/**
 * StageBackdrop — perde yapısına göre sahne arka planı.
 *
 * SVG illustration, düşük opasite, gradient wash. Üç farklı ortam:
 *   Perde I (1): Ofis — masa + raflar + pencere
 *   Perde II (2): Gece çalışması — masa lambası + kağıt + duvar saati
 *   Perde III (3): Mahkeme — kürsü + bayrak + lambri
 *
 * Center kolonun arkasına 'absolute inset-0' olarak yerleştirilir;
 * içerik üstte (z-10) kalır.
 */

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  act: 1 | 2 | 3;
  className?: string;
}

export function StageBackdrop({ act, className }: Props) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-xl", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`backdrop-${act}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {act === 1 ? <OfficeScene /> : null}
          {act === 2 ? <NightOfficeScene /> : null}
          {act === 3 ? <CourtroomScene /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Perde I — sıcak ofis: pencere ışığı, kitap rafı, masa */
function OfficeScene() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky-day" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.95 0.04 70)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.85 0.06 50)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Duvar gradyanı */}
      <rect width="800" height="400" fill="url(#sky-day)" />

      {/* Pencere — sol */}
      <g opacity="0.18">
        <rect x="60" y="50" width="160" height="200" fill="oklch(0.95 0.05 90)" stroke="oklch(0.4 0.02 60)" strokeWidth="3" />
        <line x1="140" y1="50" x2="140" y2="250" stroke="oklch(0.4 0.02 60)" strokeWidth="2" />
        <line x1="60" y1="150" x2="220" y2="150" stroke="oklch(0.4 0.02 60)" strokeWidth="2" />
      </g>

      {/* Kitap rafı — sağ */}
      <g opacity="0.16">
        <rect x="600" y="80" width="160" height="220" fill="oklch(0.45 0.04 30)" />
        {[100, 140, 180, 220, 260].map((y) => (
          <g key={y}>
            <rect x="610" y={y} width="140" height="35" fill="oklch(0.55 0.02 30)" />
            {[615, 635, 655, 675, 695, 715, 735].map((x, i) => (
              <rect key={x} x={x} y={y + 4} width="14" height="27" fill={`oklch(${0.55 + (i % 3) * 0.05} 0.12 ${(i * 80) % 360})`} />
            ))}
          </g>
        ))}
      </g>

      {/* Masa — alt */}
      <g opacity="0.18">
        <rect x="200" y="320" width="500" height="14" fill="oklch(0.42 0.05 30)" />
        <rect x="220" y="334" width="6" height="60" fill="oklch(0.38 0.04 30)" />
        <rect x="674" y="334" width="6" height="60" fill="oklch(0.38 0.04 30)" />
      </g>

      {/* Masaüstü objeler — kağıt + bardak (subtle) */}
      <g opacity="0.14">
        <rect x="320" y="305" width="80" height="20" fill="oklch(0.95 0.01 90)" stroke="oklch(0.4 0.02 60)" strokeWidth="1" />
        <rect x="430" y="305" width="80" height="20" fill="oklch(0.95 0.01 90)" stroke="oklch(0.4 0.02 60)" strokeWidth="1" />
        <ellipse cx="560" cy="315" rx="14" ry="6" fill="oklch(0.85 0.04 30)" />
      </g>
    </svg>
  );
}

/** Perde II — gece çalışması: masa lambası, kağıt yığını, saat */
function NightOfficeScene() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="lamp-glow" cx="50%" cy="40%" r="40%">
          <stop offset="0%" stopColor="oklch(0.92 0.10 80)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.4 0.05 250)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="night-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.35 0.06 260)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.25 0.08 260)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect width="800" height="400" fill="url(#night-bg)" />
      <circle cx="400" cy="180" r="280" fill="url(#lamp-glow)" />

      {/* Pencere — gece, dışarısı koyu */}
      <g opacity="0.15">
        <rect x="60" y="50" width="160" height="200" fill="oklch(0.2 0.05 260)" stroke="oklch(0.3 0.02 240)" strokeWidth="3" />
        <line x1="140" y1="50" x2="140" y2="250" stroke="oklch(0.3 0.02 240)" strokeWidth="2" />
        {/* Yıldızlar */}
        <circle cx="100" cy="80" r="1.5" fill="oklch(0.95 0.05 90)" />
        <circle cx="180" cy="120" r="1.5" fill="oklch(0.95 0.05 90)" />
        <circle cx="120" cy="180" r="1.5" fill="oklch(0.95 0.05 90)" />
      </g>

      {/* Duvar saati — sağ üst */}
      <g opacity="0.16" transform="translate(680, 100)">
        <circle r="40" fill="oklch(0.92 0.02 60)" stroke="oklch(0.3 0.02 30)" strokeWidth="3" />
        <line x1="0" y1="0" x2="0" y2="-25" stroke="oklch(0.2 0.02 30)" strokeWidth="3" />
        <line x1="0" y1="0" x2="18" y2="8" stroke="oklch(0.2 0.02 30)" strokeWidth="2" />
        <circle r="3" fill="oklch(0.2 0.02 30)" />
      </g>

      {/* Masa lambası — orta */}
      <g opacity="0.2">
        <rect x="390" y="240" width="20" height="50" fill="oklch(0.35 0.03 30)" />
        <path d="M 360 240 L 440 240 L 425 200 L 375 200 Z" fill="oklch(0.4 0.04 30)" />
        <circle cx="400" cy="210" r="6" fill="oklch(0.92 0.15 80)" />
      </g>

      {/* Masa */}
      <g opacity="0.2">
        <rect x="200" y="295" width="500" height="14" fill="oklch(0.32 0.04 30)" />
        <rect x="220" y="309" width="6" height="80" fill="oklch(0.28 0.03 30)" />
        <rect x="674" y="309" width="6" height="80" fill="oklch(0.28 0.03 30)" />
      </g>

      {/* Kağıt yığını */}
      <g opacity="0.18">
        {[0, 3, 6].map((dy) => (
          <rect key={dy} x={300 + dy * 2} y={280 - dy} width="100" height="18" fill="oklch(0.92 0.01 90)" stroke="oklch(0.3 0.02 60)" strokeWidth="0.5" />
        ))}
        <rect x="500" y="278" width="120" height="20" fill="oklch(0.92 0.01 90)" stroke="oklch(0.3 0.02 60)" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

/** Perde III — mahkeme salonu: kürsü, lambri, Türk bayrağı */
function CourtroomScene() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="hall-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.5 0.04 30)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="oklch(0.4 0.06 30)" stopOpacity="0.12" />
        </linearGradient>
        <pattern id="wood" width="20" height="200" patternUnits="userSpaceOnUse">
          <rect width="20" height="200" fill="oklch(0.4 0.05 30)" />
          <line x1="0" y1="0" x2="0" y2="200" stroke="oklch(0.3 0.04 30)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="800" height="400" fill="url(#hall-bg)" />

      {/* Lambri (alt duvar) */}
      <g opacity="0.18">
        <rect x="0" y="280" width="800" height="120" fill="url(#wood)" />
      </g>

      {/* Sütunlar */}
      <g opacity="0.15">
        {[80, 720].map((x) => (
          <g key={x}>
            <rect x={x} y="50" width="40" height="270" fill="oklch(0.85 0.02 60)" />
            <rect x={x - 5} y="45" width="50" height="10" fill="oklch(0.75 0.02 60)" />
            <rect x={x - 5} y="320" width="50" height="10" fill="oklch(0.75 0.02 60)" />
          </g>
        ))}
      </g>

      {/* Hâkim kürsüsü — yüksek, ortada */}
      <g opacity="0.22">
        <rect x="280" y="180" width="240" height="180" fill="url(#wood)" />
        <rect x="270" y="170" width="260" height="14" fill="oklch(0.35 0.04 30)" />
        {/* Adalet kabartması — daire içinde terazi (basit) */}
        <g transform="translate(400, 230)">
          <circle r="22" fill="oklch(0.55 0.05 60)" opacity="0.5" />
          <line x1="-12" y1="-2" x2="12" y2="-2" stroke="oklch(0.25 0.02 30)" strokeWidth="1.5" />
          <line x1="0" y1="-12" x2="0" y2="6" stroke="oklch(0.25 0.02 30)" strokeWidth="1.5" />
          <circle cx="-12" cy="2" r="3" fill="none" stroke="oklch(0.25 0.02 30)" strokeWidth="1.5" />
          <circle cx="12" cy="2" r="3" fill="none" stroke="oklch(0.25 0.02 30)" strokeWidth="1.5" />
        </g>
      </g>

      {/* Türk bayrağı — sol arka */}
      <g opacity="0.20" transform="translate(150, 80)">
        <rect x="0" y="0" width="2" height="120" fill="oklch(0.35 0.02 30)" />
        <rect x="2" y="10" width="60" height="40" fill="oklch(0.55 0.20 25)" />
        <circle cx="22" cy="30" r="9" fill="oklch(0.95 0.01 90)" />
        <circle cx="25" cy="30" r="7.5" fill="oklch(0.55 0.20 25)" />
        <path d="M 32 30 L 36 28.5 L 34.5 30 L 36 31.5 Z" fill="oklch(0.95 0.01 90)" />
      </g>

      {/* Avukat masaları — alt */}
      <g opacity="0.15">
        <rect x="100" y="340" width="180" height="14" fill="oklch(0.4 0.05 30)" />
        <rect x="520" y="340" width="180" height="14" fill="oklch(0.4 0.05 30)" />
      </g>
    </svg>
  );
}
