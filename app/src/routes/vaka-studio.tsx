import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Zap,
  Users,
  Scale,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { aiGenerateCase } from "@/lib/api/aiClient";
import type { GeneratedCaseScenario, LegalBranch } from "@/lib/ai-orchestrator/types";
import { cn } from "@/lib/utils";

const PHASES = [
  "Müvekkilini yaratıyoruz…",
  "Olay örgüsünü kuruyoruz…",
  "Hukuki dayanakları kontrol ediyoruz…",
  "Karakterleri çiziyoruz…",
  "Dallanan senaryoları hazırlıyoruz…",
];

const BRANCHES: { id: LegalBranch; label: string; desc: string }[] = [
  { id: "is_hukuku", label: "İş Hukuku", desc: "Fesih, kıdem, ihbar, işe iade" },
  {
    id: "borclar",
    label: "Borçlar Hukuku",
    desc: "Sözleşme, haksız fiil, sebepsiz zenginleşme",
  },
  { id: "medeni", label: "Medeni Hukuk", desc: "Aile, miras, mülkiyet, komşuluk" },
  {
    id: "medeni_usul",
    label: "Medeni Usul",
    desc: "HMK, yetki, ispat, dava şartı, tedbir",
  },
  { id: "ceza", label: "Ceza Hukuku", desc: "Suç tipleri, kast/taksir, teşebbüs" },
  { id: "idare", label: "İdare Hukuku", desc: "İdari işlem, iptal davası, İYUK" },
  { id: "ticaret", label: "Ticaret Hukuku", desc: "Şirketler, kambiyo, TTK" },
];

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Başlangıç",
  2: "Orta",
  3: "İleri",
  4: "Ustalık",
};

export const Route = createFileRoute("/vaka-studio")({
  head: () => ({
    meta: [
      { title: "Vaka Studio — AI Vaka Üretici | LawKit" },
      {
        name: "description",
        content:
          "Branş, zorluk ve tema seç — LawKit AI sana özel bir vaka senaryosu üretsin.",
      },
    ],
  }),
  component: VakaStudioPage,
});

function difficultyToTime(d: number) {
  return [8, 15, 22, 30][d - 1];
}

function VakaStudioPage() {
  const [branch, setBranch] = useState<LegalBranch>("is_hukuku");
  const [difficulty, setDifficulty] = useState<number>(2);
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [result, setResult] = useState<GeneratedCaseScenario | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setPhaseIdx(0);
      phaseTimer.current = setInterval(() => {
        setPhaseIdx((i) => Math.min(i + 1, PHASES.length - 1));
      }, 1800);
    }
    return () => {
      if (phaseTimer.current) clearInterval(phaseTimer.current);
    };
  }, [loading]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiGenerateCase({
        branch,
        difficulty: difficulty as 1 | 2 | 3 | 4,
        theme: theme.trim() || undefined,
        characterTone: tone.trim() || undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[80vh] items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg rounded-2xl border border-line bg-surface-raised p-10 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-indigo-soft/50">
              <Loader2 className="size-8 animate-spin text-indigo" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink-1">
              Vakan hazırlanıyor
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={phaseIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mt-3 text-sm leading-relaxed text-ink-2"
              >
                {PHASES[phaseIdx]}
              </motion.p>
            </AnimatePresence>
            <div className="mt-6 flex justify-center gap-1.5">
              {PHASES.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block h-1.5 w-12 rounded-full transition-colors",
                    i <= phaseIdx ? "bg-indigo" : "bg-line",
                    i === phaseIdx && "animate-pulse",
                  )}
                />
              ))}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-ink-3">
              Tahmini hazırlanma: ~{difficultyToTime(difficulty)} sn
            </p>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  if (result) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 rounded-2xl border border-line bg-surface-raised p-7 shadow-sm"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo">
                  AI üretimi vaka taslağı
                </p>
                <h1 className="mt-1 font-display text-2xl font-bold text-ink-1">
                  {result.title}
                </h1>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-ink-3">
                  {branchLabel(result.branch)} · zorluk {result.difficulty}/4 · ~
                  {result.estimatedMinutes} dk
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-ink-1 hover:bg-surface-sunken"
              >
                <RefreshCw className="size-3.5" /> Yenisini üret
              </button>
            </header>

            <p className="text-sm leading-relaxed text-ink-2">{result.summary}</p>

            <section className="rounded-xl border border-line bg-surface-sunken/40 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-3">
                Müvekkilin sana anlattığı
              </p>
              <p className="text-sm italic leading-relaxed text-ink-1">
                "{result.clientNarrative}"
              </p>
            </section>

            <div className="grid gap-5 sm:grid-cols-2">
              <section>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-3">
                  Anahtar meseleler
                </p>
                <ul className="space-y-1.5 text-sm text-ink-1">
                  {result.keyIssues.map((k, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-indigo">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-3">
                  İlk hamlelerin
                </p>
                <ul className="space-y-1.5 text-sm text-ink-1">
                  {result.expectedFirstMoves.map((k, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-indigo">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="border-t border-line pt-4 text-[10px] text-ink-3">
              <p className="uppercase tracking-widest">
                Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez
              </p>
              <p className="mt-1">
                Bu vaka taslağı kalıcı kaydedilmedi — sayfayı yenilersen kaybolur.
              </p>
            </div>
          </motion.div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/karne"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 hover:text-ink-1"
            >
              Karne'ye dön
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
            >
              Yeni vaka üret <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-soft/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
            <Sparkles className="size-3" /> AI Vaka Üretici
          </p>
          <h1 className="font-display text-3xl font-extrabold text-ink-1 sm:text-4xl">
            Sana özel vaka yaratalım
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-2">
            Alanı, zorluğu seç — istersen konu ve karakter detayları ekle.
            LawKit AI sana özel bir vaka senaryosu çıkarsın.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-7 rounded-2xl border border-line bg-surface-raised p-7 shadow-sm"
        >
          {/* Branş */}
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-ink-1">
              Hukuk dalı
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBranch(b.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition",
                    branch === b.id
                      ? "border-indigo bg-indigo-soft/30 ring-1 ring-indigo/30"
                      : "border-line hover:border-ink-2/40",
                  )}
                >
                  <span className="block text-sm font-bold text-ink-1">
                    {b.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-3">{b.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Zorluk */}
          <div>
            <label className="mb-3 flex items-center justify-between text-sm font-bold text-ink-1">
              <span>Zorluk</span>
              <span className="rounded-full bg-indigo-soft/50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-indigo">
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-indigo"
            />
            <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-widest text-ink-3">
              {[1, 2, 3, 4].map((d) => (
                <span
                  key={d}
                  className={cn(d === difficulty && "text-indigo")}
                >
                  {DIFFICULTY_LABELS[d]}
                </span>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-1">
              <Scale className="size-4 text-ink-3" />
              Konu <span className="text-ink-3 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text"
              placeholder="örn: fesih, tazminat, komşuluk, miras"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl border border-line bg-surface-raised px-4 py-2.5 text-sm text-ink-1 placeholder:text-ink-3/60 focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo/30"
            />
          </div>

          {/* Karakter tonu */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-1">
              <Users className="size-4 text-ink-3" />
              Müvekkil tonu <span className="text-ink-3 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text"
              placeholder="örn: yaşlı esnaf, genç öğrenci, emekli memur"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl border border-line bg-surface-raised px-4 py-2.5 text-sm text-ink-1 placeholder:text-ink-3/60 focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo/30"
            />
          </div>

          {error ? (
            <div className="flex items-start gap-3 rounded-lg border border-signal-critical/40 bg-signal-critical/5 p-4 text-sm text-signal-critical">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleGenerate()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo py-3.5 text-sm font-bold text-surface-raised transition hover:opacity-90"
          >
            <Sparkles className="size-4" />
            Vaka üret
            <Zap className="size-4" />
          </button>
          <p className="text-center text-[10px] uppercase tracking-widest text-ink-3">
            Tahmini hazırlık: ~{difficultyToTime(difficulty)} sn · AI üretimi ·
            Hukukçu incelemesi bekleniyor
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}

function branchLabel(branch: LegalBranch): string {
  const m: Record<LegalBranch, string> = {
    is_hukuku: "İş Hukuku",
    borclar: "Borçlar Hukuku",
    medeni: "Medeni Hukuk",
    medeni_usul: "Medeni Usul",
    ceza: "Ceza Hukuku",
    idare: "İdare Hukuku",
    ticaret: "Ticaret Hukuku",
  };
  return m[branch];
}
