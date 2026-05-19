/**
 * Engine — saf reducer.
 *
 * Bir StepEvent + mevcut CaseSession alır, yeni CaseSession döner.
 * React, network, LLM bilmez. Bu sayede unit-test edilebilir,
 * serialize edilebilir (LocalStorage / DB), ve marketing mini-demo ile
 * gerçek ürün route'u aynı motoru kullanır.
 */

import type { LegalCase } from "@/content/types";
import type {
  CaseSession,
  EngineContext,
  HintLevel,
  StepEvent,
  StepResult,
  StepRecord,
} from "./types";
import { awardForChoice, mergeLedger } from "./scoring";

export function createContext(c: LegalCase): EngineContext {
  const map = new Map(c.nodes.map((n) => [n.id, n]));
  return {
    case: c,
    resolveNode: (id) => map.get(id),
  };
}

export function startSession(c: LegalCase): CaseSession {
  return {
    caseId: c.id,
    startNode: c.startNode,
    currentNode: c.startNode,
    history: [],
    ledger: {},
    done: false,
    startedAt: Date.now(),
  };
}

/** Yardımcı: mevcut node için aktif step kaydını al; yoksa boş bir taslak döner. */
function currentStep(session: CaseSession): {
  record: StepRecord;
  index: number;
} {
  const idx = session.history.findIndex((s) => s.nodeId === session.currentNode);
  if (idx >= 0) {
    return { record: session.history[idx], index: idx };
  }
  return {
    record: {
      nodeId: session.currentNode,
      hintLevel: 0,
      awarded: {},
      at: Date.now(),
    },
    index: -1,
  };
}

function replaceStep(
  session: CaseSession,
  step: StepRecord,
  prevIndex: number,
): StepRecord[] {
  if (prevIndex < 0) return [...session.history, step];
  const next = [...session.history];
  next[prevIndex] = step;
  return next;
}

export function step(
  ctx: EngineContext,
  session: CaseSession,
  ev: StepEvent,
): StepResult {
  if (ev.type === "reset") {
    return { session: startSession(ctx.case) };
  }

  const node = ctx.resolveNode(session.currentNode);
  if (!node) return { session };

  if (ev.type === "open-hint") {
    if (node.kind !== "decision") return { session };
    const { record, index } = currentStep(session);
    if (ev.rung <= record.hintLevel) return { session }; // monoton

    const newLevel = ev.rung as HintLevel;
    const updated: StepRecord = { ...record, hintLevel: newLevel };
    return {
      session: { ...session, history: replaceStep(session, updated, index) },
    };
  }

  if (ev.type === "pick") {
    if (node.kind !== "decision") return { session };
    const { record, index } = currentStep(session);
    if (record.chosenOptionId) return { session }; // tek seçim, kilitli

    const awarded = awardForChoice(node, ev.option, record.hintLevel);
    const newLedger = mergeLedger(session.ledger, awarded);
    const updated: StepRecord = {
      ...record,
      chosenOptionId: ev.option.id,
      awarded,
      verdict: ev.option.verdict,
      at: Date.now(),
    };
    return {
      session: {
        ...session,
        history: replaceStep(session, updated, index),
        ledger: newLedger,
      },
    };
  }

  if (ev.type === "advance") {
    const { record } = currentStep(session);
    if (!record.chosenOptionId) return { session };
    const picked = node.options?.find((o) => o.id === record.chosenOptionId);
    if (!picked) return { session };
    const target = ctx.resolveNode(picked.next);
    if (!target) return { session };
    const done = target.kind === "outcome";
    return {
      session: { ...session, currentNode: target.id, done },
    };
  }

  return { session };
}

/** Convenience: tek aksiyondan tam state'i geri al. */
export function applyStep(
  ctx: EngineContext,
  session: CaseSession,
  ev: StepEvent,
): CaseSession {
  return step(ctx, session, ev).session;
}
