/**
 * L2 İçerik katmanı — TypeScript tipleri.
 * content/schemas/*.json kanonik referans; bu modül runtime'da kullanılan tipleştirilmiş kopya.
 */

export type RubricKey = "olay" | "mesele" | "usul" | "maddi" | "gerekce" | "risk" | "ifade";

export interface RubricDimension {
  key: RubricKey;
  label: string;
  short: string;
  definition: string;
  levels: Record<"0" | "1" | "2" | "3" | "4", string>;
}

export interface Rubric {
  id: string;
  version: string;
  description: string;
  dimensions: RubricDimension[];
  studentVisibleDimensions: RubricKey[];
}

export interface LegalSource {
  id: string;
  kind: "kanun" | "ictihat" | "doktrin" | "yonetmelik";
  shortTitle: string;
  fullTitle?: string;
  body: string;
  url?: string;
  verifiedAt?: string;
  verifier?: string;
}

export type Verdict = "good" | "partial" | "bad";

/**
 * Vakanın konuşan rolleri. 'narrator' AI-anlatıcı, varsayılan.
 * Diğerleri AI-orchestrator role-play personalarıyla eşleşir.
 */
export type Speaker =
  | "narrator"
  | "muvekkil"
  | "hakim"
  | "karsi_vekil"
  | "karsi_taraf"
  | "staj_patron"
  | "katip";

export type CharacterMood = "neutral" | "happy" | "sad" | "tense" | "thinking";

export interface CharacterDef {
  /** Unique id within case, e.g. "ayse_hanim", "hakim_demir". */
  id: string;
  /** Hangi role bürünüyor — Speaker tipinden bir değer. */
  role: Speaker;
  /** UI'da görünen isim, "Ayşe Hanım", "Hâkim Demir". */
  name: string;
  /** Tek satır arketip, "Tekstil işçisi, 7 yıl kıdemli". */
  archetype?: string;
  /** Avatar baş harfleri için ham; verilmezse name'den türetilir. */
  initials?: string;
  /** OKLCH renk tonu (0–360) — portrait arka planı. */
  hue?: number;
}

export interface CaseOption {
  id: string;
  label: string;
  scores?: Partial<Record<RubricKey, number>>;
  feedback?: string;
  next: string;
  verdict: Verdict;
  sources?: string[];
}

/* ───────── Yeni node tipleri (Tur 1.7) ───────── */

export type NodeKind =
  | "decision"
  | "outcome"
  | "info"
  | "open_text"
  | "ai_branch"
  | "client_chat"
  | "checkpoint";

/** AI veya rubric ile değerlendirilecek serbest metin sahnesi. */
export interface OpenTextConfig {
  /** Hangi rubric boyutları puanlanacak. */
  assessDimensions: RubricKey[];
  /** İstek minimum karakter sayısı (UI validate eder). */
  minChars?: number;
  /** Patron / hâkim'in puanlama sonrası tek satır geri bildirimi. */
  graderHint?: string;
  /** Sonraki node id (assess sonucu hangi olursa olsun). */
  next: string;
}

/** AI'ın öğrencinin serbest cevabına göre dal seçeceği sahne. */
export interface AiBranchConfig {
  /** Olası dallar — AI bunlardan birini seçmek zorunda. */
  branches: {
    nodeId: string;
    label: string;
    hint?: string; // AI'a verilen kısa açıklama
    verdict: Verdict;
  }[];
  /** AI'a verilecek ek bağlam — "karşı vekil iddiası: ...". */
  context?: string;
  /** Tüm AI başarısız olursa düşülecek default node. */
  fallbackNodeId: string;
}

/** Müvekkille N tur sohbet. AI persona = speaker. */
export interface ClientChatConfig {
  /** Maksimum tur sayısı (öğrenci-AI ikili). */
  maxTurns: number;
  /** Bu kadarı zorunlu olgu — sorulmazsa risk skoru düşer. */
  requiredFacts?: string[];
  /** AI persona açıklaması (ek prompt). */
  personaBrief: string;
  /** Sohbet bitince devam edilecek node. */
  next: string;
}

/** Ledger durumuna göre engine'in otomatik route ettiği görünmez sahne. */
export interface CheckpointConfig {
  /** Sıralı kurallar — ilk eşleşen kazanır. */
  branches: {
    condition: Condition;
    nodeId: string;
  }[];
  /** Hiçbir kural eşleşmezse buraya. */
  fallbackNodeId: string;
}

export interface CaseNode {
  id: string;
  kind: NodeKind;
  prompt?: string;
  rubricTargets?: RubricKey[];
  options?: CaseOption[];
  summary?: string;
  idealAnswer?: string;
  /** Bu node'da prompt'u kim söylüyor — sahne karesi. */
  speaker?: Speaker;
  /** Speaker character id, cast içinden — yoksa role'dan ilk eşleşen alınır. */
  speakerId?: string;
  /** Sahnedeki tüm görünür karakterler (background). İlk eleman konuşan değil; speakerId ayrı tutulur. */
  sceneCharacters?: string[];
  /** Sahne açıklayıcı tek satır — "Avukat odası, müvekkil masaya oturmuş." */
  scene?: string;
  /** kind === 'open_text' için. */
  openText?: OpenTextConfig;
  /** kind === 'ai_branch' için. */
  aiBranch?: AiBranchConfig;
  /** kind === 'client_chat' için. */
  clientChat?: ClientChatConfig;
  /** kind === 'checkpoint' için. */
  checkpoint?: CheckpointConfig;
  /** Hangi perdeye ait (UI üst şerit ilerlemesi için). */
  act?: 1 | 2 | 3;
}

/* ───────── Çoklu outcome (vaka sonu seçimi) ───────── */

export type OutcomeMood = "triumph" | "neutral" | "warning" | "loss";

/** Outcome condition — saf JSON, engine değerlendirir. */
export interface Condition {
  /** 5 öğrenci-görünür boyutun ortalaması ≥. */
  minLedgerAvg?: number;
  /** Toplam ipucu k.3'lerin sayısı ≤. */
  maxHints?: number;
  /** Her boyut ≥. */
  requireDimGte?: Partial<Record<RubricKey, number>>;
  /** History'de bu (nodeId,optionId) çiftlerinden biri varsa şart sağlanır. */
  criticalMiss?: { nodeId: string; optionId: string }[];
  /** En fazla bu kadar 'bad' karar var. */
  maxBadVerdicts?: number;
  /** Her zaman eşleşir — fallback. */
  default?: boolean;
}

export interface Outcome {
  id: string;
  title: string;
  mood: OutcomeMood;
  /** Anlatımlı sonuç metni. */
  narrative: string;
  /** Worked example — hangi yolu seçmek doğruydu. */
  idealAnswer: string;
  /** Bu outcome'a varan kritik dönüm noktaları (UI'da vurgulanır). */
  pivotalDecisions?: { nodeId: string; explanation: string }[];
  /** Engine eşleşme kuralı. */
  condition: Condition;
}

export interface LegalCase {
  id: string;
  title: string;
  branch: "is_hukuku" | "borclar" | "medeni" | "medeni_usul" | "ceza" | "idare" | "ticaret";
  difficulty: 1 | 2 | 3 | 4;
  estimatedMinutes: number;
  rubricId: string;
  summary: string;
  facts: string[];
  documents?: { label: string; ref?: string }[];
  startNode: string;
  nodes: CaseNode[];
  /** Vakanın karakter kadrosu — intro + sahnelerde kullanılır. */
  cast?: CharacterDef[];
  /** Vaka açılışında müvekkilin / anlatıcının söyleyeceği giriş metni dizisi. */
  intro?: {
    setting: string;
    beats: { speakerId?: string; text: string }[];
  };
  /** Çoklu sonuç — engine ledger + history özetine göre route eder. */
  outcomes?: Outcome[];
  /** UI üst şerit için perde adları. */
  acts?: { number: 1 | 2 | 3; title: string; setting?: string }[];
}
