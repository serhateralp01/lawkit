/**
 * Skorlama kuralları.
 *
 * Tek sorumluluk: bir seçim ve mevcut ipucu kademesi verildiğinde,
 * bu adımda hangi boyutta kaç puan kazanıldığını üretmek.
 *
 * Kurallar:
 *   1. Bir boyutta o oturumda kazanılmış en yüksek skor korunur (monoton).
 *      Aynı boyutta düşük skor sonradan gelirse ledger düşmez.
 *   2. HintLadder ceiling: o node'da Kademe 2 açıldıysa node'un
 *      rubricTargets'taki boyutlar tavanı 3'e düşer. Kademe 3 → tavan 2.
 *      (Çerçeve §5: ZPD scaffolding fade.)
 *   3. Ceiling cezası yalnız mevcut node'daki seçimin skorlarına
 *      uygulanır; başka node'lardan gelen skorlar etkilenmez.
 *
 * Bu modül saf fonksiyonlardır — yan etkisi yok, test edilebilir.
 */

import type { CaseNode, CaseOption, RubricKey } from "@/content/types";
import type { HintLevel, RubricLedger } from "./types";

export function ceilingFor(hint: HintLevel): number | null {
  if (hint <= 1) return null;
  if (hint === 2) return 3;
  return 2; // hint === 3
}

/** Seçimden bu adımda kazanılan ham skorları, ceiling uygulayarak döndürür. */
export function awardForChoice(
  node: CaseNode,
  option: CaseOption,
  hint: HintLevel,
): Partial<Record<RubricKey, number>> {
  const raw = option.scores ?? {};
  const cap = ceilingFor(hint);
  const targets = new Set<RubricKey>(node.rubricTargets ?? []);

  if (cap === null) return { ...raw };

  const out: Partial<Record<RubricKey, number>> = {};
  for (const [k, v] of Object.entries(raw) as [RubricKey, number][]) {
    out[k] = targets.has(k) ? Math.min(v, cap) : v;
  }
  return out;
}

/** Defteri monotonik biçimde birleştirir — boyut bazında max. */
export function mergeLedger(
  prev: RubricLedger,
  add: Partial<Record<RubricKey, number>>,
): RubricLedger {
  const next: RubricLedger = { ...prev };
  for (const [k, v] of Object.entries(add) as [RubricKey, number][]) {
    next[k] = Math.max(next[k] ?? 0, v);
  }
  return next;
}

/** Boyut başına yüzdesel kazanım — UI için. /4 üzerinden 0–100. */
export function ledgerPercentages(
  ledger: RubricLedger,
  keys: RubricKey[],
): Record<RubricKey, number> {
  const out = {} as Record<RubricKey, number>;
  for (const k of keys) {
    const v = ledger[k];
    out[k] = typeof v === "number" ? (v / 4) * 100 : 0;
  }
  return out;
}
