/**
 * StageView — vaka sahnesinin "tartışma odası" üst kısmı.
 *
 * Karakterler ekranda pozisyon alır (konuşan büyük + öne, dinleyenler küçük
 * + arkada). Sahne arka planı perde yapısına göre değişir. Bubble karakterin
 * yanında — konuşan kim, yön ona göre.
 *
 * Bu component sadece görsel — etkileşim yok. Vaka route'unun center'ı
 * altında basit bir "sahne kart"ı olarak kullanılır.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { CharacterDef } from "@/content/types";
import { HumanAvatar } from "./HumanAvatar";
import { StageBackdrop } from "./StageBackdrop";
import { roleLabel } from "./HumanAvatar";
import { cn } from "@/lib/utils";

interface Props {
  /** Aktif perde — arka plan seçimi için. */
  act?: 1 | 2 | 3;
  /** Sahnenin "ana" konuşan karakteri. Büyük ve ön planda. */
  speaker?: CharacterDef;
  /** Sahnedeki diğer karakterler — küçük, arka planda. */
  others: CharacterDef[];
  /** Speaker'ın mood'u — verdict sonrası reaksiyon. */
  speakerMood?: "neutral" | "happy" | "sad" | "tense" | "thinking";
  /** Sahne açıklayıcı satır (subtitle gibi). */
  caption?: string;
  className?: string;
}

export function StageView({
  act = 1,
  speaker,
  others,
  speakerMood = "thinking",
  caption,
  className,
}: Props) {
  // Sahne pozisyonu kuralları:
  //   - Speaker varsa: orta-sol veya orta-sağ (rolüne göre)
  //   - Others: arkada, sağ-sol dağılım
  //   - 2'den fazla kişi varsa side-pozisyon alır

  const speakerSide: "left" | "right" =
    speaker?.role === "muvekkil" || speaker?.role === "karsi_taraf" ? "left" : "right";

  return (
    <div
      className={cn(
        "relative h-56 overflow-hidden rounded-xl border border-line bg-surface-sunken/20 lg:h-64",
        className,
      )}
    >
      <StageBackdrop act={act} />

      {/* Karakter katmanı */}
      <div className="absolute inset-0 z-10">
        {/* Arka plandaki diğer karakterler — küçük, sönük */}
        <div className="absolute left-0 right-0 top-4 flex justify-around px-12">
          {others.slice(0, 3).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 0.55, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex flex-col items-center gap-1"
            >
              <HumanAvatar character={c} size="sm" mood="neutral" />
              <span className="rounded bg-paper/70 px-1.5 py-0.5 text-[9px] font-semibold text-ink-2 backdrop-blur-sm">
                {c.name.split(" ")[0]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Speaker — büyük, ön, mood ile */}
        <AnimatePresence mode="wait">
          {speaker ? (
            <motion.div
              key={`speaker-${speaker.id}-${speakerMood}`}
              initial={{ opacity: 0, x: speakerSide === "left" ? -40 : 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={cn(
                "absolute bottom-3 flex items-end gap-2.5",
                speakerSide === "left" ? "left-6" : "right-6 flex-row-reverse",
              )}
            >
              <HumanAvatar
                character={speaker}
                size="lg"
                mood={speakerMood}
                facing={speakerSide === "left" ? "right" : "left"}
                highlighted
              />
              <div
                className={cn(
                  "mb-2 rounded-lg bg-paper/95 px-2.5 py-1.5 text-left shadow-sm backdrop-blur-sm",
                  speakerSide === "left" ? "text-left" : "text-right",
                )}
              >
                <p className="text-xs font-display font-semibold text-ink-1">
                  {speaker.name}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-ink-3">
                  {roleLabel(speaker.role)}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Caption — alt orta */}
        {caption ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2"
          >
            <span className="rounded-full bg-paper/80 px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-3 backdrop-blur">
              ※ {caption}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
