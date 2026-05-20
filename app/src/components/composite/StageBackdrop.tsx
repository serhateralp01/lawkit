/**
 * StageBackdrop — perde yapısına göre sahne arka planı.
 *
 * Minimal SVG: gradient + 1-2 sade silüet objesi. Çok düşük opasite,
 * üzerine content katmanı binince okunabilirlik kaybolmasın.
 */

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  act: 1 | 2 | 3;
  className?: string;
}

export function StageBackdrop({ act, className }: Props) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${act}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {act === 1 ? <DayOffice /> : null}
          {act === 2 ? <NightDesk /> : null}
          {act === 3 ? <Courtroom /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Perde I — Gündüz ofisi. Pencere ışığı, hafif sıcak ton. */
function DayOffice() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="day-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.96 0.04 80)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.92 0.03 60)" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="day-window" cx="20%" cy="30%" r="35%">
          <stop offset="0%" stopColor="oklch(0.98 0.05 90)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.95 0.03 70)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="400" fill="url(#day-bg)" />
      <circle cx="160" cy="120" r="260" fill="url(#day-window)" />

      {/* Yer çizgisi */}
      <rect x="0" y="340" width="800" height="60" fill="oklch(0.45 0.04 30)" opacity="0.06" />
    </svg>
  );
}

/** Perde II — Gece çalışması. Masa lambası ışığı, soğuk arka plan. */
function NightDesk() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="night-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.4 0.06 260)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.3 0.08 260)" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="lamp-glow" cx="40%" cy="40%" r="40%">
          <stop offset="0%" stopColor="oklch(0.92 0.12 80)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.4 0.05 250)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="400" fill="url(#night-bg)" />
      <circle cx="320" cy="160" r="280" fill="url(#lamp-glow)" />

      {/* Yer çizgisi */}
      <rect x="0" y="340" width="800" height="60" fill="oklch(0.2 0.04 260)" opacity="0.1" />
    </svg>
  );
}

/** Perde III — Mahkeme salonu. Lambri + adalet vurgusu. */
function Courtroom() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="court-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.5 0.04 30)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="oklch(0.4 0.06 30)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <rect width="800" height="400" fill="url(#court-bg)" />

      {/* Alt lambri */}
      <rect x="0" y="300" width="800" height="100" fill="oklch(0.42 0.05 30)" opacity="0.18" />
      {/* Lambri çizgileri */}
      {[80, 240, 400, 560, 720].map((x) => (
        <line key={x} x1={x} y1="300" x2={x} y2="400" stroke="oklch(0.32 0.04 30)" strokeOpacity="0.18" strokeWidth="1.5" />
      ))}

      {/* Adalet kabartması — orta */}
      <g transform="translate(400, 80)" opacity="0.12">
        <circle r="50" fill="oklch(0.5 0.06 40)" />
        {/* Terazi */}
        <line x1="-26" y1="0" x2="26" y2="0" stroke="oklch(0.25 0.02 30)" strokeWidth="2.5" />
        <line x1="0" y1="-26" x2="0" y2="14" stroke="oklch(0.25 0.02 30)" strokeWidth="2.5" />
        <path d="M -26 0 L -36 12 L -16 12 Z" fill="none" stroke="oklch(0.25 0.02 30)" strokeWidth="2" />
        <path d="M 26 0 L 16 12 L 36 12 Z" fill="none" stroke="oklch(0.25 0.02 30)" strokeWidth="2" />
        <circle cx="0" cy="-26" r="3" fill="oklch(0.25 0.02 30)" />
      </g>
    </svg>
  );
}
