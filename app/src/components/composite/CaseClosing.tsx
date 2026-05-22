/**
 * CaseClosing — vaka sonu sinematik kapanış sahnesi.
 *
 * Outcome'a varınca FeedbackPanel direkt açılmaz. Önce outcome.closingBeats
 * adım adım oynanır (dialogue bubble + sahne ifadesi). Sonunda "Sonucu gör"
 * butonu → FeedbackPanel.
 *
 * Mood'a göre arka plan tonu değişir; karakter portrait'lerinin yüz ifadesi
 * outcome ile uyumlu.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, SkipForward } from "lucide-react";
import type { CharacterDef, LegalCase, Outcome, OutcomeMood } from "@/content/types";
import { DialogueBubble, SceneCaption } from "./DialogueBubble";
import { cn } from "@/lib/utils";

interface Props {
  case: LegalCase;
  outcome: Outcome;
  onContinue: () => void;
}

const MOOD_BG: Record<OutcomeMood, string> = {
  triumph: "bg-gradient-to-br from-signal-positive/15 via-amber-soft/20 to-paper",
  neutral: "bg-gradient-to-br from-indigo-soft/20 via-paper to-paper",
  warning: "bg-gradient-to-br from-signal-warning/15 via-paper to-paper",
  loss: "bg-gradient-to-br from-signal-critical/15 via-paper to-paper",
};

export function CaseClosing({ case: legalCase, outcome, onContinue }: Props) {
  const beats = outcome.closingBeats ?? [];
  const cast = legalCase.cast ?? [];
  const lookup = new Map<string, CharacterDef>(cast.map((c) => [c.id, c]));

  const [step, setStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);

  // closingBeats yoksa direkt FeedbackPanel'e geç
  useEffect(() => {
    if (beats.length === 0) onContinue();
  }, [beats.length, onContinue]);

  useEffect(() => {
    setCanAdvance(false);
    const t = setTimeout(() => setCanAdvance(true), 700);
    return () => clearTimeout(t);
  }, [step]);

  if (beats.length === 0) return null;

  const visible = beats.slice(0, step + 1);
  const atEnd = step >= beats.length - 1;

  const speakerMood =
    outcome.mood === "triumph"
      ? "happy"
      : outcome.mood === "loss"
        ? "sad"
        : outcome.mood === "warning"
          ? "tense"
          : "neutral";

  return (
    <div className={cn("min-h-[60vh] rounded-2xl p-8 lg:p-12", MOOD_BG[outcome.mood])}>
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          type="button"
          onClick={onContinue}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line bg-paper/80 px-3 py-1.5 text-[11px] font-semibold text-ink-3 backdrop-blur hover:bg-paper"
        >
          <SkipForward className="size-3" /> Sonucu gör
        </button>

        <header className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
            Vakanın son sahnesi
          </p>
          <h2 className="font-display text-2xl font-bold text-ink-1 lg:text-3xl">
            {outcome.title}
          </h2>
        </header>

        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {visible.map((beat, idx) => {
              const speaker = beat.speakerId ? lookup.get(beat.speakerId) : undefined;

              if (!speaker && beat.setting) {
                return (
                  <motion.div
                    key={`beat-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SceneCaption text={beat.setting} />
                  </motion.div>
                );
              }

              if (!speaker) return null;

              return (
                <motion.div
                  key={`beat-${idx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <DialogueBubble
                    character={speaker}
                    text={beat.text}
                    mood={speakerMood === "neutral" ? "thinking" : speakerMood}
                    side={speaker.role === "muvekkil" ? "left" : "right"}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex justify-end pt-4">
          {!atEnd ? (
            <motion.button
              type="button"
              onClick={() => canAdvance && setStep((s) => s + 1)}
              disabled={!canAdvance}
              whileHover={canAdvance ? { x: 2 } : undefined}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-5 py-2.5 text-xs font-bold text-surface-raised hover:bg-ink-1/90 disabled:opacity-50"
            >
              Devam <ArrowRight className="size-3.5" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={onContinue}
              disabled={!canAdvance}
              whileHover={canAdvance ? { x: 2 } : undefined}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-6 py-3 text-sm font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
            >
              Karneye geç <ArrowRight className="size-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
