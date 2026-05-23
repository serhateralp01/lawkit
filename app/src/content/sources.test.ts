import { describe, it, expect } from "vitest";
import { sources, searchSources, sourcesByBranch } from "@/content/sources";

describe("sources — basic lookup", () => {
  it("tbk_m49 should exist (TBK haksiz fiil)", () => {
    const s = sources.tbk_m49;
    expect(s).toBeDefined();
    expect(s.shortTitle).toBe("TBK m. 49");
    expect(s.kind).toBe("kanun");
    expect(s.body).toContain("hukuka aykırı");
  });

  it("is_kanunu_m18 should exist (is guvencesi)", () => {
    const s = sources.is_kanunu_m18;
    expect(s).toBeDefined();
    expect(s.body).toContain("30 veya daha fazla");
  });

  it("tmk_m737 should exist (komsuluk)", () => {
    const s = sources.tmk_m737;
    expect(s).toBeDefined();
    expect(s.shortTitle).toBe("TMK m. 737");
  });

  it("tmk_m730 should exist (taskin kullanim)", () => {
    const s = sources.tmk_m730;
    expect(s).toBeDefined();
  });

  it("all law IDs referenced by existing cases should be in sources", () => {
    const requiredIds = [
      "tbk_m77",
      "tbk_m79",
      "tbk_m82",
      "is_kanunu_m20",
      "is_mahkemeleri_m3",
      "tmk_m730",
      "tmk_m737",
    ];
    for (const id of requiredIds) {
      expect(sources[id]).toBeDefined();
    }
  });

  it("sources should have at least 40 entries", () => {
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(40);
  });

  it("every source should have required fields", () => {
    for (const [, s] of Object.entries(sources)) {
      expect(s.id).toBeTruthy();
      expect(s.kind).toMatch(/^(kanun|ictihat|doktrin|yonetmelik)$/);
      expect(s.shortTitle).toBeTruthy();
      expect(s.body).toBeTruthy();
      expect(s.body.length).toBeGreaterThan(20);
    }
  });
});

describe("sources — searchSources RAG", () => {
  it("finds is hukuku sources by branch filter", () => {
    const results = sourcesByBranch("is_hukuku");
    expect(results.length).toBeGreaterThanOrEqual(6);
    expect(results.some((s) => s.id === "is_kanunu_m17")).toBe(true);
    expect(results.some((s) => s.id === "is_kanunu_m18")).toBe(true);
  });

  it("finds borclar sources by branch filter", () => {
    const results = sourcesByBranch("borclar");
    expect(results.length).toBeGreaterThanOrEqual(5);
    expect(results.some((s) => s.id === "tbk_m49")).toBe(true);
  });

  it("searchSources returns relevant results by keyword", () => {
    const results = searchSources("fesih", "is_hukuku", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((s) => s.id.startsWith("is_kanunu"))).toBe(true);
  });

  it("searchSources returns empty on gibberish query", () => {
    const results = searchSources("xyzabc123nonexistent", undefined, 5);
    expect(results.length).toBe(0);
  });

  it("searchSources with branch filter limits correctly", () => {
    const results = searchSources("madde", "ceza", 3);
    expect(results.length).toBeLessThanOrEqual(3);
    for (const s of results) {
      const meta = s as { branch?: string[] };
      expect(meta.branch?.includes("ceza")).toBe(true);
    }
  });
});
