import { callOpenAIJson } from "../../../lib/openai/callOpenAIJson";
import { buildPolicyPatchPrompt } from "../../../lib/agents/policyAgent";

export async function POST(request) {
  try {
    const body = await request.json();
    const { memo, message, agent } = body;
    const { system, user, schemaHint } = buildPolicyPatchPrompt({ agent, memo, message });
    const result = await callOpenAIJson({ system, user, schemaHint });
    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to update policy memo." },
      { status: 500 }
    );
  }
}
