/**
 * HumanAvatar — DiceBear illustrated karakter avatarı.
 *
 * Tasarım kararı:
 *   - DiceBear "notionists-neutral" stili — minimal, profesyonel, cinsiyet/etnik
 *     bias minimum, hukuk/iş kontekstine uygun çizim
 *   - Avatar deterministik: seed = character.id, aynı karakter her yerde aynı görünür
 *   - Role hue → background frame rengi (sadece çerçeve, içerik aynı)
 *   - 3 boyut (sm/md/lg) + mood badge sağ alt
 *
 * Performans: SVG runtime'da generate edilir (`useMemo`), URL fetch yok.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { createAvatar } from "@dicebear/core";
import { notionistsNeutral } from "@dicebear/collection";
import type { CharacterDef, CharacterMood, Speaker } from "@/content/types";
import { cn } from "@/lib/utils";

interface Props {
  character: Pick<CharacterDef, "name" | "initials" | "hue" | "role" | "id"> & {
    id?: string;
  };
  mood?: CharacterMood;
  size?: "sm" | "md" | "lg";
  className?: string;
  highlighted?: boolean;
  /** İleride sahne pozisyonu için flip (sağa/sola bakış). */
  facing?: "left" | "right";
}

const ROLE_HUE: Record<Speaker, number> = {
  narrator: 230,
  muvekkil: 30,
  hakim: 270,
  karsi_vekil: 350,
  karsi_taraf: 350,
  staj_patron: 210,
  katip: 150,
};

const sizePx = { sm: 40, md: 64, lg: 112 } as const;

function seedFor(c: Props["character"]): string {
  return c.id ?? c.name;
}

export function HumanAvatar({
  character,
  mood = "neutral",
  size = "md",
  className,
  highlighted,
  facing = "right",
}: Props) {
  const hue = character.hue ?? ROLE_HUE[character.role] ?? 230;
  const px = sizePx[size];
  const seed = seedFor(character);

  // DiceBear SVG'yi useMemo ile cache et — render başına yeniden generate etme.
  const svg = useMemo(
    () =>
      createAvatar(notionistsNeutral, {
        seed,
        size: px,
        radius: 50,
        backgroundColor: ["transparent"],
      }).toString(),
    [seed, px],
  );

  const frameColor = `oklch(0.92 0.05 ${hue})`;
  const ringColor = `oklch(0.55 0.18 ${hue})`;

  return (
    <motion.div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
      animate={{ scale: highlighted ? 1.04 : 1 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={cn(
          "h-full w-full overflow-hidden rounded-full transition-shadow",
          highlighted ? "ring-2 ring-offset-2 ring-offset-paper shadow-md" : "ring-1 ring-black/5",
        )}
        style={{
          backgroundColor: frameColor,
          // @ts-expect-error custom prop
          "--tw-ring-color": ringColor,
        }}
      >
        <div
          style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
          className="h-full w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Mood badge */}
      {mood !== "neutral" ? (
        <motion.span
          key={mood}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-paper text-[10px] font-bold",
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
