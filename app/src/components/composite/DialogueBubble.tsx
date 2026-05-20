/**
 * DialogueBubble — konuşma balonu.
 *
 * Karakter portrait + name + role + tail'lı bubble.
 * Typewriter efekti opsiyonel — `animate=true` ise karakter karakter belirir.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CharacterDef, CharacterMood } from "@/content/types";
import { CharacterPortrait, roleLabel } from "./CharacterPortrait";
import { cn } from "@/lib/utils";

interface Props {
  character: CharacterDef;
  text: string;
  /** Speaker'a ait reaksiyon */
  mood?: CharacterMood;
  /** Karakter karakter yazılım. Default true. */
  animate?: boolean;
  /** Bubble yönü (default 'left' — anlatıcı sağdan gelebilir). */
  side?: "left" | "right";
  /** Hafif bir vurgu sınıfı (örn. karar prompt'unda). */
  emphasis?: boolean;
  className?: string;
}

export function DialogueBubble({
  character,
  text,
  mood,
  animate = true,
  side = "left",
  emphasis,
  className,
}: Props) {
  const [shown, setShown] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) {
      setShown(text);
      return;
    }
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setShown(text);
        return;
      }
    }
    setShown("");
    let i = 0;
    // Cümle başına hızlı, kelime ortasında daha yavaş hissetmesi için
    // sabit ms ama char-by-char.
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [text, animate]);

  const isLeft = side === "left";

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("flex items-start gap-3", !isLeft && "flex-row-reverse", className)}
    >
      <CharacterPortrait character={character} mood={mood} size="md" highlighted />
      <div className={cn("flex-1", isLeft ? "items-start" : "items-end")}>
        <div className={cn("flex items-baseline gap-2", !isLeft && "justify-end")}>
          <span className="font-display text-sm font-semibold text-ink-1">
            {character.name}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
            {roleLabel(character.role)}
            {character.archetype ? ` · ${character.archetype}` : null}
          </span>
        </div>
        <motion.div
          className={cn(
            "relative mt-1.5 rounded-2xl px-4 py-3 text-sm leading-relaxed",
            emphasis
              ? "bg-indigo text-surface-raised shadow-[var(--shadow-raised)]"
              : "bg-surface-raised text-ink-1 ring-1 ring-line",
            isLeft ? "rounded-tl-sm" : "rounded-tr-sm",
          )}
        >
          <span className="whitespace-pre-wrap">{shown}</span>
          {shown.length < text.length ? (
            <motion.span
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="ml-0.5 inline-block w-1.5 align-baseline"
            >
              ▍
            </motion.span>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Bubble içermeyen, sahne yönlendirici tek satır anlatım. */
export function SceneCaption({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3"
    >
      ※ {text}
    </motion.p>
  );
}
