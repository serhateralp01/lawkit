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

export interface CaseNode {
  id: string;
  kind: "decision" | "outcome" | "info";
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
}
