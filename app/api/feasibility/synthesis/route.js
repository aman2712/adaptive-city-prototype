import { callOpenAIJson } from "../../../../lib/openai/callOpenAIJson";
import { buildSynthesisPrompt } from "../../../../lib/agents/feasibilityAgent";

export async function POST(request) {
  try {
    const body = await request.json();
    const { finance, regulatory, operations } = body;
    const { system, user, schemaHint } = buildSynthesisPrompt({
      finance,
      regulatory,
      operations,
    });
    const result = await callOpenAIJson({ system, user, schemaHint });
    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to synthesize feasibility." },
      { status: 500 }
    );
  }
}
