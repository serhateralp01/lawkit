import { cn } from "@/lib/utils";
import { defaultRubric } from "@/content/rubrics";
import type { RubricKey } from "@/content/types";

export type RubricScores = Partial<Record<RubricKey, number>>;

interface Props {
  scores: RubricScores;
  /** Yalnız öğrenciye görünür boyutları göster (5/7). Admin için tüm 7. */
  variant?: "student" | "admin";
  className?: string;
}

/**
 * 7 boyutlu rubrik göstergesi.
 * Bilim: AAC&U VALUE + Brookhart davranışsal seviye; toplam puan yok (anti-pattern).
 * SDT: competence ihtiyacını boyut bazlı geri bildirimle besler.
 */
export function RubricMeter({ scores, variant = "student", className }: Props) {
  const dims = defaultRubric.dimensions.filter((d) =>
    variant === "student" ? defaultRubric.studentVisibleDimensions.includes(d.key) : true,
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
          Rubrik · Boyut bazlı
        </h4>
        <span className="text-[10px] font-medium text-ink-3">/ 4</span>
      </div>
      <ul className="space-y-2.5">
        {dims.map((d) => {
          const v = scores[d.key];
          const evaluated = typeof v === "number";
          const pct = evaluated ? (v / 4) * 100 : 0;
          return (
            <li key={d.key} className="grid grid-cols-[7rem_1fr_2ch] items-center gap-3">
              <span className="text-xs font-medium text-ink-2" title={d.definition}>
                {d.short}
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                {evaluated ? (
                  <div
                    className="lk-fill h-full rounded-full bg-indigo"
                    style={{ width: `${pct}%` }}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-right text-[11px] tabular-nums",
                  evaluated ? "font-semibold text-ink-1" : "text-ink-3",
                )}
              >
                {evaluated ? v : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
