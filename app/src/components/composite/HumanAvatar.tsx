/**
 * HumanAvatar — SVG insan silüeti, yüzü blur.
 *
 * Tasarım kararı:
 *   - Yüz detayı yok (gender/etnik bias kaçınmak için)
 *   - Kafa + omuz silüeti, role rengi gradyan wash
 *   - Yüz alanı blur filter ile yumuşatılmış → "kim olduğu önemli değil,
 *     ne dediği önemli" mesajı
 *   - 3 boyut: sm (40), md (72), lg (128)
 *   - Mood badge sağ alt — küçük renkli daire
 *
 * Public API: CharacterPortrait ile uyumlu (drop-in replacement).
 */

import { motion } from "framer-motion";
import type { CharacterDef, CharacterMood, Speaker } from "@/content/types";
import { cn } from "@/lib/utils";

interface Props {
  character: Pick<CharacterDef, "name" | "initials" | "hue" | "role">;
  mood?: CharacterMood;
  size?: "sm" | "md" | "lg";
  className?: string;
  highlighted?: boolean;
  /** Bubble yönü için: sola bakar / sağa bakar (ileride pozisyon için). */
  facing?: "left" | "right";
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

const sizePx = { sm: 40, md: 72, lg: 128 } as const;

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
  const gradientId = `g-${character.name.replace(/\s+/g, "-")}-${size}`;
  const blurId = `b-${character.name.replace(/\s+/g, "-")}-${size}`;

  const baseColor = `oklch(0.62 0.14 ${hue})`;
  const lightColor = `oklch(0.72 0.10 ${hue})`;
  const darkColor = `oklch(0.48 0.16 ${hue})`;

  return (
    <motion.div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
      animate={{ scale: highlighted ? 1.04 : 1 }}
      transition={{ duration: 0.25 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        className={cn(
          "overflow-visible rounded-full shadow-sm",
          highlighted ? "ring-2 ring-offset-2 ring-offset-paper" : "ring-1 ring-black/5",
        )}
        style={{
          // @ts-expect-error custom prop
          "--tw-ring-color": baseColor,
          transform: facing === "left" ? "scaleX(-1)" : undefined,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor={darkColor} />
          </linearGradient>
          <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Arka dolgu — yuvarlak daire */}
        <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />

        {/* İnsan silüeti: omuzlar (yarım elips) + kafa (daire) — yüzü blur */}
        <g filter={`url(#${blurId})`}>
          {/* Omuzlar */}
          <ellipse cx="50" cy="95" rx="42" ry="28" fill={baseColor} opacity="0.95" />
          {/* Boyun */}
          <rect x="42" y="55" width="16" height="20" rx="4" fill={baseColor} opacity="0.9" />
          {/* Kafa */}
          <circle cx="50" cy="38" r="22" fill="oklch(0.92 0.02 60)" opacity="0.85" />
          {/* Saç (üst yarım) — role hue ile koyu */}
          <path
            d={[
              "M 28 38",
              "Q 28 16 50 16",
              "Q 72 16 72 38",
              "Q 72 30 65 28",
              "Q 50 24 35 28",
              "Q 28 30 28 38",
              "Z",
            ].join(" ")}
            fill={darkColor}
            opacity="0.7"
          />
          {/* Yüz detayları için çok soluk gölge — gözler/burun belirsiz */}
          <ellipse cx="42" cy="38" rx="2" ry="1.5" fill="oklch(0.3 0.02 60)" opacity="0.35" />
          <ellipse cx="58" cy="38" rx="2" ry="1.5" fill="oklch(0.3 0.02 60)" opacity="0.35" />
          <ellipse cx="50" cy="48" rx="3" ry="1" fill="oklch(0.4 0.06 20)" opacity="0.4" />
        </g>

        {/* Hafif vinyet — çerçeve hissi */}
        <circle
          cx="50"
          cy="50"
          r="50"
          fill="none"
          stroke="oklch(0 0 0)"
          strokeOpacity="0.04"
          strokeWidth="1"
        />
      </svg>

      {/* Mood badge */}
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
