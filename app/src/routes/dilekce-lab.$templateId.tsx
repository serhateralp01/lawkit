import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { BetaGate } from "@/components/site/BetaGate";
import { getPetitionTemplate } from "@/content/petition-templates";
import type { PetitionSection } from "@/content/petition-templates";
import { defaultRubric } from "@/content/rubrics";
import type { RubricKey } from "@/content/types";
import { cn } from "@/lib/utils";
import { aiAssess } from "@/lib/api/aiClient";
import type { CaseSession } from "@/lib/case-engine";
import type { AssessmentResponse } from "@/lib/ai-orchestrator/types";

const PET_KEY = "lawkit_gen_petition";

export const Route = createFileRoute("/dilekce-lab/$templateId")({
  loader: ({ params }) => {
    if (params.templateId.startsWith("gen_pet_")) {
      try {
        const raw = sessionStorage.getItem(PET_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.template) {
            sessionStorage.removeItem(PET_KEY);
            return { template: parsed.template };
          }
        }
      } catch { /* sessionStorage unavailable */ }
      throw notFound();
    }
    const t = getPetitionTemplate(params.templateId);
    if (!t) throw notFound();
    return { template: t };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.template.title} — Dilekçe Lab | LawKit` }],
  }),
  component: PetitionWorkbenchGated,
});

function PetitionWorkbenchGated() {
  return (
    <BetaGate feature="Dilekçe Lab">
      <PetitionWorkbench />
    </BetaGate>
  );
}

interface SectionState {
  text: string;
  result: AssessmentResponse | null;
  loading: boolean;
  error: string | null;
}

function emptySection(): SectionState {
  return { text: "", result: null, loading: false, error: null };
}

function PetitionWorkbench() {
  const { template } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [states, setStates] = useState<Record<string, SectionState>>(() => {
    const m: Record<string, SectionState> = {};
    for (const s of template.sections) m[s.key] = emptySection();
    return m;
  });

  const currentSection = template.sections[active];
  const currentState = states[currentSection.key];

  const update = (key: string, patch: Partial<SectionState>) => {
    setStates((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const evaluate = async () => {
    if (!currentState || currentState.text.trim().length < currentSection.minChars) return;
    update(currentSection.key, { loading: true, error: null, result: null });

    try {
      const userAnswer = [
        `[Dilekçe Lab — Şablon: ${template.title}]`,
        `[Bölüm: ${currentSection.title}]`,
        `[Bölüm rehberi: ${currentSection.guidance}]`,
        currentState.text.trim(),
      ].join("\n");

      const res = await aiAssess({
        caseId: "is_hukuku_001",
        session: {
          caseId: "is_hukuku_001",
          startNode: "n1",
          currentNode: "n1",
          history: [],
          ledger: {},
          done: false,
          startedAt: Date.now(),
        },
        userAnswer,
        dimensions: currentSection.scoringDimensions as RubricKey[],
      });

      update(currentSection.key, { loading: false, result: res });
    } catch (e) {
      update(currentSection.key, {
        loading: false,
        error: e instanceof Error ? e.message : "Değerlendirme başarısız",
      });
    }
  };

  const isCurrentEvaluated = !!currentState?.result;
  const tooShort =
    currentState && currentState.text.trim().length < currentSection.minChars;

  const evaluatedCount = template.sections.filter((s) => states[s.key]?.result).length;
  const totalSections = template.sections.length;
  const allEvaluated = evaluatedCount === totalSections;

  // Genel ortalama
  const overallAvg = (() => {
    const all: number[] = [];
    for (const s of template.sections) {
      const r = states[s.key]?.result;
      if (r) for (const x of r.scores) all.push(x.score);
    }
    if (all.length === 0) return null;
    return all.reduce((a, b) => a + b, 0) / all.length;
  })();

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Künye + ilerleme */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
              Dilekçe Lab · {template.id}
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-bold text-ink-1 lg:text-3xl">
              {template.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
              İlerleme
            </p>
            <p className="font-display text-xl font-bold text-ink-1 tabular-nums">
              {evaluatedCount} / {totalSections} bölüm
            </p>
            {overallAvg !== null ? (
              <p className="text-[11px] text-ink-3">
                Şu ana kadar ortalama:{" "}
                <span className="font-bold text-ink-1">{overallAvg.toFixed(2)} / 4</span>
              </p>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 grid-cols-[260px_minmax(0,1fr)]">
          {/* Sol — bölüm listesi */}
          <aside className="space-y-2">
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-ink-3">
              Bölümler
            </p>
            {template.sections.map((s, i) => {
              const st = states[s.key];
              const isActive = i === active;
              const isDone = !!st.result;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md border p-2.5 text-left text-xs transition-colors",
                    isActive
                      ? "border-indigo/40 bg-indigo-soft/30"
                      : "border-line bg-surface-raised hover:bg-surface-sunken/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                      isDone
                        ? "bg-signal-positive text-white"
                        : isActive
                          ? "bg-indigo text-surface-raised"
                          : "bg-line text-ink-3",
                    )}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-1">{s.title}</p>
                    {st.result ? (
                      <p className="text-[10px] text-ink-3">
                        Ortalama:{" "}
                        {(
                          st.result.scores.reduce((a, b) => a + b.score, 0) /
                          st.result.scores.length
                        ).toFixed(1)}
                        /4
                      </p>
                    ) : (
                      <p className="text-[10px] text-ink-3">
                        {st.text ? `${st.text.length} karakter` : "Henüz yazmadın"}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}

            {allEvaluated ? (
              <div className="mt-4 rounded-md border border-amber/40 bg-amber-soft/30 p-3">
                <Trophy className="mb-1 size-4 text-amber-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-1">
                  Dilekçen tamam
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-2">
                  Tüm bölümleri değerlendirdin. Yukarıdaki ortalamayı gör.
                </p>
              </div>
            ) : null}
          </aside>

          {/* Sağ — aktif bölüm */}
          <main className="rounded-2xl border border-line bg-surface-raised p-6 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <header>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">
                    Bölüm {active + 1} / {totalSections}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-ink-1">
                    {currentSection.title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
                    {currentSection.guidance}
                  </p>
                </header>

                <textarea
                  value={currentState?.text ?? ""}
                  onChange={(e) =>
                    update(currentSection.key, {
                      text: e.target.value,
                      result: null,
                      error: null,
                    })
                  }
                  rows={10}
                  placeholder={currentSection.placeholder}
                  className="w-full resize-y rounded-md border border-line bg-surface-sunken/30 p-3 text-sm leading-relaxed text-ink-1 outline-none focus:border-indigo/60 focus:bg-surface-raised"
                />

                <div className="flex items-center justify-between text-[10px] text-ink-3">
                  <span>
                    {currentState?.text.trim().length ?? 0} / min {currentSection.minChars}
                  </span>
                  {tooShort ? (
                    <span className="text-signal-warning">
                      Daha açıklayıcı yazmalısın
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!isCurrentEvaluated ? (
                    <button
                      type="button"
                      onClick={evaluate}
                      disabled={currentState?.loading || tooShort}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
                    >
                      {currentState?.loading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" /> AI değerlendiriyor…
                        </>
                      ) : (
                        <>
                          AI değerlendir <ArrowRight className="size-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        update(currentSection.key, { result: null, error: null })
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-4 py-2 text-xs font-semibold text-ink-1 hover:bg-surface-sunken"
                    >
                      Tekrar değerlendir
                    </button>
                  )}

                  {active < totalSections - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActive(active + 1)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 hover:text-ink-1"
                    >
                      Sonraki bölüm <ArrowRight className="size-3" />
                    </button>
                  ) : null}
                </div>

                <AnimatePresence>
                  {currentState?.error ? (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden rounded-md border border-signal-critical/40 bg-signal-critical/5 p-3 text-xs text-signal-critical"
                    >
                      <AlertTriangle className="mr-1 inline size-3.5" />
                      {currentState.error}
                    </motion.div>
                  ) : null}

                  {currentState?.result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 rounded-md border border-line bg-surface-sunken/40 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
                        AI değerlendirmesi
                      </p>
                      <ul className="space-y-2">
                        {currentState.result.scores.map((s) => {
                          const dim = defaultRubric.dimensions.find(
                            (d) => d.key === s.dimension,
                          );
                          const color =
                            s.score >= 3
                              ? "text-signal-positive"
                              : s.score >= 2
                                ? "text-signal-warning"
                                : "text-signal-critical";
                          return (
                            <li key={s.dimension} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-ink-1">
                                  {dim?.label}
                                </span>
                                <span
                                  className={cn(
                                    "font-bold tabular-nums",
                                    color,
                                  )}
                                >
                                  {s.score} / 4
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-ink-2">
                                {s.reason}
                              </p>
                            </li>
                          );
                        })}
                      </ul>

                      {currentState.result.missedIssues.length > 0 ? (
                        <div className="rounded-md border border-signal-warning/40 bg-signal-warning/5 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-signal-warning">
                            Eksiklerin
                          </p>
                          <ul className="mt-1 space-y-1 text-xs text-ink-1">
                            {currentState.result.missedIssues.map((m, i) => (
                              <li key={i} className="flex gap-1.5">
                                <span>•</span>
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="rounded-md border border-signal-positive/40 bg-signal-positive/5 p-3 text-xs text-ink-1">
                          <CheckCircle2 className="mr-1 inline size-3.5 text-signal-positive" />
                          Önemli bir eksik yok.
                        </div>
                      )}

                      <p className="text-[11px] italic text-ink-2">
                        Sonraki adım: {currentState.result.nextStep}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink-3">
          Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez ·{" "}
          <Link to="/dilekce-lab" className="underline">
            Şablon listesine dön
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
