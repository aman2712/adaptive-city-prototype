"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepperRail from "../../components/StepperRail";
import Badge from "../../components/Badge";
import ErrorToast from "../../components/ErrorToast";
import { useCityStore } from "../../store/useCityStore";
import { applyFeasibilityToMemo } from "../../lib/agents/memoBuilder";

export default function FeasibilityPage() {
  const router = useRouter();
  const hasHydrated = useCityStore((state) => state.hasHydrated);
  const clusters = useCityStore((state) => state.clusters);
  const selectedClusterId = useCityStore((state) => state.selectedClusterId);
  const problemBrief = useCityStore((state) => state.problemBrief);
  const solutionPlan = useCityStore((state) => state.solutionPlan);
  const solutionsApproved = useCityStore((state) => state.solutionsApproved);
  const feasibilityPack = useCityStore((state) => state.feasibilityPack);
  const policyMemo = useCityStore((state) => state.policyMemo);
  const setFeasibilityPack = useCityStore((state) => state.setFeasibilityPack);
  const setPolicyMemo = useCityStore((state) => state.setPolicyMemo);
  const setFeasibilityApproved = useCityStore((state) => state.setFeasibilityApproved);

  const [loading, setLoading] = useState({
    finance: false,
    regulatory: false,
    operations: false,
    synthesis: false,
  });
  const [error, setError] = useState("");

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(" | ");
    if (value && typeof value === "object") {
      return Object.values(value)
        .flat()
        .filter(Boolean)
        .map((item) => String(item))
        .join(" | ");
    }
    return value ?? "";
  };

  const cluster = useMemo(
    () => clusters.find((item) => item.id === selectedClusterId),
    [clusters, selectedClusterId]
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (!solutionsApproved) {
      router.replace("/solutions");
    }
  }, [hasHydrated, solutionsApproved, router]);

  const updatePack = useCallback(
    (partial) => {
      const hasSynthesized = Object.prototype.hasOwnProperty.call(partial, "synthesized");
      setFeasibilityPack({
        issueId: cluster?.id,
        finance: partial.finance || feasibilityPack?.finance,
        regulatory: partial.regulatory || feasibilityPack?.regulatory,
        operations: partial.operations || feasibilityPack?.operations,
        synthesized: hasSynthesized ? partial.synthesized : feasibilityPack?.synthesized,
      });
    },
    [cluster?.id, feasibilityPack, setFeasibilityPack]
  );

  const runAgent = useCallback(
    async (type) => {
      if (!cluster || !problemBrief || !solutionPlan) return;
      setError("");
      setLoading((prev) => ({ ...prev, [type]: true }));
      try {
        const res = await fetch(`/api/feasibility/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cluster, problemBrief, solutionPlan }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || `Failed ${type}`);
        updatePack({ [type]: json.data, synthesized: null });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [cluster, problemBrief, solutionPlan, updatePack]
  );

  const runSynthesis = useCallback(
    async () => {
      if (!feasibilityPack?.finance || !feasibilityPack?.regulatory || !feasibilityPack?.operations) return;
      setError("");
      setLoading((prev) => ({ ...prev, synthesis: true }));
      try {
        const res = await fetch("/api/feasibility/synthesis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            finance: feasibilityPack.finance,
            regulatory: feasibilityPack.regulatory,
            operations: feasibilityPack.operations,
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Synthesis failed");
        updatePack({ synthesized: json.data });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading((prev) => ({ ...prev, synthesis: false }));
      }
    },
    [feasibilityPack?.finance, feasibilityPack?.operations, feasibilityPack?.regulatory, updatePack]
  );

  useEffect(() => {
    if (!cluster || !problemBrief || !solutionPlan) return;
    if (!feasibilityPack?.finance && !loading.finance) runAgent("finance");
    if (!feasibilityPack?.regulatory && !loading.regulatory) runAgent("regulatory");
    if (!feasibilityPack?.operations && !loading.operations) runAgent("operations");
  }, [
    cluster,
    feasibilityPack?.finance,
    feasibilityPack?.operations,
    feasibilityPack?.regulatory,
    loading.finance,
    loading.operations,
    loading.regulatory,
    problemBrief,
    runAgent,
    solutionPlan,
  ]);

  useEffect(() => {
    if (
      feasibilityPack?.finance &&
      feasibilityPack?.regulatory &&
      feasibilityPack?.operations &&
      !feasibilityPack?.synthesized &&
      !loading.synthesis
    ) {
      runSynthesis();
    }
  }, [
    feasibilityPack?.finance,
    feasibilityPack?.operations,
    feasibilityPack?.regulatory,
    feasibilityPack?.synthesized,
    loading.synthesis,
    runSynthesis,
  ]);

  const handleApprove = () => {
    if (!policyMemo || !feasibilityPack?.synthesized) return;
    const updated = applyFeasibilityToMemo({ memo: policyMemo, feasibilityPack });
    setPolicyMemo(updated);
    setFeasibilityApproved(true);
    router.push("/studio");
  };

  const showConnectors = loading.finance || loading.regulatory || loading.operations;

  return (
    <main className="min-h-screen bg-shell text-white">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="flex min-h-screen">
        <StepperRail activeIds={["finance", "regulatory", "ops"]} />
        <div className="flex-1 px-6 py-12 md:px-10">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <header className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Feasibility Trio</div>
                <h1 className="text-3xl font-semibold text-slate-100">Finance, Regulatory, Ops</h1>
              </div>
              <Badge label="Parallel Run" variant="accent" />
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { id: "finance", title: "Finance", variant: "accent" },
                { id: "regulatory", title: "Regulatory", variant: "regulatory" },
                { id: "operations", title: "Operations", variant: "info" },
              ].map((card, index) => {
                const data = feasibilityPack?.[card.id];
                const isLoading = loading[card.id];
                return (
                  <div key={card.id} className={`card flex flex-col gap-3 p-4 ${showConnectors && index < 2 ? "connector" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-100">{card.title}</div>
                      {isLoading ? <Badge label="Working" variant={card.variant} /> : <Badge label="Ready" variant="success" />}
                    </div>
                    {!data && (
                      <div className="rounded-lg border border-dashed border-slate-800 p-3 text-xs text-slate-500">
                        {isLoading ? "Analyzing..." : "Awaiting run."}
                      </div>
                    )}
                    {data && (
                      <div className="space-y-2 text-xs text-slate-200">
                        {Object.entries(data).map(([key, value]) => (
                          <div key={key} className="card-soft p-2">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">{key}</div>
                            <div className="mt-1 text-xs text-slate-200">
                              {formatValue(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => runAgent(card.id)}
                      className="btn btn-secondary btn-xs mt-auto"
                    >
                      Re-run {card.title}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="card flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Synthesis</div>
                  <h2 className="text-lg font-semibold text-slate-100">Feasibility Summary</h2>
                </div>
                {loading.synthesis && <Badge label="Synthesizing" variant="accent" />}
              </div>
              {!feasibilityPack?.synthesized && (
                <div className="rounded-xl border border-dashed border-slate-800 p-6 text-sm text-slate-500">
                  {loading.synthesis ? "Synthesizing..." : "Awaiting synthesis."}
                </div>
              )}
              {feasibilityPack?.synthesized && (
                <div className="space-y-3 text-xs text-slate-200">
                  <div className="card-soft p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommended</div>
                    <p>{feasibilityPack.synthesized.recommended}</p>
                  </div>
                  <div className="card-soft p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Key Risks</div>
                    <p>{feasibilityPack.synthesized.keyRisks.join(" | ")}</p>
                  </div>
                  <div className="card-soft p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Mitigation</div>
                    <p>{feasibilityPack.synthesized.mitigation.join(" | ")}</p>
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!feasibilityPack?.synthesized}
                  className="btn btn-primary btn-sm disabled:opacity-60"
                >
                  Approve Pack
                </button>
                <button
                  type="button"
                  onClick={runSynthesis}
                  className="btn btn-secondary btn-sm"
                >
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ErrorToast message={error} onRetry={runSynthesis} onDismiss={() => setError("")} />
    </main>
  );
}
