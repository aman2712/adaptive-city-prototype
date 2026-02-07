import AgentGlyph from "./AgentGlyph";

const steps = [
  { id: "data", label: "Data" },
  { id: "solutions", label: "Solutions" },
  { id: "finance", label: "Finance" },
  { id: "regulatory", label: "Regulatory" },
  { id: "ops", label: "Ops" },
];

export default function StepperRail({ activeIds = [] }) {
  return (
    <aside className="rail no-print w-full border-b border-slate-800 px-4 py-4 md:w-24 md:border-b-0 md:border-r md:px-0 md:py-10">
      <div className="flex items-center justify-between md:flex-col md:gap-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 md:mb-2">Agents</div>
        <div className="flex w-full items-center justify-between gap-4 md:flex-col md:justify-start">
          {steps.map((step) => {
            const active = activeIds.includes(step.id);
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 text-center">
                <div
                  className={`stepper-step flex h-10 w-10 items-center justify-center rounded-xl border text-slate-400 ${
                    active
                      ? "active border-blue-500/40 bg-blue-500/10 text-blue-300 data-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "border-slate-800 bg-slate-900/60"
                  }`}
                >
                  <AgentGlyph type={step.id} className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${active ? "text-blue-300" : "text-slate-500"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
