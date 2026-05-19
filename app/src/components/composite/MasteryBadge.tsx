import { cn } from "@/lib/utils";

export type MasteryLevel = "fresh" | "practicing" | "mastered";

const config: Record<MasteryLevel, { label: string; dot: string; bg: string; text: string }> = {
  fresh: {
    label: "Henüz başlamadı",
    dot: "bg-ink-3",
    bg: "bg-surface-sunken",
    text: "text-ink-2",
  },
  practicing: {
    label: "Pratiği derinleştir",
    dot: "bg-signal-warning",
    bg: "bg-amber-soft/40",
    text: "text-ink-1",
  },
  mastered: {
    label: "Kavradın",
    dot: "bg-signal-positive",
    bg: "bg-indigo-soft/40",
    text: "text-ink-1",
  },
};

/**
 * Bloom Mastery (1968) + Black & Wiliam formative.
 * Yüzde göstermez — yarış sinyali yerine 3 kademeli mastery etiketi.
 */
export function MasteryBadge({
  level,
  className,
  size = "md",
}: {
  level: MasteryLevel;
  className?: string;
  size?: "sm" | "md";
}) {
  const c = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold",
        c.bg,
        c.text,
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
