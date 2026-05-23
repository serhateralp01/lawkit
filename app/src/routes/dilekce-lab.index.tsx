import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Sparkles,
  Loader2,
  Bot,
  Scale,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { BetaGate } from "@/components/site/BetaGate";
import { petitionTemplates, type PetitionTemplate } from "@/content/petition-templates";
import { aiGeneratePetition } from "@/lib/api/aiClient";
import { cn } from "@/lib/utils";

type PetitionBranch =
  | "is_hukuku"
  | "borclar"
  | "medeni"
  | "medeni_usul"
  | "ceza"
  | "idare";

const PETITION_BRANCHES: { id: PetitionBranch; label: string }[] = [
  { id: "is_hukuku", label: "İş Hukuku" },
  { id: "borclar", label: "Borçlar Hukuku" },
  { id: "medeni", label: "Medeni Hukuk" },
  { id: "medeni_usul", label: "Medeni Usul" },
  { id: "ceza", label: "Ceza Hukuku" },
  { id: "idare", label: "İdare Hukuku" },
];

const DIFF_LABELS: Record<number, string> = {
  1: "Başlangıç",
  2: "Orta",
  3: "İleri",
  4: "Ustalık",
};

const PET_KEY = "lawkit_gen_petition";

export const Route = createFileRoute("/dilekce-lab/")({
  head: () => ({
    meta: [
      { title: "Dilekçe Lab | LawKit" },
      { name: "description", content: "Dilekçe yazmayı öğrenin. AI parça parça değerlendirir." },
    ],
  }),
  component: DilekceLabGated,
});

function DilekceLabGated() {
  return (
    <BetaGate feature="Dilekçe Lab">
      <DilekceLabIndex />
    </BetaGate>
  );
}

function DilekceLabIndex() {
  const navigate = useNavigate();
  const [branch, setBranch] = useState<PetitionBranch>("is_hukuku");
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4>(2);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genElapsedMs, setGenElapsedMs] = useState(0);
  const genTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const genStartedAt = useRef<number>(0);

  useEffect(() => {
    if (genLoading) {
      genStartedAt.current = Date.now();
      setGenElapsedMs(0);
      genTickRef.current = setInterval(() => {
        setGenElapsedMs(Date.now() - genStartedAt.current);
      }, 200);
    } else if (genTickRef.current) {
      clearInterval(genTickRef.current);
    }
    return () => {
      if (genTickRef.current) clearInterval(genTickRef.current);
    };
  }, [genLoading]);

  const generateWithAI = async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const res = await aiGeneratePetition({
        branch,
        difficulty,
        theme: theme.trim() || undefined,
        contextSourceIds: [],
      });
      const tId = `gen_pet_${Date.now()}`;
      sessionStorage.setItem(PET_KEY, JSON.stringify({ id: tId, template: res.template }));
      navigate({ to: "/dilekce-lab/$templateId", params: { templateId: tId } });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "AI bağlantısı başarısız");
      setGenLoading(false);
    }
  };

  const genElapsedSec = Math.floor(genElapsedMs / 1000);
  const genEstimatedSec = 45;
  const genProgressPct = Math.min(99, Math.round((genElapsedMs / (genEstimatedSec * 1000)) * 100));

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <motion.header
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-indigo-soft/40 px-3 py-1">
            <Sparkles className="size-3.5 text-indigo" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo">
              Dilekçe Lab · AI değerlendirmeli
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-1 lg:text-4xl">
            Dilekçeyi parça parça yazın, ustalaşın.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            Şablon seçin, her bölümü kendi kelimelerinizle yazın, AI rubrik üzerinden değerlendirsin.
          </p>
        </motion.header>

        {/* AI ile yeni şablon — form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mb-10 rounded-2xl border-2 border-dashed border-gold/40 bg-gold/5 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Bot className="size-5 text-gold" />
            <h2 className="font-display text-base font-bold text-ink">
              AI ile yeni şablon oluştur
            </h2>
          </div>

          {genLoading ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Loader2 className="size-8 animate-spin text-gold" />
              <p className="mt-4 text-sm font-bold text-ink">AI şablon hazırlıyor...</p>
              <p className="mt-1 text-[11px] text-ink/55">
                DeepSeek "{theme || PETITION_BRANCHES.find((b) => b.id === branch)?.label}" için
                5-7 bölümlük dilekçe yazıyor. Tipik ~{genEstimatedSec}s.
              </p>
              <div className="mt-4 w-full max-w-xs">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full bg-gold transition-[width] duration-200 ease-linear"
                    style={{ width: `${genProgressPct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink/40">
                  <span>%{genProgressPct}</span>
                  <span>
                    {genElapsedSec}s / ~{genEstimatedSec}s
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Branş */}
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-ink/60">
                  Hukuk dalı
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PETITION_BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBranch(b.id)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                        branch === b.id
                          ? "border-gold bg-gold/10 text-ink ring-1 ring-gold/30"
                          : "border-line bg-white text-ink/70 hover:border-ink/20",
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Konu / theme */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ink/60">
                  <Scale className="size-3.5" /> Konu
                  <span className="ml-1 font-normal normal-case text-ink/40">
                    (opsiyonel ama önerilir)
                  </span>
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="örn: işe iade, depozito iadesi, komşu el atma, hizmet tespit davası"
                  maxLength={120}
                  className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
                />
              </div>

              {/* Zorluk */}
              <div>
                <label className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-ink/60">
                  <span>Zorluk</span>
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold normal-case">
                    {DIFF_LABELS[difficulty]}
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(Number(e.target.value) as 1 | 2 | 3 | 4)
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-gold"
                />
                <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-ink/30">
                  {[1, 2, 3, 4].map((d) => (
                    <span key={d} className={cn(d === difficulty && "text-gold")}>
                      {DIFF_LABELS[d]}
                    </span>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={generateWithAI}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-gold/90"
              >
                <Bot className="size-4" /> Şablonu üret <Sparkles className="size-3.5" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Hazır şablonlar */}
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
          Hazır şablonlar
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {petitionTemplates.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-ink-3">
          Eğitim amaçlı simülasyon · LawKit hukuki tavsiye vermez
        </p>
      </section>
    </PageShell>
  );
}

function TemplateCard({ template, index }: { template: PetitionTemplate; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.35 }}
    >
      <Link
        to="/dilekce-lab/$templateId"
        params={{ templateId: template.id }}
        className="group block rounded-2xl border border-line bg-surface-raised p-5 transition-all hover:border-indigo/40 hover:bg-indigo-soft/10 hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-soft/40">
            <FileText className="size-5 text-indigo" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-3">
            <Difficulty d={template.difficulty} />
            <span>·</span>
            <span>~{template.estimatedMinutes} dk</span>
          </div>
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-ink-1">{template.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{template.summary}</p>
        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
            {template.sections.length} bölüm
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo transition-transform group-hover:translate-x-0.5">
            Yazmaya başla <ArrowRight className="size-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function Difficulty({ d }: { d: 1 | 2 | 3 | 4 }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Zorluk ${d}/4`}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={cn("size-1.5 rounded-full", n <= d ? "bg-ink-2" : "bg-line")} />
      ))}
    </span>
  );
}
