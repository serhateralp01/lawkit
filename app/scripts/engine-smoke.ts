/**
 * Engine smoke test — TypeScript node ile çalışır.
 *
 *   bunx tsx scripts/engine-smoke.ts
 *
 * Üç senaryoyu engine ile geçirir, beklenen ledger ile karşılaştırır.
 * Aşama 4'te bu script CI'da çalışır ve content/eval/*.eval.json
 * dosyalarını otomatik koşturur.
 */

import { isHukuku001 } from "../src/content/cases/isHukuku001";
import { borclar001 } from "../src/content/cases/borclar001";
import { medeni001 } from "../src/content/cases/medeni001";
import {
  applyStep,
  createContext,
  startSession,
  validateCase,
} from "../src/lib/case-engine";
import type { CaseOption } from "../src/content/types";

function findOption(caseNode: ReturnType<typeof isHukuku001.nodes.find>, id: string): CaseOption {
  const opt = caseNode?.options?.find((o) => o.id === id);
  if (!opt) throw new Error(`Option ${id} not found`);
  return opt;
}

function run(label: string, ok: boolean) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) process.exitCode = 1;
}

console.log("\nLawKit engine smoke");
console.log("─────────────────────");

// Validation
for (const c of [isHukuku001, borclar001, medeni001]) {
  const v = validateCase(c);
  run(`validate(${c.id}) → ok=${v.ok}, issues=${v.issues.length}`, v.ok);
}

// Happy path is_hukuku_001
{
  const ctx = createContext(isHukuku001);
  let s = startSession(isHukuku001);
  const n1 = ctx.resolveNode("n1")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n1, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  const n2 = ctx.resolveNode("n2")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n2, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  run(`is_hukuku_001 happy: done=${s.done}, node=${s.currentNode}`, s.done && s.currentNode === "n3");
  run(`is_hukuku_001 ledger.usul=${s.ledger.usul}`, s.ledger.usul === 4);
  run(`is_hukuku_001 ledger.mesele=${s.ledger.mesele}`, s.ledger.mesele === 3);
}

// Hint ceiling
{
  const ctx = createContext(isHukuku001);
  let s = startSession(isHukuku001);
  s = applyStep(ctx, s, { type: "open-hint", rung: 3 });
  const n1 = ctx.resolveNode("n1")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n1, "a") });
  // mesele 3 → 2 (n1 rubricTargets içinde, hint 3 ceiling=2)
  run(`hint ceiling mesele=${s.ledger.mesele}`, s.ledger.mesele === 2);
  run(`hint ceiling usul=${s.ledger.usul}`, s.ledger.usul === 2);
}

// Borclar happy
{
  const ctx = createContext(borclar001);
  let s = startSession(borclar001);
  const n1 = ctx.resolveNode("n1")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n1, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  const n2 = ctx.resolveNode("n2")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n2, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  run(`borclar_001 happy: done=${s.done}`, s.done);
  run(`borclar_001 ledger.maddi=${s.ledger.maddi}`, s.ledger.maddi === 4);
}

// Medeni happy
{
  const ctx = createContext(medeni001);
  let s = startSession(medeni001);
  const n1 = ctx.resolveNode("n1")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n1, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  const n2 = ctx.resolveNode("n2")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n2, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  const n3 = ctx.resolveNode("n3")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n3, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  run(`medeni_001 happy: done=${s.done}`, s.done);
  run(`medeni_001 ledger.maddi=${s.ledger.maddi}`, s.ledger.maddi === 4);
  run(`medeni_001 ledger.usul=${s.ledger.usul}`, s.ledger.usul === 4);
}

console.log("─────────────────────\n");
