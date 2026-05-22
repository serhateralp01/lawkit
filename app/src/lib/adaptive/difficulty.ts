/**
 * Adaptif zorluk — kullanıcı geçmişine göre vaka deneyimini ayarlar.
 *
 * İki kanal:
 *   1) Hint quota: mastery yüksek boyutlarda kullanıcı 1-2 ipucu alabilir.
 *      Engine'in ceiling cezası ZATEN var; bu üst limit nümerik (max açılabilen
 *      rung). UI bu sayıyı okur ve disable eder.
 *
 *   2) Vaka önerme: en zayıf boyut hangi vakada en sık işliyor → karne'de
 *      "Sana önerilen" rozeti.
 */

import type { LegalCase, RubricKey } from "@/content/types";
import type { CaseAttempt } from "@/lib/gamification/types";
import { dimensionAverages } from "@/lib/gamification/store";

/* ────────── Hint quota ────────── */

export interface HintQuota {
  /** En fazla bu rung'a kadar açabilir (0-3). */
  maxRung: 1 | 2 | 3;
  /** UI'a gösterilecek kısa not. */
  reason: string;
}

/**
 * Vakanın bir node'unun rubricTargets'larına göre hint quota'sı.
 * Eğer hedef boyutlardan biri mastery'de (avg ≥ 3.5) → maxRung = 1.
 * Hepsinde orta (avg 2.5-3.5) → maxRung = 2.
 * Diğer durumlarda 3 (sınırsız).
 */
export function computeHintQuota(
  rubricTargets: RubricKey[] | undefined,
  attempts: CaseAttempt[],
): HintQuota {
  if (!rubricTargets || rubricTargets.length === 0) {
    return { maxRung: 3, reason: "" };
  }
  if (attempts.length < 3) {
    return { maxRung: 3, reason: "" }; // Yeterli veri yok
  }

  const avgs = dimensionAverages(attempts);
  const targetAvgs = rubricTargets
    .map((k) => avgs[k])
    .filter((x): x is number => typeof x === "number");

  if (targetAvgs.length === 0) {
    return { maxRung: 3, reason: "" };
  }

  const maxAvg = Math.max(...targetAvgs);
  const minAvg = Math.min(...targetAvgs);

  if (maxAvg >= 3.5) {
    return {
      maxRung: 1,
      reason: "Bu konuda ustalaştın — ipucu sınırı: 1",
    };
  }
  if (minAvg >= 2.5) {
    return {
      maxRung: 2,
      reason: "Orta seviyedesin — ipucu sınırı: 2",
    };
  }
  return { maxRung: 3, reason: "" };
}

/* ────────── Vaka önerme ────────── */

export interface CaseRecommendation {
  caseId: string;
  reason: string;
  weakestDimension: RubricKey;
  weakestAvg: number;
}

/**
 * En zayıf boyutu bul, hangi vaka bu boyutta en çok node'da çalışıyor onu öner.
 * Daha önce hiç oynanmamış vakaları öncelikle al.
 */
export function recommendCase(
  cases: LegalCase[],
  attempts: CaseAttempt[],
): CaseRecommendation | null {
  if (attempts.length < 2) {
    // Yeterli veri yok — ilk derin vakayı öner
    const deep = cases.find((c) => c.outcomes && c.outcomes.length > 1);
    if (deep) {
      return {
        caseId: deep.id,
        reason: "İlk derin vakanı buradan başla",
        weakestDimension: "mesele",
        weakestAvg: 0,
      };
    }
    return null;
  }

  const avgs = dimensionAverages(attempts);
  const entries = Object.entries(avgs) as [RubricKey, number][];
  if (entries.length === 0) return null;

  // En düşük ortalama
  entries.sort((a, b) => a[1] - b[1]);
  const [weakestDim, weakestAvg] = entries[0];

  // Bu boyutu en çok hedefleyen + daha önce oynanmamış vaka
  const playedCaseIds = new Set(attempts.map((a) => a.caseId));

  // Vakaları skorla: bu dimension hedef alınan node sayısı + öncelik:
  // önce oynanmamış, sonra derin (outcomes var)
  const scored = cases.map((c) => {
    const targetCount = c.nodes.reduce((sum, n) => {
      return sum + (n.rubricTargets?.includes(weakestDim) ? 1 : 0);
    }, 0);
    return {
      case: c,
      targetCount,
      played: playedCaseIds.has(c.id),
      isDeep: !!(c.outcomes && c.outcomes.length > 1),
    };
  });

  // Sıralama: targetCount desc, oynanmamış öncelikli, derin öncelikli
  scored.sort((a, b) => {
    if (a.played !== b.played) return a.played ? 1 : -1;
    if (a.isDeep !== b.isDeep) return a.isDeep ? -1 : 1;
    return b.targetCount - a.targetCount;
  });

  const best = scored[0];
  if (!best || best.targetCount === 0) return null;

  const dimLabel: Record<RubricKey, string> = {
    olay: "Olayı Okuma",
    mesele: "Hukuki Teşhis",
    usul: "Usul Bilgisi",
    maddi: "Hukuki Dayanak",
    gerekce: "Mantık Zinciri",
    risk: "Risk Yönetimi",
    ifade: "Hukuki İfade",
  };

  return {
    caseId: best.case.id,
    reason: `${dimLabel[weakestDim]} alanında geliştirmen lazım`,
    weakestDimension: weakestDim,
    weakestAvg,
  };
}
