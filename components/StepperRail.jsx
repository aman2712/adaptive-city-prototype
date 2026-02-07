import AgentGlyph from "./AgentGlyph";

const steps = [
  { id: "data", label: "Data" },
  { id: "solutions", label: "Solutions" },
  { id: "finance", label: "Finance" },
  { id: "regulatory", label: "Regulatory" },
  { id: "ops", label: "Ops" },
];

export default function StepperRail({ activeIds = [] }) {
  const indices = activeIds
    .map((id) => steps.findIndex((step) => step.id === id))
    .filter((idx) => idx >= 0);
  const activeIndex = indices.length ? Math.max(...indices) : -1;

  return (
    <div className="stepper-floating no-print">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`stepper-icon ${
                  isActive ? "stepper-icon-active" : isComplete ? "stepper-icon-complete" : "stepper-icon-upcoming"
                }`}
                title={step.label}
              >
                <AgentGlyph type={step.id} className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`stepper-line ${isComplete ? "stepper-line-active" : "stepper-line-upcoming"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
