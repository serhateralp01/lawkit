import { useEffect, useRef } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Circle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getCase } from "@/content/cases";
import { sources } from "@/content/sources";
import { useCaseSession } from "@/lib/case-engine/useCaseSession";
import { useGamificationStore } from "@/lib/gamification";
import { CaseScreenLayout } from "@/components/patterns/CaseScreenLayout";
import { RubricMeter } from "@/components/composite/RubricMeter";
import { HintLadder } from "@/components/composite/HintLadder";
import { SourceCallout } from "@/components/composite/SourceCallout";
import { FeedbackPanel } from "@/components/composite/FeedbackPanel";
import type { CaseOption } from "@/content/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vaka/$caseId")({
  loader: ({ params }) => {
    const c = getCase(params.caseId);
    if (!c) throw notFound();
    return { case: c };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.case.title} · LawKit Vaka` },
      {
        name: "description",
        content: `${loaderData?.case.summary} — eğitim amaçlı vaka simülasyonu.`,
      },
    ],
  }),
  component: CasePage,
});

function CasePage() {
  const { case: legalCase } = Route.useLoaderData();
  const {
    session,
    node,
    currentStep,
    chosenOption,
    hintLevel,
    pick,
    openHint,
    advance,
    reset,
  } = useCaseSession(legalCase);

  // Vaka tamamlandığında gamification'a yaz — sadece ilk seferinde.
  const recordedRef = useRef<string | null>(null);
  const recordAttempt = useGamificationStore((s) => s.recordAttempt);
  useEffect(() => {
    if (session.done && recordedRef.current !== session.startedAt + ":" + session.caseId) {
      recordedRef.current = session.startedAt + ":" + session.caseId;
      recordAttempt(session);
    }
  }, [session.done, session, recordAttempt]);

  if (!node) {
    return (
      <div className="p-12 text-center text-ink-2">
        Vaka düğümü bulunamadı.{" "}
        <button onClick={reset} className="underline">
          Sıfırla
        </button>
      </div>
    );
  }

  if (node.kind === "outcome") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-5xl px-4 pb-16 pt-6 lg:px-8 lg:pt-10"
      >
        <FeedbackPanel case={legalCase} outcomeNode={node} session={session} onReset={reset} />
      </motion.div>
    );
  }

  return (
    <CaseScreenLayout
      case={legalCase}
      left={
        <>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">Olay sahnesi</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{legalCase.summary}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">Olgular</p>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-2">
              {legalCase.facts.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-3" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          {legalCase.documents && legalCase.documents.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">Belgeler</p>
              <ul className="mt-2 space-y-1 text-xs text-ink-2">
                {legalCase.documents.map((d) => (
                  <li key={d.label} className="flex justify-between gap-2">
                    <span className="font-medium">{d.label}</span>
                    {d.ref ? <span className="text-ink-3">{d.ref}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      }
      center={
        <AnimatePresence mode="wait">
          <motion.div
            key={`decision-${node.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-5"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo">
                Karar noktası · {node.id}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink-1">
                {node.prompt}
              </h2>
            </div>

            <ul className="space-y-2">
              {node.options?.map((o) => (
                <OptionRow
                  key={o.id}
                  option={o}
                  picked={chosenOption?.id === o.id}
                  disabled={!!currentStep?.chosenOptionId && chosenOption?.id !== o.id}
                  onPick={() => pick(o)}
                />
              ))}
            </ul>

            <AnimatePresence>
              {chosenOption?.feedback ? (
                <motion.div
                  key={`fb-${node.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-3 overflow-hidden rounded-md border border-line bg-surface-sunken/40 p-4"
                >
                  <p className="text-sm leading-relaxed text-ink-1">
                    <span className="font-semibold">Geri bildirim. </span>
                    {chosenOption.feedback}
                  </p>
                  {chosenOption.sources?.map((sid) =>
                    sources[sid] ? <SourceCallout key={sid} sourceId={sid} /> : null,
                  )}
                  <motion.button
                    type="button"
                    onClick={advance}
                    whileHover={{ x: 2 }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
                  >
                    Sonraki adım <ArrowRight className="size-3.5" />
                  </motion.button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      }
      right={
        <>
          <RubricMeter scores={session.ledger} />

          {!currentStep?.chosenOptionId ? (
            <HintLadder
              hint={hintForNode(node.id, legalCase.branch)}
              ceilingLabel={primaryRubricLabel(node.rubricTargets)}
              controlledLevel={hintLevel}
              onOpen={(rung) => openHint(rung)}
            />
          ) : (
            <div className="rounded-md border border-line bg-surface-sunken/40 p-3 text-xs text-ink-3">
              İpucu merdiveni: kilitli — bu adımda seçim yapıldı.
            </div>
          )}

          <div className="rounded-md border border-line bg-surface-sunken/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">İlerleme</p>
            <p className="mt-1 text-xs text-ink-2">
              Adım {session.history.length} /{" "}
              {legalCase.nodes.filter((n) => n.kind !== "outcome").length}
              {hintLevel > 0 ? ` · ipucu k.${hintLevel}` : null}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 text-[10px] font-medium uppercase tracking-widest text-ink-3 underline-offset-2 hover:underline"
            >
              Vakayı sıfırla
            </button>
          </div>
        </>
      }
    />
  );
}

function OptionRow({
  option,
  picked,
  disabled,
  onPick,
}: {
  option: CaseOption;
  picked: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  const Icon =
    option.verdict === "good"
      ? CheckCircle2
      : option.verdict === "partial"
        ? AlertCircle
        : XCircle;
  const verdictColor =
    option.verdict === "good"
      ? "text-signal-positive border-signal-positive/40 bg-signal-positive/5"
      : option.verdict === "partial"
        ? "text-signal-warning border-signal-warning/40 bg-signal-warning/5"
        : "text-signal-critical border-signal-critical/40 bg-signal-critical/5";

  return (
    <motion.li
      whileHover={!disabled && !picked ? { x: 2 } : undefined}
      animate={picked ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border p-3.5 text-left text-sm transition-colors",
          !picked && !disabled && "border-line bg-surface-raised hover:border-indigo/40 hover:bg-indigo-soft/30",
          picked && verdictColor,
          disabled && "border-line bg-surface-sunken/40 text-ink-3 opacity-60",
        )}
      >
        <div className="flex items-start gap-2.5">
          {picked ? (
            <Icon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-ink-3" />
          )}
          <span className="leading-snug">{option.label}</span>
        </div>
      </button>
    </motion.li>
  );
}

/**
 * Mock hint provider. Aşama 3'te bu Grounded Explanation orchestrator
 * çağrısına bağlanacak; içeriği vaka editöründen veya AI'dan gelecek.
 */
function hintForNode(_nodeId: string, branch: string) {
  if (branch === "is_hukuku") {
    return {
      nudge: "İşveren 30+ işçi çalıştırıyor — iş güvencesi kapsamı uygulanır.",
      specific: "Önce arabuluculuk dava şartı (İş Mahk. K. m. 3) — sonra mahkeme yolu.",
      worked: "Doğru sıralama: olgu tespiti → arabuluculuk (1 ay) → işe iade davası (2 hafta).",
    };
  }
  if (branch === "borclar") {
    return {
      nudge: "Müvekkilin tanımadığı bir kaynaktan gelen para — irade unsurunu sorgula.",
      specific: "TBK sebepsiz zenginleşme hükümleri devreye girer (m. 77 vd.).",
      worked: "İade kapsamı iyiniyet/kötüniyet ayrımına göre m. 79 üzerinden tartışılır.",
    };
  }
  if (branch === "medeni") {
    return {
      nudge: "Komşuluk hukukunda taşkın kullanım sınırı objektif değerlendirilir.",
      specific: "TMK m. 737 — taşkın olmayan zorunlu kullanım katlanılmak zorundadır.",
      worked: "Önleme + tazminat ayrı taleplerdir; tek dilekçede ileri sürülebilir (TMK m. 730).",
    };
  }
  return {
    nudge: "Aktif olguları yeniden tara — zaman, taraf, irade unsurları.",
    specific: "İlgili kanun maddelerine geç ve uygulama koşullarını test et.",
    worked: "İdeal cevap, sonuç ekranında worked example olarak verilecek.",
  };
}

function primaryRubricLabel(targets: readonly string[] | undefined): string {
  if (!targets || targets.length === 0) return "Mesele Tespiti";
  const map: Record<string, string> = {
    mesele: "Mesele Tespiti",
    usul: "Usul Hukuku",
    maddi: "Maddi Hukuk",
    gerekce: "Gerekçelendirme",
    risk: "Risk Farkındalığı",
    olay: "Olayı Anlama",
    ifade: "Hukuki İfade",
  };
  return map[targets[0]] ?? "Mesele Tespiti";
}
