/**
 * Gamification veri modeli.
 *
 * Tasarım kararı: Engine'in saf reducer'ı bozulmaz. Gamification ayrı katman.
 * Vaka tamamlandığında `recordAttempt()` çağrılır; geri kalanı türetilir.
 *
 * Persist: zustand + localStorage. Tur 2'de Supabase'e (cloud sync) taşınacak.
 * `GamificationStore` arayüzü değişmeyecek — sadece persist adaptörü değişecek.
 */

import type { RubricKey } from "@/content/types";

export interface CaseAttempt {
  caseId: string;
  finishedAt: number;
  ledger: Partial<Record<RubricKey, number>>;
  hintsOpened: number;
  durationMs: number;
  xpEarned: number;
}

export interface DailyActivity {
  /** YYYY-MM-DD lokal */
  date: string;
  casesFinished: number;
  xpEarned: number;
}

export interface GamificationState {
  /** Toplam XP. */
  xp: number;
  /** Ardışık aktif gün sayısı. */
  streak: number;
  /** Son aktif gün YYYY-MM-DD; rollover karşılaştırması için. */
  lastActiveDate: string | null;
  /** Günlük hedef — varsayılan 1 vaka. */
  dailyGoal: number;
  /** Son 30 günün özet aktivitesi. */
  recentDays: DailyActivity[];
  /** Tüm vaka denemeleri (en fazla 100 tutulur, eski kayıtlar düşer). */
  attempts: CaseAttempt[];
}

export const XP_RULES = {
  caseCompleted: 50,
  perfectDimension: 10,
  hintPenalty: 5,
} as const;

export const MASTERY_THRESHOLD = 3.5;
export const MASTERY_CONSECUTIVE = 3;
