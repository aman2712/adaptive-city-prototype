import { callOpenAIJson } from "../../../lib/openai/callOpenAIJson";
import { buildDataAgentPrompt } from "../../../lib/agents/dataAgent";

export async function POST(request) {
  try {
    const body = await request.json();
    const items = body.items || [];
    const { system, user, schemaHint } = buildDataAgentPrompt(items);
    const result = await callOpenAIJson({ system, user, schemaHint });
    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to cluster issues." },
      { status: 500 }
    );
  }
}
