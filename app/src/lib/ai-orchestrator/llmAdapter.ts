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
import type { RubricKey } from "@/content/types";
import type {
  AIOrchestrator,
  AiBranchRequest,
  AiBranchResponse,
  AssessmentRequest,
  AssessmentResponse,
  GenerateCaseRequest,
  GenerateCaseResponse,
  GeneratePetitionRequest,
  GeneratePetitionResponse,
  GenerateQuestionRequest,
  GenerateQuestionResponse,
  GroundedRequest,
  GroundedResponse,
  LegalBranch,
  RolePlayRequest,
  RolePlayResponse,
} from "./types";
import type { ServerEnv } from "@/lib/env";
import type { LegalCase } from "@/content/types";

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

const VALID_DIMS = new Set(["olay", "mesele", "usul", "maddi", "gerekce", "risk", "ifade"]);

// scoreHint için raw record kabul et, sonra elle filtrele.
const BranchSchema = z.object({
  chosenNodeId: z.string(),
  reason: z.string(),
  verdict: z.enum(["good", "partial", "bad"]),
  scoreHint: z.record(z.string(), z.unknown()).optional(),
});

const BRANCH_ENUM = z.enum([
  "is_hukuku",
  "borclar",
  "medeni",
  "medeni_usul",
  "ceza",
  "idare",
  "ticaret",
]);
const RUBRIC_ENUM = z.enum(["olay", "mesele", "usul", "maddi", "gerekce", "risk", "ifade"]);

const PetitionSectionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  guidance: z.string().min(1),
  placeholder: z.string(),
  minChars: z.number().int().min(20).max(800),
  assessDimensions: z.array(RUBRIC_ENUM).min(1),
  graderHint: z.string().min(1),
});

const GeneratePetitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  branch: BRANCH_ENUM,
  estimatedMinutes: z.number().int().min(3).max(60),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  sections: z.array(PetitionSectionSchema).min(3).max(10),
});

const GenerateCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  branch: BRANCH_ENUM,
  summary: z.string().min(1),
  clientNarrative: z.string().min(20),
  keyIssues: z.array(z.string()).min(1),
  expectedFirstMoves: z.array(z.string()).min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  estimatedMinutes: z.number().int().min(3).max(60),
});

/** scoreHint'i sanitize et: geçersiz anahtarları drop, sayısal olmayan değerleri at. */
function sanitizeScoreHint(
  raw: Record<string, unknown> | undefined,
): Partial<Record<RubricKey, number>> | undefined {
  if (!raw) return undefined;
  const out: Partial<Record<RubricKey, number>> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!VALID_DIMS.has(k)) continue;
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n >= 0 && n <= 4) {
      out[k as RubricKey] = Math.round(n) as 0 | 1 | 2 | 3 | 4;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/* ─────────── Case Generation Zod şeması ─────────── */

// MÜMKÜN OLDUĞUNCA ESNEK — LLM ne döndürürse kabul et, post-process'te düzelt
const LegalCaseOutputSchema = z.object({
  id: z.string().optional().default("gen_case"),
  title: z.string().optional().default("Vaka"),
  branch: z.string().optional().default("borclar"),
  difficulty: z.number().int().min(1).max(4).optional().default(2),
  estimatedMinutes: z.number().int().optional().default(20),
  rubricId: z.string().optional().default("rubric_v1"),
  summary: z.string().optional().default(""),
  facts: z.array(z.unknown()).optional().default([]),
  startNode: z.string().optional().default("n1"),
  nodes: z.array(z.object({
    id: z.string().optional().default("n1"),
    kind: z.string().optional().default("info"),
  }).passthrough()).optional().default([]),
}).passthrough();

/* ─────────── Auditor middleware ─────────── */

function auditSourceRefs(refs: string[]): { kept: string[]; flagged: boolean } {
  const kept = refs.filter((id) => sources[id]);
  const flagged = kept.length < refs.length;
  return { kept, flagged };
}

function auditCaseSources(caseJson: Record<string, unknown>): boolean {
  // Tüm node'lardaki source referanslarını topla
  const allRefs = new Set<string>();
  const nodes = (caseJson as { nodes?: Array<{ options?: Array<{ sources?: string[] }> }> }).nodes;
  if (nodes) {
    for (const n of nodes) {
      for (const o of n.options ?? []) {
        for (const s of o.sources ?? []) allRefs.add(s);
      }
    }
  }
  // Her ref'in sources kaydında var olması gerek
  for (const ref of allRefs) {
    if (!sources[ref]) return false;
  }
  return true;
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
    opts: { modelOverride?: string; thinking?: "enabled" | "disabled" } = {},
  ): Promise<T> {
    const selectedModel = opts.modelOverride ?? model;
    // DeepSeek thinking parametresi: body'nin içine merge edilir (OpenAI uyumlu
    // SDK pass-through). Default v4-pro'da thinking=enabled (default), v4-flash'ta
    // disabled vererek "low effort" hızını alıyoruz.
    const body: Record<string, unknown> = {
      model: selectedModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    };
    if (opts.thinking) {
      body.thinking = { type: opts.thinking };
    }
    const completion = await client.chat.completions.create(
      body as Parameters<typeof client.chat.completions.create>[0],
    );

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
    // LLM bazen object beklenirken array dönüyor (örn nodes'u root'a koyuyor).
    // Single-element array ise unwrap et; çoklu array ise nodes wrapper'ı dene.
    if (Array.isArray(parsed)) {
      if (parsed.length === 1 && parsed[0] && typeof parsed[0] === "object") {
        parsed = parsed[0];
      } else {
        parsed = { nodes: parsed };
      }
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
        "Cevabını ZORUNLU olarak şu JSON formatında döndür:",
        '{"chosenNodeId": "<listelenen bir id>", "reason": "<gerekçen>", "verdict": "good" | "partial" | "bad", "scoreHint": <opsiyonel objesi, anahtarları sadece: olay, mesele, usul, maddi, gerekce, risk, ifade — değerler 0-4>}',
        "ÖRNEK scoreHint: {\"mesele\": 4, \"usul\": 3}",
        "scoreHint isteğe bağlı — emin değilsen yazma. Asla 'dim' veya placeholder anahtarı kullanma.",
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
        scoreHint: sanitizeScoreHint(raw.scoreHint),
        verdict: raw.verdict,
        flaggedForReview: !valid,
      };
    },

    async generateCase(req: GenerateCaseRequest): Promise<GenerateCaseResponse> {
      const rB = (b: typeof req.branch) =>
        b === "is_hukuku"
          ? "İş Hukuku"
          : b === "borclar"
            ? "Borçlar Hukuku"
            : b === "medeni"
              ? "Medeni Hukuk"
              : b === "medeni_usul"
                ? "Medeni Usul Hukuku"
                : b === "ceza"
                  ? "Ceza Hukuku"
                  : b === "idare"
                    ? "İdare Hukuku"
                    : "Ticaret Hukuku";

      const contextBlock = req.contextSourceIds.length > 0
        ? [
            "Dayanak mevzuat (en az 1-2'sini option.sources'da referansla):",
            ...req.contextSourceIds.map((id) => {
              const s = sources[id];
              return s ? `- ${s.shortTitle}: ${s.body.slice(0, 200)}` : null;
            }).filter(Boolean),
          ].join("\n")
        : "Mevzuat bağlamı yok — Türk hukukunun ilgili dalından güncel mevzuatla uyumlu üret.";

      const themeLine = req.theme
        ? `TEMA: "${req.theme}" — vaka bu konu etrafında dönmeli.`
        : "TEMA: genel — alanın temel konularından birini seç.";
      const toneLine = req.characterTone
        ? `MÜVEKKİL TONU: "${req.characterTone}"`
        : "";

      const system = [
        "Sen LawKit'in Türk hukuku vaka tasarımcısısın.",
        "Hukuk öğrencileri için DALLANAN vaka simülasyonları üretiyorsun.",
        "",
        "ÜRETİM KURALLARI (KESİN):",
        "1. Vaka toplam 5-9 node (karar noktası) arasında OLMALI. Zorluk 1=5 node, 2=6 node, 3=7-8 node, 4=8-9 node.",
        "2. Her karar node'unda 2-3 option (seçenek) olmalı.",
        "3. KESİN branch değerleri (sadece bunlardan biri): is_hukuku, borclar, medeni, medeni_usul, ceza, idare, ticaret",
        "4. mood değerleri (sadece bunlar): triumph, neutral, warning, loss",
        "5. verdict değerleri (sadece bunlar): good, partial, bad",
        "6. 'good' seçenek mevzuata DAYALI olmalı.",
        "7. 'bad' seçenek tipik öğrenci hatası olmalı.",
        "8. Başlangıç node'u 'n1' olmalı (kind: 'info').",
        "9. İlk karar node'u genelde 'n2' olur (kind: 'decision').",
        "10. KISA TUT — her node prompt'u en fazla 2-3 cümle, gereksiz açıklama yok.",
        "11. ZORUNLU üst seviye alanlar: title (string, vakayı özetler), summary (2-3 cümle), branch, difficulty, estimatedMinutes, rubricId (\"rubric_v1\"), facts (string array), startNode, nodes (array).",
        "12. Node alan adları: id, kind, prompt (TEXT İÇERİĞİ — 'text' DEĞİL 'prompt' kullan!), speaker, options.",
        "13. Option alan adları: id, label (BUTONA YAZILACAK METİN — 'text' değil 'label'!), next (NEXT NODE ID — 'nextNode' değil 'next'!), verdict, sources.",
        "",
        "VAKA YAPISI:",
        "- n1: info — müvekkil olayı anlatır (speaker: 'muvekkil').",
        "- n2: decision — avukatın ilk stratejik kararı.",
        "- n3-n5: olgu toplama / usul kararları.",
        "- n6-n10: esas strateji.",
        "- n11+: outcome — sonuç.",
        "",
        "KAYNAK REFERANSLARI:",
        "- Verilen mevzuat maddelerinden EN AZ 2 tanesini option'ların sources alanında referansla.",
        "",
        "SADECE JSON döndür. Başka hiçbir şey yazma.",
      ].join("\n");

      const user = [
        `ALAN: ${rB(req.branch)}`,
        `ZORLUK: ${req.difficulty} (1=başlangıç, 4=ustalık)`,
        themeLine,
        toneLine,
        `TAHMİNİ SÜRE: ${[12, 25, 35, 50][req.difficulty - 1]} dakika`,
        "",
        contextBlock,
      ].filter(Boolean).join("\n");

      let generated: LegalCase;
      let qualityScore = 0;
      let flaggedForReview = false;

      try {
        // Vaka üretimi: v4-flash + thinking disabled (low-effort) — hız öncelikli.
        // Kullanıcı isteğiyle bu spesifik akışta hızlı modele düşüyoruz.
        const raw = (await chatJson(
          LegalCaseOutputSchema as z.ZodType<Record<string, unknown>>,
          system,
          user,
          { modelOverride: "deepseek-v4-flash", thinking: "disabled" },
        )) as Record<string, unknown>;

        // Normalize branch
        const branchMap: Record<string, string> = {
          "iş hukuku": "is_hukuku", "is hukuku": "is_hukuku", "iş_hukuku": "is_hukuku",
          "borçlar hukuku": "borclar", "borclar hukuku": "borclar", "borçlar": "borclar",
          "medeni hukuk": "medeni", "medeni": "medeni",
          "medeni usul": "medeni_usul", "medeni usul hukuku": "medeni_usul",
          "ceza hukuku": "ceza", "ceza": "ceza", "ceza_hukuku": "ceza",
          "idare hukuku": "idare", "idare": "idare", "idare_hukuku": "idare",
          "ticaret hukuku": "ticaret", "ticaret": "ticaret", "ticaret_hukuku": "ticaret",
        };
        const rawBranch = ((raw.branch ?? raw.branch ?? "") as string).toLowerCase();
        if (branchMap[rawBranch]) raw.branch = branchMap[rawBranch];
        if (!["is_hukuku", "borclar", "medeni", "medeni_usul", "ceza", "idare", "ticaret"].includes(raw.branch as string)) {
          raw.branch = "borclar";
        }

        // Normalize node kinds (LLM 'result' -> 'outcome')
        const nodes = (raw.nodes as Array<Record<string, unknown>>) ?? [];
        const validKinds = new Set(["decision", "outcome", "info", "open_text", "ai_branch", "client_chat", "checkpoint"]);
        for (const n of nodes) {
          // Field alias mapping: LLM "text" → bizim "prompt"
          if (!n.prompt && typeof n.text === "string") n.prompt = n.text;
          if (!n.prompt && typeof (n as Record<string, unknown>).content === "string") {
            n.prompt = (n as Record<string, unknown>).content;
          }
          if (!validKinds.has(n.kind as string)) n.kind = "info";
          // Fix missing option fields
          const opts = n.options as Array<Record<string, unknown>> | undefined;
          if (opts) {
            for (const o of opts) {
              // Field alias: LLM "text" → bizim "label" (görünen şık metni)
              if (!o.label && typeof o.text === "string") o.label = o.text;
              if (!o.label && typeof (o as Record<string, unknown>).content === "string") {
                o.label = (o as Record<string, unknown>).content;
              }
              if (!o.id) o.id = `opt_${Math.random().toString(36).slice(2, 8)}`;
              if (!o.label) o.label = "Seçenek";
              // next: LLM bazen "nextNode" kullanıyor
              if (!o.next && typeof (o as Record<string, unknown>).nextNode === "string") {
                o.next = (o as Record<string, unknown>).nextNode;
              }
              if (!o.next) o.next = n.id as string;
              if (!o.verdict) o.verdict = "partial";
              if (!["good", "partial", "bad"].includes(o.verdict as string)) o.verdict = "partial";
            }
          }
          // Ensure node has id
          if (!n.id) n.id = `n${nodes.indexOf(n) + 1}`;
        }

        // Ensure case has meaningful title + summary
        if (!raw.title || typeof raw.title !== "string" || (raw.title as string).trim().length < 3) {
          const themeStr = req.theme ? ` — ${req.theme}` : "";
          raw.title = `${rB(req.branch)} Vakası${themeStr}`;
        }
        if (!raw.summary || typeof raw.summary !== "string" || (raw.summary as string).trim().length < 10) {
          const firstInfo = nodes.find((n) => n.kind === "info" && typeof n.prompt === "string");
          raw.summary = firstInfo
            ? ((firstInfo.prompt as string).slice(0, 200) + "…")
            : `${rB(req.branch)} alanında ${req.theme ?? "genel"} konulu bir uyuşmazlık.`;
        }
        // facts boşsa LLM'in olay özetinden çıkar
        if (!Array.isArray(raw.facts) || (raw.facts as unknown[]).length === 0) {
          const firstInfoText =
            (nodes.find((n) => n.kind === "info")?.prompt as string | undefined) ?? "";
          raw.facts = firstInfoText
            ? [firstInfoText.slice(0, 240)]
            : [`Müvekkilin durumu: ${req.theme ?? "incelemeye alındı"}.`];
        }
        // rubricId şart
        if (!raw.rubricId) raw.rubricId = "rubric_v1";
        // estimatedMinutes
        if (!raw.estimatedMinutes || typeof raw.estimatedMinutes !== "number") {
          raw.estimatedMinutes = [12, 25, 35, 50][req.difficulty - 1];
        }
        // difficulty
        if (!raw.difficulty || typeof raw.difficulty !== "number") {
          raw.difficulty = req.difficulty;
        }

        // Ensure startNode exists in nodes
        const nodeIds = new Set(nodes.map((n) => n.id as string));
        if (!nodeIds.has(raw.startNode as string)) {
          raw.startNode = nodes[0]?.id ?? "n1";
        }

        // Fix outcome moods
        const outcomes = raw.outcomes as Array<Record<string, unknown>> | undefined;
        const validMoods = new Set(["triumph", "neutral", "warning", "loss"]);
        if (outcomes) {
          for (const o of outcomes) {
            if (!validMoods.has(o.mood as string)) o.mood = "neutral";
            if (!o.id) o.id = `outcome_${outcomes.indexOf(o)}`;
            if (!o.condition) o.condition = { default: outcomes.indexOf(o) === outcomes.length - 1 };
          }
        }

        // Cast normalize
        const cast = raw.cast as Array<Record<string, unknown>> | undefined;
        if (cast) {
          for (const c of cast) {
            if (!c.id) c.id = `char_${cast.indexOf(c)}`;
          }
        }

        generated = raw as unknown as LegalCase;

        // Quality audit (basit)
        const nodeCount = nodes.length;
        const srcPass = auditCaseSources(raw);
        const hasOpts = nodes.some((n) => Array.isArray(n.options) && (n.options as unknown[]).length > 0);
        qualityScore = 0.3 + (nodeCount >= 5 ? 0.2 : 0) + (srcPass ? 0.25 : 0) + (hasOpts ? 0.15 : 0)
          + (outcomes && outcomes.length > 0 ? 0.1 : 0);
        flaggedForReview = !srcPass || nodeCount < 3;

      } catch (err) {
        throw new Error(
          `Case generation failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      return {
        legalCase: generated,
        qualityScore: Number(qualityScore.toFixed(2)),
        flaggedForReview,
        usedSources: req.contextSourceIds,
      };
    },

    async generateQuestions(req: GenerateQuestionRequest): Promise<GenerateQuestionResponse> {
      const branchLabels: Record<string, string> = {
        is_hukuku: "İş Hukuku", borclar: "Borçlar Hukuku", medeni: "Medeni Hukuk",
        medeni_usul: "Medeni Usul", ceza: "Ceza Hukuku", idare: "İdare Hukuku",
        ticaret: "Ticaret Hukuku", anayasa: "Anayasa", ceza_usul: "Ceza Usul",
        icra: "İcra İflas",
      };
      const label = branchLabels[req.branch] ?? req.branch;

      const contextBlock = req.contextSourceIds.length > 0
        ? [
            "Aşağıdaki mevzuat maddelerini sorularına DAYANAK olarak kullan:",
            ...req.contextSourceIds.map((id) => {
              const s = sources[id];
              return s ? `- ${s.shortTitle}: ${s.body.slice(0, 250)}` : null;
            }).filter(Boolean),
          ].join("\n")
        : "";

      const excludeBlock = req.excludeIds?.length
        ? `Şu soru ID'leriyle aynı konuda soru ÜRETME: ${req.excludeIds.join(", ")}`
        : "";

      const system = [
        "Sen LawKit'in HMGS soru yazarısın.",
        "Türk hukuku çoktan seçmeli sınav sorusu üretiyorsun.",
        "",
        "KURALLAR:",
        "1. Soru kökü (stem) bir olay veya hukuki mesele içermeli.",
        "2. 4 şık olmalı (a, b, c, d).",
        "3. SADECE BİR şık doğru. Diğerleri makul çeldiriciler olmalı.",
        "4. Doğru cevap mevzuata DAYALI olmalı, ezoterik değil.",
        "5. Çeldiriciler tipik öğrenci hatalarını yansıtmalı.",
        "6. Her soruya 2-3 cümle açıklama (explanation) yaz.",
        "7. Her çeldirici için kısa gerekçe (distractorReasons) yaz.",
        "8. Kullandığın mevzuat maddelerini sources dizisinde referansla.",
        "",
        "ÇIKTI FORMATI — ZORUNLU JSON:",
        JSON.stringify({
          questions: [{
            id: "q_is_001",
            branch: "is_hukuku",
            difficulty: 2,
            stem: "Ali 7 yıldır X A.Ş.'de çalışmaktadır. İşveren... Buna göre aşağıdakilerden hangisi doğrudur?",
            choices: [
              { id: "a", text: "Doğru cevap..." },
              { id: "b", text: "Çeldirici..." },
              { id: "c", text: "Çeldirici..." },
              { id: "d", text: "Tuzak..." },
            ],
            correctId: "a",
            explanation: "Doğru cevap a şıkkıdır çünkü İş K. m. 18 uyarınca...",
            distractorReasons: {
              b: "B yanlış çünkü ihbar süresi kıdeme göre değişir.",
              c: "C yanlış çünkü haklı fesih şartları oluşmamıştır.",
              d: "D yanlış çünkü arabuluculuk dava şartıdır.",
            },
            sources: ["is_kanunu_m18"],
          }],
        }),
        "",
        "SADECE JSON döndür. Başka metin yazma.",
      ].join("\n");

      const user = [
        `HUKUK DALI: ${label}`,
        `ZORLUK: ${req.difficulty} (1=kolay, 4=zor)`,
        `SORU SAYISI: ${req.count}`,
        excludeBlock,
        contextBlock,
      ].filter(Boolean).join("\n");

      const GenQuestionSchema = z.object({
        questions: z.array(z.object({
          id: z.string(),
          branch: z.string(),
          difficulty: z.number().int().min(1).max(4),
          stem: z.string().min(1),
          choices: z.array(z.object({
            id: z.string(),
            text: z.string().min(1),
          })).length(4),
          correctId: z.string(),
          explanation: z.string(),
          distractorReasons: z.record(z.string()).optional(),
          sources: z.array(z.string()).optional(),
        })),
      });

      const raw = await chatJson(GenQuestionSchema, system, user);

      const refSet = new Set(Object.keys(sources));
      let validSourceCount = 0;
      let totalSourceCount = 0;
      for (const q of raw.questions) {
        for (const s of q.sources ?? []) {
          totalSourceCount++;
          if (refSet.has(s)) validSourceCount++;
        }
      }
      const sourceQuality = totalSourceCount > 0 ? validSourceCount / totalSourceCount : 0.5;
      const qualityScore = 0.4
        + (raw.questions.length >= req.count ? 0.2 : 0)
        + sourceQuality * 0.2
        + (raw.questions.every((q) => q.explanation.length > 20) ? 0.2 : 0);

      return {
        questions: raw.questions as GenerateQuestionResponse["questions"],
        qualityScore: Number(qualityScore.toFixed(2)),
        flaggedForReview: sourceQuality < 0.5,
        usedSources: req.contextSourceIds,
      };
    },

    async generatePetition(req: GeneratePetitionRequest): Promise<GeneratePetitionResponse> {
      const branchLabels: Record<string, string> = {
        is_hukuku: "İş Hukuku", borclar: "Borçlar Hukuku", medeni: "Medeni Hukuk",
        medeni_usul: "Medeni Usul", ceza: "Ceza Hukuku", idare: "İdare Hukuku",
      };
      const label = branchLabels[req.branch] ?? req.branch;
      const theme = req.theme ?? `${label} uyuşmazlığı`;

      const contextBlock = req.contextSourceIds.length > 0
        ? req.contextSourceIds.map((id) => { const s = sources[id]; return s ? `- ${s.shortTitle}: ${s.body.slice(0, 200)}` : null; }).filter(Boolean).join("\n")
        : "";

      const system = [
        "Sen LawKit'in dilekçe şablonu tasarımcısısın.",
        "Hukuk öğrencilerinin pratik yapması için 5 bölümlü dilekçe şablonları üretiyorsun.",
        "",
        "HER ŞABLON 5 BÖLÜMDEN oluşmalı:",
        "1. Mahkeme (görevli/yetkili mahkeme tespiti)",
        "2. Taraflar (davacı/davalı tanımlama)",
        "3. Vakıalar (olayların kronolojik dizilimi)",
        "4. Hukuki Sebepler (dayanak kanun maddeleri)",
        "5. Talep Sonucu (açık talep)",
        "",
        "Her bölüm için: key, title, guidance (yönerge), placeholder (örnek), minChars (10-30), assessDimensions (rubrik boyutları), graderHint (AI değerlendirme notu)",
        "assessDimensions sadece şunlardan: olay, mesele, usul, maddi, gerekce, risk, ifade",
        "category değerleri: ise_iade, sebepsiz_zenginlesme, komsuluk, tazminat",
        "",
        "SADECE JSON döndür.",
      ].join("\n");

      const user = `HUKUK DALI: ${label}\nKONU: ${theme}\nZORLUK: ${req.difficulty}\n${contextBlock ? `\nKAYNAKLAR:\n${contextBlock}` : ""}`;

      const schema = z.object({
        id: z.string().optional().default(`gen_pet_${Date.now()}`),
        title: z.string().optional().default(`Dilekçe - ${theme}`),
        category: z.string().optional().default("tazminat"),
        branch: z.string().optional().default(req.branch),
        summary: z.string().optional().default(""),
        estimatedMinutes: z.number().optional().default(20),
        difficulty: z.number().optional().default(req.difficulty),
        sections: z.array(z.object({
          key: z.string(),
          title: z.string(),
          guidance: z.string().optional().default(""),
          placeholder: z.string().optional().default(""),
          minChars: z.number().optional().default(15),
          assessDimensions: z.array(z.string()).optional().default(["mesele"]),
          graderHint: z.string().optional().default(""),
        }).passthrough()).optional().default([]),
      }).passthrough();

      // Dilekçe üretimi: v4-flash + thinking disabled (low-effort) — hız öncelikli.
      const raw = await chatJson(schema, system, user, {
        modelOverride: "deepseek-v4-flash",
        thinking: "disabled",
      });
      return {
        template: raw as GeneratePetitionResponse["template"],
        qualityScore: (raw.sections as unknown[])?.length >= 4 ? 0.7 : 0.4,
        flaggedForReview: (raw.sections as unknown[])?.length < 3,
        usedSources: req.contextSourceIds,
      };
    },
  };
}
