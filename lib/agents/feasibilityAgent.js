const baseContext = ({ cluster, problemBrief, solutionPlan }) => {
  return `Issue: ${cluster.title} (${cluster.location})\nProblem: ${problemBrief.whatIsHappening}\nPlan posture: ${solutionPlan.posture}\nDepartments: ${solutionPlan.departments.join(", ")}\nImmediate: ${solutionPlan.plan.immediate.join("; ")}\n30 days: ${solutionPlan.plan.days30.join("; ")}\n90 days: ${solutionPlan.plan.days90.join("; ")}`;
};

export function buildFinancePrompt(context) {
  const system = "You are the Finance Agent. Estimate costs and funding notes. Return JSON only.";
  const user = `${baseContext(context)}\n\nReturn JSON only. No markdown. Output: {costRange, fundingNotes:[...], tradeoffs:[...]}. Keep bullets short.`;
  const schemaHint = `{"costRange":"","fundingNotes":[""],"tradeoffs":[""]}`;
  return { system, user, schemaHint };
}

export function buildRegulatoryPrompt(context) {
  const system = "You are the Regulatory Agent. Identify approvals and constraints. Return JSON only.";
  const user = `${baseContext(context)}\n\nReturn JSON only. No markdown. Output: {constraints:[...], approvals:[...], risks:[...]}. Keep bullets short.`;
  const schemaHint = `{"constraints":[""],"approvals":[""],"risks":[""]}`;
  return { system, user, schemaHint };
}

export function buildOperationsPrompt(context) {
  const system = "You are the Operations Agent. Provide timeline, staffing, dependencies. Return JSON only.";
  const user = `${baseContext(context)}\n\nReturn JSON only. No markdown. Output: {timeline, staffing:[...], dependencies:[...]}. Keep bullets short.`;
  const schemaHint = `{"timeline":"","staffing":[""],"dependencies":[""]}`;
  return { system, user, schemaHint };
}

export function buildSynthesisPrompt({ finance, regulatory, operations }) {
  const system = "You are the Synthesis Agent. Summarize feasibility. Return JSON only.";
  const user = `Finance: ${finance.costRange}. Notes: ${finance.fundingNotes.join("; ")} Tradeoffs: ${finance.tradeoffs.join("; ")}\nRegulatory: Constraints: ${regulatory.constraints.join("; ")} Approvals: ${regulatory.approvals.join("; ")} Risks: ${regulatory.risks.join("; ")}\nOperations: Timeline: ${operations.timeline}. Staffing: ${operations.staffing.join("; ")} Dependencies: ${operations.dependencies.join("; ")}\n\nReturn JSON only. No markdown. Output: {recommended, keyRisks:[...], mitigation:[...]}. Keep bullets short.`;
  const schemaHint = `{"recommended":"","keyRisks":[""],"mitigation":[""]}`;
  return { system, user, schemaHint };
}
