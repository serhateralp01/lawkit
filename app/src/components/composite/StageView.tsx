/**
 * StageView — vaka sahnesinin "tartışma odası" panosu.
 *
 * Desktop-first geniş kompozisyon:
 *   - Üst sol: konum etiketi (perde adı)
 *   - Sol orta: konuşmacının büyük avatarı (lg)
 *   - Sol alt: konuşmacının kart bilgisi (isim + rol + arketip)
 *   - Sağ üst: diğer karakterler şeridi (sm avatar stack)
 *   - Sağ alt: sahne caption (italik subtitle)
 *   - Arka plan: perde illustration, düşük opasite, üzerine paper/85 overlay
 *
 * Bubble metni burada değil — vaka route'unun aşağısında ayrı DialogueBubble
 * akar. StageView sadece "kim, nerede, hangi havada" sahne kurar.
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

const ACT_ACCENT: Record<1 | 2 | 3, string> = {
  1: "bg-amber",
  2: "bg-indigo",
  3: "bg-signal-critical",
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
        "relative min-h-[220px] overflow-hidden rounded-2xl border border-line bg-surface-raised",
        className,
      )}
    >
      <StageBackdrop act={act} />

      {/* Üst orta konum etiketi */}
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
        <span className="inline-flex items-center gap-2 rounded-full bg-paper/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-2 backdrop-blur shadow-sm">
          <span className={cn("size-1.5 rounded-full", ACT_ACCENT[act])} />
          {ACT_LABEL[act]}
        </span>
      </div>

      {/* Ana kompozisyon — flex iki sütun */}
      <div className="relative z-10 grid h-full grid-cols-[auto_1fr] items-end gap-5 p-6">
        {/* Sol: konuşmacı büyük + kart */}
        <AnimatePresence mode="wait">
          {speaker ? (
            <motion.div
              key={`speaker-${speaker.id}`}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-end gap-4"
            >
              <HumanAvatar
                character={speaker}
                size="lg"
                mood={speakerMood}
                highlighted
              />
              <div className="mb-1 rounded-xl bg-paper/95 p-3 shadow-md ring-1 ring-line backdrop-blur">
                <p className="font-display text-base font-bold text-ink-1 whitespace-nowrap">
                  {speaker.name}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo">
                  {roleLabel(speaker.role)}
                </p>
                {speaker.archetype ? (
                  <p className="mt-0.5 max-w-[200px] text-[11px] text-ink-3">
                    {speaker.archetype}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <div />
          )}
        </AnimatePresence>

        {/* Sağ: diğerleri + caption */}
        <div className="flex flex-col items-end gap-3">
          {others.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
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
            </motion.div>
          ) : null}

          {caption ? (
            <motion.p
              key={caption}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="max-w-md rounded-md bg-paper/90 px-3 py-2 text-right text-[11px] italic leading-snug text-ink-2 backdrop-blur shadow-sm"
            >
              {caption}
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
