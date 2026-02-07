"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepperRail from "../../components/StepperRail";
import Badge from "../../components/Badge";
import ErrorToast from "../../components/ErrorToast";
import LanguageToggle from "../../components/LanguageToggle";
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
  const [expandedCards, setExpandedCards] = useState({
    finance: false,
    regulatory: false,
    operations: false,
  });

  const formatValue = useCallback((value) => {
    if (Array.isArray(value)) return value.join(" | ");
    if (value && typeof value === "object") {
      return Object.values(value)
        .flat()
        .filter(Boolean)
        .map((item) => String(item))
        .join(" | ");
    }
    return value ?? "";
  }, []);

  const safeText = useCallback((value) => {
    if (value == null) return "";
    if (Array.isArray(value) || typeof value === "object") return formatValue(value);
    return String(value);
  }, [formatValue]);

  const toClauses = useCallback((value) => {
    const text = safeText(value);
    if (!text) return "";
    const parts = text.split(/\s*[;|,]\s*/).filter(Boolean);
    return parts.length > 1 ? parts.join(" · ") : text;
  }, [safeText]);

  const firstOrFallback = (items, fallback = "Pending") => {
    if (!Array.isArray(items) || items.length === 0) return fallback;
    return safeText(items[0]) || fallback;
  };

  const restItems = (items) => (Array.isArray(items) ? items.slice(1).map(safeText) : []);

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
  const verdict = useMemo(() => {
    const rec = safeText(feasibilityPack?.synthesized?.recommended).toLowerCase();
    if (rec.includes("feasible") || rec.includes("proceed") || rec.includes("approve")) return "Feasible";
    if (rec.includes("risk") || rec.includes("caution")) return "Moderate Risk";
    return "High Confidence";
  }, [feasibilityPack?.synthesized?.recommended, safeText]);

  return (
    <main className="min-h-screen bg-shell text-white">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <StepperRail activeIds={["finance", "regulatory", "ops"]} />
      <div className="min-h-screen px-6 pb-12 pt-28 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <header className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Feasibility Trio</div>
                <h1 className="text-3xl font-semibold text-slate-100">Finance, Regulatory, Ops</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LanguageToggle />
                <Badge label="Parallel Run" variant="accent" />
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { id: "finance", title: "Finance", variant: "accent" },
                { id: "regulatory", title: "Regulatory", variant: "regulatory" },
                { id: "operations", title: "Operations", variant: "info" },
              ].map((card, index) => {
                const data = feasibilityPack?.[card.id];
                const isLoading = loading[card.id];
                const isExpanded = expandedCards[card.id];
                return (
                  <div
                    key={card.id}
                    className={`card group flex flex-col gap-3 p-4 ${showConnectors && index < 2 ? "connector" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-100">{card.title}</div>
                      {isLoading ? <Badge label="Working" variant={card.variant} /> : <Badge label="Ready" variant="success" />}
                    </div>
                    {showConnectors && (
                      <div className={`comms-text comms-delay-${index}`}>Signal routing</div>
                    )}
                    {!data && (
                      <div className="rounded-lg border border-dashed border-slate-800 p-3 text-xs text-slate-500">
                        {isLoading ? "Analyzing..." : "Awaiting run."}
                      </div>
                    )}
                    {data && (
                      <div className="space-y-3 text-xs text-slate-200">
                        {card.id === "finance" && (
                          <>
                            <div className="card-soft p-3">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Cost Range</div>
                              <div className="mt-1 text-sm text-slate-100">{safeText(data.costRange)}</div>
                            </div>
                            <div className="card-soft p-3">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Funding Strategy</div>
                              <div className="mt-1 text-xs text-slate-200">
                                {firstOrFallback(data.fundingNotes, "Funding plan pending.")}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="space-y-2">
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Tradeoffs</div>
                                  <div className="mt-2 space-y-2 text-xs text-slate-200">
                                    {data.tradeoffs?.length ? (
                                      data.tradeoffs.map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {safeText(item)}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No tradeoffs listed.</div>
                                    )}
                                  </div>
                                </div>
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Additional Notes</div>
                                  <div className="mt-2 space-y-2 text-xs text-slate-200">
                                    {restItems(data.fundingNotes).length ? (
                                      restItems(data.fundingNotes).map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {item}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No additional notes.</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {card.id === "regulatory" && (
                          <>
                            <div className="card-soft p-3">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Primary Constraint</div>
                              <div className="mt-1 text-xs text-slate-200">
                                {firstOrFallback(data.constraints, "No major constraints flagged.")}
                              </div>
                            </div>
                            <div className="card-soft p-3">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Primary Approval</div>
                              <div className="mt-1 text-xs text-slate-200">
                                {firstOrFallback(data.approvals, "Approval path pending.")}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="space-y-2">
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Constraints</div>
                                  <div className="mt-2 space-y-2">
                                    {restItems(data.constraints).length ? (
                                      restItems(data.constraints).map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {item}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No additional constraints.</div>
                                    )}
                                  </div>
                                </div>
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Approvals</div>
                                  <div className="mt-2 space-y-2">
                                    {restItems(data.approvals).length ? (
                                      restItems(data.approvals).map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {item}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No additional approvals.</div>
                                    )}
                                  </div>
                                </div>
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Regulatory Risks</div>
                                  <div className="mt-2 space-y-2">
                                    {data.risks?.length ? (
                                      data.risks.map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {safeText(item)}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No regulatory risks listed.</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {card.id === "operations" && (
                          <>
                            <div className="card-soft p-3">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Timeline</div>
                              <div className="mt-1 text-sm text-slate-100">{safeText(data.timeline)}</div>
                            </div>
                            <div className="card-soft p-3">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Key Dependency</div>
                              <div className="mt-1 text-xs text-slate-200">
                                {firstOrFallback(data.dependencies, "Dependencies under review.")}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="space-y-2">
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Staffing</div>
                                  <div className="mt-2 space-y-2">
                                    {data.staffing?.length ? (
                                      data.staffing.map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {safeText(item)}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No staffing notes listed.</div>
                                    )}
                                  </div>
                                </div>
                                <div className="card-soft p-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Dependencies</div>
                                  <div className="mt-2 space-y-2">
                                    {restItems(data.dependencies).length ? (
                                      restItems(data.dependencies).map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1">
                                          {item}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-slate-500">No additional dependencies.</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => runAgent(card.id)}
                      className="btn btn-secondary btn-xs mt-auto translate-y-1 opacity-0 pointer-events-none transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto"
                    >
                      Re-run {card.title}
                    </button>
                    {data && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCards((prev) => ({
                            ...prev,
                            [card.id]: !prev[card.id],
                          }))
                        }
                        className="text-[11px] font-medium text-slate-400 hover:text-slate-200"
                      >
                        {isExpanded ? "Hide details" : "View details"}
                      </button>
                    )}
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
                <div className="flex items-center gap-2">
                  <Badge label={verdict} variant="info" />
                  {loading.synthesis && <Badge label="Synthesizing" variant="accent" />}
                </div>
              </div>
              {!feasibilityPack?.synthesized && (
                <div className="rounded-xl border border-dashed border-slate-800 p-6 text-sm text-slate-500">
                  {loading.synthesis ? "Synthesizing..." : "Awaiting synthesis."}
                </div>
              )}
              {feasibilityPack?.synthesized && (
                <div className="space-y-6 text-xs text-slate-200">
                  <div className="card-soft border border-blue-500/30 bg-blue-500/5 p-4 shadow-[0_0_18px_rgba(59,130,246,0.15)]">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider text-blue-200">System Recommendation</div>
                      <Badge label="High Confidence" variant="accent" />
                    </div>
                    <p className="mt-2 text-sm text-slate-100">{toClauses(feasibilityPack.synthesized.recommended)}</p>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const risks = Array.isArray(feasibilityPack.synthesized.keyRisks)
                        ? feasibilityPack.synthesized.keyRisks
                        : [feasibilityPack.synthesized.keyRisks].filter(Boolean);
                      const mitigations = Array.isArray(feasibilityPack.synthesized.mitigation)
                        ? feasibilityPack.synthesized.mitigation
                        : [feasibilityPack.synthesized.mitigation].filter(Boolean);
                      const max = Math.max(risks.length, mitigations.length, 1);
                      return Array.from({ length: max }).map((_, idx) => (
                        <div key={`pair-${idx}`} className="card-soft p-3">
                          <div className="flex flex-col gap-2 text-xs text-slate-200">
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500">Risk</span>
                              <span className="text-slate-100">{toClauses(risks[idx] || "Pending risk review.")}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500">Mitigation</span>
                              <span className="text-slate-200">{toClauses(mitigations[idx] || "Mitigation in design.")}</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <div className="w-full text-[11px] uppercase tracking-wider text-slate-500">
                  Human review required before execution
                </div>
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
      <ErrorToast message={error} onRetry={runSynthesis} onDismiss={() => setError("")} />
    </main>
  );
}
