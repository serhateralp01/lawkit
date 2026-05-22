/**
 * L3 Case Engine — public API.
 *
 * Engine kullanım deseni:
 *
 *   const ctx = createContext(isHukuku001);
 *   const [session, setSession] = useState(() => startSession(isHukuku001));
 *   const node = ctx.resolveNode(session.currentNode);
 *
 *   function pick(opt) {
 *     setSession((s) => applyStep(ctx, s, { type: "pick", option: opt }));
 *   }
 *
 * Engine asla render yapmaz, ağ erişmez. React hook'u dışarıda yazılır.
 */

export {
  createContext,
  startSession,
  step,
  applyStep,
  selectOutcome,
  matchesCondition,
} from "./engine";
export { awardForChoice, ceilingFor, mergeLedger, ledgerPercentages } from "./scoring";
export { validateCase } from "./validate";
export { useCaseSession } from "./useCaseSession";
export { resolveFacts, discoveryProgress } from "./facts";
export type { ResolvedFact } from "./facts";
export type {
  CaseSession,
  StepEvent,
  StepRecord,
  StepResult,
  EngineContext,
  HintLevel,
  RubricLedger,
} from "./types";
export type { ValidationIssue, ValidationReport } from "./validate";
