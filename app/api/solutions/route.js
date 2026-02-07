import { callOpenAIJson } from "../../../lib/openai/callOpenAIJson";
import { buildSolutionsPrompt } from "../../../lib/agents/solutionsAgent";

export async function POST(request) {
  try {
    const body = await request.json();
    const { cluster, posts, revisionNotes } = body;
    const { system, user, schemaHint } = buildSolutionsPrompt({
      cluster,
      posts,
      revisionNotes,
    });
    const result = await callOpenAIJson({ system, user, schemaHint });
    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to generate solution plan." },
      { status: 500 }
    );
  }
}
