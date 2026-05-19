/**
 * DAG ve şema bütünlük denetçisi.
 *
 * Vaka yayına çıkmadan önce burada test edilir. CI'da ayrıca
 * koşturulur ki hatalı içerik prod'a gitmesin.
 *
 * Denetlenenler:
 *   1. startNode tanımlı bir node mu?
 *   2. Her decision node'un en az bir option'ı var mı?
 *   3. Her option.next geçerli bir node id'sine bağlı mı?
 *   4. Yetim (ulaşılmayan) node var mı?
 *   5. Cycle var mı? (DAG zorunlu — outcome'a varış garantili olmalı)
 *   6. En az bir outcome node var mı?
 *   7. Her option.scores boyut anahtarları rubric şemasında mı?
 */

import type { LegalCase, RubricKey } from "@/content/types";

export type ValidationIssue =
  | { code: "missing-start"; nodeId: string }
  | { code: "decision-no-options"; nodeId: string }
  | { code: "bad-next"; nodeId: string; optionId: string; next: string }
  | { code: "unreachable"; nodeId: string }
  | { code: "cycle"; nodeId: string }
  | { code: "no-outcome" }
  | { code: "unknown-rubric-key"; nodeId: string; optionId: string; key: string };

export interface ValidationReport {
  ok: boolean;
  issues: ValidationIssue[];
}

const VALID_RUBRIC_KEYS = new Set<RubricKey>([
  "olay",
  "mesele",
  "usul",
  "maddi",
  "gerekce",
  "risk",
  "ifade",
]);

export function validateCase(c: LegalCase): ValidationReport {
  const issues: ValidationIssue[] = [];
  const nodes = new Map(c.nodes.map((n) => [n.id, n]));

  if (!nodes.has(c.startNode)) {
    issues.push({ code: "missing-start", nodeId: c.startNode });
  }

  let hasOutcome = false;
  for (const n of c.nodes) {
    if (n.kind === "outcome") hasOutcome = true;
    if (n.kind === "decision" && (!n.options || n.options.length === 0)) {
      issues.push({ code: "decision-no-options", nodeId: n.id });
    }
    if (n.options) {
      for (const o of n.options) {
        if (!nodes.has(o.next)) {
          issues.push({
            code: "bad-next",
            nodeId: n.id,
            optionId: o.id,
            next: o.next,
          });
        }
        if (o.scores) {
          for (const k of Object.keys(o.scores)) {
            if (!VALID_RUBRIC_KEYS.has(k as RubricKey)) {
              issues.push({
                code: "unknown-rubric-key",
                nodeId: n.id,
                optionId: o.id,
                key: k,
              });
            }
          }
        }
      }
    }
  }
  if (!hasOutcome) issues.push({ code: "no-outcome" });

  // Reachability + cycle (DFS)
  const visited = new Set<string>();
  const stack = new Set<string>();
  function visit(id: string): boolean {
    if (stack.has(id)) {
      issues.push({ code: "cycle", nodeId: id });
      return false;
    }
    if (visited.has(id)) return true;
    visited.add(id);
    stack.add(id);
    const n = nodes.get(id);
    if (n?.options) for (const o of n.options) visit(o.next);
    stack.delete(id);
    return true;
  }
  visit(c.startNode);

  for (const n of c.nodes) {
    if (!visited.has(n.id)) issues.push({ code: "unreachable", nodeId: n.id });
  }

  return { ok: issues.length === 0, issues };
}
