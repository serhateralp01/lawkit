/**
 * AI Eval Runner — content/eval/*.eval.json dosyalarını gerçek LLM ile koşturur.
 *
 *   npx tsx app/scripts/eval-run.ts                     # tümünü
 *   npx tsx app/scripts/eval-run.ts is_hukuku_002       # tek vaka
 *
 * .env'den LLM_API_KEY okur. Dev/CI'da kullanılır.
 *
 * Çıktı: her senaryo için PASS/FAIL + sebep, sonunda özet.
 *
 * Bu eval'leri haftalık (veya prompt değişikliği sonrası) çalıştır — AI
 * sağlayıcı/model güncellemesi cevap kalitesini bozmadığını doğrularsın.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { config } from "dotenv";
import { readServerEnv, hasAiCredentials } from "../src/lib/env";
import { createLlmAdapter } from "../src/lib/ai-orchestrator/llmAdapter";
import { getCase } from "../src/content/cases";
import { startSession } from "../src/lib/case-engine";
import type {
  AiBranchResponse,
  AssessmentResponse,
  GroundedResponse,
} from "../src/lib/ai-orchestrator/types";
import type { RubricKey } from "../src/content/types";

// .env ve .dev.vars dosyalarını yükle (sırayla, daha sonra gelen kazanır değil)
config({ path: ".env" });
config({ path: ".dev.vars" });

interface EvalScenario {
  id: string;
  endpoint: "ground" | "assess" | "branch";
  request: Record<string, unknown>;
  expectations: Record<string, unknown>;
}

interface EvalFile {
  caseId: string;
  version: string;
  description: string;
  scenarios: EvalScenario[];
}

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";

const env = readServerEnv();
if (!hasAiCredentials(env)) {
  console.error(`${RED}LLM_API_KEY bulunamadı. .env veya .dev.vars'ı kontrol et.${RESET}`);
  process.exit(1);
}

const adapter = createLlmAdapter(env);

const evalDir = join(process.cwd(), "content", "eval");
const filterArg = process.argv[2];

const allFiles = readdirSync(evalDir).filter((f) => f.endsWith(".eval.json"));
const files = filterArg
  ? allFiles.filter((f) => f.includes(filterArg))
  : allFiles;

if (files.length === 0) {
  console.error(`Eval dosyası bulunamadı (filter: ${filterArg ?? "tümü"})`);
  process.exit(1);
}

interface Result {
  file: string;
  scenarioId: string;
  pass: boolean;
  reason?: string;
  raw?: unknown;
}

const results: Result[] = [];

for (const file of files) {
  const evalFile = JSON.parse(readFileSync(join(evalDir, file), "utf-8")) as EvalFile;
  const legalCase = getCase(evalFile.caseId);
  if (!legalCase) {
    console.error(`${RED}[${file}] Vaka bulunamadı: ${evalFile.caseId}${RESET}`);
    continue;
  }

  console.log(`\n${DIM}━━━ ${file} (${evalFile.scenarios.length} senaryo) ━━━${RESET}`);

  for (const scen of evalFile.scenarios) {
    process.stdout.write(`  ${DIM}▸${RESET} ${scen.id.padEnd(28)} ${DIM}${scen.endpoint}${RESET} `);

    try {
      const session = startSession(legalCase);

      if (scen.endpoint === "ground") {
        const res = await adapter.ground({
          case: legalCase,
          session,
          topic: scen.request.topic as string,
        });
        const r = checkGround(res, scen.expectations);
        results.push({ file, scenarioId: scen.id, ...r, raw: res });
        if (r.pass) console.log(`${GREEN}PASS${RESET}`);
        else console.log(`${RED}FAIL${RESET} ${DIM}${r.reason}${RESET}`);
      } else if (scen.endpoint === "assess") {
        const res = await adapter.assess({
          case: legalCase,
          session,
          userAnswer: scen.request.userAnswer as string,
          dimensions: scen.request.dimensions as RubricKey[],
        });
        const r = checkAssess(res, scen.expectations);
        results.push({ file, scenarioId: scen.id, ...r, raw: res });
        if (r.pass) console.log(`${GREEN}PASS${RESET}`);
        else console.log(`${RED}FAIL${RESET} ${DIM}${r.reason}${RESET}`);
      } else if (scen.endpoint === "branch") {
        const res = await adapter.branch({
          case: legalCase,
          session,
          userText: scen.request.userText as string,
          context: scen.request.context as string,
          candidates: scen.request.candidates as { nodeId: string; label: string; hint?: string; verdict: "good" | "partial" | "bad" }[],
          fallbackNodeId: scen.request.fallbackNodeId as string,
        });
        const r = checkBranch(res, scen.expectations);
        results.push({ file, scenarioId: scen.id, ...r, raw: res });
        if (r.pass) console.log(`${GREEN}PASS${RESET}`);
        else console.log(`${RED}FAIL${RESET} ${DIM}${r.reason}${RESET}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`${YELLOW}ERROR${RESET} ${DIM}${msg.slice(0, 80)}${RESET}`);
      results.push({ file, scenarioId: scen.id, pass: false, reason: `EXCEPTION: ${msg}` });
    }
  }
}

// Özet
const total = results.length;
const passed = results.filter((r) => r.pass).length;
const failed = total - passed;

console.log(`\n${DIM}━━━ Özet ━━━${RESET}`);
console.log(
  `${passed === total ? GREEN : YELLOW}${passed}/${total} PASS${RESET}` +
    (failed > 0 ? `, ${RED}${failed} FAIL${RESET}` : "")
);

if (failed > 0) {
  console.log(`\n${RED}Başarısız senaryolar:${RESET}`);
  for (const r of results.filter((x) => !x.pass)) {
    console.log(`  ${DIM}[${basename(r.file)}]${RESET} ${r.scenarioId}: ${r.reason}`);
  }
  process.exit(1);
}

/* ─────────── Helper checkers ─────────── */

function checkGround(
  res: GroundedResponse,
  exp: Record<string, unknown>,
): { pass: boolean; reason?: string } {
  const mustSources = (exp.mustMentionSources ?? []) as string[];
  for (const s of mustSources) {
    if (!res.sourceRefs.includes(s))
      return { pass: false, reason: `kaynak '${s}' yok` };
  }
  const contains = (exp.explanationContains ?? []) as string[];
  for (const k of contains) {
    if (!res.explanation.toLowerCase().includes(k.toLowerCase()))
      return { pass: false, reason: `'${k}' geçmiyor` };
  }
  if (
    exp.noSourceFoundShouldBe !== undefined &&
    res.noSourceFound !== exp.noSourceFoundShouldBe
  ) {
    return {
      pass: false,
      reason: `noSourceFound beklenen=${exp.noSourceFoundShouldBe} aldık=${res.noSourceFound}`,
    };
  }
  return { pass: true };
}

function checkAssess(
  res: AssessmentResponse,
  exp: Record<string, unknown>,
): { pass: boolean; reason?: string } {
  const minScores = (exp.minScores ?? {}) as Record<string, number>;
  for (const [dim, min] of Object.entries(minScores)) {
    const s = res.scores.find((x) => x.dimension === dim);
    if (!s) return { pass: false, reason: `${dim} skoru dönmedi` };
    if (s.score < min)
      return { pass: false, reason: `${dim} skoru ${s.score} < min ${min}` };
  }
  const maxScores = (exp.maxScores ?? {}) as Record<string, number>;
  for (const [dim, max] of Object.entries(maxScores)) {
    const s = res.scores.find((x) => x.dimension === dim);
    if (!s) continue;
    if (s.score > max)
      return { pass: false, reason: `${dim} skoru ${s.score} > max ${max}` };
  }
  if (
    exp.maxMissedIssues !== undefined &&
    res.missedIssues.length > (exp.maxMissedIssues as number)
  ) {
    return {
      pass: false,
      reason: `missedIssues ${res.missedIssues.length} > max ${exp.maxMissedIssues}`,
    };
  }
  if (
    exp.minMissedIssues !== undefined &&
    res.missedIssues.length < (exp.minMissedIssues as number)
  ) {
    return {
      pass: false,
      reason: `missedIssues ${res.missedIssues.length} < min ${exp.minMissedIssues}`,
    };
  }
  if (exp.shouldNotBeFlagged === true && res.flaggedForReview) {
    return { pass: false, reason: `flaggedForReview=true (denetim)` };
  }
  return { pass: true };
}

function checkBranch(
  res: AiBranchResponse,
  exp: Record<string, unknown>,
): { pass: boolean; reason?: string } {
  if (exp.chosenNodeId && res.chosenNodeId !== exp.chosenNodeId) {
    return {
      pass: false,
      reason: `chosenNodeId beklenen=${exp.chosenNodeId} aldık=${res.chosenNodeId}`,
    };
  }
  if (exp.verdict && res.verdict !== exp.verdict) {
    return {
      pass: false,
      reason: `verdict beklenen=${exp.verdict} aldık=${res.verdict}`,
    };
  }
  return { pass: true };
}
