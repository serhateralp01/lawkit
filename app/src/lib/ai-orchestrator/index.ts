/**
 * AI Orchestrator entry point.
 *
 * `getOrchestrator()` env durumuna göre canlı veya mock adapter döner.
 * Sunucu tarafı kodu bu factory'yi kullanır; UI doğrudan adapter'a
 * dokunmaz, her zaman /api/ai/* uçları üzerinden konuşur.
 */

export * from "./types";
export { mockAdapter } from "./mockAdapter";
export { createLlmAdapter } from "./llmAdapter";

import { mockAdapter } from "./mockAdapter";
import { createLlmAdapter } from "./llmAdapter";
import { hasAiCredentials, readServerEnv } from "@/lib/env";
import type { AIOrchestrator } from "./types";

export function getOrchestrator(
  workerEnv?: Record<string, string | undefined>,
): AIOrchestrator {
  const env = readServerEnv(workerEnv);
  if (hasAiCredentials(env)) {
    return createLlmAdapter(env);
  }
  return mockAdapter;
}
