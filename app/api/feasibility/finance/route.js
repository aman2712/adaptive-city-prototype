import { callOpenAIJson } from "../../../../lib/openai/callOpenAIJson";
import { buildFinancePrompt } from "../../../../lib/agents/feasibilityAgent";

export async function POST(request) {
  try {
    const body = await request.json();
    const { cluster, problemBrief, solutionPlan } = body;
    const { system, user, schemaHint } = buildFinancePrompt({
      cluster,
      problemBrief,
      solutionPlan,
    });
    const result = await callOpenAIJson({ system, user, schemaHint });
    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to run finance agent." },
      { status: 500 }
    );
  }
}
