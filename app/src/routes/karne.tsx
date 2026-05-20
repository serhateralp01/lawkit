import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, ArrowRight, Sparkles } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  useGamificationStore,
  dimensionAverages,
  dailyProgress,
  isMastered,
} from "@/lib/gamification";
import { defaultRubric } from "@/content/rubrics";
import { getCase, listCases } from "@/content/cases";
import { PageShell } from "@/components/site/PageShell";
import { cn } from "@/lib/utils";
import type { RubricKey } from "@/content/types";

export const Route = createFileRoute("/karne")({
  head: () => ({
    meta: [
      { title: "Karne · LawKit" },
      {
        name: "description",
        content:
          "Yetkinlik gelişimi, streak, XP, mastery rozetleri ve son vakaların tek ekranda.",
      },
    ],
  }),
  component: KarnePage,
});

function KarnePage() {
  // SSR-safe hydration: zustand persist'in client mount sonrası yüklenmesini bekle.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const xp = useGamificationStore((s) => s.xp);
  const streak = useGamificationStore((s) => s.streak);
  const dailyGoal = useGamificationStore((s) => s.dailyGoal);
  const recentDays = useGamificationStore((s) => s.recentDays);
  const attempts = useGamificationStore((s) => s.attempts);
  const setDailyGoal = useGamificationStore((s) => s.setDailyGoal);

  const progress = hydrated ? dailyProgress({ recentDays, dailyGoal }) : 0;
  const averages = hydrated ? dimensionAverages(attempts) : {};
  const radarData = defaultRubric.dimensions
    .filter((d) => defaultRubric.studentVisibleDimensions.includes(d.key))
    .map((d) => ({
      dim: d.short,
      avg: Number(((averages[d.key] ?? 0)).toFixed(2)),
    }));

  const masteredDimensions = hydrated
    ? defaultRubric.studentVisibleDimensions.filter((k) => isMastered(attempts, k))
    : [];

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:px-8 lg:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
            Senin Karne'n
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-1 lg:text-4xl">
            Yetkinlik gelişimini gör
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
            Topladığın XP, ardışık günlerin, boyut bazlı ortalaman ve mastery rozetlerin.
            Verin tarayıcında lokal tutulur — Tur 2'de hesabınla cloud'a senkronize olur.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Trophy className="size-4" />}
            label="Toplam XP"
            value={hydrated ? xp.toString() : "—"}
            tone="indigo"
            delay={0}
          />
          <StatCard
            icon={<Flame className="size-4" />}
            label="Ardışık gün"
            value={hydrated ? `${streak} gün` : "—"}
            tone="amber"
            delay={0.05}
          />
          <StatCard
            icon={<Target className="size-4" />}
            label="Günlük hedef"
            value={hydrated ? `${Math.round(progress * 100)}%` : "—"}
            tone="positive"
            delay={0.1}
            footer={
              hydrated ? (
                <DailyGoalControl value={dailyGoal} onChange={setDailyGoal} />
              ) : null
            }
          />
          <StatCard
            icon={<Sparkles className="size-4" />}
            label="Toplam vaka"
            value={hydrated ? attempts.length.toString() : "—"}
            tone="indigo"
            delay={0.15}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Yetkinlik radar */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-2xl border border-line bg-surface-raised p-6 shadow-[var(--shadow-raised)]"
          >
            <header className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
                Yetkinlik radarı
              </h2>
              <span className="text-[10px] text-ink-3">Son 10 vakanın ortalaması · 0–4</span>
            </header>
            <div className="mt-4 h-72">
              {hydrated && attempts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="rgb(0 0 0 / 0.08)" />
                    <PolarAngleAxis
                      dataKey="dim"
                      tick={{ fontSize: 11, fill: "rgb(0 0 0 / 0.6)" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 4]}
                      tick={{ fontSize: 9, fill: "rgb(0 0 0 / 0.4)" }}
                    />
                    <Radar
                      name="Sen"
                      dataKey="avg"
                      stroke="rgb(55 48 163)"
                      fill="rgb(55 48 163)"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </div>
          </motion.section>

          {/* Mastery rozetleri */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-2xl border border-line bg-surface-raised p-6 shadow-[var(--shadow-raised)]"
          >
            <header>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
                Mastery rozetleri
              </h2>
              <p className="mt-1 text-[10px] text-ink-3">
                Bir boyutta son 3 vakada 3.5+ ortalama → rozet
              </p>
            </header>
            <ul className="mt-4 space-y-2">
              {defaultRubric.dimensions
                .filter((d) => defaultRubric.studentVisibleDimensions.includes(d.key))
                .map((d) => {
                  const mastered = masteredDimensions.includes(d.key as RubricKey);
                  const avg = averages[d.key as RubricKey];
                  return (
                    <li
                      key={d.key}
                      className={cn(
                        "flex items-center justify-between rounded-md border p-3",
                        mastered
                          ? "border-amber/40 bg-amber-soft/30"
                          : "border-line bg-surface-sunken/40",
                      )}
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink-1">{d.label}</p>
                        <p className="text-[10px] text-ink-3">
                          {avg !== undefined ? `Ort: ${avg.toFixed(2)}` : "Henüz veri yok"}
                        </p>
                      </div>
                      {mastered ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="rounded-full bg-amber px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-1"
                        >
                          Mastered
                        </motion.span>
                      ) : (
                        <span className="text-[10px] text-ink-3">—</span>
                      )}
                    </li>
                  );
                })}
            </ul>
          </motion.section>
        </div>

        {/* Vaka kütüphanesi */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-10"
        >
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
              Vaka kütüphanesi
            </h2>
            <span className="text-[10px] text-ink-3">{listCases().length} vaka</span>
          </header>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listCases().map((c, i) => {
              const lastAttempt = hydrated
                ? attempts.filter((a) => a.caseId === c.id).at(-1)
                : undefined;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <Link
                    to="/vaka/$caseId"
                    params={{ caseId: c.id }}
                    className="block rounded-xl border border-line bg-surface-raised p-4 transition-colors hover:border-indigo/40 hover:bg-indigo-soft/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
                        {branchLabel(c.branch)} · ~{c.estimatedMinutes} dk
                      </span>
                      {lastAttempt ? (
                        <span className="text-[10px] font-semibold text-signal-positive">
                          +{lastAttempt.xpEarned} XP
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-display text-base font-semibold text-ink-1">
                      {c.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-2">
                      {c.summary}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-indigo">
                      {lastAttempt ? "Tekrar oyna" : "Vakayı aç"}{" "}
                      <ArrowRight className="size-3" />
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Son denemeler */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-10"
        >
          <header className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
              Son denemeler
            </h2>
          </header>
          {hydrated && attempts.length > 0 ? (
            <ul className="overflow-hidden rounded-xl border border-line bg-surface-raised">
              {[...attempts]
                .reverse()
                .slice(0, 8)
                .map((a, i) => {
                  const c = getCase(a.caseId);
                  const date = new Date(a.finishedAt);
                  return (
                    <li
                      key={`${a.caseId}-${a.finishedAt}`}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm",
                        i !== 0 && "border-t border-line",
                      )}
                    >
                      <div>
                        <p className="font-semibold text-ink-1">
                          {c?.title ?? a.caseId}
                        </p>
                        <p className="text-[10px] text-ink-3">
                          {date.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                          {" · "}
                          {a.hintsOpened > 0 ? `${a.hintsOpened} ipucu` : "ipucusuz"}
                          {" · "}
                          {Math.round(a.durationMs / 1000)} sn
                        </p>
                      </div>
                      <span className="rounded-md bg-indigo-soft/40 px-2.5 py-1 text-[11px] font-bold text-indigo">
                        +{a.xpEarned} XP
                      </span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <EmptyState label="Henüz vaka tamamlamadın. Aşağıdaki kütüphaneden başla." />
          )}
        </motion.section>
      </div>
    </PageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  delay,
  footer,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "indigo" | "amber" | "positive";
  delay: number;
  footer?: React.ReactNode;
}) {
  const toneClass = {
    indigo: "bg-indigo-soft/40 text-indigo",
    amber: "bg-amber-soft/50 text-amber-foreground",
    positive: "bg-signal-positive/10 text-signal-positive",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-line bg-surface-raised p-4 shadow-[var(--shadow-raised)]"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-md",
            toneClass,
          )}
        >
          {icon}
        </span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
          {label}
        </p>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink-1 tabular-nums">
        {value}
      </p>
      {footer}
    </motion.div>
  );
}

function DailyGoalControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-3">
      <span>Hedef:</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="size-5 rounded border border-line text-[10px] hover:bg-surface-sunken"
        >
          −
        </button>
        <span className="min-w-[1.5rem] text-center text-xs font-semibold text-ink-1">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="size-5 rounded border border-line text-[10px] hover:bg-surface-sunken"
        >
          +
        </button>
      </div>
      <span>vaka/gün</span>
    </div>
  );
}

function EmptyState({ label }: { label?: string } = {}) {
  return (
    <div className="flex h-full min-h-[10rem] items-center justify-center rounded-md border border-dashed border-line bg-surface-sunken/30 p-6 text-center text-xs text-ink-3">
      {label ?? "Bir vaka tamamla — radar burada belirir."}
    </div>
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
