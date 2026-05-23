import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Flame,
  Trophy,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { ReviewBadge } from "@/components/composite/ReviewBadge";
import { recommendCase } from "@/lib/adaptive/difficulty";
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
import { useAuth } from "@/lib/auth/AuthProvider";
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
  const { user } = useAuth();
  // SSR-safe hydration: zustand persist'in client mount sonrası yüklenmesini bekle.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const xp = useGamificationStore((s) => s.xp);
  const streak = useGamificationStore((s) => s.streak);
  const dailyGoal = useGamificationStore((s) => s.dailyGoal);
  const recentDays = useGamificationStore((s) => s.recentDays);
  const attempts = useGamificationStore((s) => s.attempts);
  const setDailyGoal = useGamificationStore((s) => s.setDailyGoal);
  const hydrateFromCloud = useGamificationStore((s) => s.hydrateFromCloud);

  // Login olduğunda cloud'dan attempt'leri çek
  useEffect(() => {
    if (user) {
      void hydrateFromCloud();
    }
  }, [user, hydrateFromCloud]);

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
            Nasıl gidiyorsun?
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
            Topladığın puan, üst üste girdiğin günler, becerilerinin ortalaması ve aldığın rozetler bir bakışta burada.
          </p>

          {!user && hydrated ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber/40 bg-amber-soft/30 px-4 py-3 text-xs text-ink-1">
              <span>📁</span>
              <p className="flex-1">
                Şu an misafir modundasın — verilerin sadece bu tarayıcıda. Hesap aç,
                karnen bulutta saklansın, farklı cihazlardan eriş.
              </p>
              <Link
                to="/kayit"
                className="rounded-md bg-ink-1 px-3 py-1.5 text-[11px] font-bold text-surface-raised hover:bg-ink-1/90"
              >
                Hesap aç
              </Link>
            </div>
          ) : null}
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
                Beceri haritan
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
                Ustalaştığın alanlar
              </h2>
              <p className="mt-1 text-[10px] text-ink-3">
                Bir beceride son 3 vakada 3.5+ ortalama → rozet
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
                          {avg !== undefined ? `Ortalaman: ${avg.toFixed(2)}` : "Henüz vaka oynamadın"}
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

        <CaseLibrarySection attempts={attempts} hydrated={hydrated} />


        {/* Son denemeler */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-10"
        >
          <header className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
              Son oynadıkların
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

/* ────────── Vaka Kütüphanesi (filtreli + zengin kart) ────────── */

type BranchFilter = "all" | "is_hukuku" | "borclar" | "medeni";

function CaseLibrarySection({
  attempts,
  hydrated,
}: {
  attempts: ReturnType<typeof useGamificationStore.getState>["attempts"];
  hydrated: boolean;
}) {
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

  // Vaka tipini node yapısından çıkar — derin vakada açıkça outcomes var.
  const caseType = (c: ReturnType<typeof listCases>[number]) => {
    if (c.outcomes && c.outcomes.length > 1) return "deep" as const;
    return "demo" as const;
  };

  const recommendation = hydrated ? recommendCase(allCases, attempts) : null;
  const recommendedCase = recommendation
    ? allCases.find((c) => c.id === recommendation.caseId)
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-10"
    >
      {/* AI ile vaka üret */}
      <AiCaseGenerator />

      {/* Sana önerilen vaka */}
      {recommendation && recommendedCase ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-2xl border border-indigo/30 bg-gradient-to-r from-indigo-soft/40 via-indigo-soft/20 to-transparent p-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Sparkles className="size-5 shrink-0 text-indigo" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo">
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
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
            >
              Hadi başla <ArrowRight className="size-3" />
            </Link>
          </div>
        </motion.div>
      ) : null}

      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
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
            Bunlar LawKit ekibinin hazırladığı örnek vakalardır — pratik için hep buradalar.{" "}
            {branchCounts.all} vaka · {allCases.filter((c) => caseType(c) === "deep").length} kapsamlı senaryo
          </p>
        </div>

        {/* Filtre rozetleri */}
        <div className="flex flex-wrap items-center gap-1.5">
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
              {label} <span className="ml-1 opacity-70">{branchCounts[key]}</span>
            </button>
          ))}
        </div>
      </header>

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
              transition={{ delay: 0.35 + i * 0.04 }}
            >
              <Link
                to="/vaka/$caseId"
                params={{ caseId: c.id }}
                className="group block h-full rounded-xl border border-line bg-surface-raised p-4 transition-all hover:border-indigo/40 hover:bg-indigo-soft/10 hover:shadow-sm"
              >
                {/* Üst rozet şeridi */}
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
                    title={
                      type === "deep"
                        ? "Kapsamlı senaryo — birden çok sonuç dalı, ~15-20 dk"
                        : "Hızlı pratik — tek akış, ~8-10 dk"
                    }
                  >
                    {type === "deep" ? "Kapsamlı" : "Hızlı"}
                  </span>
                  <span className="ml-auto text-[10px] text-ink-3">
                    ~{c.estimatedMinutes} dk
                  </span>
                </div>

                {/* Hukukçu onay rozeti */}
                <div className="mb-2">
                  <ReviewBadge review={c.reviewedBy} variant="chip" />
                </div>

                <h3 className="font-display text-base font-semibold text-ink-1">
                  {c.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-2">
                  {c.summary}
                </p>

                {/* Alt durum */}
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
    </motion.section>
  );
}

function AiCaseGenerator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-6 rounded-2xl border border-indigo/30 bg-gradient-to-r from-indigo-soft/40 via-indigo-soft/10 to-transparent p-5"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-soft/60">
          <Wand2 className="size-5 text-indigo" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">
            Vaka Studio
          </p>
          <p className="mt-0.5 font-display text-base font-semibold text-ink-1">
            AI ile kendi vakanı yarat
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            Dal, zorluk ve istersen konu/karakter tonu seç — AI sana özel bir
            vaka senaryosu üretsin.
          </p>
        </div>
        <Link
          to="/vaka-studio"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
        >
          Vaka üret <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </motion.div>
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
