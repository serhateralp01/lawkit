import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { petitionTemplates } from "@/content/petition-templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dilekce-lab")({
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
