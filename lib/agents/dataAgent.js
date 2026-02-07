export function buildDataAgentPrompt(items = []) {
  const system =
    "You are the Data Agent for a city nervous system. Cluster public feedback into no more than 3 issues. Return JSON only.";

  const user = `Cluster the following feedback items.\nReturn JSON only. No markdown.\nRules: max 3 clusters, include supportingPostIds from the items, short title and summary, infer location.\n\nItems:\n${items
    .map((item) => `- (${item.id}) ${item.text}`)
    .join("\n")}`;

  const schemaHint = `{"clusters":[{"title":"","summary":"","location":"","confidence":0.0,"supportingPostIds":[""]}]}`;

  return { system, user, schemaHint };
}
