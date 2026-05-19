/**
 * MockAdapter — geliştirme ve demo için.
 *
 * Gerçek LLM çağrısı yok. Vakanın kendi içinde tanımlı feedback ve
 * idealAnswer alanlarını döndürür. Auditor pass-through.
 *
 * Bu adapter'ın amacı: UI'ı engine'e ve orchestrator interface'ine
 * bağlamak — Aşama 3'te OpenAI/Anthropic adapter'ı bunun yerine geçer
 * ve UI hiç değişmez.
 */

import { sources } from "@/content/sources";
import { defaultRubric } from "@/content/rubrics";
import type { RubricKey } from "@/content/types";
import type {
  AIOrchestrator,
  AssessmentRequest,
  AssessmentResponse,
  DimensionScore,
  GroundedRequest,
  GroundedResponse,
  RolePlayRequest,
  RolePlayResponse,
} from "./types";

export const mockAdapter: AIOrchestrator = {
  async ground(req: GroundedRequest): Promise<GroundedResponse> {
    // Vakanın mevcut node'unda picked option'ın source'larını al
    const node = req.case.nodes.find((n) => n.id === req.session.currentNode);
    const history = req.session.history.find((h) => h.nodeId === node?.id);
    const picked = node?.options?.find((o) => o.id === history?.chosenOptionId);
    const refs = picked?.sources ?? [];
    const verified = refs.filter((id) => sources[id]);

    if (verified.length === 0) {
      return {
        explanation:
          "Bu konuda doğrulanmış kaynak bulunamadı. Vaka editörüne bildir.",
        sourceRefs: [],
        noSourceFound: true,
      };
    }
    return {
      explanation: picked?.feedback ?? "Açıklama hazırlanmadı.",
      sourceRefs: verified,
      noSourceFound: false,
    };
  },

  async rolePlay(req: RolePlayRequest): Promise<RolePlayResponse> {
    // Mock: müvekkil her şeyi nazikçe doğrular, hâkim sertçe sorar.
    const persona = req.persona;
    const reply =
      persona === "muvekkil"
        ? "Evet avukat bey/hanım, dediğiniz gibi. Başka ne anlatmalıyım?"
        : persona === "hakim"
          ? "Meslektaşım, bu beyanınızın hukuki dayanağı nedir?"
          : "Karşı taraf olarak iddialarınıza şu an itiraz ediyorum.";
    return {
      reply,
      observed: { askedForFactsAbout: [], missedKeyFacts: [] },
    };
  },

  async assess(req: AssessmentRequest): Promise<AssessmentResponse> {
    // Mock: kullanıcının metin uzunluğuna göre kaba bir skor üret.
    const wordCount = req.userAnswer.trim().split(/\s+/).length;
    const baseScore = Math.min(4, Math.max(0, Math.floor(wordCount / 20))) as 0 | 1 | 2 | 3 | 4;

    const dims: DimensionScore[] = req.dimensions.map((d: RubricKey) => {
      const def = defaultRubric.dimensions.find((x) => x.key === d);
      return {
        dimension: d,
        score: baseScore,
        reason: def?.levels[String(baseScore) as "0" | "1" | "2" | "3" | "4"] ?? "—",
      };
    });

    return {
      scores: dims,
      missedIssues: wordCount < 40 ? ["Cevap kısa; gerekçe yetersiz."] : [],
      sourceRefs: [],
      nextStep: "Cevabını rubric kriterlerine göre tekrar gözden geçir.",
      flaggedForReview: false,
    };
  },
};
