import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { MasteryBadge, type MasteryLevel } from "./MasteryBadge";
import { cn } from "@/lib/utils";

interface Props {
  href?: string;
  title: string;
  branch: string;
  difficulty: 1 | 2 | 3 | 4;
  estimatedMinutes: number;
  mastery?: MasteryLevel;
  summary?: string;
  className?: string;
}

const diffLabel: Record<1 | 2 | 3 | 4, string> = {
  1: "Giriş",
  2: "Orta",
  3: "İleri",
  4: "Uzman",
};

export function CaseCard({
  href,
  title,
  branch,
  difficulty,
  estimatedMinutes,
  mastery = "fresh",
  summary,
  className,
}: Props) {
  const inner = (
    <article
      className={cn(
        "group flex h-full flex-col justify-between gap-6 rounded-xl border border-line bg-surface-raised p-6 transition-all",
        href && "hover:-translate-y-0.5 hover:border-indigo/30 hover:shadow-[var(--shadow-raised)]",
        className,
      )}
    >
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
            {branch} · {diffLabel[difficulty]}
          </span>
          <MasteryBadge level={mastery} size="sm" />
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink-1">{title}</h3>
        {summary ? <p className="text-sm leading-relaxed text-ink-2">{summary}</p> : null}
      </header>
      <footer className="flex items-center justify-between text-xs text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          ~{estimatedMinutes} dk
        </span>
        {href ? (
          <span className="inline-flex items-center gap-1 font-semibold text-indigo">
            Vakaya gir <ArrowUpRight className="size-3.5" />
          </span>
        ) : null}
      </footer>
    </article>
  );
  return href ? (
    <Link to={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
