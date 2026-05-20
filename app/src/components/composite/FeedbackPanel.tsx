import { ArrowRight, CheckCircle2, Compass, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { defaultRubric } from "@/content/rubrics";
import { sources } from "@/content/sources";
import type { CaseNode, LegalCase, RubricKey } from "@/content/types";
import type { CaseSession } from "@/lib/case-engine";
import { RubricMeter } from "./RubricMeter";
import { SourceCallout } from "./SourceCallout";
import { AiTutor } from "./AiTutor";
import { cn } from "@/lib/utils";

interface Props {
  case: LegalCase;
  outcomeNode: CaseNode;
  session: CaseSession;
  onReset?: () => void;
  className?: string;
}

/**
 * FeedbackPanel — vaka tamamlandığında gösterilen worked-example ekranı.
 *
 * Yapı (çerçeve §5):
 *   1. Rubrik özet bar grafiği
 *   2. Geçmiş kararlar şeridi (verdict renkli)
 *   3. Kaçırılan zorunlu meseleler (boş ledger boyutları)
 *   4. İdeal cevap — worked example
 *   5. Kaynak kartları
 *
 * Bilim: Collins-Brown-Newman cognitive apprenticeship — modeling +
 * articulation; Bloom mastery — yüzde değil boyut bazlı dürüst geri bildirim.
 */
export function FeedbackPanel({
  case: legalCase,
  outcomeNode,
  session,
  onReset,
  className,
}: Props) {
  const visibleDims = defaultRubric.studentVisibleDimensions;
  const missedDims = visibleDims.filter((k) => (session.ledger[k] ?? 0) < 3);

  // Tüm kararlardan kullanılan kaynakları topla (dedupe)
  const usedSources = new Set<string>();
  for (const h of session.history) {
    if (!h.chosenOptionId) continue;
    const n = legalCase.nodes.find((x) => x.id === h.nodeId);
    const opt = n?.options?.find((o) => o.id === h.chosenOptionId);
    opt?.sources?.forEach((s) => usedSources.add(s));
  }

  return (
    <div className={cn("space-y-8", className)}>
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-soft/60 px-3 py-1">
          <Sparkles className="size-3.5 text-indigo" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo">
            Vaka tamamlandı
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-ink-1">
          {outcomeNode.summary ?? "Strateji özeti hazır."}
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Sol — rubrik + kaçırılanlar */}
        <div className="space-y-6 rounded-lg border border-line bg-surface-raised p-5">
          <RubricMeter scores={session.ledger} />

          {missedDims.length > 0 ? (
            <div className="border-t border-line pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
                Üzerine çalış
              </p>
              <ul className="mt-2 space-y-1.5">
                {missedDims.map((k: RubricKey) => {
                  const dim = defaultRubric.dimensions.find((d) => d.key === k);
                  return (
                    <li key={k} className="flex items-start gap-2 text-xs text-ink-2">
                      <Compass className="mt-0.5 size-3.5 shrink-0 text-signal-warning" />
                      <span>
                        <span className="font-semibold text-ink-1">{dim?.label}:</span>{" "}
                        {dim?.definition}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="border-t border-line pt-4 text-xs text-signal-positive">
              <CheckCircle2 className="mr-1 inline size-3.5" /> Tüm gözlenen boyutlarda
              kabul edilebilir seviyedesin.
            </div>
          )}
        </div>

        {/* Sağ — ideal cevap + kaynaklar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-surface-sunken/40 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
              İdeal cevap · worked example
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-1">
              {outcomeNode.idealAnswer ?? "—"}
            </p>
          </div>

          {usedSources.size > 0 ? (
            <div className="space-y-2">
              {Array.from(usedSources).map((sid) =>
                sources[sid] ? <SourceCallout key={sid} sourceId={sid} /> : null,
              )}
            </div>
          ) : null}

          <AiTutor
            caseId={legalCase.id}
            session={session}
            defaultTopic={`${legalCase.title} — kararlarımdaki kritik noktaları açıkla.`}
          />
        </div>
      </div>

      {/* Kararlar şeridi */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-3">
          Kararların
        </p>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {session.history.map((h, i) => {
            const n = legalCase.nodes.find((x) => x.id === h.nodeId);
            const opt = n?.options?.find((o) => o.id === h.chosenOptionId);
            const verdictColor =
              h.verdict === "good"
                ? "border-signal-positive/40 bg-signal-positive/5"
                : h.verdict === "partial"
                  ? "border-signal-warning/40 bg-signal-warning/5"
                  : "border-signal-critical/40 bg-signal-critical/5";
            return (
              <li
                key={`${h.nodeId}-${i}`}
                className={cn("rounded-md border p-3 text-xs", verdictColor)}
              >
                <p className="font-bold uppercase tracking-widest text-ink-3">
                  Adım {i + 1} · {h.nodeId}
                </p>
                <p className="mt-1 text-ink-1">{n?.prompt}</p>
                <p className="mt-1 text-ink-2">→ {opt?.label}</p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-line bg-surface-raised px-4 py-2 text-xs font-semibold text-ink-1 hover:bg-surface-sunken"
          >
            Tekrar oyna
          </button>
        ) : null}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
        >
          Vaka kütüphanesine dön <ArrowRight className="size-3.5" />
        </Link>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-ink-3">
          Eğitim amaçlı simülasyon — gerçek hukuki tavsiye değildir
        </span>
      </div>
    </div>
  );
}
