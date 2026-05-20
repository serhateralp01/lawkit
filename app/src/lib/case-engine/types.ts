/**
 * L3 Case Engine — type sözlüğü.
 *
 * Engine LLM çağırmaz, render yapmaz, ağ yapmaz. Sadece:
 *   1. Vakanın hangi düğümünde olduğumuzu hatırlar (CaseSession)
 *   2. Bir kullanıcı aksiyonunu (seçim / ipucu açma / ilerleme) saf bir
 *      reducer geçişi olarak uygular (StepEvent → CaseSession')
 *   3. Rubric skor defterini (RubricLedger) günceller ve ceiling
 *      kurallarını uygular (HintLadder cezası)
 *
 * Bilim:
 *   - Cathy Moore (Action Mapping): her node bir karar
 *   - Vygotsky ZPD + Pea: hint ladder, ceiling fade
 *   - AAC&U VALUE + Brookhart: boyut bazlı puan, toplam yok
 *   - Bloom mastery: 0–4 davranışsal seviye
 */

import type {
  CaseNode,
  CaseOption,
  LegalCase,
  Outcome,
  RubricKey,
  Verdict,
} from "@/content/types";

export type HintLevel = 0 | 1 | 2 | 3;

/** Bir node'da kullanıcının ne yaptığının değişmez kaydı. */
export interface StepRecord {
  nodeId: string;
  chosenOptionId?: string;
  /** O node'da ne kadar ipucu açtı (0–3). */
  hintLevel: HintLevel;
  /** Reducer çıktığında o node için kazanılmış skorlar (ceiling uygulanmış). */
  awarded: Partial<Record<RubricKey, number>>;
  /** Verdict — pedagojik geri bildirim renkleri için. */
  verdict?: Verdict;
  /** UTC ms, replay/analytics için. */
  at: number;
  /** open_text / ai_branch / chat — kullanıcının serbest metin girdisi. */
  freeText?: string;
  /** ai_branch sonucunda AI'ın seçtiği node id (audit izi). */
  aiChosenNodeId?: string;
  /** AI'ın gerekçesi (debug + replay). */
  aiReason?: string;
  /** client_chat için yapılan tüm tur turn'ler. */
  chatTurns?: { speaker: "user" | "ai"; text: string; at: number }[];
}

/** Skor defteri — boyut başına oturum boyunca kazanılmış en yüksek puan. */
export type RubricLedger = Partial<Record<RubricKey, number>>;

export interface CaseSession {
  caseId: string;
  startNode: string;
  currentNode: string;
  /** Sıralı geçmiş — replay, undo, eval için. */
  history: StepRecord[];
  /** Boyut başına en yüksek kazanılmış skor. */
  ledger: RubricLedger;
  /** Vaka outcome node'una varıldı mı. */
  done: boolean;
  /** Vaka çoklu outcome içeriyorsa hangi outcome'a route edildi. */
  outcomeId?: string;
  /** Eval/audit için, oturum başlangıç zamanı. */
  startedAt: number;
}

export type StepEvent =
  | { type: "pick"; option: CaseOption }
  | { type: "open-hint"; rung: 1 | 2 | 3 }
  | { type: "advance" }
  | { type: "reset" }
  | {
      type: "submit_text";
      freeText: string;
      awarded?: Partial<Record<RubricKey, number>>;
      verdict?: Verdict;
    }
  | {
      type: "ai_branch_decided";
      freeText: string;
      chosenNodeId: string;
      reason?: string;
      awarded?: Partial<Record<RubricKey, number>>;
      verdict?: Verdict;
    }
  | {
      type: "chat_turn";
      userText: string;
      aiText: string;
    }
  | { type: "chat_finish"; awarded?: Partial<Record<RubricKey, number>> };

/** Engine'in saf cevabı: yeni state + opsiyonel side-effect notları. */
export interface StepResult {
  session: CaseSession;
  /** UI hint: bu adımda ceiling cezası uygulandı mı, hangi boyutta. */
  ceilingApplied?: { dimension: RubricKey; ceiling: number };
}

/** Engine bir vakayı + rubrik çözünürlüğünü ister. */
export interface EngineContext {
  case: LegalCase;
  /** Hangi node bir karar mı outcome mu — engine içinden çözülür. */
  resolveNode: (id: string) => CaseNode | undefined;
}
