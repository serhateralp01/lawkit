/**
 * Engine — saf reducer.
 *
 * Bir StepEvent + mevcut CaseSession alır, yeni CaseSession döner.
 * React, network, LLM bilmez. Bu sayede unit-test edilebilir,
 * serialize edilebilir (LocalStorage / DB), ve marketing mini-demo ile
 * gerçek ürün route'u aynı motoru kullanır.
 */

import type { Condition, LegalCase, Outcome, RubricKey } from "@/content/types";
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
    // İpuçları her tip karar gerektiren sahnede açılabilir.
    const ALLOWED = ["decision", "open_text", "ai_branch", "client_chat"];
    if (!ALLOWED.includes(node.kind)) return { session };
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
    let targetId: string | undefined;

    if (node.kind === "decision") {
      if (!record.chosenOptionId) return { session };
      const picked = node.options?.find((o) => o.id === record.chosenOptionId);
      if (!picked) return { session };
      targetId = picked.next;
    } else if (node.kind === "info") {
      // info node'lar tek bir 'next' tutar; ilk option (varsa) veya
      // çoklu seçenek yoksa node.options[0].next varsayılır.
      targetId = node.options?.[0]?.next;
    } else if (node.kind === "open_text" && node.openText) {
      targetId = node.openText.next;
    } else if (node.kind === "client_chat" && node.clientChat) {
      targetId = node.clientChat.next;
    } else if (node.kind === "ai_branch") {
      // ai_branch advance ile geçilmez — submit dispatch'inden gelir.
      // Buraya düştüyse fallback'a düş.
      targetId = node.aiBranch?.fallbackNodeId;
    } else if (node.kind === "checkpoint" && node.checkpoint) {
      targetId = evaluateCheckpoint(session, node.checkpoint);
    }

    if (!targetId) return { session };
    return moveTo(ctx, session, targetId);
  }

  if (ev.type === "submit_text") {
    if (node.kind !== "open_text" && node.kind !== "ai_branch") return { session };
    const { record, index } = currentStep(session);
    const awarded = ev.awarded ?? {};
    const updated: StepRecord = {
      ...record,
      freeText: ev.freeText,
      awarded: { ...record.awarded, ...awarded },
      verdict: ev.verdict ?? record.verdict,
      at: Date.now(),
    };
    return {
      session: {
        ...session,
        history: replaceStep(session, updated, index),
        ledger: mergeLedger(session.ledger, awarded),
      },
    };
  }

  if (ev.type === "ai_branch_decided") {
    if (node.kind !== "ai_branch") return { session };
    const validIds = new Set([
      ...(node.aiBranch?.branches.map((b) => b.nodeId) ?? []),
      node.aiBranch?.fallbackNodeId,
    ]);
    const target =
      validIds.has(ev.chosenNodeId) && ctx.resolveNode(ev.chosenNodeId)
        ? ev.chosenNodeId
        : node.aiBranch?.fallbackNodeId;
    if (!target) return { session };

    const { record, index } = currentStep(session);
    const awarded = ev.awarded ?? {};
    const updated: StepRecord = {
      ...record,
      freeText: ev.freeText,
      aiChosenNodeId: target,
      aiReason: ev.reason,
      awarded: { ...record.awarded, ...awarded },
      verdict: ev.verdict ?? record.verdict,
      at: Date.now(),
    };
    const updatedHistory = replaceStep(session, updated, index);
    const ledger = mergeLedger(session.ledger, awarded);

    const moveResult = moveTo(
      ctx,
      { ...session, history: updatedHistory, ledger },
      target,
    );
    return moveResult;
  }

  if (ev.type === "chat_turn") {
    if (node.kind !== "client_chat") return { session };
    const { record, index } = currentStep(session);
    const turns = [...(record.chatTurns ?? [])];
    turns.push({ speaker: "user", text: ev.userText, at: Date.now() });
    turns.push({ speaker: "ai", text: ev.aiText, at: Date.now() });
    const updated: StepRecord = { ...record, chatTurns: turns, at: Date.now() };
    return {
      session: { ...session, history: replaceStep(session, updated, index) },
    };
  }

  if (ev.type === "chat_finish") {
    if (node.kind !== "client_chat") return { session };
    const { record, index } = currentStep(session);
    const awarded = ev.awarded ?? {};
    const updated: StepRecord = {
      ...record,
      awarded: { ...record.awarded, ...awarded },
      at: Date.now(),
    };
    const updatedHistory = replaceStep(session, updated, index);
    const ledger = mergeLedger(session.ledger, awarded);
    const next = node.clientChat?.next;
    if (!next) return { session: { ...session, history: updatedHistory, ledger } };
    return moveTo(ctx, { ...session, history: updatedHistory, ledger }, next);
  }

  return { session };
}

/* ──────── Outcome routing + checkpoint helper'ları ──────── */

function moveTo(
  ctx: EngineContext,
  session: CaseSession,
  targetId: string,
): StepResult {
  const target = ctx.resolveNode(targetId);
  if (!target) return { session };

  if (target.kind === "outcome") {
    // Çoklu outcome ise condition'lara göre yeniden route et.
    const chosenOutcomeId = selectOutcome(ctx.case.outcomes, session);
    const finalNodeId = chosenOutcomeId ?? target.id;
    return {
      session: {
        ...session,
        currentNode: finalNodeId,
        done: true,
        outcomeId: chosenOutcomeId,
      },
    };
  }

  if (target.kind === "checkpoint" && target.checkpoint) {
    // Checkpoint görünmez — anında bir sonrakine route eder.
    const next = evaluateCheckpoint(session, target.checkpoint);
    if (!next) return { session: { ...session, currentNode: target.id } };
    return moveTo(ctx, { ...session, currentNode: target.id }, next);
  }

  return { session: { ...session, currentNode: target.id } };
}

function evaluateCheckpoint(
  session: CaseSession,
  cfg: { branches: { condition: Condition; nodeId: string }[]; fallbackNodeId: string },
): string {
  for (const b of cfg.branches) {
    if (matchesCondition(session, b.condition)) return b.nodeId;
  }
  return cfg.fallbackNodeId;
}

/** Çoklu outcome listesinden ilk eşleşeni seç. */
export function selectOutcome(
  outcomes: Outcome[] | undefined,
  session: CaseSession,
): string | undefined {
  if (!outcomes || outcomes.length === 0) return undefined;
  for (const o of outcomes) {
    if (matchesCondition(session, o.condition)) return o.id;
  }
  return outcomes[outcomes.length - 1]?.id; // son fallback
}

export function matchesCondition(session: CaseSession, c: Condition): boolean {
  if (c.default) return true;

  const ledgerValues = Object.values(session.ledger);
  const avg =
    ledgerValues.length > 0
      ? ledgerValues.reduce((s, v) => s + v, 0) / ledgerValues.length
      : 0;
  if (c.minLedgerAvg !== undefined && avg < c.minLedgerAvg) return false;

  if (c.maxHints !== undefined) {
    const totalHints = session.history.reduce((s, h) => s + h.hintLevel, 0);
    if (totalHints > c.maxHints) return false;
  }

  if (c.requireDimGte) {
    for (const [k, min] of Object.entries(c.requireDimGte) as [RubricKey, number][]) {
      if ((session.ledger[k] ?? 0) < min) return false;
    }
  }

  if (c.criticalMiss && c.criticalMiss.length > 0) {
    const hit = c.criticalMiss.some((m) =>
      session.history.some(
        (h) => h.nodeId === m.nodeId && h.chosenOptionId === m.optionId,
      ),
    );
    if (!hit) return false;
  }

  if (c.maxBadVerdicts !== undefined) {
    const bad = session.history.filter((h) => h.verdict === "bad").length;
    if (bad > c.maxBadVerdicts) return false;
  }

  return true;
}

/** Convenience: tek aksiyondan tam state'i geri al. */
export function applyStep(
  ctx: EngineContext,
  session: CaseSession,
  ev: StepEvent,
): CaseSession {
  return step(ctx, session, ev).session;
}
