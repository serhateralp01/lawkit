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
import { isHukuku002 } from "../src/content/cases/isHukuku002";
import { borclar001 } from "../src/content/cases/borclar001";
import { borclar002 } from "../src/content/cases/borclar002";
import { medeni001 } from "../src/content/cases/medeni001";
import { medeni002 } from "../src/content/cases/medeni002";
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
for (const c of [isHukuku001, borclar001, medeni001, isHukuku002, borclar002, medeni002]) {
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

// is_hukuku_002 — derin vaka happy path (sadece decision'lara dokunup tam zafer al)
{
  const ctx = createContext(isHukuku002);
  let s = startSession(isHukuku002);

  // n1 client_chat — sadece bitir, en az olay skoru ile geç
  s = applyStep(ctx, s, { type: "chat_finish", awarded: { olay: 4, mesele: 3 } });
  s = applyStep(ctx, s, { type: "advance" });

  // n2 decision a
  let n = ctx.resolveNode("n2")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n, "a") });
  s = applyStep(ctx, s, { type: "advance" });

  // n3 open_text — mock submit
  s = applyStep(ctx, s, {
    type: "submit_text",
    freeText: "Mock cevap.",
    awarded: { mesele: 4, gerekce: 4, ifade: 3 },
    verdict: "good",
  });
  s = applyStep(ctx, s, { type: "advance" });

  // n4 decision a (arabuluculuk)
  n = ctx.resolveNode("n4")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n, "a") });
  s = applyStep(ctx, s, { type: "advance" });

  // n5 decision a (1 ay süre)
  n = ctx.resolveNode("n5")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n, "a") });
  s = applyStep(ctx, s, { type: "advance" });
  // n6 checkpoint geçildi → n7b'ye gitmeli

  // n7b open_text — mock submit
  s = applyStep(ctx, s, {
    type: "submit_text",
    freeText: "Talep sonucu detayı.",
    awarded: { gerekce: 4, ifade: 4, risk: 4 },
    verdict: "good",
  });
  s = applyStep(ctx, s, { type: "advance" });

  // n8 decision a (süre tutum)
  n = ctx.resolveNode("n8")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n, "a") });
  s = applyStep(ctx, s, { type: "advance" });

  // n9 ai_branch — mock branch decided to n10_strong
  s = applyStep(ctx, s, {
    type: "ai_branch_decided",
    freeText: "Güçlü savunma metni.",
    chosenNodeId: "n10_strong",
    awarded: { risk: 4, ifade: 4 },
    verdict: "good",
  });

  // n10_strong info — pick 'a'
  n = ctx.resolveNode("n10_strong")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n, "a") });
  s = applyStep(ctx, s, { type: "advance" });

  // n11 info — pick 'go'
  n = ctx.resolveNode("n11")!;
  s = applyStep(ctx, s, { type: "pick", option: findOption(n, "go") });
  s = applyStep(ctx, s, { type: "advance" });

  run(`is_hukuku_002 happy: done=${s.done}`, s.done);
  run(`is_hukuku_002 outcomeId=${s.outcomeId}`, s.outcomeId === "zafer");
}

console.log("─────────────────────\n");
