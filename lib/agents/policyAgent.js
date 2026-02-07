const agentRoles = {
  leader: "Policy Leader",
  solutions: "Solutions Strategist",
  finance: "Finance Lead",
  regulatory: "Regulatory Counsel",
  ops: "Operations Lead",
};

export function buildPolicyPatchPrompt({ agent = "leader", memo, message }) {
  const system = `You are the ${agentRoles[agent] || agentRoles.leader} for a city policy memo. Keep edits concise. Return JSON only.`;

  const sections = Object.entries(memo.sections)
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
    .join("\n\n");

  const user = `Current memo sections:\n${sections}\n\nUser request: ${message}\n\nReturn JSON only. No markdown.\nOutput format:\n{reply:"short text", patches:[{section:"executiveSummary|problem|recommendation|evidence|plan|feasibility|kpis|risks|timelineOwners", action:"replace", content:"string"}]}\nOnly include patches that change content. Keep reply short.`;

  const schemaHint = `{"reply":"","patches":[{"section":"executiveSummary","action":"replace","content":""}]}`;

  return { system, user, schemaHint };
}
