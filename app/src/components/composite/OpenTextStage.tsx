/**
 * OpenTextStage — öğrenci serbest hukuki cevap yazar, AI rubric ile puanlar.
 *
 * Akış:
 *   1. textarea + minimum karakter kontrolü
 *   2. "AI değerlendir" → /api/ai/assess
 *   3. dimension skorları + missed issues + nextStep gösterilir
 *   4. "Devam et" → engine'e submit_text dispatch
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Pencil, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { aiAssess } from "@/lib/api/aiClient";
import { defaultRubric } from "@/content/rubrics";
import type { CaseNode, CharacterDef, RubricKey, Verdict } from "@/content/types";
import type { CaseSession } from "@/lib/case-engine";
import type { AssessmentResponse } from "@/lib/ai-orchestrator/types";
import { DialogueBubble } from "./DialogueBubble";
import { cn } from "@/lib/utils";

interface Props {
  caseId: string;
  node: CaseNode;
  session: CaseSession;
  speaker?: CharacterDef;
  onSubmit: (data: {
    freeText: string;
    awarded: Partial<Record<RubricKey, number>>;
    verdict: Verdict;
  }) => void;
}

export function OpenTextStage({ caseId, node, session, speaker, onSubmit }: Props) {
  const cfg = node.openText!;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResponse | null>(null);

  const minChars = cfg.minChars ?? 60;
  const tooShort = text.trim().length < minChars;

  const evaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiAssess({
        caseId,
        session,
        userAnswer: text,
        dimensions: cfg.assessDimensions,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const accept = () => {
    if (!result) return;
    const awarded: Partial<Record<RubricKey, number>> = {};
    for (const s of result.scores) awarded[s.dimension] = s.score;
    const avg =
      result.scores.length > 0
        ? result.scores.reduce((s, x) => s + x.score, 0) / result.scores.length
        : 0;
    const verdict: Verdict = avg >= 3 ? "good" : avg >= 2 ? "partial" : "bad";
    onSubmit({ freeText: text, awarded, verdict });
  };

  return (
    <div className="space-y-5">
      {speaker && node.prompt ? (
        <DialogueBubble character={speaker} text={node.prompt} mood="thinking" emphasis />
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="open-text"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-3"
        >
          <Pencil className="size-3" /> Cevabını buraya yaz
        </label>
        <textarea
          id="open-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!!result}
          rows={5}
          placeholder={cfg.graderHint ?? "Hukuki argümanını gerekçeleriyle yaz…"}
          className="w-full resize-y rounded-md border border-line bg-surface-raised p-3 text-sm text-ink-1 focus:border-indigo/60 focus:outline-none disabled:opacity-70"
        />
        <div className="flex items-center justify-between text-[10px] text-ink-3">
          <span>
            {text.trim().length} / min {minChars} karakter
          </span>
          {tooShort ? <span className="text-signal-warning">Daha açıklayıcı yazmalısın</span> : null}
        </div>
      </div>

      {!result ? (
        <motion.button
          type="button"
          onClick={evaluate}
          disabled={loading || tooShort}
          whileHover={!loading && !tooShort ? { x: 2 } : undefined}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> AI değerlendiriyor…
            </>
          ) : (
            <>
              AI değerlendir <ArrowRight className="size-3.5" />
            </>
          )}
        </motion.button>
      ) : null}

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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 rounded-lg border border-line bg-surface-sunken/40 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
              AI Değerlendirme · Rubric
            </p>
            <ul className="space-y-2">
              {result.scores.map((s) => {
                const dim = defaultRubric.dimensions.find((d) => d.key === s.dimension);
                const color =
                  s.score >= 3
                    ? "text-signal-positive"
                    : s.score >= 2
                      ? "text-signal-warning"
                      : "text-signal-critical";
                return (
                  <li key={s.dimension} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-1">{dim?.label}</span>
                      <span className={cn("font-bold tabular-nums", color)}>{s.score} / 4</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-ink-2">{s.reason}</p>
                  </li>
                );
              })}
            </ul>

            {result.missedIssues.length > 0 ? (
              <div className="rounded-md border border-signal-warning/40 bg-signal-warning/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-signal-warning">
                  Kaçırdığın
                </p>
                <ul className="mt-1 space-y-1 text-xs text-ink-1">
                  {result.missedIssues.map((m, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span>•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border border-signal-positive/40 bg-signal-positive/5 p-3 text-xs text-ink-1">
                <CheckCircle2 className="mr-1 inline size-3.5 text-signal-positive" />
                Önemli mesele atlanmadı.
              </div>
            )}

            <p className="text-[11px] italic text-ink-2">Sonraki adım: {result.nextStep}</p>

            <motion.button
              type="button"
              onClick={accept}
              whileHover={{ x: 2 }}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
            >
              Sonraki sahne <ArrowRight className="size-3.5" />
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
