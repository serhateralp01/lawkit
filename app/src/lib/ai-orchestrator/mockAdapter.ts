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
  AiBranchRequest,
  AiBranchResponse,
  AssessmentRequest,
  AssessmentResponse,
  DimensionScore,
  GenerateCaseRequest,
  GenerateCaseResponse,
  GenerateQuestionRequest,
  GenerateQuestionResponse,
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

  async branch(req: AiBranchRequest): Promise<AiBranchResponse> {
    // Mock: ilk 'good' verdict'li candidate'i seç, yoksa ilkini.
    const good = req.candidates.find((c) => c.verdict === "good") ?? req.candidates[0];
    return {
      chosenNodeId: good?.nodeId ?? req.fallbackNodeId,
      reason: "Mock adapter: ilk olumlu dal seçildi.",
      scoreHint: {},
      verdict: good?.verdict ?? "partial",
      flaggedForReview: false,
    };
  },

  async generateCase(req: GenerateCaseRequest): Promise<GenerateCaseResponse> {
    // Mock: hardcoded vaka şablonunu döndür (DeepSeek olmadığında dev için)
    return {
      legalCase: {
        id: `mock_${req.branch}_${Date.now()}`,
        title: `Mock ${req.branch} vakası — ${req.theme ?? "genel"}`,
        branch: req.branch,
        difficulty: req.difficulty,
        estimatedMinutes: 10,
        rubricId: "rubric_v1",
        summary: "Mock vaka (gerçek LLM bağlanmadı).",
        facts: ["Mock olgu 1", "Mock olgu 2"],
        startNode: "n1",
        nodes: [
          { id: "n1", kind: "outcome", prompt: "Mock vaka", summary: "Bitti", idealAnswer: "—" },
        ],
      },
      qualityScore: 0.5,
      flaggedForReview: true,
      usedSources: req.contextSourceIds,
    };
  },

  async generateQuestions(req: GenerateQuestionRequest): Promise<GenerateQuestionResponse> {
    const branchLabels: Record<string, string> = {
      is_hukuku: "İş Hukuku",
      borclar: "Borçlar Hukuku",
      medeni: "Medeni Hukuk",
      medeni_usul: "Medeni Usul",
      ceza: "Ceza Hukuku",
      idare: "İdare Hukuku",
      ticaret: "Ticaret Hukuku",
    };
    const label = branchLabels[req.branch] ?? req.branch;
    const fakeQuestions = Array.from({ length: req.count }, (_, i) => ({
      id: `mock_q_${Date.now()}_${i}`,
      branch: req.branch,
      difficulty: req.difficulty,
      stem: `[Mock] ${label} — ${i + 1}. soru. ${req.contextSourceIds.length > 0 ? "Kaynak: " + req.contextSourceIds[0] : "Kaynaksız"}. Bu bir test sorusudur.`,
      choices: [
        { id: "a", text: "A şıkkı — doğru cevap" },
        { id: "b", text: "B şıkkı — çeldirici" },
        { id: "c", text: "C şıkkı — çeldirici" },
        { id: "d", text: "D şıkkı — tuzak" },
      ],
      correctId: "a",
      explanation: "Mock açıklama. Gerçek AI bağlanmadığı için detaylı açıklama üretilemedi.",
      distractorReasons: {
        b: "B yanlış çünkü...",
        c: "C ilgisiz.",
        d: "D tuzak.",
      },
      sources: req.contextSourceIds.slice(0, 2),
    }));

    return {
      questions: fakeQuestions,
      qualityScore: 0.5,
      flaggedForReview: true,
      usedSources: req.contextSourceIds,
    };
  },
};
