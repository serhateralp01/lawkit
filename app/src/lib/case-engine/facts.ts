/**
 * Olgu keşif — hangi DiscoverableFact'lerin session'da açıldığını hesaplar.
 *
 * Kurallar:
 *   - `hidden !== true` ise her zaman açık (başlangıçtan).
 *   - `revealAfterNode` belirtilen node ziyaret edildiyse açık.
 *   - `revealKeywords` chat veya open_text içinde geçti ise açık.
 */

import type { LegalCase, DiscoverableFact } from "@/content/types";
import type { CaseSession } from "./types";

export interface ResolvedFact {
  text: string;
  category?: string;
  /** false → "henüz öğrenmedin" placeholder gösterilebilir. */
  discovered: boolean;
}

function asFact(f: string | DiscoverableFact): DiscoverableFact {
  return typeof f === "string" ? { text: f } : f;
}

/** Session'daki tüm chat ve open_text serbest metnini birleştir. */
function userTextCorpus(session: CaseSession): string {
  const parts: string[] = [];
  for (const s of session.history) {
    if (s.freeText) parts.push(s.freeText);
    if (s.chatTurns) {
      for (const t of s.chatTurns) {
        if (t.speaker === "user") parts.push(t.text);
      }
    }
  }
  return parts.join(" ").toLowerCase();
}

export function resolveFacts(legalCase: LegalCase, session: CaseSession): ResolvedFact[] {
  const corpus = userTextCorpus(session);
  const visitedNodes = new Set(session.history.map((h) => h.nodeId));

  return legalCase.facts.map((raw) => {
    const f = asFact(raw);
    if (!f.hidden) return { text: f.text, category: f.category, discovered: true };

    let discovered = false;

    if (f.revealAfterNode && visitedNodes.has(f.revealAfterNode)) {
      discovered = true;
    }

    if (!discovered && f.revealKeywords && f.revealKeywords.length > 0) {
      discovered = f.revealKeywords.some((k) => corpus.includes(k.toLowerCase()));
    }

    return { text: f.text, category: f.category, discovered };
  });
}

/** Sadece açık olanların oranı 0..1 — UI rozeti için. */
export function discoveryProgress(legalCase: LegalCase, session: CaseSession): number {
  const all = legalCase.facts.map(asFact);
  const hidden = all.filter((f) => f.hidden);
  if (hidden.length === 0) return 1;
  const resolved = resolveFacts(legalCase, session);
  const discoveredHidden = resolved.filter((r, i) => all[i].hidden && r.discovered).length;
  return discoveredHidden / hidden.length;
}
