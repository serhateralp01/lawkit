import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Loader2, Sparkles, Wand2, AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import {
  petitionTemplates,
  saveAiPetitionTemplate,
  type PetitionTemplate,
} from "@/content/petition-templates";
import { aiGeneratePetition } from "@/lib/api/aiClient";
import type { LegalBranch } from "@/lib/ai-orchestrator/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dilekce-lab/")({
  head: () => ({
    meta: [
      { title: "Dilekçe Lab | LawKit" },
      {
        name: "description",
        content:
          "Hukukçu olmadan önce dilekçe yazmayı öğren. AI parça parça değerlendirir, eksiğini söyler.",
      },
    ],
  }),
  component: DilekceLabIndex,
});

function DilekceLabIndex() {
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
            Bir dilekçeyi parça parça yaz, ustalaş.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            Şablon seç, her bölümü kendi kelimelerinle yaz, AI rubric'e göre puanlasın.
            Eksiklerini nokta atışı görür — bir sonraki dilekçende telafi edersin.
          </p>
        </motion.header>

        <AiGenerator />

        <h2 className="mb-4 mt-12 text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
          Hazır şablonlar
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          {petitionTemplates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
            >
              <Link
                to="/dilekce-lab/$templateId"
                params={{ templateId: t.id }}
                className="group block rounded-2xl border border-line bg-surface-raised p-5 transition-all hover:border-indigo/40 hover:bg-indigo-soft/10 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-soft/40">
                    <FileText className="size-5 text-indigo" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-3">
                    <Difficulty d={t.difficulty} />
                    <span>·</span>
                    <span>~{t.estimatedMinutes} dk</span>
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-1">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{t.summary}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
                    {t.sections.length} bölüm
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo transition-transform group-hover:translate-x-0.5">
                    Yazmaya başla <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-ink-3">
          Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez
        </p>
      </section>
    </PageShell>
  );
}

function AiGenerator() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState("");
  const [branch, setBranch] = useState<LegalBranch | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = scenario.trim().length < 30;

  async function generate() {
    if (tooShort || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiGeneratePetition({
        userScenario: scenario.trim(),
        branch: branch || undefined,
      });
      // Yapıyı PetitionTemplate'e adapte et (id ve category eşle)
      const tpl: PetitionTemplate = {
        id: res.id,
        title: res.title,
        category: "sebepsiz_zenginlesme", // generic — content UI'da kullanılmıyor
        branch: res.branch,
        summary: res.summary,
        estimatedMinutes: res.estimatedMinutes,
        difficulty: res.difficulty,
        sections: res.sections,
      };
      saveAiPetitionTemplate(tpl);
      void navigate({
        to: "/dilekce-lab/$templateId",
        params: { templateId: res.id },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.4 }}
      className="rounded-2xl border border-indigo/30 bg-gradient-to-br from-indigo-soft/40 via-indigo-soft/10 to-transparent p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <Wand2 className="size-4 text-indigo" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
          AI ile kendi şablonunu üret
        </h2>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink-2">
        Senaryonu birkaç cümleyle anlat — AI, sana özel bir dilekçe şablonu kursun, parça parça pratik yap.
      </p>
      <textarea
        value={scenario}
        onChange={(e) => {
          setScenario(e.target.value);
          setError(null);
        }}
        rows={4}
        placeholder="Örn: Kiraladığım dairenin sahibi 6 aydır depozitomu iade etmiyor. Sözleşmem var, hasar yok…"
        className="w-full resize-y rounded-md border border-line bg-surface-raised p-3 text-sm leading-relaxed text-ink-1 outline-none focus:border-indigo/60"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[11px] text-ink-2">
          Dal:
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value as LegalBranch | "")}
            className="rounded-md border border-line bg-surface-raised px-2 py-1 text-xs"
          >
            <option value="">Otomatik</option>
            <option value="is_hukuku">İş Hukuku</option>
            <option value="borclar">Borçlar</option>
            <option value="medeni">Medeni</option>
            <option value="medeni_usul">Medeni Usul</option>
          </select>
          <span className="ml-2 text-ink-3">
            {scenario.trim().length} / min 30
          </span>
        </label>
        <button
          type="button"
          onClick={() => void generate()}
          disabled={tooShort || loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> AI üretiyor…
            </>
          ) : (
            <>
              Şablon üret <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </div>
      {error ? (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-signal-critical/40 bg-signal-critical/5 p-3 text-xs text-signal-critical">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </motion.div>
  );
}

function Difficulty({ d }: { d: 1 | 2 | 3 | 4 }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Zorluk ${d}/4`}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn("size-1.5 rounded-full", n <= d ? "bg-ink-2" : "bg-line")}
        />
      ))}
    </span>
  );
}
