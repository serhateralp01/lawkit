/**
 * StageView — vaka sahnesi başı: sahne arka planı + konuşma kartı.
 *
 * Tasarım:
 *   - Üst sol: aktif konuşmacının avatar + isim + arketip kartı
 *   - Üst sağ: sahnedeki diğer karakterler (küçük avatar şeridi)
 *   - Alt orta: sahne caption (italik, subtitle gibi)
 *   - Arka plan: perde yapısına göre subtle illustration
 *
 * Bubble metni burada DEĞİL — vaka route'unun aşağısında orijinal bubble
 * kalıyor. Bu component sadece "kim, nerede" sahne kurar.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { CharacterDef } from "@/content/types";
import { HumanAvatar, roleLabel } from "./HumanAvatar";
import { StageBackdrop } from "./StageBackdrop";
import { cn } from "@/lib/utils";

interface Props {
  act?: 1 | 2 | 3;
  speaker?: CharacterDef;
  others: CharacterDef[];
  speakerMood?: "neutral" | "happy" | "sad" | "tense" | "thinking";
  caption?: string;
  className?: string;
}

const ACT_LABEL: Record<1 | 2 | 3, string> = {
  1: "Ofiste · ilk görüşme",
  2: "Strateji masasında",
  3: "Duruşma salonunda",
};

export function StageView({
  act = 1,
  speaker,
  others,
  speakerMood = "thinking",
  caption,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-surface-raised",
        className,
      )}
    >
      {/* Arka plan illustration */}
      <StageBackdrop act={act} />

      {/* İçerik katmanı */}
      <div className="relative z-10 flex flex-col gap-3 p-4 sm:p-5">
        {/* Üst şerit: konum etiketi */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-3 backdrop-blur">
            <span className="size-1.5 rounded-full bg-amber" />
            {ACT_LABEL[act]}
          </span>

          {/* Sağ üst: diğer karakterler (küçük) */}
          {others.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink-3">
                Sahnede
              </span>
              <div className="flex -space-x-2">
                {others.slice(0, 4).map((c) => (
                  <div key={c.id} title={`${c.name} · ${roleLabel(c.role)}`}>
                    <HumanAvatar
                      character={c}
                      size="sm"
                      mood="neutral"
                      className="ring-2 ring-paper"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Sol: konuşmacı kartı */}
        <AnimatePresence mode="wait">
          {speaker ? (
            <motion.div
              key={`speaker-${speaker.id}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl bg-paper/90 p-3 backdrop-blur-sm shadow-sm ring-1 ring-line"
            >
              <HumanAvatar
                character={speaker}
                size="lg"
                mood={speakerMood}
                highlighted
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink-1 truncate">
                  {speaker.name}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo">
                  {roleLabel(speaker.role)}
                </p>
                {speaker.archetype ? (
                  <p className="text-[11px] text-ink-3 truncate">{speaker.archetype}</p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Alt: caption */}
        {caption ? (
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-md bg-paper/80 px-3 py-2 text-center text-[11px] italic text-ink-2 backdrop-blur"
          >
            {caption}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}
