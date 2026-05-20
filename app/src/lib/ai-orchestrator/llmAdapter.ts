/**
 * Generic LLM Adapter — OpenAI uyumlu herhangi bir provider'la çalışır.
 *
 * Şu an DeepSeek. Sağlayıcı değişince env değişkenleri (LLM_BASE_URL +
 * LLM_API_KEY + LLM_MODEL) değiştirilir; bu dosyaya dokunulmaz.
 *
 * Tasarım:
 *   - OpenAI SDK + custom base URL
 *   - Yapılandırılmış çıktı: zod schema → response_format JSON
 *   - Auditor middleware: source claim'lerini knownSources'a karşı doğrular
 *   - RolePlay'de chat completion format (user/assistant rolleri net) —
 *     bu sayede müvekkil rolündeyken model avukat gibi soru sormaz.
 *   - Sunucu-only: bu modül asla client'a bundle edilmemeli.
 */

import OpenAI from "openai";
import { z } from "zod";
import { sources } from "@/content/sources";
import { defaultRubric } from "@/content/rubrics";
import type {
  AIOrchestrator,
  AiBranchRequest,
  AiBranchResponse,
  AssessmentRequest,
  AssessmentResponse,
  GroundedRequest,
  GroundedResponse,
  RolePlayRequest,
  RolePlayResponse,
} from "./types";
import type { ServerEnv } from "@/lib/env";

/* ─────────── Zod şemaları ─────────── */

const GroundedSchema = z.object({
  explanation: z.string().min(1),
  sourceRefs: z.array(z.string()),
  noSourceFound: z.boolean(),
});

const RolePlaySchema = z.object({
  reply: z.string().min(1),
  observed: z.object({
    askedForFactsAbout: z.array(z.string()),
    missedKeyFacts: z.array(z.string()),
  }),
});

const AssessmentSchema = z.object({
  scores: z.array(
    z.object({
      dimension: z.enum(["olay", "mesele", "usul", "maddi", "gerekce", "risk", "ifade"]),
      score: z.number().int().min(0).max(4),
      reason: z.string(),
    }),
  ),
  missedIssues: z.array(z.string()),
  sourceRefs: z.array(z.string()),
  nextStep: z.string(),
});

const BranchSchema = z.object({
  chosenNodeId: z.string(),
  reason: z.string(),
  verdict: z.enum(["good", "partial", "bad"]),
  scoreHint: z
    .record(
      z.enum(["olay", "mesele", "usul", "maddi", "gerekce", "risk", "ifade"]),
      z.number().int().min(0).max(4),
    )
    .optional(),
});

/* ─────────── Auditor middleware ─────────── */

function auditSourceRefs(refs: string[]): { kept: string[]; flagged: boolean } {
  const kept = refs.filter((id) => sources[id]);
  const flagged = kept.length < refs.length;
  return { kept, flagged };
}

/* ─────────── Adapter ─────────── */

export function createLlmAdapter(env: ServerEnv): AIOrchestrator {
  if (!env.LLM_API_KEY) {
    throw new Error("LLM_API_KEY missing — adapter cannot be initialized.");
  }

  const client = new OpenAI({
    apiKey: env.LLM_API_KEY,
    baseURL: env.LLM_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": env.LLM_SITE_URL,
      "X-Title": env.LLM_APP_NAME,
    },
  });

  const model = env.LLM_MODEL;

  type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

  async function chatJson<T>(
    schema: z.ZodType<T>,
    system: string,
    user: string,
  ): Promise<T> {
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    if (!completion?.choices || completion.choices.length === 0) {
      const errMsg =
        (completion as unknown as { error?: { message?: string } })?.error?.message ??
        "LLM response has no choices — model may be invalid or rate-limited.";
      throw new Error(`LLM (${model}): ${errMsg}`);
    }
    const text = completion.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`LLM response not valid JSON: ${text.slice(0, 200)}`);
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLM response failed schema: ${result.error.message}`);
    }
    return result.data;
  }

  /**
   * Multi-turn JSON chat — RolePlay için. Transcript user/assistant rolleriyle
   * gönderilir; model rolünü karıştırmaz.
   */
  async function chatTurnsJson<T>(
    schema: z.ZodType<T>,
    system: string,
    turns: ChatMsg[],
  ): Promise<T> {
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, ...turns],
      temperature: 0.6, // role-play daha doğal hissi için biraz yüksek
    });

    if (!completion?.choices || completion.choices.length === 0) {
      const errMsg =
        (completion as unknown as { error?: { message?: string } })?.error?.message ??
        "LLM response has no choices.";
      throw new Error(`LLM (${model}): ${errMsg}`);
    }
    const text = completion.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`LLM response not valid JSON: ${text.slice(0, 200)}`);
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLM response failed schema: ${result.error.message}`);
    }
    return result.data;
  }

  function knownSourcesContext(_caseId: string): string {
    return Object.values(sources)
      .map((s) => `- ${s.id}: ${s.shortTitle} — ${s.body.slice(0, 220)}…`)
      .join("\n");
  }

  return {
    async ground(req: GroundedRequest): Promise<GroundedResponse> {
      const system = [
        "Sen LawKit'in 'Grounded Explanation' ajansısın.",
        "Yalnızca sana verilen doğrulanmış kaynak setinden konuş; başka mevzuat veya içtihat uydurma.",
        "Cevabını ZORUNLU olarak bu JSON şemasıyla döndür:",
        '{"explanation": "...", "sourceRefs": ["source_id", ...], "noSourceFound": true|false}',
        "sourceRefs sadece sana verilen source_id'lerden olabilir.",
        "Doğrulanmış kaynak yoksa noSourceFound=true, explanation kısa olsun.",
      ].join("\n");

      const user = [
        `Vaka: ${req.case.title}`,
        `Özet: ${req.case.summary}`,
        `Konu/sorulan: ${req.topic}`,
        "",
        "Doğrulanmış kaynak seti (yalnız bunlar kullanılabilir):",
        knownSourcesContext(req.case.id),
      ].join("\n");

      const raw = await chatJson(GroundedSchema, system, user);
      const audit = auditSourceRefs(raw.sourceRefs);
      return {
        explanation: raw.explanation,
        sourceRefs: audit.kept,
        noSourceFound: raw.noSourceFound || audit.kept.length === 0,
      };
    },

    async rolePlay(req: RolePlayRequest): Promise<RolePlayResponse> {
      // Persona briefleri — KESİN talimat
      const personaMap: Record<typeof req.persona, string> = {
        muvekkil: [
          "Sen MÜVEKKİL rolündesin — hukukçu değilsin, bir gerçek kişisin.",
          "Avukat sana sorular sorar; sen sadece SORULANA YANIT verirsin.",
          "ASLA avukata 'siz ne yapacaksınız', 'hangi belgeyi sunmalıyım' gibi soru SORMA.",
          "Bilmediğin hukuki kavramları bilmiyormuş gibi konuş ('hukukunu pek bilmem ama...').",
          "Olguları net hatırlıyorsun. Duygusal yorgun ve kırılgansın.",
          "Avukatın sorusu muğlaksa 'tam anlamadım' diyebilirsin.",
          "Cevapların kısa olsun (2-4 cümle). Lafı uzatma.",
        ].join(" "),
        hakim: [
          "Sen HÂKİM rolündesin — tarafsız, usul kurallarına bağlı, kısa konuşur.",
          "Sadece sana yönelen beyana cevap ver; meslektaşa profesyonel ton.",
          "Soru sormaktan kaçınma — usuli bir soru yöneltebilirsin ama bunu hâkim olarak yapacaksın.",
        ].join(" "),
        karsi_vekil: [
          "Sen KARŞI TARAFIN VEKİLİSİN — agresif, mantık hatası bulmaya çalışan.",
          "Müvekkilinin çıkarını koruyan tonda; teknik hukuki ifadeler kullan.",
        ].join(" "),
        staj_patron: [
          "Sen KIDEMLİ AVUKATSIN — pedagojik, eleştirel ama yapıcı.",
          "Stajyere yol gösteriyorsun. Soru sorabilirsin, doğru hamleye yönlendirirsin.",
        ].join(" "),
      };

      const system = [
        personaMap[req.persona],
        "",
        "TÜRKÇE konuş.",
        "Cevabını ZORUNLU olarak şu JSON şemasıyla döndür:",
        '{"reply": "rolündeki cevabın", "observed": {"askedForFactsAbout": [], "missedKeyFacts": []}}',
        "observed alanı meta — sadece kullanıcının (avukatın) ne sorduğunu/atladığını işaretler, role-play'in dışı.",
        "",
        `Vaka bağlamı: ${req.case.title}`,
        `Özet: ${req.case.summary}`,
      ].join("\n");

      // Transcript'i chat completion format'ında gönder — kullanıcı = avukat,
      // assistant = persona (sen). Böylece model rolünü karıştırmaz.
      const turns: ChatMsg[] = [];
      for (const t of req.transcript) {
        turns.push({
          role: t.speaker === "user" ? "user" : "assistant",
          // assistant turn'leri JSON formatta dönmüş olabilir ama burada
          // history için sadece reply'in metni gerek. Eski formattaysa
          // direkt geçer.
          content: t.text,
        });
      }
      turns.push({ role: "user", content: req.userTurn });

      return chatTurnsJson(RolePlaySchema, system, turns);
    },

    async assess(req: AssessmentRequest): Promise<AssessmentResponse> {
      const rubricContext = defaultRubric.dimensions
        .filter((d) => req.dimensions.includes(d.key))
        .map((d) => {
          return `- ${d.key} (${d.label}): ${d.definition}\n  Seviye 0: ${d.levels["0"]}\n  Seviye 4: ${d.levels["4"]}`;
        })
        .join("\n");

      const system = [
        "Sen LawKit'in 'Assessment' ajansısın.",
        "Kullanıcının yazdığı hukuki cevabı verilen boyutlara göre 0-4 ölçeğinde puanla.",
        "Sadece doğrulanmış kaynak id'lerine atıf yap (uydurma).",
        "JSON şeması:",
        '{"scores": [{"dimension": "key", "score": 0-4, "reason": "..."}], "missedIssues": [...], "sourceRefs": [...], "nextStep": "..."}',
      ].join("\n");

      const user = [
        `Vaka: ${req.case.title}`,
        `Özet: ${req.case.summary}`,
        "",
        "Değerlendirilecek cevap:",
        req.userAnswer,
        "",
        "Puanlanacak boyutlar ve davranışsal tanımlar:",
        rubricContext,
        "",
        "Doğrulanmış kaynak seti:",
        knownSourcesContext(req.case.id),
      ].join("\n");

      const raw = await chatJson(AssessmentSchema, system, user);
      const audit = auditSourceRefs(raw.sourceRefs);
      return {
        scores: raw.scores.map((s) => ({
          dimension: s.dimension,
          score: s.score as 0 | 1 | 2 | 3 | 4,
          reason: s.reason,
        })),
        missedIssues: raw.missedIssues,
        sourceRefs: audit.kept,
        nextStep: raw.nextStep,
        flaggedForReview: audit.flagged,
      };
    },

    async branch(req: AiBranchRequest): Promise<AiBranchResponse> {
      const validIds = new Set([
        ...req.candidates.map((c) => c.nodeId),
        req.fallbackNodeId,
      ]);

      const candidateList = req.candidates
        .map(
          (c) =>
            `- ${c.nodeId} | verdict=${c.verdict} | ${c.label}${c.hint ? ` — ${c.hint}` : ""}`,
        )
        .join("\n");

      const system = [
        "Sen LawKit'in 'AI Branch' yönlendiricisisin.",
        "Öğrencinin avukat olarak verdiği serbest cevabı oku.",
        "Aşağıdaki olası dallardan TAM OLARAK BİRİNİ seç. Yeni node id üretme; yalnız listelenenlerden birini döndür.",
        "Türk hukuku açısından öğrencinin cevabının ne kadar güçlü olduğunu değerlendir.",
        "Cevabını ZORUNLU olarak şu JSON şemasıyla döndür:",
        '{"chosenNodeId": "...", "reason": "...", "verdict": "good|partial|bad", "scoreHint": {"dim": 0-4}}',
      ].join("\n");

      const user = [
        `Vaka: ${req.case.title}`,
        `Özet: ${req.case.summary}`,
        "",
        `Sahne / bağlam:`,
        req.context || "(yok)",
        "",
        `Olası dallar:`,
        candidateList,
        `(eğer hiçbiri uygun değilse: ${req.fallbackNodeId} fallback)`,
        "",
        "Öğrencinin serbest cevabı:",
        req.userText,
        "",
        req.scoreDimensions && req.scoreDimensions.length > 0
          ? `Puanlanacak rubric boyutları: ${req.scoreDimensions.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const raw = await chatJson(BranchSchema, system, user);
      const valid = validIds.has(raw.chosenNodeId);
      return {
        chosenNodeId: valid ? raw.chosenNodeId : req.fallbackNodeId,
        reason: raw.reason,
        scoreHint: raw.scoreHint,
        verdict: raw.verdict,
        flaggedForReview: !valid,
      };
    },
  };
}
