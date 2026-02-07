"use client";

import { useState } from "react";

const sectionLabels = {
  executiveSummary: "Executive Summary",
  problem: "Problem",
  recommendation: "Recommendation",
  evidence: "Evidence",
  plan: "Plan",
  feasibility: "Feasibility",
  kpis: "KPIs",
  risks: "Risks",
  timelineOwners: "Timeline & Owners",
};

function splitLines(value) {
  if (!value) return [];
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function MemoRenderer({ memo, highlightedSections = [] }) {
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  if (!memo) return null;
  const formatSection = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map((item) => String(item)).join("\n");
    if (value && typeof value === "object") {
      return Object.values(value)
        .flat()
        .filter(Boolean)
        .map((item) => String(item))
        .join("\n");
    }
    return value ? String(value) : "";
  };
  const evidenceLines = splitLines(memo.sections.evidence);
  const evidenceVisible = evidenceExpanded ? evidenceLines : evidenceLines.slice(0, 2);

  return (
    <div className="memo-paper flex h-full flex-col gap-5 overflow-hidden p-6">
      <div>
        <div className="memo-header-line">Policy Memo</div>
        <h2 className="text-2xl font-semibold text-slate-900">{memo.title}</h2>
        <div className="mt-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Status:</span> Human-approved · Agent-assisted
          <span className="mx-2 text-slate-400">|</span>
          <span className="font-medium text-slate-700">Posture:</span> Proactive
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto pr-2 text-sm text-slate-700">
        {Object.keys(sectionLabels).map((key) => (
          <section
            key={key}
            className={`memo-section space-y-2 border border-slate-200 bg-white p-4 ${
              highlightedSections.includes(key) ? "highlight" : ""
            } ${key === "executiveSummary" ? "border-blue-500/40 bg-blue-50/60" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${key === "executiveSummary" ? "text-slate-900" : "text-slate-800"}`}>
                {sectionLabels[key]}
              </h3>
              {key === "executiveSummary" && (
                <span className="rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-700">
                  Decision Summary
                </span>
              )}
            </div>
            {key === "evidence" ? (
              <div className="space-y-2 text-xs text-slate-600">
                {evidenceVisible.map((line) => (
                  <div key={line} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                    {line}
                  </div>
                ))}
                {evidenceLines.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setEvidenceExpanded((prev) => !prev)}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                  >
                    {evidenceExpanded
                      ? "Show less"
                      : `+${evidenceLines.length - 2} more evidence point${evidenceLines.length - 2 === 1 ? "" : "s"}`}
                  </button>
                )}
              </div>
            ) : (
              <p className={`whitespace-pre-line text-xs ${key === "executiveSummary" ? "text-slate-800" : "text-slate-600"}`}>
                {formatSection(memo.sections[key])}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
