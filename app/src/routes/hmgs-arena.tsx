import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  RotateCcw,
  Target,
  Loader2,
  Bot,
  BookOpen,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import {
  analyzeDiagnostic,
  BRANCH_LABELS,
  hmgsQuestions,
  pickDiagnosticSet,
  type HmgsQuestion,
  type HmgsBranch,
  type DiagnosticResult,
} from "@/content/hmgs-questions";
import { defaultRubric } from "@/content/rubrics";
import type { RubricKey } from "@/content/types";
import { listCases } from "@/content/cases";
import { BetaGate } from "@/components/site/BetaGate";
import { aiGenerateQuestions } from "@/lib/api/aiClient";
import type { GeneratedQuestion } from "@/lib/ai-orchestrator/types";
import { cn } from "@/lib/utils";

type Phase = "intro" | "loading" | "running" | "result";

export const Route = createFileRoute("/hmgs-arena")({
  head: () => ({
    meta: [
      { title: "HMGS Arena — Tanı Testi | LawKit" },
      {
        name: "description",
        content:
          "10 soruluk mini tanı testi. AI ile yeni sorular üretin ya da sabit havuzdan ilerleyin.",
      },
    ],
  }),
  component: HmgsArenaGated,
});

function HmgsArenaGated() {
  return (
    <BetaGate feature="HMGS Arena tanı testi">
      <HmgsArenaPage />
    </BetaGate>
  );
}

function HmgsArenaPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<HmgsQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [genError, setGenError] = useState<string | null>(null);

  const totalAvailable = hmgsQuestions.length;

  const start = (count: number) => {
    // Direkt sabit havuzdan başlat (hızlı yol)
    const set = pickDiagnosticSet(count);
    setQuestions(set);
    setCurrentIdx(0);
    setAnswers({});
    setRevealed({});
    setPhase("running");
  };

  const startWithAI = async (count: number) => {
    setPhase("loading");
    setGenError(null);
    try {
      const branches = Object.keys(BRANCH_LABELS) as HmgsBranch[];
      const res = await aiGenerateQuestions({
        branch: branches[Math.floor(Math.random() * branches.length)],
        difficulty: 2,
        count,
        contextSourceIds: [],
      });

      if (res.questions.length > 0) {
        const mapped: HmgsQuestion[] = res.questions.map((q: GeneratedQuestion) => ({
          id: q.id,
          branch: (q.branch as HmgsBranch) || "is_hukuku",
          difficulty: (q.difficulty as 1 | 2 | 3 | 4) || 2,
          primarySkill: "mesele" as const,
          stem: q.stem,
          choices: q.choices as HmgsQuestion["choices"],
          correctId: q.correctId as "a" | "b" | "c" | "d",
          explanation: q.explanation,
          distractorReasons: q.distractorReasons as HmgsQuestion["distractorReasons"],
          sources: q.sources,
        }));
        setQuestions(mapped);
        setCurrentIdx(0);
        setAnswers({});
        setRevealed({});
        setPhase("running");
      } else {
        throw new Error("AI soru üretemedi.");
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Bilinmeyen hata");
      // Fallback: sabit havuzdan başlat
      setTimeout(() => start(count), 500);
    }
  };

  const restart = () => setPhase("intro");

  if (phase === "loading") {
    return (
      <PageShell>
        <section className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
          <div className="mb-6 grid size-16 place-items-center rounded-full bg-gold/10">
            <Loader2 className="size-8 animate-spin text-gold" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Sorular hazırlanıyor</h1>
          <p className="mt-2 text-sm text-ink/55">
            AI size özel sorular üretiyor. Hukuki kaynaklardan beslenen,
            daha önce görmediğiniz sorular.
          </p>
          {genError && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
              AI bağlantısı kurulamadı — sabit havuzdan devam ediliyor.
            </p>
          )}
        </section>
      </PageShell>
    );
  }

  if (phase === "intro") {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-indigo-soft/40 px-3 py-1">
              <Target className="size-3.5 text-indigo" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">
                Tanı Testi · {totalAvailable} sabit + AI üretim
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink-1 lg:text-4xl">
              Nerede iyisiniz, nerede zayıfsınız?
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
              AI ile daha önce görmediğiniz sorular üretin ya da sabit havuzdan ilerleyin.
              Her sorunun ardından açıklama görürsünüz — yanlışınız bile öğretir.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Branş" value={`${Object.keys(BRANCH_LABELS).length}`} sub="hukuk dalı" />
              <Stat label="Süre" value="~10 dk" sub="ortalama" />
              <Stat label="Çıktı" value="Radar" sub="zayıf alan + öneri" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => startWithAI(10)}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold/90"
              >
                <Bot className="size-4" />
                AI ile 10 soru üret
                <Sparkles className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => start(10)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink-1 px-6 py-3 text-sm font-bold text-surface-raised hover:bg-ink-1/90"
              >
                10 soruluk testi başlat
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => start(5)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-raised px-6 py-3 text-sm font-bold text-ink-1 hover:bg-surface-sunken"
              >
                Kısa: 5 soru
              </button>
            </div>

            <p className="mt-12 text-center text-[10px] uppercase tracking-widest text-ink-3">
              Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez
            </p>
          </motion.div>
        </section>
      </PageShell>
    );
  }

  if (phase === "result") {
    const result = analyzeDiagnostic(questions, answers);
    return (
      <PageShell>
        <DiagnosticResult result={result} questions={questions} answers={answers} onRestart={restart} />
      </PageShell>
    );
  }

  // running
  const current = questions[currentIdx];
  const isRevealed = revealed[current.id];
  const userAns = answers[current.id];
  const isLast = currentIdx === questions.length - 1;

  const pickAnswer = (id: "a" | "b" | "c" | "d") => {
    if (isRevealed) return;
    setAnswers((a) => ({ ...a, [current.id]: id }));
    setRevealed((r) => ({ ...r, [current.id]: true }));
  };

  const next = () => {
    if (isLast) {
      setPhase("result");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Üst şerit: ilerleme */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
            Soru {currentIdx + 1} / {questions.length}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-ink-3">
            <span className="rounded-full bg-amber-soft/40 px-2 py-0.5 font-bold text-amber-foreground">
              {BRANCH_LABELS[current.branch]}
            </span>
            <DifficultyDots d={current.difficulty} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1 overflow-hidden rounded-full bg-surface-sunken">
          <motion.div
            className="h-full bg-indigo"
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="font-display text-xl font-semibold leading-snug text-ink-1 lg:text-2xl">
              {current.stem}
            </h2>

            <ul className="space-y-2.5">
              {current.choices.map((c) => {
                const isUserPick = userAns === c.id;
                const isCorrect = c.id === current.correctId;
                const showResult = isRevealed;

                return (
                  <motion.li
                    key={c.id}
                    whileHover={!isRevealed ? { x: 2 } : undefined}
                    animate={
                      showResult && isUserPick && !isCorrect
                        ? { x: [0, -4, 4, -2, 2, 0] }
                        : showResult && isCorrect
                          ? { scale: [1, 1.02, 1] }
                          : { scale: 1, x: 0 }
                    }
                    transition={{ duration: 0.4 }}
                  >
                    <button
                      type="button"
                      onClick={() => pickAnswer(c.id)}
                      disabled={isRevealed}
                      className={cn(
                        "w-full rounded-lg border p-3.5 text-left text-sm transition-colors",
                        !showResult &&
                          "border-line bg-surface-raised hover:border-indigo/40 hover:bg-indigo-soft/20",
                        showResult &&
                          isCorrect &&
                          "border-signal-positive/50 bg-signal-positive/10 text-ink-1",
                        showResult &&
                          isUserPick &&
                          !isCorrect &&
                          "border-signal-critical/50 bg-signal-critical/10 text-ink-1",
                        showResult &&
                          !isCorrect &&
                          !isUserPick &&
                          "border-line bg-surface-sunken/40 text-ink-3 opacity-70",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-bold text-[10px]",
                            !showResult && "border border-line bg-surface-raised text-ink-2",
                            showResult && isCorrect && "bg-signal-positive text-white",
                            showResult &&
                              isUserPick &&
                              !isCorrect &&
                              "bg-signal-critical text-white",
                            showResult &&
                              !isCorrect &&
                              !isUserPick &&
                              "border border-line bg-surface-raised text-ink-3",
                          )}
                        >
                          {showResult && isCorrect ? (
                            <CheckCircle2 className="size-3" />
                          ) : showResult && isUserPick && !isCorrect ? (
                            <XCircle className="size-3" />
                          ) : (
                            c.id.toUpperCase()
                          )}
                        </span>
                        <span className="flex-1 leading-snug">{c.text}</span>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            {/* Açıklama */}
            <AnimatePresence>
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 overflow-hidden rounded-lg border border-line bg-surface-sunken/30 p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo">
                    AI Tutor · Doğru cevap: {current.correctId.toUpperCase()}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-1">{current.explanation}</p>

                  {userAns &&
                  userAns !== current.correctId &&
                  current.distractorReasons?.[userAns] ? (
                    <div className="rounded-md border border-signal-warning/40 bg-signal-warning/5 p-3 text-xs">
                      <p className="font-bold text-signal-warning">Senin seçimin neden hatalıydı:</p>
                      <p className="mt-1 text-ink-2">{current.distractorReasons[userAns]}</p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
                  >
                    {isLast ? "Sonucu gör" : "Sonraki soru"}{" "}
                    <ArrowRight className="size-3.5" />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </section>
    </PageShell>
  );
}

/* ────────── Result ────────── */

function DiagnosticResult({
  result,
  questions,
  answers,
  onRestart,
}: {
  result: DiagnosticResult;
  questions: HmgsQuestion[];
  answers: Record<string, "a" | "b" | "c" | "d">;
  onRestart: () => void;
}) {
  const percentage = Math.round((result.correct / result.total) * 100);
  const tone =
    percentage >= 80 ? "positive" : percentage >= 60 ? "neutral" : percentage >= 40 ? "warning" : "loss";

  const headline =
    percentage >= 80
      ? "Mükemmel hazırlık seviyesi"
      : percentage >= 60
        ? "İyi başlangıç, eksiklerin var"
        : percentage >= 40
          ? "Önemli boşluklar var"
          : "Sıfırdan ciddi bir hazırlık gerekli";

  // En zayıf branch ile vaka önerme
  const recommendedCase = useMemo(() => {
    if (!result.weakestBranch) return null;
    return listCases().find(
      (c) => c.branch === (result.weakestBranch as string) && c.outcomes && c.outcomes.length > 1,
    );
  }, [result.weakestBranch]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl border p-6",
          tone === "positive" && "border-signal-positive/40 bg-signal-positive/5",
          tone === "neutral" && "border-indigo/40 bg-indigo-soft/30",
          tone === "warning" && "border-signal-warning/40 bg-signal-warning/5",
          tone === "loss" && "border-signal-critical/40 bg-signal-critical/5",
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
              Tanı testi sonucun
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink-1">
              {headline}
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              {result.correct} / {result.total} doğru · %{percentage} başarı
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-5xl font-extrabold text-ink-1 tabular-nums">
              %{percentage}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Branch breakdown */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
          Hukuk dalı kırılımı
        </h2>
        <div className="space-y-2">
          {Object.entries(result.byBranch).map(([branch, data]) => {
            const ratio = data!.total > 0 ? data!.correct / data!.total : 0;
            const color =
              ratio >= 0.8
                ? "bg-signal-positive"
                : ratio >= 0.5
                  ? "bg-signal-warning"
                  : "bg-signal-critical";
            return (
              <div
                key={branch}
                className="rounded-md border border-line bg-surface-raised p-3"
              >
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-1">
                    {BRANCH_LABELS[branch as HmgsBranch]}
                  </span>
                  <span className="font-bold tabular-nums text-ink-1">
                    {data!.correct} / {data!.total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <motion.div
                    className={cn("h-full rounded-full", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Skill breakdown */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-8"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
          Beceri kırılımı
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(result.bySkill).map(([skill, data]) => {
            const ratio = data!.total > 0 ? data!.correct / data!.total : 0;
            const dim = defaultRubric.dimensions.find((x) => x.key === (skill as RubricKey));
            return (
              <div
                key={skill}
                className="rounded-md border border-line bg-surface-raised p-3"
              >
                <p className="text-xs font-semibold text-ink-1">{dim?.label ?? skill}</p>
                <p className="text-[11px] text-ink-3">
                  {data!.correct} / {data!.total} · %{Math.round(ratio * 100)}
                </p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Vaka önerisi */}
      {recommendedCase ? (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl border border-indigo/30 bg-gradient-to-r from-indigo-soft/40 via-indigo-soft/20 to-transparent p-5"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Sparkles className="size-5 shrink-0 text-indigo" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo">
                Bu sonuca göre sana önerilen vaka
              </p>
              <p className="mt-0.5 font-display text-lg font-semibold text-ink-1">
                {recommendedCase.title}
              </p>
              <p className="mt-1 text-xs text-ink-2">
                {result.weakestBranch
                  ? `${BRANCH_LABELS[result.weakestBranch]} alanında pratik`
                  : "Önerilen derin vaka"}
              </p>
            </div>
            <Link
              to="/vaka/$caseId"
              params={{ caseId: recommendedCase.id }}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
            >
              Vakayı aç <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.section>
      ) : null}

      {/* Aksiyon butonları */}
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-4 py-2 text-xs font-semibold text-ink-1 hover:bg-surface-sunken"
        >
          <RotateCcw className="size-3.5" /> Yeniden başla
        </button>
        <Link
          to="/karne"
          className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
        >
          <Trophy className="size-3.5" /> Karnemi gör
        </Link>
      </div>

      <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink-3">
        Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez
      </p>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink-1 tabular-nums">{value}</p>
      <p className="text-[10px] text-ink-3">{sub}</p>
    </div>
  );
}

function DifficultyDots({ d }: { d: 1 | 2 | 3 | 4 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn("size-1.5 rounded-full", n <= d ? "bg-ink-2" : "bg-line")}
        />
      ))}
    </span>
  );
}
