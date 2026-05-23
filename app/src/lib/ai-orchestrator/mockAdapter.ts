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
  GeneratedCaseScenario,
  GeneratePetitionRequest,
  GeneratePetitionResponse,
  GenerateCaseRequest,
  GroundedRequest,
  GroundedResponse,
  LegalBranch,
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

  async generatePetition(req: GeneratePetitionRequest): Promise<GeneratePetitionResponse> {
    const branch: LegalBranch = req.branch ?? "borclar";
    const slug = `mock_${branch}_${Date.now().toString(36)}`;
    return {
      id: slug,
      title: "AI Üretimi Dilekçe Şablonu (Mock)",
      summary: `Senaryo: ${req.userScenario.slice(0, 120)}…`,
      branch,
      estimatedMinutes: 15,
      difficulty: 3,
      sections: [
        {
          key: "mahkeme",
          title: "Mahkeme Başlığı",
          guidance: "Yetkili + görevli mahkemeyi açıkça yaz.",
          placeholder: "[YETKİLİ] MAHKEMESİ SAYIN HAKİMLİĞİNE",
          minChars: 40,
          assessDimensions: ["usul", "ifade"],
          graderHint: "Doğru görevli mahkeme + yetkili yer.",
        },
        {
          key: "vakialar",
          title: "Vakıalar",
          guidance: "Olay örgüsünü kronolojik yaz.",
          placeholder: "1. …\n2. …\n3. …",
          minChars: 180,
          assessDimensions: ["olay", "mesele"],
          graderHint: "Kronolojik, somut, belge dayanaklı.",
        },
        {
          key: "sonuc_istem",
          title: "Sonuç ve İstem",
          guidance: "Numaralı + miktarlı talepler.",
          placeholder: "1- …\n2- …",
          minChars: 100,
          assessDimensions: ["gerekce", "ifade"],
          graderHint: "Talepler net + faiz başlangıcı + giderler.",
        },
      ],
      flaggedForReview: false,
    };
  },

  async generateCase(req: GenerateCaseRequest): Promise<GeneratedCaseScenario> {
    const branch: LegalBranch = req.branch ?? "borclar";
    const slug = `mock_case_${branch}_${Date.now().toString(36)}`;
    const scenarioText =
      req.userScenario ??
      [
        req.theme ? `Konu: ${req.theme}.` : "",
        req.characterTone ? `Müvekkil: ${req.characterTone}.` : "",
        "Anlaşmazlık devam ediyor ve hukuki çözüm aranıyor.",
      ]
        .filter(Boolean)
        .join(" ");
    return {
      id: slug,
      title:
        (req.theme ? `${req.theme} · ` : "") + "AI Üretimi Vaka (Mock)",
      branch,
      summary: scenarioText.slice(0, 200),
      clientNarrative:
        "Müvekkil senin önünde oturuyor. " +
        (req.characterTone ? `Karakter: ${req.characterTone}. ` : "") +
        "Yorgun ama umutlu, anlatmaya başlıyor: " +
        scenarioText.slice(0, 240),
      keyIssues: [
        "Hukuki nitelik tespiti",
        "Görevli + yetkili mahkeme",
        "Zamanaşımı / hak düşürücü süre",
      ],
      expectedFirstMoves: [
        "Olguları kronolojik dök",
        "İlgili mevzuat maddelerini tara",
        "Delillerin tamamlığını test et",
      ],
      difficulty: req.difficulty ?? 3,
      estimatedMinutes: 12,
      flaggedForReview: false,
    };
  },
};
