import { describe, it, expect } from "vitest";
import { isHukuku002 } from "@/content/cases/isHukuku002";
import { borclar002 } from "@/content/cases/borclar002";
import {
  applyStep,
  createContext,
  startSession,
  matchesCondition,
  selectOutcome,
} from "./engine";
import { validateCase } from "./validate";

describe("engine — startSession", () => {
  it("starts at case.startNode with empty ledger and history", () => {
    const s = startSession(isHukuku002);
    expect(s.currentNode).toBe(isHukuku002.startNode);
    expect(s.history).toEqual([]);
    expect(s.ledger).toEqual({});
    expect(s.done).toBe(false);
    expect(s.outcomeId).toBeUndefined();
  });
});

describe("engine — pick + advance flow (decision node)", () => {
  it("records option, awards rubric, and advances to next node", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    // n1 is client_chat — skip with chat_finish to reach n2
    s = applyStep(ctx, s, {
      type: "chat_finish",
      awarded: { olay: 4, mesele: 3 },
    });
    s = applyStep(ctx, s, { type: "advance" });
    expect(s.currentNode).toBe("n2");

    const n2 = ctx.resolveNode("n2")!;
    const optA = n2.options!.find((o) => o.id === "a")!;
    s = applyStep(ctx, s, { type: "pick", option: optA });
    expect(s.history.some((h) => h.chosenOptionId === "a")).toBe(true);
    expect(s.ledger.mesele).toBe(4);
    expect(s.history.find((h) => h.nodeId === "n2")!.verdict).toBe("good");
  });

  it("rejects second pick on same node", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    s = applyStep(ctx, s, { type: "chat_finish", awarded: {} });
    s = applyStep(ctx, s, { type: "advance" });
    const n2 = ctx.resolveNode("n2")!;
    const optA = n2.options!.find((o) => o.id === "a")!;
    const optB = n2.options!.find((o) => o.id === "b")!;
    s = applyStep(ctx, s, { type: "pick", option: optA });
    const ledgerBefore = s.ledger.mesele;
    s = applyStep(ctx, s, { type: "pick", option: optB });
    expect(s.ledger.mesele).toBe(ledgerBefore); // değişmedi
  });
});

describe("engine — open-hint", () => {
  it("applies hint level monotonically", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    s = applyStep(ctx, s, { type: "chat_finish", awarded: {} });
    s = applyStep(ctx, s, { type: "advance" });
    s = applyStep(ctx, s, { type: "open-hint", rung: 2 });
    let rec = s.history.find((h) => h.nodeId === "n2");
    expect(rec?.hintLevel).toBe(2);
    // Geriye gitmez
    s = applyStep(ctx, s, { type: "open-hint", rung: 1 });
    rec = s.history.find((h) => h.nodeId === "n2");
    expect(rec?.hintLevel).toBe(2);
    // İlerler
    s = applyStep(ctx, s, { type: "open-hint", rung: 3 });
    rec = s.history.find((h) => h.nodeId === "n2");
    expect(rec?.hintLevel).toBe(3);
  });

  it("hint ceiling reduces awarded score", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    s = applyStep(ctx, s, { type: "chat_finish", awarded: {} });
    s = applyStep(ctx, s, { type: "advance" });
    s = applyStep(ctx, s, { type: "open-hint", rung: 3 });
    const n2 = ctx.resolveNode("n2")!;
    const optA = n2.options!.find((o) => o.id === "a")!;
    s = applyStep(ctx, s, { type: "pick", option: optA });
    // Rung 3 → ceiling 2 (scoring.ts), mesele option'da 4 → 2'ye düşmeli
    expect(s.ledger.mesele).toBeLessThanOrEqual(2);
  });
});

describe("engine — submit_text + ai_branch_decided", () => {
  it("records freeText and awards on open_text submit", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    // n1 → n2 → n3 (open_text)
    s = applyStep(ctx, s, { type: "chat_finish", awarded: {} });
    s = applyStep(ctx, s, { type: "advance" });
    const n2 = ctx.resolveNode("n2")!;
    s = applyStep(ctx, s, { type: "pick", option: n2.options!.find((o) => o.id === "a")! });
    s = applyStep(ctx, s, { type: "advance" });
    expect(s.currentNode).toBe("n3");
    s = applyStep(ctx, s, {
      type: "submit_text",
      freeText: "Mock öğrenci cevabı.",
      awarded: { mesele: 4, gerekce: 3 },
      verdict: "good",
    });
    const n3rec = s.history.find((h) => h.nodeId === "n3");
    expect(n3rec?.freeText).toBe("Mock öğrenci cevabı.");
    expect(s.ledger.gerekce).toBe(3);
  });

  it("ai_branch_decided routes to chosen node", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    s.currentNode = "n9";
    const decision = applyStep(ctx, s, {
      type: "ai_branch_decided",
      freeText: "Strong cevap.",
      chosenNodeId: "n10_strong",
      verdict: "good",
      awarded: { risk: 4 },
    });
    expect(decision.currentNode).toBe("n10_strong");
    expect(decision.ledger.risk).toBe(4);
  });

  it("ai_branch_decided falls back when chosenNodeId is invalid", () => {
    const ctx = createContext(isHukuku002);
    let s = startSession(isHukuku002);
    s.currentNode = "n9";
    const decision = applyStep(ctx, s, {
      type: "ai_branch_decided",
      freeText: "x",
      chosenNodeId: "GERCEKTE_OLMAYAN",
      verdict: "partial",
    });
    // n9.aiBranch.fallbackNodeId === "n10_partial"
    expect(decision.currentNode).toBe("n10_partial");
  });
});

describe("engine — outcome routing", () => {
  it("matchesCondition basic checks", () => {
    const session = startSession(isHukuku002);
    session.ledger = { mesele: 4, usul: 4, gerekce: 3, maddi: 3, risk: 3 };
    session.history = [];
    expect(matchesCondition(session, { minLedgerAvg: 3 })).toBe(true);
    expect(matchesCondition(session, { minLedgerAvg: 5 })).toBe(false);
    expect(matchesCondition(session, { requireDimGte: { usul: 4 } })).toBe(true);
    expect(matchesCondition(session, { requireDimGte: { usul: 5 } })).toBe(false);
    expect(matchesCondition(session, { default: true })).toBe(true);
  });

  it("selectOutcome picks first matching outcome", () => {
    const session = startSession(isHukuku002);
    session.ledger = { mesele: 4, usul: 4, gerekce: 4, maddi: 4, risk: 4 };
    const oid = selectOutcome(isHukuku002.outcomes, session);
    expect(oid).toBe("zafer");
  });

  it("selectOutcome falls to default outcome when nothing matches", () => {
    const session = startSession(isHukuku002);
    session.ledger = { mesele: 0, usul: 0 };
    session.history = [{ nodeId: "x", hintLevel: 0, awarded: {}, at: 0, verdict: "bad" }];
    const oid = selectOutcome(isHukuku002.outcomes, session);
    expect(oid).toBe("tam_kayip");
  });
});

describe("engine — validateCase (6 vakaya hızlı kontrol)", () => {
  it("isHukuku002 ok", () => {
    expect(validateCase(isHukuku002).ok).toBe(true);
  });
  it("borclar002 ok", () => {
    expect(validateCase(borclar002).ok).toBe(true);
  });
});
