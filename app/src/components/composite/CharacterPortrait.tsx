/**
 * CharacterPortrait — SVG initials avatarı + mood yüz ifadesi.
 *
 * Tasarım kararı: photoreal değil — flat, minimal, OKLCH renk tonlu daire +
 * baş harfler + opsiyonel basit ifade çizgisi (mood). Cinsiyet/etnik bias yok.
 *
 * `mood` verdict'e göre değişebilir; vaka sahnesinde reaksiyon kanalı.
 */

import { motion } from "framer-motion";
import type { CharacterDef, CharacterMood, Speaker } from "@/content/types";
import { cn } from "@/lib/utils";

interface Props {
  character: Pick<CharacterDef, "name" | "initials" | "hue" | "role">;
  mood?: CharacterMood;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Halka rengi — sahne fokusu için. */
  highlighted?: boolean;
}

const ROLE_HUE: Record<Speaker, number> = {
  narrator: 230,
  muvekkil: 24,
  hakim: 280,
  karsi_vekil: 350,
  karsi_taraf: 350,
  staj_patron: 200,
  katip: 140,
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const sizePx = { sm: 36, md: 56, lg: 88 } as const;
const sizeText = { sm: "text-xs", md: "text-base", lg: "text-2xl" } as const;

export function CharacterPortrait({
  character,
  mood = "neutral",
  size = "md",
  className,
  highlighted,
}: Props) {
  const hue = character.hue ?? ROLE_HUE[character.role] ?? 230;
  const initials = character.initials ?? initialsFromName(character.name);
  const px = sizePx[size];

  return (
    <motion.div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
      animate={{
        scale: highlighted ? 1.04 : 1,
      }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full font-display font-bold text-white shadow-sm transition-all",
          highlighted ? "ring-2 ring-offset-2 ring-offset-paper" : "ring-1 ring-black/5",
        )}
        style={{
          backgroundColor: `oklch(0.62 0.16 ${hue})`,
          // @ts-expect-error custom prop
          "--tw-ring-color": `oklch(0.62 0.16 ${hue})`,
        }}
      >
        <span className={cn("tracking-tight", sizeText[size])}>{initials}</span>
      </div>
      {/* Mood indicator — sağ alt küçük çember */}
      {mood !== "neutral" ? (
        <motion.span
          key={mood}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-paper text-[10px]",
            mood === "happy" && "bg-signal-positive text-white",
            mood === "sad" && "bg-signal-critical text-white",
            mood === "tense" && "bg-signal-warning text-ink-1",
            mood === "thinking" && "bg-ink-3 text-white",
          )}
          aria-label={moodLabel(mood)}
        >
          {mood === "happy" && "✓"}
          {mood === "sad" && "✕"}
          {mood === "tense" && "!"}
          {mood === "thinking" && "…"}
        </motion.span>
      ) : null}
    </motion.div>
  );
}

function moodLabel(m: CharacterMood): string {
  return (
    { neutral: "tarafsız", happy: "memnun", sad: "üzgün", tense: "endişeli", thinking: "düşünüyor" } as Record<
      CharacterMood,
      string
    >
  )[m];
}

export function roleLabel(r: Speaker): string {
  const m: Record<Speaker, string> = {
    narrator: "Anlatıcı",
    muvekkil: "Müvekkil",
    hakim: "Hâkim",
    karsi_vekil: "Karşı Vekil",
    karsi_taraf: "Karşı Taraf",
    staj_patron: "Kıdemli Avukat",
    katip: "Zabıt Kâtibi",
  };
  return m[r] ?? r;
}
