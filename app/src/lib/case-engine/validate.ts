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

  // Reachability + cycle (DFS) — yeni node tiplerinin de next'lerini takip et
  const visited = new Set<string>();
  const stack = new Set<string>();
  function nextIds(id: string): string[] {
    const n = nodes.get(id);
    if (!n) return [];
    const ids: string[] = [];
    if (n.options) for (const o of n.options) ids.push(o.next);
    if (n.kind === "open_text" && n.openText) ids.push(n.openText.next);
    if (n.kind === "ai_branch" && n.aiBranch) {
      for (const b of n.aiBranch.branches) ids.push(b.nodeId);
      ids.push(n.aiBranch.fallbackNodeId);
    }
    if (n.kind === "client_chat" && n.clientChat) ids.push(n.clientChat.next);
    if (n.kind === "checkpoint" && n.checkpoint) {
      for (const b of n.checkpoint.branches) ids.push(b.nodeId);
      ids.push(n.checkpoint.fallbackNodeId);
    }
    return ids;
  }
  function visit(id: string): boolean {
    if (stack.has(id)) {
      issues.push({ code: "cycle", nodeId: id });
      return false;
    }
    if (visited.has(id)) return true;
    visited.add(id);
    stack.add(id);
    for (const next of nextIds(id)) visit(next);
    stack.delete(id);
    return true;
  }
  visit(c.startNode);

  // Bad-next: yeni node tiplerinin referansları geçerli mi
  for (const n of c.nodes) {
    const refs: { ref: string; via: string }[] = [];
    if (n.kind === "open_text" && n.openText)
      refs.push({ ref: n.openText.next, via: "open_text.next" });
    if (n.kind === "ai_branch" && n.aiBranch) {
      for (const b of n.aiBranch.branches) refs.push({ ref: b.nodeId, via: `ai_branch:${b.label}` });
      refs.push({ ref: n.aiBranch.fallbackNodeId, via: "ai_branch.fallback" });
    }
    if (n.kind === "client_chat" && n.clientChat)
      refs.push({ ref: n.clientChat.next, via: "client_chat.next" });
    if (n.kind === "checkpoint" && n.checkpoint) {
      for (const b of n.checkpoint.branches)
        refs.push({ ref: b.nodeId, via: "checkpoint.branch" });
      refs.push({ ref: n.checkpoint.fallbackNodeId, via: "checkpoint.fallback" });
    }
    for (const r of refs) {
      if (!nodes.has(r.ref)) {
        issues.push({
          code: "bad-next",
          nodeId: n.id,
          optionId: r.via,
          next: r.ref,
        });
      }
    }
  }

  for (const n of c.nodes) {
    if (!visited.has(n.id)) issues.push({ code: "unreachable", nodeId: n.id });
  }

  return { ok: issues.length === 0, issues };
}
