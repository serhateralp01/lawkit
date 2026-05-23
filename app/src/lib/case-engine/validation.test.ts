import { describe, it, expect } from "vitest";
import { validateCase } from "@/lib/case-engine/validate";
import { listCases, getCase } from "@/content/cases";

describe("case-engine — validate all hardcoded cases", () => {
  const allCases = listCases();

  for (const c of allCases) {
    it(`validates ${c.id} without errors`, () => {
      const report = validateCase(c);
      if (report.issues.length > 0) {
        console.error(`[${c.id}] Validation issues:`, report.issues);
      }
      expect(report.ok).toBe(true);
      expect(report.issues).toEqual([]);
    });
  }
});

describe("case-engine — validateCase edge cases", () => {
  it("rejects case with missing startNode", () => {
    const report = validateCase({
      id: "test",
      title: "Test",
      branch: "is_hukuku",
      difficulty: 1,
      estimatedMinutes: 10,
      rubricId: "rubric_v1",
      summary: "Test",
      facts: [],
      startNode: "nonexistent",
      nodes: [{ id: "n1", kind: "outcome", summary: "done", idealAnswer: "x" }],
    });
    expect(report.ok).toBe(false);
    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.issues[0].code).toBe("missing-start");
  });

  it("rejects case with node pointing to missing next", () => {
    const report = validateCase({
      id: "test",
      title: "Test",
      branch: "is_hukuku",
      difficulty: 1,
      estimatedMinutes: 10,
      rubricId: "rubric_v1",
      summary: "Test",
      facts: [],
      startNode: "n1",
      nodes: [
        {
          id: "n1",
          kind: "decision",
          prompt: "Choose",
          options: [
            { id: "o1", label: "Go", next: "n_missing", verdict: "good" as const },
          ],
        },
      ],
    });
    expect(report.ok).toBe(false);
    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.code === "bad-next")).toBe(true);
  });

  it("accepts minimal valid case", () => {
    const report = validateCase({
      id: "test_minimal",
      title: "Minimal",
      branch: "is_hukuku",
      difficulty: 1,
      estimatedMinutes: 5,
      rubricId: "rubric_v1",
      summary: "Test",
      facts: ["Fact 1"],
      startNode: "n1",
      nodes: [
        { id: "n1", kind: "outcome", summary: "Done", idealAnswer: "x" },
      ],
    });
    expect(report.ok).toBe(true);
    expect(report.issues).toEqual([]);
  });
});

describe("case-engine — basic engine functions", () => {
  const allCases = listCases();

  it("listCases returns cases", () => {
    expect(allCases.length).toBeGreaterThanOrEqual(4);
  });

  it("all cases have unique IDs", () => {
    const ids = allCases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all cases have required top-level fields", () => {
    for (const c of allCases) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.branch).toBeTruthy();
      expect(c.difficulty).toBeGreaterThanOrEqual(1);
      expect(c.difficulty).toBeLessThanOrEqual(4);
      expect(c.startNode).toBeTruthy();
      expect(Array.isArray(c.nodes)).toBe(true);
      expect(c.nodes.length).toBeGreaterThan(2);
    }
  });

  it("all cases have at least one outcome node", () => {
    for (const c of allCases) {
      const hasOutcome = c.nodes.some((n) => n.kind === "outcome");
      expect(hasOutcome).toBe(true);
    }
  });

  it("all cases have startNode that exists in nodes", () => {
    for (const c of allCases) {
      const nodeIds = new Set(c.nodes.map((n) => n.id));
      expect(nodeIds.has(c.startNode)).toBe(true);
    }
  });

  it("getCase returns correct case by ID", () => {
    for (const c of allCases) {
      const found = getCase(c.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(c.id);
      expect(found!.title).toBe(c.title);
    }
  });

  it("getCase returns undefined for unknown ID", () => {
    expect(getCase("nonexistent_case_id")).toBeUndefined();
  });

  it("all case nodes have valid structure", () => {
    for (const c of allCases) {
      for (const node of c.nodes) {
        expect(node.id).toBeTruthy();
        expect(node.kind).toBeTruthy();
        if (node.kind === "decision" && node.options) {
          for (const opt of node.options) {
            expect(opt.id).toBeTruthy();
            expect(opt.label).toBeTruthy();
            expect(opt.next).toBeTruthy();
            expect(["good", "partial", "bad"]).toContain(opt.verdict);
          }
        }
      }
    }
  });
});
