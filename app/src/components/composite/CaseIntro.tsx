/**
 * CaseIntro — vaka açılış sahnesi.
 *
 * Akış:
 *  1. Sahne fotoğraf-altı yazısı belirir ("Avukatlık ofisinde, Pazartesi sabahı")
 *  2. Müvekkil sahneye girer (slide-in, mood: tense)
 *  3. Bubble'ları sırayla atar (typewriter), her bitince devam butonu açılır
 *  4. Son bubble → "Vakaya başla" → onStart()
 *  Skip: sağ üst köşe; localStorage'a "intro_seen_{caseId}" yazar, sonraki açılışlarda intro skip.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, SkipForward } from "lucide-react";
import type { LegalCase } from "@/content/types";
import { DialogueBubble, SceneCaption } from "./DialogueBubble";
import { cn } from "@/lib/utils";

interface Props {
  case: LegalCase;
  onStart: () => void;
  className?: string;
}

const STORAGE_PREFIX = "lawkit.intro_seen.";

export function CaseIntro({ case: legalCase, onStart, className }: Props) {
  const beats = legalCase.intro?.beats ?? [];
  const cast = legalCase.cast ?? [];
  const [step, setStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);

  const visible = beats.slice(0, step + 1);

  // Her bubble göründükten ~600ms sonra ileri butonu açılsın
  // (typewriter bitmemiş olsa bile yetenekli okuyucu hızlı geçebilsin)
  useEffect(() => {
    setCanAdvance(false);
    const t = setTimeout(() => setCanAdvance(true), 700);
    return () => clearTimeout(t);
  }, [step]);

  const lookup = useMemo(() => {
    const m = new Map(cast.map((c) => [c.id, c]));
    return m;
  }, [cast]);

  const skipIntro = () => {
    try {
      localStorage.setItem(STORAGE_PREFIX + legalCase.id, "1");
    } catch {
      /* SSR / private mode */
    }
    onStart();
  };

  if (beats.length === 0) {
    // intro tanımlı değilse direkt geç
    onStart();
    return null;
  }

  const atEnd = step >= beats.length - 1;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={skipIntro}
        className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-3 py-1.5 text-[11px] font-semibold text-ink-3 hover:bg-surface-sunken"
      >
        <SkipForward className="size-3" /> Intro'yu atla
      </button>

      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
          Vaka · {legalCase.id}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-1 lg:text-3xl">
          {legalCase.title}
        </h1>
      </header>

      {legalCase.intro?.setting ? (
        <div className="mb-6">
          <SceneCaption text={legalCase.intro.setting} />
        </div>
      ) : null}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {visible.map((beat, idx) => {
            const speaker = beat.speakerId ? lookup.get(beat.speakerId) : undefined;
            if (!speaker) return null;
            return (
              <motion.div
                key={`beat-${idx}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <DialogueBubble
                  character={speaker}
                  text={beat.text}
                  mood={
                    speaker.role === "muvekkil" ? "tense" : "thinking"
                  }
                  emphasis={false}
                  side={speaker.role === "staj_patron" ? "right" : "left"}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        {!atEnd ? (
          <motion.button
            type="button"
            onClick={() => canAdvance && setStep((s) => s + 1)}
            disabled={!canAdvance}
            whileHover={canAdvance ? { x: 2 } : undefined}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90 disabled:opacity-50"
          >
            Devam <ArrowRight className="size-3.5" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={onStart}
            disabled={!canAdvance}
            whileHover={canAdvance ? { x: 2 } : undefined}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-5 py-2.5 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
          >
            Vakaya başla <ArrowRight className="size-3.5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

export function hasSeenIntro(caseId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_PREFIX + caseId) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(caseId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + caseId, "1");
  } catch {
    /* ignore */
  }
}
