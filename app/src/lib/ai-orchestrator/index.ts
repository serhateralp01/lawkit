/**
 * AI Orchestrator entry point.
 *
 * `getOrchestrator()` env durumuna göre canlı veya mock adapter döner.
 * Sunucu tarafı kodu bu factory'yi kullanır; UI doğrudan adapter'a
 * dokunmaz, her zaman /api/ai/* uçları üzerinden konuşur.
 */

export * from "./types";
export { mockAdapter } from "./mockAdapter";
export { createOpenRouterAdapter } from "./openrouterAdapter";

import { mockAdapter } from "./mockAdapter";
import { createOpenRouterAdapter } from "./openrouterAdapter";
import { hasAiCredentials, readServerEnv } from "@/lib/env";
import type { AIOrchestrator } from "./types";

export function getOrchestrator(workerEnv?: Record<string, string | undefined>): AIOrchestrator {
  const env = readServerEnv(workerEnv);
  if (hasAiCredentials(env)) {
    return createOpenRouterAdapter(env);
  }
  return mockAdapter;
}
