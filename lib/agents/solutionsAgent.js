export function buildSolutionsPrompt({ cluster, posts = [], revisionNotes = "" }) {
  const system =
    "You are the Solutions Agent for a city nervous system. Produce a concise problem brief and solution plan. Return JSON only.";

  const revisionBlock = revisionNotes
    ? `\nUser revision notes: ${revisionNotes}\nMake changes accordingly.`
    : "";

  const user = `Issue cluster: ${cluster.title} (${cluster.location})\nSummary: ${cluster.summary}\n\nSupporting signals:\n${posts
    .map((post) => `- ${post.text}`)
    .join("\n")}\n\nReturn JSON only. No markdown.\nOutput must include:\nproblemBrief:{whatIsHappening,where,when,whoIsAffected:[...],whyItMatters,evidenceQuotes:[...]}\nsolutionPlan:{posture,departments:[...],plan:{immediate:[...],days30:[...],days90:[...]},kpis:[...],risks:[...],assumptions:[...]}\nKeep bullets short (max 5 each).${revisionBlock}`;

  const schemaHint = `{"problemBrief":{"whatIsHappening":"","where":"","when":"","whoIsAffected":[""],"whyItMatters":"","evidenceQuotes":[""]},"solutionPlan":{"posture":"monitor","departments":[""],"plan":{"immediate":[""],"days30":[""],"days90":[""]},"kpis":[""],"risks":[""],"assumptions":[""]}}`;

  return { system, user, schemaHint };
}
