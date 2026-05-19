import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

/**
 * Çalışma serisi — pazar tatil, 2-gün ara güvenli.
 * Bilim: Lally et al. 2010 (habit formation); SDT anksiyete yumuşatması.
 */
export function StreakDot({
  days,
  restToday = false,
  className,
}: {
  days: number;
  restToday?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3 py-1.5",
        className,
      )}
      title={restToday ? "Bugün dinlenme günü — seri korunuyor" : "Aktif çalışma serisi"}
    >
      <Flame
        className={cn(
          "size-3.5",
          restToday ? "text-ink-3" : "text-amber",
        )}
      />
      <span className="text-xs font-semibold text-ink-1">{days} gün</span>
      {restToday ? (
        <span className="text-[10px] font-medium text-ink-3">· tatil</span>
      ) : null}
    </div>
  );
}
