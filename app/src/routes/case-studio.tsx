import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Wand2,
  Filter,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ReviewBadge } from "@/components/composite/ReviewBadge";
import { useGamificationStore } from "@/lib/gamification";
import { recommendCase } from "@/lib/adaptive/difficulty";
import { listCases } from "@/content/cases";
import { cn } from "@/lib/utils";

type BranchFilter = "all" | "is_hukuku" | "borclar" | "medeni";

export const Route = createFileRoute("/case-studio")({
  head: () => ({
    meta: [
      { title: "Case Studio · LawKit" },
      {
        name: "description",
        content:
          "LawKit'in vaka çalışma giriş ekranı: hazır demo vakalar, sana özel öneri ve AI ile yeni vaka üretimi tek yerde.",
      },
    ],
  }),
  component: CaseStudioPage,
});

function CaseStudioPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const attempts = useGamificationStore((s) => s.attempts);

  const [filter, setFilter] = useState<BranchFilter>("all");
  const allCases = listCases();
  const filtered =
    filter === "all" ? allCases : allCases.filter((c) => c.branch === filter);

  const branchCounts: Record<BranchFilter, number> = {
    all: allCases.length,
    is_hukuku: allCases.filter((c) => c.branch === "is_hukuku").length,
    borclar: allCases.filter((c) => c.branch === "borclar").length,
    medeni: allCases.filter((c) => c.branch === "medeni").length,
  };

  const caseType = (c: ReturnType<typeof listCases>[number]) => {
    if (c.outcomes && c.outcomes.length > 1) return "deep" as const;
    return "demo" as const;
  };

  const recommendation = hydrated ? recommendCase(allCases, attempts) : null;
  const recommendedCase = recommendation
    ? allCases.find((c) => c.id === recommendation.caseId)
    : null;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:px-8 lg:pt-14">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 space-y-2"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
            Case Studio
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-1 lg:text-4xl">
            Bir vaka seç, oynamaya başla
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
            Hazır demo vakalardan çalış, beceri haritanı geliştir — istediğin an{" "}
            <Link to="/vaka-studio" className="font-semibold text-indigo hover:underline">
              Vaka Studio
            </Link>
            'da AI ile sana özel yeni bir vaka üret.
          </p>
        </motion.header>

        {/* AI üretici CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 rounded-2xl border border-indigo/30 bg-gradient-to-r from-indigo-soft/40 via-indigo-soft/15 to-transparent p-5"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-soft/60">
              <Wand2 className="size-5 text-indigo" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">
                AI ile yeni vaka
              </p>
              <p className="mt-0.5 font-display text-base font-semibold text-ink-1">
                Hazır vakalardan birini değil de tam sana özel olanı mı istersin?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">
                Dal, zorluk ve isterseniz konu/karakter tonu seç — saniyeler
                içinde sana özel bir senaryo üretsin.
              </p>
            </div>
            <Link
              to="/vaka-studio"
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
            >
              Vaka Studio'ya git <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Sana önerilen */}
        {recommendation && recommendedCase ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 rounded-2xl border border-amber/40 bg-amber-soft/30 p-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Sparkles className="size-5 shrink-0 text-amber-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-foreground">
                  Sana önerilen
                </p>
                <p className="mt-0.5 truncate font-display text-base font-semibold text-ink-1">
                  {recommendedCase.title}
                </p>
                <p className="text-xs text-ink-2">{recommendation.reason}</p>
              </div>
              <Link
                to="/vaka/$caseId"
                params={{ caseId: recommendation.caseId }}
                className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
              >
                Hadi başla <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </motion.div>
        ) : null}

        {/* Library header + filtre */}
        <motion.header
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
                Demo Vakalar
              </h2>
              <span className="rounded-full bg-amber-soft/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-foreground">
                Önceden hazırlanmış
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
              {branchCounts.all} vaka ·{" "}
              {allCases.filter((c) => caseType(c) === "deep").length} kapsamlı senaryo
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-ink-3" />
            {(
              [
                ["all", "Tümü"],
                ["is_hukuku", "İş Hukuku"],
                ["borclar", "Borçlar"],
                ["medeni", "Medeni"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors",
                  filter === key
                    ? "bg-ink-1 text-surface-raised"
                    : "border border-line bg-surface-raised text-ink-2 hover:bg-surface-sunken",
                )}
              >
                {label}{" "}
                <span className="ml-1 opacity-70">{branchCounts[key]}</span>
              </button>
            ))}
          </div>
        </motion.header>

        {/* Library grid */}
        <div className="grid gap-3 lg:grid-cols-3">
          {filtered.map((c, i) => {
            const caseAttempts = hydrated
              ? attempts.filter((a) => a.caseId === c.id)
              : [];
            const lastAttempt = caseAttempts.at(-1);
            const playCount = caseAttempts.length;
            const type = caseType(c);

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.04, duration: 0.35 }}
              >
                <Link
                  to="/vaka/$caseId"
                  params={{ caseId: c.id }}
                  className="group block h-full rounded-xl border border-line bg-surface-raised p-4 transition-all hover:border-indigo/40 hover:bg-indigo-soft/10 hover:shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
                      {branchLabel(c.branch)}
                    </span>
                    <span className="text-ink-3/40">·</span>
                    <DifficultyBadge difficulty={c.difficulty} />
                    <span className="text-ink-3/40">·</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                        type === "deep"
                          ? "bg-indigo-soft/60 text-indigo"
                          : "bg-amber-soft/50 text-amber-foreground",
                      )}
                    >
                      {type === "deep" ? "Kapsamlı" : "Hızlı"}
                    </span>
                    <span className="ml-auto text-[10px] text-ink-3">
                      ~{c.estimatedMinutes} dk
                    </span>
                  </div>

                  <div className="mb-2">
                    <ReviewBadge review={c.reviewedBy} variant="chip" />
                  </div>

                  <h3 className="font-display text-base font-semibold text-ink-1">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-2">
                    {c.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
                    {lastAttempt ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3 text-signal-positive" />
                        <span className="text-[10px] text-ink-2">
                          {playCount}× oynandı · son +{lastAttempt.xpEarned} XP
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-foreground">
                        Yeni — hiç oynamadın
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo transition-transform group-hover:translate-x-0.5">
                      {lastAttempt ? "Tekrar" : "Başla"}
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink-3">
          Eğitim amaçlı simülasyon · LawKit hukuki tavsiye vermez
        </p>
      </div>
    </PageShell>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: 1 | 2 | 3 | 4 }) {
  return (
    <span
      title={`Zorluk seviyesi ${difficulty}/4`}
      className="inline-flex items-center gap-0.5"
      aria-label={`Zorluk ${difficulty} / 4`}
    >
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn(
            "size-1.5 rounded-full",
            n <= difficulty ? "bg-ink-2" : "bg-line",
          )}
        />
      ))}
    </span>
  );
}

function branchLabel(branch: string): string {
  const map: Record<string, string> = {
    is_hukuku: "İş Hukuku",
    borclar: "Borçlar",
    medeni: "Medeni",
    medeni_usul: "Medeni Usul",
    ceza: "Ceza",
    idare: "İdare",
    ticaret: "Ticaret",
  };
  return map[branch] ?? branch;
}
