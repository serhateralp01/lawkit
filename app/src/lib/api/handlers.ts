/**
 * /api/ai/* handler'ları.
 *
 * server.ts bunları path-based route eder. Tarayıcı dünyasından
 * doğrudan fetch ile çağrılır. AI sırrı sadece bu fonksiyonların
 * çağrıldığı sunucu side'da kalır.
 */

import { z } from "zod";
import { getOrchestrator } from "@/lib/ai-orchestrator";
import { getCase } from "@/content/cases";
import { searchSources } from "@/content/sources";
import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  AiBranchRequest,
  AssessmentRequest,
  GenerateCaseRequest,
  GeneratePetitionRequest,
  GenerateQuestionRequest,
  GroundedRequest,
  RolePlayRequest,
} from "@/lib/ai-orchestrator/types";
import type { ServerEnv } from "@/lib/env";
import { readServerEnv } from "@/lib/env";

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });

const SessionShape = z
  .object({
    caseId: z.string(),
    startNode: z.string(),
    currentNode: z.string(),
    history: z.array(z.any()),
    ledger: z.record(z.string(), z.number()),
    done: z.boolean(),
    startedAt: z.number(),
  })
  .passthrough();

const GroundedBody = z.object({
  caseId: z.string(),
  session: SessionShape,
  topic: z.string(),
});

const RolePlayBody = z.object({
  caseId: z.string(),
  session: SessionShape,
  persona: z.enum(["muvekkil", "hakim", "karsi_vekil", "staj_patron"]),
  transcript: z.array(
    z.object({ speaker: z.enum(["user", "ai"]), text: z.string() }),
  ),
  userTurn: z.string(),
});

const AssessmentBody = z.object({
  caseId: z.string(),
  session: SessionShape,
  userAnswer: z.string().min(1),
  dimensions: z.array(
    z.enum(["olay", "mesele", "usul", "maddi", "gerekce", "risk", "ifade"]),
  ),
});

const BranchBody = z.object({
  caseId: z.string(),
  session: SessionShape,
  userText: z.string().min(1),
  context: z.string(),
  candidates: z
    .array(
      z.object({
        nodeId: z.string(),
        label: z.string(),
        hint: z.string().optional(),
        verdict: z.enum(["good", "partial", "bad"]),
      }),
    )
    .min(2),
  fallbackNodeId: z.string(),
  scoreDimensions: z
    .array(z.enum(["olay", "mesele", "usul", "maddi", "gerekce", "risk", "ifade"]))
    .optional(),
});

const GenerateCaseBody = z.object({
  branch: z.enum([
    "is_hukuku",
    "borclar",
    "medeni",
    "medeni_usul",
    "ceza",
    "idare",
    "ticaret",
  ]),
  difficulty: z.number().int().min(1).max(4),
  theme: z.string().optional(),
  characterTone: z.string().optional(),
});

const GenerateQuestionBody = z.object({
  branch: z.string(),
  difficulty: z.number().int().min(1).max(4),
  count: z.number().int().min(1).max(5),
  excludeIds: z.array(z.string()).optional(),
});

const GeneratePetitionBody = z.object({
  branch: z.enum(["is_hukuku", "borclar", "medeni", "medeni_usul", "ceza", "idare"]),
  difficulty: z.number().int().min(1).max(4),
  theme: z.string().optional(),
});

async function readBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function userIdFromRequest(
  req: Request,
  env: ServerEnv,
): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const sb = supabaseAdmin(env);
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export async function handleAi(
  request: Request,
  workerEnv: Record<string, string | undefined> | undefined,
  pathname: string,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await readBody(request);
  if (!body) return json({ error: "Invalid JSON body" }, { status: 400 });

  const orchestrator = getOrchestrator(workerEnv);

  try {
    if (pathname === "/api/ai/ground") {
      const parsed = GroundedBody.safeParse(body);
      if (!parsed.success) {
        return json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const legalCase = getCase(parsed.data.caseId);
      if (!legalCase) return json({ error: "case not found" }, { status: 404 });
      const req: GroundedRequest = {
        case: legalCase,
        session: parsed.data.session as GroundedRequest["session"],
        topic: parsed.data.topic,
      };
      const res = await orchestrator.ground(req);
      return json(res);
    }

    if (pathname === "/api/ai/roleplay") {
      const parsed = RolePlayBody.safeParse(body);
      if (!parsed.success) {
        return json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const legalCase = getCase(parsed.data.caseId);
      if (!legalCase) return json({ error: "case not found" }, { status: 404 });
      const req: RolePlayRequest = {
        case: legalCase,
        session: parsed.data.session as RolePlayRequest["session"],
        persona: parsed.data.persona,
        transcript: parsed.data.transcript,
        userTurn: parsed.data.userTurn,
      };
      const res = await orchestrator.rolePlay(req);
      return json(res);
    }

    if (pathname === "/api/ai/branch") {
      const parsed = BranchBody.safeParse(body);
      if (!parsed.success) {
        return json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const legalCase = getCase(parsed.data.caseId);
      if (!legalCase) return json({ error: "case not found" }, { status: 404 });
      const req: AiBranchRequest = {
        case: legalCase,
        session: parsed.data.session as AiBranchRequest["session"],
        userText: parsed.data.userText,
        context: parsed.data.context,
        candidates: parsed.data.candidates,
        fallbackNodeId: parsed.data.fallbackNodeId,
        scoreDimensions: parsed.data.scoreDimensions,
      };
      const res = await orchestrator.branch(req);
      return json(res);
    }

    if (pathname === "/api/ai/assess") {
      const parsed = AssessmentBody.safeParse(body);
      if (!parsed.success) {
        return json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const legalCase = getCase(parsed.data.caseId);
      if (!legalCase) return json({ error: "case not found" }, { status: 404 });
      const req: AssessmentRequest = {
        case: legalCase,
        session: parsed.data.session as AssessmentRequest["session"],
        userAnswer: parsed.data.userAnswer,
        dimensions: parsed.data.dimensions,
      };
      const res = await orchestrator.assess(req);
      return json(res);
    }

    if (pathname === "/api/ai/generate-case") {
      const parsed = GenerateCaseBody.safeParse(body);
      if (!parsed.success) {
        return json({ error: parsed.error.flatten() }, { status: 400 });
      }
      // RAG: tema + dal ile ilgili mevzuat maddelerini çek
      const query = parsed.data.theme ?? parsed.data.branch;
      // 3 source yeter — daha fazlası prompt'u şişirir, LLM yavaşlar.
      const relevantSources = searchSources(query, parsed.data.branch, 3);
      const req: GenerateCaseRequest = {
        branch: parsed.data.branch,
        difficulty: parsed.data.difficulty,
        theme: parsed.data.theme,
        characterTone: parsed.data.characterTone,
        contextSourceIds: relevantSources.map((s) => s.id),
      };
      const res = await orchestrator.generateCase(req);

      // Persist to Supabase (eğer erişim varsa)
      const serverEnv = readServerEnv(workerEnv);
      try {
        const userId = await userIdFromRequest(request, serverEnv);
        if (userId && serverEnv.SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
          const sb = supabaseAdmin(serverEnv);
          const caseUuid = crypto.randomUUID();
          const caseWithId = {
            ...(res.legalCase as Record<string, unknown>),
            id: `gen_${caseUuid.slice(0, 8)}`,
          };
          const { error: insertErr } = await sb
            .from("generated_cases")
            .insert({
              id: caseUuid,
              user_id: userId,
              case_json: caseWithId,
              params: {
                branch: parsed.data.branch,
                difficulty: parsed.data.difficulty,
                theme: parsed.data.theme ?? null,
              },
              quality_score: res.qualityScore,
              status: res.flaggedForReview ? "flagged" : "active",
            });
          if (insertErr) {
            console.error("[api] generated_cases insert error:", insertErr);
          } else {
            return json({ ...res, persistedId: caseUuid, caseId: caseWithId.id });
          }
        }
      } catch (persistErr) {
        console.error("[api] Case persist error:", persistErr);
      }

      return json(res);
    }

    if (pathname === "/api/ai/generate-question") {
      const parsed = GenerateQuestionBody.safeParse(body);
      if (!parsed.success) {
        return json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const query = parsed.data.branch;
      const relevantSources = searchSources(query, parsed.data.branch, 6);
      const req: GenerateQuestionRequest = {
        branch: parsed.data.branch,
        difficulty: parsed.data.difficulty,
        count: parsed.data.count,
        excludeIds: parsed.data.excludeIds,
        contextSourceIds: relevantSources.map((s) => s.id),
      };
      const res = await orchestrator.generateQuestions(req);
      return json(res);
    }

    if (pathname === "/api/ai/generate-petition") {
      const parsed = GeneratePetitionBody.safeParse(body);
      if (!parsed.success) return json({ error: parsed.error.flatten() }, { status: 400 });
      const relevantSources = searchSources(parsed.data.theme ?? parsed.data.branch, parsed.data.branch, 5);
      const req: GeneratePetitionRequest = {
        branch: parsed.data.branch,
        difficulty: parsed.data.difficulty,
        theme: parsed.data.theme,
        contextSourceIds: relevantSources.map((s) => s.id),
      };
      const res = await orchestrator.generatePetition(req);
      return json(res);
    }

    return json({ error: "AI endpoint not found" }, { status: 404 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/ai] error:", message);
    return json(
      { error: "AI request failed", detail: message.slice(0, 300) },
      { status: 500 },
    );
  }
}
