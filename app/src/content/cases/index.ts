/**
 * Vaka registry — id'ye göre yüklenir.
 * Aşama 5'te buradaki manuel kayıt yerini build-time scanner alır.
 */

import type { LegalCase } from "../types";
import { isHukuku001 } from "./isHukuku001";
import { isHukuku002 } from "./isHukuku002";
import { borclar001 } from "./borclar001";
import { medeni001 } from "./medeni001";

export const caseRegistry: Record<string, LegalCase> = {
  is_hukuku_001: isHukuku001,
  is_hukuku_002: isHukuku002,
  borclar_001: borclar001,
  medeni_001: medeni001,
};

export function getCase(id: string): LegalCase | undefined {
  return caseRegistry[id];
}

export function listCases(): LegalCase[] {
  return Object.values(caseRegistry);
}
