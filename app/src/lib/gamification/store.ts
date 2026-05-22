/**
 * Gamification store — zustand + localStorage persist.
 *
 * SSR güvenli: store create edilirken localStorage'a dokunmaz; ilk hydrate
 * client'ta zustand middleware tarafından yapılır.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CaseSession } from "@/lib/case-engine";
import type { RubricKey } from "@/content/types";
import type {
  CaseAttempt,
  DailyActivity,
  GamificationState,
} from "./types";
import { XP_RULES, MASTERY_THRESHOLD, MASTERY_CONSECUTIVE } from "./types";
import { pushAttemptToCloud, loadCloudAttempts, mergeAttempts } from "./cloudSync";

interface GamificationActions {
  recordAttempt: (session: CaseSession) => CaseAttempt;
  setDailyGoal: (n: number) => void;
  reset: () => void;
  /** Cloud'dan attempt'leri çek ve local ile merge et. Login sonrası çağrılır. */
  hydrateFromCloud: () => Promise<void>;
}

type Store = GamificationState & GamificationActions;

const initialState: GamificationState = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  dailyGoal: 1,
  recentDays: [],
  attempts: [],
};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isYesterday(prev: string, today: string): boolean {
  const p = new Date(prev + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((t.getTime() - p.getTime()) / (24 * 60 * 60 * 1000));
  return diff === 1;
}

function calcXp(session: CaseSession): { xp: number; hints: number } {
  let xp = XP_RULES.caseCompleted;
  let hints = 0;
  for (const step of session.history) {
    hints += step.hintLevel;
    for (const score of Object.values(step.awarded)) {
      if (score === 4) xp += XP_RULES.perfectDimension;
    }
  }
  xp -= hints * XP_RULES.hintPenalty;
  return { xp: Math.max(0, xp), hints };
}

function pushDay(days: DailyActivity[], today: string, xp: number): DailyActivity[] {
  const idx = days.findIndex((d) => d.date === today);
  if (idx >= 0) {
    const next = [...days];
    next[idx] = {
      ...next[idx],
      casesFinished: next[idx].casesFinished + 1,
      xpEarned: next[idx].xpEarned + xp,
    };
    return next.slice(-30);
  }
  return [...days, { date: today, casesFinished: 1, xpEarned: xp }].slice(-30);
}

export const useGamificationStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      setDailyGoal: (n) => set({ dailyGoal: Math.max(1, Math.min(10, n)) }),
      reset: () => set(initialState),
      recordAttempt: (session) => {
        const { xp: gained, hints } = calcXp(session);
        const today = todayLocal();
        const prev = get();

        const durationMs =
          session.history.length > 0
            ? session.history[session.history.length - 1].at - session.startedAt
            : 0;

        const attempt: CaseAttempt = {
          caseId: session.caseId,
          finishedAt: Date.now(),
          ledger: session.ledger,
          hintsOpened: hints,
          durationMs,
          xpEarned: gained,
        };

        const nextStreak =
          prev.lastActiveDate === today
            ? prev.streak
            : prev.lastActiveDate && isYesterday(prev.lastActiveDate, today)
              ? prev.streak + 1
              : 1;

        set({
          xp: prev.xp + gained,
          streak: nextStreak,
          lastActiveDate: today,
          recentDays: pushDay(prev.recentDays, today, gained),
          attempts: [...prev.attempts, attempt].slice(-100),
        });

        // Paralel cloud yazımı (login varsa). Hata olursa local kayıt yine durur.
        void pushAttemptToCloud(session, attempt);

        return attempt;
      },
      hydrateFromCloud: async () => {
        const cloud = await loadCloudAttempts();
        if (cloud.length === 0) return;
        const prev = get();
        const merged = mergeAttempts(prev.attempts, cloud);
        // XP toplamı yeniden hesapla — cloud kanonik
        const totalXp = merged.reduce((s, a) => s + a.xpEarned, 0);
        set({ attempts: merged, xp: totalXp });
      },
    }),
    {
      name: "lawkit.gamification.v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : ({} as Storage),
      ),
      skipHydration: false,
    },
  ),
);

/** Boyut başına ortalama, son `windowSize` denemede. */
export function dimensionAverages(
  attempts: CaseAttempt[],
  windowSize = 10,
): Partial<Record<RubricKey, number>> {
  const slice = attempts.slice(-windowSize);
  const totals: Partial<Record<RubricKey, { sum: number; count: number }>> = {};
  for (const a of slice) {
    for (const [k, v] of Object.entries(a.ledger) as [RubricKey, number][]) {
      const bucket = totals[k] ?? { sum: 0, count: 0 };
      bucket.sum += v;
      bucket.count += 1;
      totals[k] = bucket;
    }
  }
  const avg: Partial<Record<RubricKey, number>> = {};
  for (const [k, b] of Object.entries(totals) as [RubricKey, { sum: number; count: number }][]) {
    if (b.count > 0) avg[k] = b.sum / b.count;
  }
  return avg;
}

/** Belli bir boyutta son `MASTERY_CONSECUTIVE` denemenin ortalaması eşiği geçti mi. */
export function isMastered(attempts: CaseAttempt[], dim: RubricKey): boolean {
  const recent = attempts
    .filter((a) => a.ledger[dim] !== undefined)
    .slice(-MASTERY_CONSECUTIVE);
  if (recent.length < MASTERY_CONSECUTIVE) return false;
  const avg = recent.reduce((s, a) => s + (a.ledger[dim] ?? 0), 0) / recent.length;
  return avg >= MASTERY_THRESHOLD;
}

/** Bugünkü günlük hedef ilerlemesi (0..1 arası). */
export function dailyProgress(state: Pick<GamificationState, "recentDays" | "dailyGoal">): number {
  const today = todayLocal();
  const day = state.recentDays.find((d) => d.date === today);
  if (!day) return 0;
  return Math.min(1, day.casesFinished / state.dailyGoal);
}
