/**
 * StageView — vaka sahnesi, sinematik kompozisyon.
 *
 * Karakterler sabit pozisyonlarda durur:
 *   foreground-left  → ön-sol (müvekkil/karşı taraf)
 *   foreground-right → ön-sağ (patron/karşı vekil)
 *   background-left  → arka-sol (savcı/katip)
 *   background-right → arka-sağ (gözlemci)
 *   center-back      → arka-orta (hâkim kürsüsü)
 *
 * Konuşan karakter:
 *   - scale 1.15, z-30, opacity 1
 *   - mood badge aktif (verdict reaksiyonu)
 *   - alt etiketi büyük + bold
 * Dinleyenler:
 *   - scale 0.85, z-10, opacity 0.55
 *   - mood neutral
 *   - alt etiketi küçük
 *
 * Perde geçişinde framer-motion layout animasyonu pozisyonları yumuşatır.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { CharacterDef, Speaker, StagePosition } from "@/content/types";
import { HumanAvatar, roleLabel } from "./HumanAvatar";
import { StageBackdrop } from "./StageBackdrop";
import { cn } from "@/lib/utils";

interface Props {
  act?: 1 | 2 | 3;
  /** Konuşan karakter — öne çıkar, mood reaksiyonuyla. */
  speaker?: CharacterDef;
  /** Sahnedeki diğer karakterler — sönük, neutral. */
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

/** Role'den varsayılan pozisyon. */
function defaultPosition(role: Speaker): StagePosition {
  switch (role) {
    case "muvekkil":
    case "karsi_taraf":
      return "foreground-left";
    case "staj_patron":
    case "karsi_vekil":
      return "foreground-right";
    case "hakim":
      return "center-back";
    case "katip":
      return "background-right";
    default:
      return "background-left";
  }
}

function resolvePosition(c: CharacterDef): StagePosition {
  return c.position ?? defaultPosition(c.role);
}

/** Pozisyon → CSS koordinatları (% bazlı, container'a göre). */
const POSITION_STYLES: Record<StagePosition, { left: string; bottom: string; z: number }> = {
  "foreground-left": { left: "8%", bottom: "10%", z: 20 },
  "foreground-right": { left: "62%", bottom: "10%", z: 20 },
  "background-left": { left: "20%", bottom: "40%", z: 10 },
  "background-right": { left: "70%", bottom: "40%", z: 10 },
  "center-back": { left: "42%", bottom: "48%", z: 15 },
};

interface PositionedCharacter {
  char: CharacterDef;
  pos: StagePosition;
  isActive: boolean;
}

export function StageView({
  act = 1,
  speaker,
  others,
  speakerMood = "thinking",
  caption,
  className,
}: Props) {
  // Tüm sahnedeki karakterleri tek listeye topla
  const allChars: PositionedCharacter[] = [];
  if (speaker) {
    allChars.push({ char: speaker, pos: resolvePosition(speaker), isActive: true });
  }
  for (const o of others) {
    if (speaker && o.id === speaker.id) continue;
    allChars.push({ char: o, pos: resolvePosition(o), isActive: false });
  }

  // Pozisyon çakışmasını engelle: aynı pozisyona düşen ikinci karakter
  // alt pozisyona kaydırılsın.
  const usedPositions = new Set<StagePosition>();
  const placed = allChars.map((c) => {
    if (usedPositions.has(c.pos)) {
      // Çakışma — fallback pozisyon
      const alt: StagePosition[] = ["background-right", "background-left", "center-back"];
      for (const p of alt) {
        if (!usedPositions.has(p)) {
          usedPositions.add(p);
          return { ...c, pos: p };
        }
      }
    }
    usedPositions.add(c.pos);
    return c;
  });

  return (
    <div
      className={cn(
        "relative h-[280px] overflow-hidden rounded-2xl border border-line bg-surface-raised",
        className,
      )}
    >
      <StageBackdrop act={act} />

      {/* Üst orta konum etiketi */}
      <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2">
        <span className="inline-flex items-center gap-2 rounded-full bg-paper/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-2 shadow-sm backdrop-blur">
          <span className={cn("size-1.5 rounded-full", ACT_ACCENT[act])} />
          {ACT_LABEL[act]}
        </span>
      </div>

      {/* Karakterler */}
      <AnimatePresence>
        {placed.map(({ char, pos, isActive }) => {
          const style = POSITION_STYLES[pos];
          return (
            <motion.div
              key={char.id}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: isActive ? 1 : 0.55,
                scale: isActive ? 1.1 : 0.85,
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute flex flex-col items-center"
              style={{
                left: style.left,
                bottom: style.bottom,
                zIndex: style.z,
              }}
            >
              <HumanAvatar
                character={char}
                size={isActive ? "lg" : "md"}
                mood={isActive ? speakerMood : "neutral"}
                highlighted={isActive}
              />
              <motion.div
                className={cn(
                  "mt-1.5 rounded-md px-2 py-0.5 text-center backdrop-blur",
                  isActive
                    ? "bg-paper/95 shadow-sm"
                    : "bg-paper/70",
                )}
              >
                <p
                  className={cn(
                    "font-display font-semibold leading-tight whitespace-nowrap",
                    isActive ? "text-[12px] text-ink-1" : "text-[10px] text-ink-2",
                  )}
                >
                  {char.name}
                </p>
                <p
                  className={cn(
                    "font-bold uppercase tracking-widest leading-none mt-0.5",
                    isActive ? "text-[9px] text-indigo" : "text-[8px] text-ink-3",
                  )}
                >
                  {roleLabel(char.role)}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Alt orta caption */}
      {caption ? (
        <motion.div
          key={caption}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 max-w-[60%]"
        >
          <p className="rounded-md bg-paper/95 px-3 py-1.5 text-center text-[11px] italic leading-snug text-ink-2 shadow-sm backdrop-blur">
            {caption}
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}
