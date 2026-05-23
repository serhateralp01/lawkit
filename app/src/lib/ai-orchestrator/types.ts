/**
 * L4 AI Orchestrator — kontrat (yalnız tip + arayüz).
 *
 * Çerçeve §2'de tanımlı üç ayrık rol:
 *   - Grounded explanation: kullanıcının cevabını doğrulanmış kaynağa bağlar
 *   - Role-play: müvekkil/hâkim/karşı vekil simülasyonu
 *   - Assessment: rubrik tabanlı yapılandırılmış puanlama
 *
 * Bu modül *kontrat*tır — gerçek LLM çağrısını yapmaz. İlerleyen aşamada
 * (Aşama 3 — Dikey MVP) bu interface'i implement eden bir adapter
 * (örn. OpenAI Responses API + Structured Outputs) yazılacak.
 *
 * Her çıktı katı şemaya bağlıdır. Serbest metin yalnızca kontratta
 * tarif edilen alanlardadır ve yapılandırılmış zarfın içindedir.
 * Halüsinasyon riskine karşı Auditor middleware burada çalıştırılır.
 */

import type { CaseSession, StepRecord } from "@/lib/case-engine";
import type { LegalCase, LegalSource, RubricKey } from "@/content/types";

/* ─────────────── Grounded explanation ─────────────── */

export interface GroundedRequest {
  case: LegalCase;
  session: CaseSession;
  /** Hangi spesifik hukuki mesele için açıklama isteniyor */
  topic: string;
}

export interface GroundedResponse {
  /** Açıklama metni — sade Türkçe, terim doğru */
  explanation: string;
  /** Sadece doğrulanmış kaynak parçaları — uydurma yok */
  sourceRefs: string[];
  /** Kaynak bulunamadıysa true ve açıklama "doğrulanmış kaynak yok" der */
  noSourceFound: boolean;
}

/* ─────────────── Role-play ─────────────── */

export type Persona = "muvekkil" | "hakim" | "karsi_vekil" | "staj_patron";

export interface RolePlayRequest {
  case: LegalCase;
  session: CaseSession;
  persona: Persona;
  /** Önceki replikler */
  transcript: { speaker: "user" | "ai"; text: string }[];
  /** Kullanıcının son söylediği */
  userTurn: string;
}

export interface RolePlayResponse {
  /** Persona repliği */
  reply: string;
  /** Engine'e geri verilecek meta — kullanıcının ne sorduğunu / sormadığını işaretle */
  observed: {
    askedForFactsAbout: string[];
    missedKeyFacts: string[];
  };
}

/* ─────────────── Assessment ─────────────── */

export interface AssessmentRequest {
  case: LegalCase;
  session: CaseSession;
  /** Değerlendirilecek serbest metin cevap — örn. dilekçe parçası */
  userAnswer: string;
  /** Hangi boyutlarda puanlama isteniyor */
  dimensions: RubricKey[];
}

export interface DimensionScore {
  dimension: RubricKey;
  score: 0 | 1 | 2 | 3 | 4;
  /** Davranışsal seviye tanımına bağlı tek cümlelik gerekçe */
  reason: string;
}

export interface AssessmentResponse {
  /** Her boyut için 0-4 puan + gerekçe */
  scores: DimensionScore[];
  /** Kaçırılan hukuki meseleler */
  missedIssues: string[];
  /** Kaynak referansları (yalnızca doğrulanmış set'ten) */
  sourceRefs: string[];
  /** Önerilen sonraki adım */
  nextStep: string;
  /** Auditor ajanı bayrağı: halüsinasyon şüphesi varsa true → UI gizler */
  flaggedForReview: boolean;
}

/* ─────────────── AI Branch ─────────────── */

export interface AiBranchRequest {
  case: LegalCase;
  session: CaseSession;
  /** Öğrencinin serbest cevabı. */
  userText: string;
  /** Sahne içeriği — "Karşı vekil: müvekkilim haklı sebeple feshetti diyor." */
  context: string;
  /** AI'ın seçebileceği geçerli node id listesi + her birinin kısa açıklaması. */
  candidates: {
    nodeId: string;
    label: string;
    hint?: string;
    verdict: "good" | "partial" | "bad";
  }[];
  /** Tüm dallar AI başarısız olursa düşülecek. */
  fallbackNodeId: string;
  /** Puanlanacak rubric boyutları (opsiyonel). */
  scoreDimensions?: RubricKey[];
}

export interface AiBranchResponse {
  /** Seçilen node id (auditor doğrulandı). */
  chosenNodeId: string;
  /** Bu seçimi neden yaptın. */
  reason: string;
  /** AI'ın tavsiye ettiği rubric puanları. */
  scoreHint?: Partial<Record<RubricKey, number>>;
  /** Bu dalın verdict'i. */
  verdict: "good" | "partial" | "bad";
  /** Auditor reddetti mi. */
  flaggedForReview: boolean;
}

/* ─────────────── Case Generation ─────────────── */

export interface GenerateCaseRequest {
  /** Hangi hukuk dalı */
  branch: "is_hukuku" | "borclar" | "medeni" | "medeni_usul" | "ceza" | "idare" | "ticaret";
  /** 1-4 zorluk */
  difficulty: 1 | 2 | 3 | 4;
  /** Opsiyonel tema: "fesih", "tazminat", "kıdem" gibi */
  theme?: string;
  /** Karakter tonu önerisi: "yaşlı müvekkil", "öğrenci", "esnaf" */
  characterTone?: string;
  /** İlgili kaynak ID'leri (RAG ile çekilmiş, prompt'a verilecek) */
  contextSourceIds: string[];
}

export interface GenerateCaseResponse {
  /** Üretilen vaka — tam LegalCase objesi */
  legalCase: LegalCase;
  /** Quality auditor skoru 0-1 */
  qualityScore: number;
  /** Auditor reddetti mi */
  flaggedForReview: boolean;
  /** AI'ın kullandığı raw context (debug için) */
  usedSources: string[];
}

/* ─────────────── Adapter ─────────────── */

/**
 * Tek arayüz, dört rol. Implementasyonlar:
 *   - MockAdapter (bu repo, demo/test için)
 *   - OpenRouterAdapter (canlı LLM)
 *
 * Her implementasyon Auditor middleware'i kendi içinde çağırır.
 * Çıktı flaggedForReview=true ise UI sadece "denetimde" yazar.
 */
export interface AIOrchestrator {
  ground(req: GroundedRequest): Promise<GroundedResponse>;
  rolePlay(req: RolePlayRequest): Promise<RolePlayResponse>;
  assess(req: AssessmentRequest): Promise<AssessmentResponse>;
  branch(req: AiBranchRequest): Promise<AiBranchResponse>;
  generateCase(req: GenerateCaseRequest): Promise<GenerateCaseResponse>;
}

/* ─────────────── Auditor ─────────────── */

export interface AuditorContext {
  /** Doğrulanmış kaynak veritabanı; uydurma denetimi için */
  knownSources: Record<string, LegalSource>;
  /** Engine state'i — kullanıcı ne yaptı, neyi kaçırdı */
  history: StepRecord[];
}

export interface AuditReport {
  passed: boolean;
  /** Hangi cümle/iddia hangi kaynakta destekleniyor */
  citations: { claim: string; sourceId?: string; supported: boolean }[];
  /** Auditor neden reddetti — UI loglar */
  rejectionReason?: string;
}
