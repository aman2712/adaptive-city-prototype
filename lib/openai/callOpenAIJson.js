import client from "./client";

function extractJson(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return null;
  return text.slice(firstBrace, lastBrace + 1);
}

export async function callOpenAIJson({ system, user, schemaHint }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }
  const prompt = schemaHint ? `${user}\n\nSchema hint: ${schemaHint}` : user;
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    text: {
      format: { type: "json_object" },
    },
  });

  const outputText =
    response.output_text ||
    response.output?.[0]?.content?.[0]?.text ||
    response.output?.[0]?.content?.[0]?.value ||
    "";
  try {
    return JSON.parse(outputText);
  } catch (error) {
    const extracted = extractJson(outputText);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch (innerError) {
        throw new Error(`Failed to parse JSON: ${innerError.message}`);
      }
    }
    throw new Error("Model did not return valid JSON.");
  }
}
