import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, Zap, Users, Scale, AlertCircle, Bot } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { BetaGate } from "@/components/site/BetaGate";
import { aiGenerateCase } from "@/lib/api/aiClient";
import type { LegalCase } from "@/content/types";
import { cn } from "@/lib/utils";

const GEN_KEY = "lawkit_generated_case";
const TIMEOUT_MS = 180_000;
/** Optimist tahmin: tipik full LegalCase üretimi ~90s sürer. */
const ESTIMATED_MS = 90_000;

/**
 * Phase boundaries — elapsed ms cinsinden. Geçen süre boundary'i aşınca
 * bir sonraki faza geçiyoruz. Son fazda kalıp "neredeyse hazır" diyoruz.
 */
const PHASES: { atMs: number; label: string }[] = [
  { atMs: 0, label: "Müvekkilini yaratıyoruz..." },
  { atMs: 15_000, label: "Olay örgüsünü kuruyoruz..." },
  { atMs: 30_000, label: "Hukuki dayanakları kontrol ediyoruz..." },
  { atMs: 50_000, label: "Karakterleri çiziyoruz..." },
  { atMs: 70_000, label: "Dallanan senaryoları hazırlıyoruz..." },
  { atMs: 90_000, label: "Neredeyse hazır, son rötuşlar..." },
];

const BRANCHES: {
  id: NonNullable<LegalCase["branch"]>;
  label: string;
  desc: string;
}[] = [
  { id: "is_hukuku", label: "İş Hukuku", desc: "Fesih, kıdem, ihbar, işe iade" },
  { id: "borclar", label: "Borçlar Hukuku", desc: "Sözleşme, haksız fiil, sebepsiz zenginleşme" },
  { id: "medeni", label: "Medeni Hukuk", desc: "Aile, miras, mülkiyet, komşuluk" },
  { id: "medeni_usul", label: "Medeni Usul", desc: "HMK, yetki, ispat, dava şartı, tedbir" },
  { id: "ceza", label: "Ceza Hukuku", desc: "Suç tipleri, kast/taksir, teşebbüs" },
  { id: "idare", label: "İdare Hukuku", desc: "İdari işlem, iptal davası, İYUK" },
  { id: "ticaret", label: "Ticaret Hukuku", desc: "Şirketler, kambiyo, TTK" },
];

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Başlangıç", 2: "Orta", 3: "İleri", 4: "Ustalık",
};

export const Route = createFileRoute("/vaka-studio")({
  head: () => ({ meta: [{ title: "Vaka Studio · LawKit" }] }),
  component: VakaStudioPage,
});

function VakaStudioPage() {
  return (
    <BetaGate feature="Vaka Studio">
      <VakaStudioInner />
    </BetaGate>
  );
}

function VakaStudioInner() {
  const navigate = useNavigate();
  const [branch, setBranch] = useState<typeof BRANCHES[number]["id"]>("is_hukuku");
  const [difficulty, setDifficulty] = useState(2);
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (loading) {
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      tickTimer.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
    } else {
      if (tickTimer.current) clearInterval(tickTimer.current);
    }
    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading]);

  const currentPhase = (() => {
    let idx = 0;
    for (let i = 0; i < PHASES.length; i++) {
      if (elapsedMs >= PHASES[i].atMs) idx = i;
    }
    return { idx, label: PHASES[idx].label };
  })();
  const progressPct = Math.min(99, Math.round((elapsedMs / ESTIMATED_MS) * 100));

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      setError("İstek zaman aşımına uğradı. Sunucu yanıt vermiyor. Sayfayı yenileyip tekrar deneyin.");
      setLoading(false);
    }, TIMEOUT_MS);

    try {
      const result = await aiGenerateCase({
        branch,
        difficulty: difficulty as 1 | 2 | 3 | 4,
        theme: theme.trim() || undefined,
        characterTone: tone.trim() || undefined,
        contextSourceIds: [],
      });
      clearTimeout(timeoutRef.current);

      const caseId = result.caseId ?? `gen-${Date.now()}`;
      sessionStorage.setItem(GEN_KEY, JSON.stringify({ case: result.legalCase }));
      navigate({ to: "/vaka/$caseId", params: { caseId } });
    } catch (e) {
      clearTimeout(timeoutRef.current);
      setLoading(false);
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";

      // Hata mesajına göre spesifik yönlendirme
      if (msg.includes("fetch") || msg.includes("Network") || msg.includes("status")) {
        setError("AI sunucusuna bağlanılamadı. Sunucunun çalıştığından emin olun.");
      } else {
        setError(msg);
      }
    }
  };

  if (loading) {
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const overdue = elapsedMs > ESTIMATED_MS;
    return (
      <PageShell>
        <div className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-gold/10">
              <Loader2 className="size-8 animate-spin text-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">Vakanız hazırlanıyor</h2>
            <p className="mt-3 min-h-[1.25rem] text-sm leading-relaxed text-ink/55">
              {currentPhase.label}
            </p>

            {/* Gerçek elapsed-tabanlı progress bar */}
            <div className="mt-6">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-gold transition-[width] duration-200 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink/40">
                <span>%{progressPct}</span>
                <span>
                  {elapsedSec}s / ~{Math.round(ESTIMATED_MS / 1000)}s
                </span>
              </div>
            </div>

            {overdue ? (
              <p className="mt-4 text-[11px] italic text-ink/45">
                Karmaşık senaryolar daha uzun sürebilir — sabret, yakında.
              </p>
            ) : null}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-6 py-20 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">AI Vaka Üretici</p>
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Size özel vaka yaratalım</h1>
          <p className="mt-4 leading-relaxed text-ink/55">
            Hukuk dalını, zorluk seviyesini ve isterseniz konuyu seçin. Her seferinde farklı bir senaryo.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-ink/70">Hukuk dalı</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBranch(b.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition",
                    branch === b.id
                      ? "border-gold bg-gold/5 ring-1 ring-gold/20"
                      : "border-line hover:border-ink/20",
                  )}
                >
                  <span className="block text-sm font-bold text-ink">{b.label}</span>
                  <span className="block mt-0.5 text-xs text-ink/45">{b.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="mb-3 block text-sm font-bold text-ink/70">
              Zorluk: {DIFFICULTY_LABELS[difficulty]}
            </label>
            <input
              type="range"
              min={1}
              max={4}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-gold"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-ink/70">
              <Scale className="size-4" /> Konu (opsiyonel)
            </label>
            <input
              type="text"
              placeholder="örn: fesih, tazminat, komşuluk, miras"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink placeholder:text-ink/25 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-ink/70">
              <Users className="size-4" /> Müvekkil tonu (opsiyonel)
            </label>
            <input
              type="text"
              placeholder="örn: yaşlı esnaf, genç öğrenci, emekli memur"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink placeholder:text-ink/25 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-bold text-white transition hover:bg-gold/90 disabled:opacity-50"
          >
            <Bot className="size-4" /> Vaka üret <Sparkles className="size-4" />
          </button>
          <p className="text-center text-[10px] uppercase tracking-widest text-ink/25">
            12-50 dk (zorluğa göre) · AI ile üretilir
          </p>
        </div>
      </div>
    </PageShell>
  );
}
