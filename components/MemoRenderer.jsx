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

export default function MemoRenderer({ memo, highlightedSections = [] }) {
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
  return (
    <div className="card flex h-full flex-col gap-5 overflow-hidden bg-slate-950/50 p-6 shadow-xl shadow-black/40">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Policy Memo</div>
        <h2 className="text-2xl font-semibold text-slate-100">{memo.title}</h2>
      </div>
      <div className="space-y-4 overflow-y-auto pr-2 text-sm text-slate-200">
        {Object.keys(sectionLabels).map((key) => (
          <section
            key={key}
            className={`memo-section space-y-2 border border-slate-800 bg-slate-900/40 p-4 ${
              highlightedSections.includes(key) ? "highlight" : ""
            }`}
          >
            <h3 className="text-sm font-semibold text-slate-100">{sectionLabels[key]}</h3>
            <p className="whitespace-pre-line text-xs text-slate-300">{formatSection(memo.sections[key])}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
