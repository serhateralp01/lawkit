import type { CaseSession } from "@/lib/case-engine";
import type {
  AiBranchResponse,
  AssessmentResponse,
  GenerateCaseRequest,
  GenerateCaseResponse,
  GenerateQuestionRequest,
  GenerateQuestionResponse,
  GroundedResponse,
  Persona,
  RolePlayResponse,
} from "@/lib/ai-orchestrator/types";
import type { RubricKey } from "@/content/types";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";

async function post<T>(
  path: string,
  body: unknown,
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (auth && hasSupabaseConfig()) {
    const { data } = await supabaseBrowser().auth.getSession();
    if (data.session?.access_token) {
      headers["authorization"] = `Bearer ${data.session.access_token}`;
    }
  }
  const res = await fetch(path, {
    method: "POST",
    headers,
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

export function aiBranch(args: {
  caseId: string;
  session: CaseSession;
  userText: string;
  context: string;
  candidates: {
    nodeId: string;
    label: string;
    hint?: string;
    verdict: "good" | "partial" | "bad";
  }[];
  fallbackNodeId: string;
  scoreDimensions?: RubricKey[];
}) {
  return post<AiBranchResponse>("/api/ai/branch", args);
}

export interface GenerateCaseResult extends GenerateCaseResponse {
  persistedId?: string;
  caseId?: string;
}

export function aiGenerateCase(args: GenerateCaseRequest) {
  return post<GenerateCaseResult>("/api/ai/generate-case", args, true);
}

export function aiGenerateQuestions(args: GenerateQuestionRequest) {
  return post<GenerateQuestionResponse>("/api/ai/generate-question", args, true);
}
