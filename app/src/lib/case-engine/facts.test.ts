import { describe, it, expect } from "vitest";
import { isHukuku002 } from "@/content/cases/isHukuku002";
import { resolveFacts, discoveryProgress } from "./facts";
import { startSession } from "./engine";

describe("resolveFacts", () => {
  it("non-hidden facts are always discovered", () => {
    const s = startSession(isHukuku002);
    const facts = resolveFacts(isHukuku002, s);
    const visible = facts.filter((f) => f.discovered);
    // At least 2 başlangıçta açık fact var (Müvekkil + Anlaşmazlık)
    expect(visible.length).toBeGreaterThanOrEqual(2);
  });

  it("hidden facts are discovered when keyword appears in chat", () => {
    const s = startSession(isHukuku002);
    // Chat'te 'kıdem' geçirelim
    s.history.push({
      nodeId: "n1",
      hintLevel: 0,
      awarded: {},
      at: Date.now(),
      chatTurns: [
        { speaker: "user", text: "Selin Hanım, kıdem süreniz ne kadar?", at: Date.now() },
        { speaker: "ai", text: "9 yıl", at: Date.now() },
      ],
    });
    const facts = resolveFacts(isHukuku002, s);
    const kidem = facts.find((f) => f.text.includes("9 yıl"));
    expect(kidem?.discovered).toBe(true);
  });

  it("discoveryProgress reflects ratio", () => {
    const s = startSession(isHukuku002);
    const p0 = discoveryProgress(isHukuku002, s);
    expect(p0).toBe(0); // başlangıçta hiç gizli açılmadı

    // 1 anahtar kelimeyi keşfet
    s.history.push({
      nodeId: "n1",
      hintLevel: 0,
      awarded: {},
      at: Date.now(),
      chatTurns: [{ speaker: "user", text: "kaç yıl çalıştın?", at: 0 }],
    });
    const p1 = discoveryProgress(isHukuku002, s);
    expect(p1).toBeGreaterThan(0);
    expect(p1).toBeLessThanOrEqual(1);
  });
});
