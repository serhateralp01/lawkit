/**
 * AiTutor — vaka sonunda derinlemesine AI açıklaması iste.
 * Grounded endpoint'i çağırır; sadece doğrulanmış kaynak set'inden konuşması zorunlu.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { aiGround } from "@/lib/api/aiClient";
import { sources } from "@/content/sources";
import type { CaseSession } from "@/lib/case-engine";
import type { GroundedResponse } from "@/lib/ai-orchestrator/types";

interface Props {
  caseId: string;
  session: CaseSession;
  defaultTopic?: string;
}

export function AiTutor({ caseId, session, defaultTopic }: Props) {
  const [topic, setTopic] = useState(defaultTopic ?? "Bu vakanın ana hukuki dayanağını detaylandır.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GroundedResponse | null>(null);

  const ask = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiGround({ caseId, session, topic });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-indigo/30 bg-indigo-soft/10 p-4">
      <div className="flex items-center gap-2">
        <Brain className="size-4 text-indigo" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo">
          AI Tutor · Grounded
        </p>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-ink-3">
          Yalnız doğrulanmış kaynaklardan
        </span>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="ai-topic"
          className="text-[10px] font-bold uppercase tracking-widest text-ink-3"
        >
          Sorun / konu
        </label>
        <textarea
          id="ai-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-line bg-surface-raised p-2.5 text-xs text-ink-1 focus:border-indigo/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={ask}
          disabled={loading || topic.trim().length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> AI düşünüyor…
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" /> Açıkla
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {error ? (
          <motion.div
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-md border border-signal-critical/40 bg-signal-critical/5 p-3 text-xs text-signal-critical"
          >
            <AlertTriangle className="mr-1 inline size-3.5" /> {error}
          </motion.div>
        ) : null}

        {result ? (
          <motion.div
            key="res"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 rounded-md border border-line bg-surface-raised p-3"
          >
            {result.noSourceFound ? (
              <p className="text-xs text-signal-warning">
                <AlertTriangle className="mr-1 inline size-3.5" />
                Doğrulanmış kaynak bulunamadı. AI açıklaması gösterilmiyor.
              </p>
            ) : (
              <>
                <p className="text-xs leading-relaxed text-ink-1">{result.explanation}</p>
                {result.sourceRefs.length > 0 ? (
                  <div className="border-t border-line pt-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink-3">
                      Kaynaklar
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-ink-2">
                      {result.sourceRefs.map((id) => {
                        const s = sources[id];
                        if (!s) return null;
                        return (
                          <li key={id}>
                            <span className="font-semibold text-ink-1">{s.shortTitle}</span>
                            {s.url ? (
                              <>
                                {" · "}
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo underline-offset-2 hover:underline"
                                >
                                  mevzuat.gov.tr
                                </a>
                              </>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
