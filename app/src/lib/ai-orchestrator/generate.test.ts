import { describe, it, expect } from "vitest";
import { mockAdapter } from "@/lib/ai-orchestrator/mockAdapter";

describe("mockAdapter — generateCase", () => {
  it("returns a LegalCase-shaped object", async () => {
    const result = await mockAdapter.generateCase({
      branch: "is_hukuku",
      difficulty: 2,
      theme: "fesih",
      contextSourceIds: ["is_kanunu_m18"],
    });

    expect(result.legalCase).toBeDefined();
    const c = result.legalCase as Record<string, unknown>;
    expect(c.id).toBeDefined();
    expect(c.title).toBeDefined();
    expect(c.branch).toBe("is_hukuku");
    expect(c.difficulty).toBe(2);
    expect(c.startNode).toBeDefined();
    expect(c.nodes).toBeDefined();
    expect(Array.isArray(c.nodes)).toBe(true);
    expect((c.nodes as unknown[]).length).toBeGreaterThan(0);
  });

  it("sets flaggedForReview to true for mock (not real LLM)", async () => {
    const result = await mockAdapter.generateCase({
      branch: "borclar",
      difficulty: 1,
      contextSourceIds: [],
    });
    expect(result.flaggedForReview).toBe(true);
    expect(result.qualityScore).toBe(0.5);
  });

  it("includes usedSources in response", async () => {
    const sourceIds = ["tbk_m49", "tbk_m77"];
    const result = await mockAdapter.generateCase({
      branch: "borclar",
      difficulty: 3,
      contextSourceIds: sourceIds,
    });
    expect(result.usedSources).toEqual(sourceIds);
  });

  it("works for all branch types", async () => {
    const branches = [
      "is_hukuku",
      "borclar",
      "medeni",
      "medeni_usul",
      "ceza",
      "idare",
      "ticaret",
    ] as const;
    for (const branch of branches) {
      const result = await mockAdapter.generateCase({
        branch,
        difficulty: 1,
        contextSourceIds: [],
      });
      expect(result.legalCase).toBeDefined();
    }
  });

  it("includes theme in title when provided", async () => {
    const result = await mockAdapter.generateCase({
      branch: "is_hukuku",
      difficulty: 2,
      theme: "kıdem tazminatı",
      contextSourceIds: [],
    });
    const c = result.legalCase as Record<string, unknown>;
    expect((c.title as string).toLowerCase()).toContain("kıdem");
  });
});
