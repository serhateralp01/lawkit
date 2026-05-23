import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Loader2, Bot } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { BetaGate } from "@/components/site/BetaGate";
import { petitionTemplates, type PetitionTemplate } from "@/content/petition-templates";
import { aiGeneratePetition } from "@/lib/api/aiClient";
import { cn } from "@/lib/utils";

const PET_KEY = "lawkit_gen_petition";

export const Route = createFileRoute("/dilekce-lab")({
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
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const generateWithAI = async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const branch = "is_hukuku" as const;
      const res = await aiGeneratePetition({ branch, difficulty: 2, contextSourceIds: [] });
      const tId = `gen_pet_${Date.now()}`;
      sessionStorage.setItem(PET_KEY, JSON.stringify({ id: tId, template: res.template }));
      navigate({ to: "/dilekce-lab/$templateId", params: { templateId: tId } });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "AI bağlantısı başarısız");
      setGenLoading(false);
    }
  };

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

        <div className="grid gap-4 lg:grid-cols-2">
          {petitionTemplates.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}

          {/* AI ile yeni şablon */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
          >
            {genLoading ? (
              <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gold/40 bg-gold/5 p-10 text-center">
                <Loader2 className="size-8 animate-spin text-gold" />
                <p className="mt-4 text-sm font-bold text-ink">AI şablon hazırlıyor...</p>
                {genError && <p className="mt-2 text-xs text-red-600">{genError}</p>}
              </div>
            ) : (
              <button
                type="button"
                onClick={generateWithAI}
                className="group flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-line bg-surface-raised p-10 text-center transition hover:border-gold/40 hover:bg-gold/5"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-gold/10">
                  <Bot className="size-6 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">AI ile yeni şablon oluştur</h3>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-ink/50">
                  Hukuk dalına özel, 5 bölümlü dilekçe şablonu AI tarafından saniyeler içinde hazırlanır.
                </p>
              </button>
            )}
          </motion.div>
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
