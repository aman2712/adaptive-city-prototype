import { callOpenAIJson } from "../../../../lib/openai/callOpenAIJson";
import { buildOperationsPrompt } from "../../../../lib/agents/feasibilityAgent";

export async function POST(request) {
  try {
    const body = await request.json();
    const { cluster, problemBrief, solutionPlan } = body;
    const { system, user, schemaHint } = buildOperationsPrompt({
      cluster,
      problemBrief,
      solutionPlan,
    });
    const result = await callOpenAIJson({ system, user, schemaHint });
    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to run operations agent." },
      { status: 500 }
    );
  }
}
