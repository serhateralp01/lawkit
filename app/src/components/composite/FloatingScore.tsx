/**
 * FloatingScore — karar verince havadan yukarı çıkıp solan skor kartı.
 *
 * Birden fazla boyut tek seferde geldiğinde stack edilir.
 * Karar verince ekranda 1 saniye + fade out.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { RubricKey, Verdict } from "@/content/types";
import { defaultRubric } from "@/content/rubrics";
import { cn } from "@/lib/utils";

interface FloatingScoreProps {
  /** Bu pozitif veya negatif puan kartlarının listesi (örn. +3 mesele). */
  awarded?: Partial<Record<RubricKey, number>>;
  /** Verdict — renkleme için. */
  verdict?: Verdict;
  /** Görünür süre ms. */
  visibleMs?: number;
  className?: string;
  /** Her aksiyon için unique anahtar; aynı anda iki ardışık ödülde restart edilsin. */
  signal?: string | number;
}

export function FloatingScore({
  awarded,
  verdict,
  visibleMs = 1400,
  className,
  signal,
}: FloatingScoreProps) {
  const entries = awarded
    ? (Object.entries(awarded) as [RubricKey, number][]).filter(([, v]) => v > 0)
    : [];

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 top-1 -translate-x-1/2",
        className,
      )}
      aria-live="polite"
    >
      <AnimatePresence>
        {entries.length > 0 ? (
          <motion.div
            key={`burst-${signal}`}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex gap-2"
            onAnimationComplete={() => {
              // exit'i tetikleyen kontrol parent'ta; burada sadece auto-hide için ipucu.
              void visibleMs;
            }}
          >
            {entries.map(([k, v]) => {
              const dim = defaultRubric.dimensions.find((d) => d.key === k);
              return (
                <motion.div
                  key={k}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold shadow-md",
                    verdict === "good"
                      ? "bg-signal-positive text-white"
                      : verdict === "partial"
                        ? "bg-signal-warning text-ink-1"
                        : "bg-signal-critical text-white",
                  )}
                >
                  +{v} {dim?.short ?? k}
                </motion.div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
