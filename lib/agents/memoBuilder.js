import { makeId, normalizePlan, toStringArray } from "../utils";

export function buildInitialMemo({ cluster, problemBrief, solutionPlan }) {
  const safePlan = normalizePlan(solutionPlan.plan);
  const safeKpis = toStringArray(solutionPlan.kpis);
  const safeRisks = toStringArray(solutionPlan.risks);
  const safeQuotes = toStringArray(problemBrief.evidenceQuotes);
  return {
    id: makeId("memo"),
    issueId: cluster.id,
    title: `Policy Memo - ${cluster.title}`,
    sections: {
      executiveSummary: `${problemBrief.whatIsHappening} Coordinated action recommended under a ${solutionPlan.posture} posture.`,
      problem: `Where: ${problemBrief.where}. When: ${problemBrief.when}. Affected: ${toStringArray(problemBrief.whoIsAffected).join(", ")}.`,
      recommendation: `Lead departments: ${solutionPlan.departments.join(", ")}. Focus on rapid service stabilization and visible remediation.`,
      evidence: safeQuotes.map((quote) => `- ${quote}`).join("\n"),
      plan: `Immediate: ${safePlan.immediate.join("; ")}\n30 days: ${safePlan.days30.join("; ")}\n90 days: ${safePlan.days90.join("; ")}`,
      feasibility: "Pending feasibility review.",
      kpis: safeKpis.map((kpi) => `- ${kpi}`).join("\n"),
      risks: safeRisks.map((risk) => `- ${risk}`).join("\n"),
      timelineOwners: `Owner: City Operations Center. Weekly reporting cadence.`,
    },
    lastEditedAt: new Date().toISOString(),
    approved: {
      solutions: {
        approved: true,
        approvedAt: new Date().toISOString(),
        notes: "Approved in Solutions stage.",
      },
      feasibility: {
        approved: false,
        approvedAt: null,
        notes: "Pending feasibility approval.",
      },
    },
  };
}

export function applyFeasibilityToMemo({ memo, feasibilityPack }) {
  const updated = { ...memo };
  updated.sections = {
    ...memo.sections,
    feasibility: `Finance: ${feasibilityPack.finance.costRange}. Regulatory: ${feasibilityPack.regulatory.constraints.join("; ")}. Ops timeline: ${feasibilityPack.operations.timeline}. Synthesis: ${feasibilityPack.synthesized.recommended}.`,
    risks: `${memo.sections.risks}\n\nFeasibility risks: ${feasibilityPack.synthesized.keyRisks.join("; ")}`,
  };
  updated.lastEditedAt = new Date().toISOString();
  updated.approved = {
    ...memo.approved,
    feasibility: {
      approved: true,
      approvedAt: new Date().toISOString(),
      notes: "Approved in Feasibility stage.",
    },
  };
  return updated;
}
