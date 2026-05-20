/**
 * AiBranchStage — öğrenci serbest cevap yazar, AI sahnenin gidişatını belirler.
 *
 * Akış:
 *   1. Sahne context'i + speaker bubble'ı (örn. karşı vekil'in iddiası) gösterilir
 *   2. Öğrenci serbest yanıt yazar
 *   3. "Cevabımı sun" → /api/ai/branch — AI candidate node'lardan birini seçer
 *   4. AI'ın gerekçesi + verdict + skor pop-up'ı
 *   5. "Devam et" → engine'e ai_branch_decided dispatch (target = AI seçimi)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, AlertTriangle, Brain } from "lucide-react";
import { aiBranch } from "@/lib/api/aiClient";
import type { CaseNode, CharacterDef, RubricKey, Verdict } from "@/content/types";
import type { CaseSession } from "@/lib/case-engine";
import type { AiBranchResponse } from "@/lib/ai-orchestrator/types";
import { DialogueBubble } from "./DialogueBubble";
import { cn } from "@/lib/utils";

interface Props {
  caseId: string;
  node: CaseNode;
  session: CaseSession;
  speaker?: CharacterDef;
  onSubmit: (data: {
    freeText: string;
    chosenNodeId: string;
    reason?: string;
    awarded: Partial<Record<RubricKey, number>>;
    verdict: Verdict;
  }) => void;
}

export function AiBranchStage({ caseId, node, session, speaker, onSubmit }: Props) {
  const cfg = node.aiBranch!;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiBranchResponse | null>(null);

  const tooShort = text.trim().length < 40;

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiBranch({
        caseId,
        session,
        userText: text,
        context: cfg.context ?? node.scene ?? "",
        candidates: cfg.branches,
        fallbackNodeId: cfg.fallbackNodeId,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const continueScene = () => {
    if (!result) return;
    onSubmit({
      freeText: text,
      chosenNodeId: result.chosenNodeId,
      reason: result.reason,
      awarded: (result.scoreHint ?? {}) as Partial<Record<RubricKey, number>>,
      verdict: result.verdict,
    });
  };

  return (
    <div className="space-y-5">
      {speaker && node.prompt ? (
        <DialogueBubble
          character={speaker}
          text={node.prompt}
          mood={speaker.role === "karsi_vekil" ? "tense" : "thinking"}
          emphasis
        />
      ) : null}

      <div className="rounded-md border border-amber/40 bg-amber-soft/20 p-3 text-xs text-ink-1">
        <Brain className="mr-1 inline size-3.5 text-indigo" />
        Bu sahnede cevabın hikayeyi <strong>gerçekten</strong> değiştirir. Sonraki adımı AI seçecek.
      </div>

      <div className="space-y-2">
        <label
          htmlFor="branch-text"
          className="text-[10px] font-bold uppercase tracking-widest text-ink-3"
        >
          Cevabını gerekçeleriyle yaz
        </label>
        <textarea
          id="branch-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!!result}
          rows={5}
          placeholder="Hukuki dayanak + olgu analizi + öneri…"
          className="w-full resize-y rounded-md border border-line bg-surface-raised p-3 text-sm text-ink-1 focus:border-indigo/60 focus:outline-none disabled:opacity-70"
        />
        <div className="flex items-center justify-between text-[10px] text-ink-3">
          <span>{text.trim().length} / min 40 karakter</span>
        </div>
      </div>

      {!result ? (
        <motion.button
          type="button"
          onClick={submit}
          disabled={loading || tooShort}
          whileHover={!loading && !tooShort ? { x: 2 } : undefined}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-2 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> AI yönlendiriyor…
            </>
          ) : (
            <>
              Cevabımı sun <ArrowRight className="size-3.5" />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "space-y-3 rounded-lg border p-4",
              result.verdict === "good"
                ? "border-signal-positive/50 bg-signal-positive/5"
                : result.verdict === "partial"
                  ? "border-signal-warning/50 bg-signal-warning/5"
                  : "border-signal-critical/50 bg-signal-critical/5",
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
              Cevabın değerlendirildi
            </p>
            <p className="text-sm leading-relaxed text-ink-1">{result.reason}</p>

            {result.flaggedForReview ? (
              <p className="text-[11px] text-signal-warning">
                <AlertTriangle className="mr-1 inline size-3" />
                Auditor: AI çıktısı denetimde, yedek dala düşüldü.
              </p>
            ) : null}

            <motion.button
              type="button"
              onClick={continueScene}
              whileHover={{ x: 2 }}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
            >
              Devam et <ArrowRight className="size-3.5" />
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
