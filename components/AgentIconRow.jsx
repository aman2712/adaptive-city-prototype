import AgentGlyph from "./AgentGlyph";

const agents = [
  { id: "data", label: "Data" },
  { id: "solutions", label: "Solutions" },
  { id: "finance", label: "Finance" },
  { id: "regulatory", label: "Regulatory" },
  { id: "ops", label: "Ops" },
];

export default function AgentIconRow() {
  return (
    <div className="flex flex-wrap gap-3">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-200">
            <AgentGlyph type={agent.id} className="h-4 w-4" />
          </span>
          {agent.label}
        </div>
      ))}
    </div>
  );
}
