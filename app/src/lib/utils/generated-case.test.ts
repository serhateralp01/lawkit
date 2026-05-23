import { describe, it, expect } from "vitest";

const GEN_KEY = "lawkit_generated_case";

function storeCase(caseId: string, legalCase: unknown) {
  const raw = JSON.stringify({ case: legalCase });
  // Simulate sessionStorage get/set
  return { key: GEN_KEY, value: raw, caseId };
}

function readCase(raw: string | null): unknown | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "case" in parsed) {
      return (parsed as { case: unknown }).case;
    }
    return null;
  } catch {
    return null;
  }
}

describe("session storage — generated case flow", () => {
  it("stores and retrieves a case correctly", () => {
    const mockCase = {
      id: "gen_test_001",
      title: "Test Case",
      branch: "borclar",
      difficulty: 2,
      estimatedMinutes: 20,
      rubricId: "rubric_v1",
      summary: "A test case",
      facts: ["Fact 1", "Fact 2"],
      startNode: "n1",
      nodes: [{ id: "n1", kind: "outcome", summary: "Done" }],
    };

    const stored = storeCase("gen-test", mockCase);
    const retrieved = readCase(stored.value);

    expect(retrieved).toBeDefined();
    expect((retrieved as Record<string, unknown>).id).toBe("gen_test_001");
    expect((retrieved as Record<string, unknown>).title).toBe("Test Case");
    expect((retrieved as Record<string, unknown>).branch).toBe("borclar");
  });

  it("returns null for invalid JSON", () => {
    const result = readCase("{ invalid json }");
    expect(result).toBeNull();
  });

  it("returns null for JSON without 'case' key", () => {
    const result = readCase(JSON.stringify({ foo: "bar" }));
    expect(result).toBeNull();
  });

  it("returns null for null input", () => {
    const result = readCase(null);
    expect(result).toBeNull();
  });

  it("recognizes gen- prefixed IDs", () => {
    const isGen = (caseId: string) => caseId.startsWith("gen-");
    expect(isGen("gen-1234567890")).toBe(true);
    expect(isGen("is_hukuku_001")).toBe(false);
    expect(isGen("borclar_002")).toBe(false);
    expect(isGen("gen")).toBe(false);
  });
});
