import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { isHukuku001 } from "@/content/cases/isHukuku001";
import { sources } from "@/content/sources";
import type { CaseNode, CaseOption, RubricKey } from "@/content/types";
import { RubricMeter, type RubricScores } from "./RubricMeter";
import { HintLadder } from "./HintLadder";
import { SourceCallout } from "./SourceCallout";
import { cn } from "@/lib/utils";

/**
 * Marketing hero için canlı mini case-engine.
 * L3 state-machine'in basitleştirilmiş kullanıcı arayüzü.
 * Aynı schema'yı (isHukuku001) gerçek ürün de okur.
 */
export function MiniCaseRunner() {
  const caseData = isHukuku001;
  const [nodeId, setNodeId] = useState(caseData.startNode);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<RubricScores>({});

  const node = useMemo<CaseNode>(
    () => caseData.nodes.find((n) => n.id === nodeId)!,
    [nodeId, caseData],
  );
  const pickedId = chosen[node.id];
  const picked = node.options?.find((o) => o.id === pickedId);

  const choose = (opt: CaseOption) => {
    if (pickedId) return;
    setChosen((c) => ({ ...c, [node.id]: opt.id }));
    if (opt.scores) {
      setScores((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(opt.scores!)) {
          const key = k as RubricKey;
          next[key] = Math.max(next[key] ?? 0, v ?? 0);
        }
        return next;
      });
    }
  };

  const next = () => {
    if (!picked) return;
    setNodeId(picked.next);
  };

  const reset = () => {
    setNodeId(caseData.startNode);
    setChosen({});
    setScores({});
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-[var(--shadow-raised)]">
      {/* Üst bar — vaka dosya künyesi */}
      <header className="flex items-center justify-between border-b border-line bg-surface-sunken/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="size-1.5 rounded-full bg-signal-critical/70" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-2">
            Dosya · {caseData.id.toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] font-medium text-ink-3">
          ~{caseData.estimatedMinutes} dk · Giriş seviyesi
        </span>
      </header>

      {/* Üçlü kolon — pattern: CaseScreenLayout (basit varyant) */}
      <div className="grid gap-0 lg:grid-cols-[1fr_1.4fr_0.85fr]">
        {/* Sol — olay dosyası */}
        <aside className="space-y-4 border-line bg-surface-sunken/30 p-5 lg:border-r">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
              Olay sahnesi
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{caseData.summary}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
              Olgular
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-2">
              {caseData.facts.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-3" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Orta — aktif karar */}
        <div className="space-y-5 p-6">
          {node.kind === "decision" && node.options ? (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo">
                  Karar noktası · {node.id}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink-1">
                  {node.prompt}
                </h3>
              </div>
              <ul className="space-y-2">
                {node.options.map((o) => {
                  const isPicked = pickedId === o.id;
                  const Icon =
                    o.verdict === "good" ? CheckCircle2
                      : o.verdict === "partial" ? AlertCircle
                      : XCircle;
                  const verdictColor =
                    o.verdict === "good" ? "text-signal-positive border-signal-positive/40 bg-signal-positive/5"
                      : o.verdict === "partial" ? "text-signal-warning border-signal-warning/40 bg-signal-warning/5"
                      : "text-signal-critical border-signal-critical/40 bg-signal-critical/5";
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => choose(o)}
                        disabled={!!pickedId && !isPicked}
                        className={cn(
                          "w-full rounded-md border p-3.5 text-left text-sm transition-all",
                          !pickedId && "border-line bg-surface-raised hover:border-indigo/40 hover:bg-indigo-soft/30",
                          isPicked && verdictColor,
                          pickedId && !isPicked && "border-line bg-surface-sunken/40 text-ink-3 opacity-60",
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          {isPicked ? (
                            <Icon className="mt-0.5 size-4 shrink-0" />
                          ) : (
                            <Circle className="mt-0.5 size-4 shrink-0 text-ink-3" />
                          )}
                          <span className="leading-snug">{o.label}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {picked?.feedback ? (
                <div className="lk-reveal space-y-3 rounded-md border border-line bg-surface-sunken/40 p-4">
                  <p className="text-sm leading-relaxed text-ink-1">
                    <span className="font-semibold">Geri bildirim. </span>
                    {picked.feedback}
                  </p>
                  {picked.sources?.map((sid) =>
                    sources[sid] ? <SourceCallout key={sid} sourceId={sid} /> : null,
                  )}
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
                  >
                    Sonraki adım <ArrowRight className="size-3.5" />
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          {node.kind === "outcome" ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-soft/50 px-3 py-1">
                <Sparkles className="size-3.5 text-indigo" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo">
                  Vaka tamamlandı
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-1">{node.summary}</h3>
              <div className="rounded-md border border-line bg-surface-sunken/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
                  İdeal cevap · worked example
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{node.idealAnswer}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md border border-line bg-surface-raised px-4 py-2 text-xs font-semibold text-ink-1 hover:bg-surface-sunken"
                >
                  Tekrar oyna
                </button>
                <Link
                  to="/kayit"
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90"
                >
                  Tam vakayı aç <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sağ — rubrik + ipucu */}
        <aside className="space-y-6 border-line bg-surface-sunken/30 p-5 lg:border-l">
          <RubricMeter scores={scores} />
          {node.kind === "decision" && !pickedId ? (
            <HintLadder
              hint={{
                nudge: "Bu vakada işveren 30+ işçi çalıştırıyor; iş güvencesi hükümleri uygulanır.",
                specific: "Önce arabuluculuk dava şartı (İş Mahk. K. m. 3) — sonra mahkeme yolu.",
                worked: "Doğru sıralama: olgu tespiti → arabuluculuk başvurusu (1 ay) → işe iade davası (2 hafta).",
              }}
              ceilingLabel="Mesele Tespiti"
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
