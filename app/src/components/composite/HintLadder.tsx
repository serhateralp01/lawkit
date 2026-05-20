import { useState } from "react";
import { Lightbulb, BookOpenCheck, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HintRung {
  /** Yumuşak yönlendirme — rubrik ceiling cezası: 0 */
  nudge: string;
  /** Spesifik işaret — ceiling cezası: 1 */
  specific: string;
  /** Worked example / tam açıklama — ceiling cezası: 2 */
  worked: string;
}

interface Props {
  hint: HintRung;
  /** Hangi rubrik boyutuna ceiling cezası uygulanır */
  ceilingLabel?: string;
  className?: string;
  /** Controlled mod: engine'e bağlandığında bu prop'lar geçer. */
  controlledLevel?: 0 | 1 | 2 | 3;
  onOpen?: (rung: 1 | 2 | 3) => void;
}

/**
 * Üç kademeli ipucu merdiveni.
 * Bilim: Vygotsky ZPD + Pea (scaffolding fading).
 * SDT: autonomy — açma kararı kullanıcıya bırakılır.
 * Her kademe açılınca rubrik tavanı düşer (öğrenciye şeffaf).
 *
 * Controlled (engine'e bağlı) veya uncontrolled (mini demo) çalışabilir.
 */
export function HintLadder({
  hint,
  ceilingLabel = "Mesele Tespiti",
  className,
  controlledLevel,
  onOpen,
}: Props) {
  const [localLevel, setLocalLevel] = useState<0 | 1 | 2 | 3>(0);
  const level = controlledLevel ?? localLevel;
  const setLevel = (rung: 1 | 2 | 3) => {
    if (onOpen) onOpen(rung);
    else setLocalLevel((l) => (l >= rung ? l : rung));
  };

  const rungs = [
    {
      n: 1,
      icon: Lightbulb,
      label: "Yumuşak yönlendirme",
      cost: "Ceiling değişmez",
      body: hint.nudge,
    },
    {
      n: 2,
      icon: BookOpenCheck,
      label: "Spesifik işaret",
      cost: `${ceilingLabel}: tavan 3`,
      body: hint.specific,
    },
    {
      n: 3,
      icon: Eye,
      label: "Tam açıklama",
      cost: `${ceilingLabel}: tavan 2`,
      body: hint.worked,
    },
  ] as const;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
          İpucu Merdiveni
        </h4>
        <span className="text-[10px] text-ink-3">Senin kararın</span>
      </div>
      <ul className="space-y-2">
        {rungs.map((r) => {
          const Icon = r.icon;
          const open = level >= r.n;
          return (
            <li key={r.n}>
              <button
                type="button"
                onClick={() => setLevel(r.n as 1 | 2 | 3)}
                disabled={open}
                className={cn(
                  "group w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                  open
                    ? "cursor-default border-amber/40 bg-amber-soft/40"
                    : "border-line bg-surface-raised hover:border-indigo/40 hover:bg-indigo-soft/30",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-semibold text-ink-1">
                    <Icon className="size-3.5 text-indigo" />
                    Kademe {r.n} · {r.label}
                  </span>
                  <span className="text-[10px] font-medium text-ink-3">{r.cost}</span>
                </div>
                {open ? (
                  <p className="lk-reveal mt-2 text-xs leading-relaxed text-ink-2">{r.body}</p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
