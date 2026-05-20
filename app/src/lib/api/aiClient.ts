/**
 * Tarayıcı tarafı AI client'ı.
 * /api/ai/* uçlarına fetch atar; sırlar asla client'a sızmaz.
 */

import type { CaseSession } from "@/lib/case-engine";
import type {
  AssessmentResponse,
  GroundedResponse,
  Persona,
  RolePlayResponse,
} from "@/lib/ai-orchestrator/types";
import type { RubricKey } from "@/content/types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `AI request failed (${res.status}): ${
        typeof err === "object" && err && "error" in err
          ? JSON.stringify(err.error).slice(0, 200)
          : res.statusText
      }`,
    );
  }
  return (await res.json()) as T;
}

export function aiGround(args: {
  caseId: string;
  session: CaseSession;
  topic: string;
}) {
  return post<GroundedResponse>("/api/ai/ground", args);
}

export function aiRolePlay(args: {
  caseId: string;
  session: CaseSession;
  persona: Persona;
  transcript: { speaker: "user" | "ai"; text: string }[];
  userTurn: string;
}) {
  return post<RolePlayResponse>("/api/ai/roleplay", args);
}

export function aiAssess(args: {
  caseId: string;
  session: CaseSession;
  userAnswer: string;
  dimensions: RubricKey[];
}) {
  return post<AssessmentResponse>("/api/ai/assess", args);
}
