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
}
