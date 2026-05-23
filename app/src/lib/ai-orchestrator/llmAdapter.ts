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
  GenerateCaseRequest,
  GenerateCaseResponse,
  GroundedRequest,
  GroundedResponse,
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

const CaseGenOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  next: z.string(),
  verdict: z.enum(["good", "partial", "bad"]),
  feedback: z.string().optional(),
  scores: z.record(z.string(), z.number()).optional(),
  sources: z.array(z.string()).optional(),
});

const CaseGenNodeSchema = z.object({
  id: z.string(),
  kind: z.enum(["decision", "outcome", "info", "open_text", "ai_branch", "client_chat", "checkpoint"]),
  prompt: z.string().optional(),
  summary: z.string().optional(),
  idealAnswer: z.string().optional(),
  speaker: z.string().optional(),
  speakerId: z.string().optional(),
  scene: z.string().optional(),
  sceneCharacters: z.array(z.string()).optional(),
  act: z.number().int().min(1).max(3).optional(),
  options: z.array(CaseGenOptionSchema).optional(),
}).passthrough();

const CaseGenOutcomeSchema = z.object({
  id: z.string(),
  title: z.string(),
  mood: z.enum(["triumph", "neutral", "warning", "loss"]),
  narrative: z.string(),
  idealAnswer: z.string(),
  condition: z.object({
    default: z.boolean().optional(),
    minLedgerAvg: z.number().optional(),
    maxHints: z.number().optional(),
    maxBadVerdicts: z.number().optional(),
  }).passthrough(),
}).passthrough();

const LegalCaseOutputSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  branch: z.enum(["is_hukuku", "borclar", "medeni", "medeni_usul", "ceza", "idare", "ticaret"]),
  difficulty: z.number().int().min(1).max(4),
  estimatedMinutes: z.number().int(),
  rubricId: z.string(),
  summary: z.string(),
  facts: z.array(z.unknown()),
  startNode: z.string(),
  nodes: z.array(CaseGenNodeSchema),
  outcomes: z.array(CaseGenOutcomeSchema).optional(),
  cast: z.array(z.object({
    id: z.string(),
    role: z.string(),
    name: z.string(),
    archetype: z.string().optional(),
    initials: z.string().optional(),
    hue: z.number().optional(),
  })).optional(),
  acts: z.array(z.object({
    number: z.number().int().min(1).max(3),
    title: z.string(),
    setting: z.string().optional(),
  })).optional(),
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
            "Aşağıdaki mevzuat maddelerini vakaya dayanak olarak KULLANMALISIN:",
            ...req.contextSourceIds.map((id) => {
              const s = sources[id];
              return s ? `- ${s.shortTitle}: ${s.body.slice(0, 300)}` : null;
            }).filter(Boolean),
          ].join("\n")
        : "Hiçbir mevzuat bağlamı verilmedi — mevzuat.gov.tr'deki güncel mevzuatla uyumlu üret.";

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
        "1. Vaka toplam 7-15 node (karar noktası) arasında OLMALI.",
        "2. Her karar node'unda 2-4 option (seçenek) olmalı.",
        "3. Seçeneklerin verdict'leri şöyle dağılmalı: en az 1 'good', 1 'partial', 1 'bad'.",
        "4. 'good' seçenek gerçek hukuki doğruyu yansıtmalı — mevzuata DAYALI olmalı.",
        "5. 'bad' seçenek tipik öğrenci hatası olmalı — havalı görünen ama yanlış strateji.",
        "6. Her seçeneğe 1-2 cümle KISA 'feedback' yaz — neden doğru/yanlış.",
        "7. Başlangıç node'u 'n1' olmalı (kind: 'info' — olayı anlatır).",
        "8. İlk karar node'u genelde 'n2' olur (kind: 'decision').",
        "9. Müvekkil karakteri EKLE — cast'e 'muvekkil' role'da bir karakter gir.",
        "10. Zorluk 1-2 ise 7-10 node, 3-4 ise 10-15 node olsun.",
        "",
        "VAKA YAPISI:",
        "- n1: info node — müvekkil olayı anlatır (speaker: 'muvekkil').",
        "- n2: decision node — avukatın ilk stratejik kararı.",
        "- n3-n5: olgu toplama / usul kararları.",
        "- n6-n10: esas strateji — hukuki meseleyi çözme.",
        "- n11+: outcome/decision — sonuç ve kapanış.",
        "",
        "KARAKTERLER (cast):",
        "- Her karakter için: id, role (muvekkil/hakim/karsi_vekil/staj_patron), name, archetype.",
        "- Müvekkil gerçekçi olmalı — hukuk bilmez, duygusal.",
        "- Karşı taraf / karşı vekil olmazsa olmaz — çatışma yoksa vaka olmaz.",
        "",
        "KAYNAK REFERANSLARI:",
        "- Verilen mevzuat maddelerinden EN AZ 2 tanesini option'ların sources alanında referansla.",
        "- Source id'leri TAM OLARAK verilen id'lerle eşleşmeli (örn: 'tbk_m49', 'is_kanunu_m18').",
        "- Sahne açıklamalarında (scene, summary) yasal madde numaralarına ATIF yap.",
        "",
        "ÇIKTI FORMATI — ZORUNLU olarak şu JSON yapısında döndür:",
        JSON.stringify({
          id: "is_hukuku_003",
          title: "Fesih Sebebiyle...",
          branch: "is_hukuku",
          difficulty: 2,
          estimatedMinutes: 35,
          rubricId: "rubric_v1",
          summary: "Kısa özet (2 cümle)...",
          facts: ["Olgu 1", "Olgu 2"],
          documents: [{ label: "İş sözleşmesi" }],
          startNode: "n1",
          nodes: [{
            id: "n1", kind: "info", speaker: "muvekkil",
            prompt: "Müvekkilin anlatımı...", summary: "Olay özeti...",
          }, {
            id: "n2", kind: "decision", prompt: "Ne yapmalısınız?",
            speaker: "staj_patron",
            options: [{
              id: "opt1", label: "Doğru seçenek", next: "n3",
              verdict: "good", feedback: "Doğru çünkü...",
              sources: ["tbk_m49"],
            }, {
              id: "opt2", label: "Yanlış seçenek", next: "n4",
              verdict: "bad", feedback: "Yanlış çünkü...",
            }],
          }, {
            id: "n_last", kind: "outcome", prompt: "Sonuç...",
            summary: "Vaka sonlandı.", idealAnswer: "Doğru strateji...",
          }],
          outcomes: [{
            id: "triumph", title: "Müvekkil kazandı",
            mood: "triumph", narrative: "Tebrikler...",
            idealAnswer: "Doğru yol...",
            condition: { minLedgerAvg: 3.0 },
          }, {
            id: "loss", title: "Dava kaybedildi",
            mood: "loss", narrative: "Maalesef...",
            idealAnswer: "Kaçınılan hatalar...",
            condition: { default: true },
          }],
          cast: [{
            id: "muvekkil_1", role: "muvekkil", name: "Ahmet Bey",
            archetype: "Küçük işletme sahibi, 45 yaş",
          }, {
            id: "patron_1", role: "staj_patron", name: "Av. Elif Demir",
            archetype: "Kıdemli avukat, titiz",
          }],
          acts: [
            { number: 1, title: "Müvekkil Görüşmesi" },
            { number: 2, title: "Strateji ve Deliller" },
            { number: 3, title: "Karar ve Sonuç" },
          ],
        }),
        "",
        "ÖNEMLİ:",
        "- n1 İLK node'dur — startNode: 'n1' oalrak ver.",
        "- n1'in kind'ı 'info' olmalı.",
        "- Çıktıyı YUKARIDAKİ JSON FORMATINDA döndür. Ekstra metin yazma.",
        "- SADECE JSON döndür. Başka hiçbir şey yazma.",
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
        const raw = await chatJson(LegalCaseOutputSchema as z.ZodType<LegalCase>, system, user);
        generated = raw;

        // Quality audit
        const nodeCount = (raw as { nodes?: unknown[] }).nodes?.length ?? 0;
        const sourcePass = auditCaseSources(raw as Record<string, unknown>);
        const hasOptions = generated.nodes.some((n) => (n as { options?: unknown[] }).options?.length);
        const hasCast = generated.cast && generated.cast.length > 0;
        const hasOutcomes = generated.outcomes && generated.outcomes.length > 0;

        qualityScore = 0.35 + (nodeCount >= 7 ? 0.15 : 0) + (sourcePass ? 0.2 : 0)
          + (hasOptions ? 0.15 : 0) + (hasCast ? 0.1 : 0) + (hasOutcomes ? 0.05 : 0);
        flaggedForReview = !sourcePass || nodeCount < 5;
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
  };
}
