/**
 * useCaseSession — React tarafı ince sarmalayıcı.
 * Engine saf kalır; bu hook yalnızca state'i bir useState içine alır
 * ve event dispatcher'larını döndürür.
 */

import { useCallback, useMemo, useState } from "react";
import type { CaseOption, LegalCase, RubricKey, Verdict } from "@/content/types";
import { applyStep, createContext, startSession } from "./engine";
import type { CaseSession, StepEvent } from "./types";

export function useCaseSession(legalCase: LegalCase) {
  const ctx = useMemo(() => createContext(legalCase), [legalCase]);
  const [session, setSession] = useState<CaseSession>(() =>
    startSession(legalCase),
  );

  const dispatch = useCallback(
    (ev: StepEvent) => {
      setSession((s) => applyStep(ctx, s, ev));
    },
    [ctx],
  );

  const node = ctx.resolveNode(session.currentNode);
  const currentStep = session.history.find((h) => h.nodeId === session.currentNode);
  const chosenOption: CaseOption | undefined = node?.options?.find(
    (o) => o.id === currentStep?.chosenOptionId,
  );

  return {
    session,
    node,
    currentStep,
    chosenOption,
    hintLevel: currentStep?.hintLevel ?? 0,
    pick: (option: CaseOption) => dispatch({ type: "pick", option }),
    openHint: (rung: 1 | 2 | 3) => dispatch({ type: "open-hint", rung }),
    advance: () => dispatch({ type: "advance" }),
    reset: () => dispatch({ type: "reset" }),
    submitText: (args: {
      freeText: string;
      awarded?: Partial<Record<RubricKey, number>>;
      verdict?: Verdict;
    }) => dispatch({ type: "submit_text", ...args }),
    aiBranchDecided: (args: {
      freeText: string;
      chosenNodeId: string;
      reason?: string;
      awarded?: Partial<Record<RubricKey, number>>;
      verdict?: Verdict;
    }) => dispatch({ type: "ai_branch_decided", ...args }),
    chatTurn: (userText: string, aiText: string) =>
      dispatch({ type: "chat_turn", userText, aiText }),
    chatFinish: (awarded?: Partial<Record<RubricKey, number>>) =>
      dispatch({ type: "chat_finish", awarded }),
  };
}
