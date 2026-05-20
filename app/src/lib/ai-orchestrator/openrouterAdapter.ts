/**
 * OpenRouterAdapter — AIOrchestrator interface'inin canlı LLM implementasyonu.
 *
 * Tasarım:
 *   - OpenAI SDK + custom base URL (https://openrouter.ai/api/v1)
 *   - Yapılandırılmış çıktı: zod schema → response_format JSON (modele uygun fallback)
 *   - Auditor middleware: response'taki source claim'lerini knownSources'a karşı doğrular.
 *   - Sunucu-only: bu modül asla client'a bundle edilmemeli (api/* route'larından çağrılır).
 *
 * Model değiştirmek için: env OPENROUTER_MODEL=... ya da OPENAI'a geçişte
 * tek dosyada base URL + key swap.
 */

import OpenAI from "openai";
import { z } from "zod";
import { sources } from "@/content/sources";
import { defaultRubric } from "@/content/rubrics";
import type {
  AIOrchestrator,
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

/* ─────────── Auditor middleware ─────────── */

function auditSourceRefs(refs: string[]): { kept: string[]; flagged: boolean } {
  const kept = refs.filter((id) => sources[id]);
  const flagged = kept.length < refs.length;
  return { kept, flagged };
}

/* ─────────── Adapter ─────────── */

export function createOpenRouterAdapter(env: ServerEnv): AIOrchestrator {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY missing — adapter cannot be initialized.");
  }

  const client = new OpenAI({
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": env.OPENROUTER_SITE_URL,
      "X-Title": env.OPENROUTER_APP_NAME,
    },
  });

  const model = env.OPENROUTER_MODEL;

  async function chatJson<T>(
    schema: z.ZodType<T>,
    system: string,
    user: string,
  ): Promise<T> {
    // OpenRouter çoğu modelde response_format json_object destekler.
    // Schema validation bizim tarafta.
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    // OpenRouter bazen 200 ile ama choices'sız error dönebiliyor.
    if (!completion?.choices || completion.choices.length === 0) {
      const errMsg =
        (completion as unknown as { error?: { message?: string } })?.error?.message ??
        "OpenRouter response has no choices — model may be invalid or rate-limited.";
      throw new Error(`OpenRouter (${model}): ${errMsg}`);
    }
    const text = completion.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error(`OpenRouter response not valid JSON: ${text.slice(0, 200)}`);
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        `OpenRouter response failed schema: ${result.error.message}`,
      );
    }
    return result.data;
  }

  function knownSourcesContext(caseId: string): string {
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
      const personaMap: Record<typeof req.persona, string> = {
        muvekkil:
          "Sen müvekkilsin — hukukçu değilsin, duygusalsın, bilgin eksik olabilir. Avukatın sorularına gerçek hayattaki bir müvekkil gibi cevap ver.",
        hakim:
          "Sen tarafsız bir hâkimsin — usul kurallarına sıkı bağlısın, kısa ve direkt konuşursun, gerekirse meslektaşa açık uyarı yaparsın.",
        karsi_vekil:
          "Sen karşı tarafın vekilisin — agresif, mantık hatası bulmaya çalışan, müvekkilinin çıkarını koruyan tonda.",
        staj_patron:
          "Sen kıdemli avukatsın, stajyere yol gösteriyorsun — pedagojik, eleştirel ama yapıcı.",
      };

      const system = [
        personaMap[req.persona],
        "Türkçe konuş.",
        "Cevabını JSON olarak döndür:",
        '{"reply": "...", "observed": {"askedForFactsAbout": [], "missedKeyFacts": []}}',
      ].join("\n");

      const transcript = req.transcript
        .map((t) => `${t.speaker === "user" ? "Avukat" : "Sen"}: ${t.text}`)
        .join("\n");
      const user = [
        `Vaka: ${req.case.title}`,
        `Özet: ${req.case.summary}`,
        "",
        "Önceki replikler:",
        transcript || "(henüz konuşma yok)",
        "",
        `Avukatın son söylediği: ${req.userTurn}`,
      ].join("\n");

      return chatJson(RolePlaySchema, system, user);
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
  };
}
