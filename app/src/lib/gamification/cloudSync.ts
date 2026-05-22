/**
 * Gamification cloud sync — Supabase'e attempt yazma + okuma + lokal merge.
 *
 * Strateji:
 *   - User login değilse: sadece localStorage (mevcut davranış)
 *   - User login ise: recordAttempt() paralel hem local'e (anlık UI) hem
 *     case_attempts tablosuna yazar
 *   - Sayfa açılışında loadCloudAttempts() çağrılır; local'deki kayıtlarla
 *     merge edilir (en yeni 100 tutulur)
 */

import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";
import type { CaseSession } from "@/lib/case-engine";
import type { CaseAttempt } from "./types";

export interface CloudAttemptRow {
  id: string;
  user_id: string;
  case_id: string;
  outcome_id: string | null;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  hints_opened: number;
  xp_earned: number;
  ledger: Record<string, number>;
}

/** Cloud satırını UI CaseAttempt formatına çevir. */
function fromRow(r: CloudAttemptRow): CaseAttempt {
  return {
    caseId: r.case_id,
    finishedAt: new Date(r.finished_at).getTime(),
    ledger: r.ledger,
    hintsOpened: r.hints_opened,
    durationMs: r.duration_ms,
    xpEarned: r.xp_earned,
  };
}

/** Local attempt'i cloud row'a çevir. */
function toRow(
  userId: string,
  session: CaseSession,
  attempt: CaseAttempt,
): Omit<CloudAttemptRow, "id"> {
  return {
    user_id: userId,
    case_id: attempt.caseId,
    outcome_id: session.outcomeId ?? null,
    started_at: new Date(session.startedAt).toISOString(),
    finished_at: new Date(attempt.finishedAt).toISOString(),
    duration_ms: attempt.durationMs,
    hints_opened: attempt.hintsOpened,
    xp_earned: attempt.xpEarned,
    ledger: attempt.ledger as Record<string, number>,
  };
}

/** Aktif kullanıcı varsa attempt'i case_attempts'e yaz. Hata olursa sessiz fail. */
export async function pushAttemptToCloud(
  session: CaseSession,
  attempt: CaseAttempt,
): Promise<void> {
  if (!hasSupabaseConfig()) return;
  try {
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const row = toRow(user.id, session, attempt);
    const { error } = await supabase.from("case_attempts").insert(row);
    if (error) console.warn("[cloudSync] insert failed:", error.message);
  } catch (e) {
    console.warn("[cloudSync] push error:", e);
  }
}

/** Kullanıcının tüm cloud attempt'lerini en yeniden eskiye al (en fazla 100). */
export async function loadCloudAttempts(): Promise<CaseAttempt[]> {
  if (!hasSupabaseConfig()) return [];
  try {
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("case_attempts")
      .select("*")
      .eq("user_id", user.id)
      .order("finished_at", { ascending: false })
      .limit(100);
    if (error) {
      console.warn("[cloudSync] load failed:", error.message);
      return [];
    }
    return (data ?? []).map(fromRow).reverse(); // eskiye → yeniye sırada UI'a uygun
  } catch (e) {
    console.warn("[cloudSync] load error:", e);
    return [];
  }
}

/** Local + cloud attempt'leri birleştir, deduplicate et (caseId + finishedAt). */
export function mergeAttempts(local: CaseAttempt[], cloud: CaseAttempt[]): CaseAttempt[] {
  const key = (a: CaseAttempt) => `${a.caseId}-${a.finishedAt}`;
  const seen = new Map<string, CaseAttempt>();
  for (const a of [...cloud, ...local]) seen.set(key(a), a);
  return Array.from(seen.values())
    .sort((a, b) => a.finishedAt - b.finishedAt)
    .slice(-100);
}
