"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepperRail from "../../components/StepperRail";
import Accordion from "../../components/Accordion";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ErrorToast from "../../components/ErrorToast";
import LanguageToggle from "../../components/LanguageToggle";
import { useCityStore } from "../../store/useCityStore";
import { buildInitialMemo } from "../../lib/agents/memoBuilder";
import { normalizePlan, toStringArray } from "../../lib/utils";

const rejectionReasons = [
  "Too expensive",
  "Not feasible",
  "Too generic",
  "Other",
];

export default function SolutionsPage() {
  const router = useRouter();
  const hasHydrated = useCityStore((state) => state.hasHydrated);
  const clusters = useCityStore((state) => state.clusters);
  const selectedClusterId = useCityStore((state) => state.selectedClusterId);
  const problemBrief = useCityStore((state) => state.problemBrief);
  const solutionPlan = useCityStore((state) => state.solutionPlan);
  const rawFeedback = useCityStore((state) => state.rawFeedback);
  const setProblemBrief = useCityStore((state) => state.setProblemBrief);
  const setSolutionPlan = useCityStore((state) => state.setSolutionPlan);
  const setPolicyMemo = useCityStore((state) => state.setPolicyMemo);
  const setSolutionsApproved = useCityStore((state) => state.setSolutionsApproved);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState(rejectionReasons[0]);
  const [customReason, setCustomReason] = useState("");

  const normalizedSolutionPlan = useMemo(() => {
    if (!solutionPlan) return null;
    return {
      ...solutionPlan,
      departments: toStringArray(solutionPlan.departments),
      plan: normalizePlan(solutionPlan.plan),
      kpis: toStringArray(solutionPlan.kpis),
      risks: toStringArray(solutionPlan.risks),
      assumptions: toStringArray(solutionPlan.assumptions),
    };
  }, [solutionPlan]);

  const normalizedProblemBrief = useMemo(() => {
    if (!problemBrief) return null;
    return {
      ...problemBrief,
      whoIsAffected: toStringArray(problemBrief.whoIsAffected),
      evidenceQuotes: toStringArray(problemBrief.evidenceQuotes),
    };
  }, [problemBrief]);

  const cluster = useMemo(
    () => clusters.find((item) => item.id === selectedClusterId),
    [clusters, selectedClusterId]
  );

  const supportingPosts = useMemo(() => {
    if (!cluster) return rawFeedback.slice(-8);
    const ids = new Set(cluster.supportingPostIds || []);
    const filtered = rawFeedback.filter((item) => ids.has(item.id));
    return filtered.length > 0 ? filtered : rawFeedback.slice(-10);
  }, [cluster, rawFeedback]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!selectedClusterId) {
      router.replace("/collect");
    }
  }, [hasHydrated, selectedClusterId, router]);

  const runSolutions = useCallback(
    async (revisionNotes = "") => {
      if (!cluster) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/solutions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cluster,
            posts: supportingPosts,
            revisionNotes,
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Solutions failed");
        const nextVersion = (solutionPlan?.version || 0) + 1;
        const problem = json.data.problemBrief || {};
        const normalizedProblem = {
          whatIsHappening: problem.whatIsHappening || "Pending synthesis.",
          where: problem.where || cluster.location || "Unknown",
          when: problem.when || "Recent",
          whoIsAffected: toStringArray(problem.whoIsAffected),
          whyItMatters: problem.whyItMatters || "Requires review.",
          evidenceQuotes: toStringArray(problem.evidenceQuotes),
        };
        const plan = json.data.solutionPlan || {};
        const normalizedPlan = {
          posture: plan.posture || "monitor",
          departments: toStringArray(plan.departments),
          plan: normalizePlan(plan.plan),
          kpis: toStringArray(plan.kpis),
          risks: toStringArray(plan.risks),
          assumptions: toStringArray(plan.assumptions),
        };
        setProblemBrief(normalizedProblem);
        setSolutionPlan({ ...normalizedPlan, version: nextVersion, issueId: cluster.id });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [cluster, setProblemBrief, setSolutionPlan, solutionPlan?.version, supportingPosts]
  );

  useEffect(() => {
    if (!cluster) return;
    if (!problemBrief || !solutionPlan) {
      runSolutions();
    }
  }, [cluster, problemBrief, solutionPlan, runSolutions]);

  const handleApprove = () => {
    if (!cluster || !normalizedProblemBrief || !normalizedSolutionPlan) return;
    const memo = buildInitialMemo({
      cluster,
      problemBrief: normalizedProblemBrief,
      solutionPlan: normalizedSolutionPlan,
    });
    setPolicyMemo(memo);
    setSolutionsApproved(true);
    router.push("/feasibility");
  };

  const handleReject = () => {
    setModalOpen(true);
  };

  const handleSubmitReject = async () => {
    const notes = reason === "Other" ? customReason : reason;
    setModalOpen(false);
    await runSolutions(notes);
  };

  return (
    <main className="min-h-screen bg-shell text-white">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="flex min-h-screen">
        <StepperRail activeIds={["solutions"]} />
        <div className="flex-1 px-6 py-12 md:px-10">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <header className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Solutions Agent</div>
                <h1 className="text-3xl font-semibold text-slate-100">Problem Brief + Plan</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LanguageToggle />
                {normalizedSolutionPlan?.version && (
                  <Badge label={`v${normalizedSolutionPlan.version}`} variant="accent" />
                )}
              </div>
            </header>

            <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <section className="card-soft flex flex-col gap-4 border border-slate-800/60 bg-slate-900/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Problem Brief</div>
                    <h2 className="text-lg font-semibold text-slate-200">{cluster?.title || "Loading"}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge label={cluster?.location || "Abu Dhabi"} variant="info" />
                    {normalizedSolutionPlan?.posture && (
                      <Badge label={normalizedSolutionPlan.posture} variant="neutral" />
                    )}
                  </div>
                </div>
                {!normalizedProblemBrief && (
                  <div className="rounded-xl border border-dashed border-slate-800 p-6 text-sm text-slate-500">
                    {loading ? "Synthesizing brief..." : "Awaiting brief."}
                  </div>
                )}
                {normalizedProblemBrief && (
                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="text-xs uppercase tracking-wider text-slate-500">Situation</div>
                      <p className="mt-2 text-sm text-slate-200">{normalizedProblemBrief.whatIsHappening}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Where</div>
                        <p className="text-sm text-slate-200">{normalizedProblemBrief.where}</p>
                      </div>
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">When</div>
                        <p className="text-sm text-slate-200">{normalizedProblemBrief.when}</p>
                      </div>
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Who</div>
                        <p className="text-sm text-slate-200">{normalizedProblemBrief.whoIsAffected.join(", ")}</p>
                      </div>
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Why</div>
                        <p className="text-sm text-slate-200">{normalizedProblemBrief.whyItMatters}</p>
                      </div>
                    </div>
                  </div>
                )}
                <Accordion title="Signal Trace" items={normalizedProblemBrief?.evidenceQuotes || []} />
              </section>

              <section className="card card-active flex flex-col gap-6 p-6 shadow-xl shadow-black/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Solution Plan</div>
                    <h2 className="text-xl font-semibold text-slate-100">Action Plan</h2>
                  </div>
                  {normalizedSolutionPlan?.posture && (
                    <Badge label={normalizedSolutionPlan.posture} variant="success" />
                  )}
                </div>

                {!normalizedSolutionPlan && (
                  <div className="rounded-xl border border-dashed border-slate-800 p-6 text-sm text-slate-500">
                    {loading ? "Designing plan..." : "Awaiting plan."}
                  </div>
                )}
                {normalizedSolutionPlan && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {normalizedSolutionPlan.departments.map((dept) => (
                        <span
                          key={dept}
                          className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-200"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                      {[
                        { id: "immediate", label: "Immediate", items: normalizedSolutionPlan.plan.immediate },
                        { id: "days30", label: "30 Days", items: normalizedSolutionPlan.plan.days30 },
                        { id: "days90", label: "90 Days", items: normalizedSolutionPlan.plan.days90 },
                      ].map((phase) => (
                        <div key={phase.id} className="card-soft p-4">
                          <div className="text-xs uppercase tracking-wider text-slate-500">{phase.label}</div>
                          <div className="mt-3 space-y-2 text-xs text-slate-200">
                            {phase.items.length === 0 && (
                              <div className="text-slate-500">Pending actions.</div>
                            )}
                            {phase.items.map((item) => (
                              <div key={item} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400/70" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">KPIs</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {normalizedSolutionPlan.kpis.map((item) => (
                            <span
                              key={item}
                              className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-100"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Risks</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {normalizedSolutionPlan.risks.map((item) => (
                            <span
                              key={item}
                              className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-100"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="card-soft p-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Assumptions</div>
                        <div className="mt-3 space-y-2 text-xs text-slate-300">
                          {normalizedSolutionPlan.assumptions.length === 0 && (
                            <div className="text-slate-500">No assumptions listed.</div>
                          )}
                          {normalizedSolutionPlan.assumptions.map((item) => (
                            <div key={item} className="rounded-md border border-slate-800 bg-slate-900/50 px-2.5 py-1">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={!normalizedSolutionPlan || !normalizedProblemBrief}
                    className="btn btn-primary btn-sm disabled:opacity-60"
                  >
                    Approve Plan
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!normalizedSolutionPlan || !normalizedProblemBrief || loading}
                    className="btn btn-danger btn-sm disabled:opacity-60"
                  >
                    Reject Plan
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Modal open={modalOpen} title="Revise Plan" onClose={() => setModalOpen(false)}>
        <div className="grid gap-2">
          {rejectionReasons.map((option) => (
            <label key={option} className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="radio"
                name="reason"
                value={option}
                checked={reason === option}
                onChange={() => setReason(option)}
              />
              {option}
            </label>
          ))}
        </div>
        {reason === "Other" && (
          <textarea
            value={customReason}
            onChange={(event) => setCustomReason(event.target.value)}
            className="input-base w-full min-h-[90px] text-xs"
            placeholder="Add revision notes"
          />
        )}
        <button
          type="button"
          onClick={handleSubmitReject}
          className="btn btn-primary btn-sm"
        >
          Re-run Solutions Agent
        </button>
      </Modal>
      <ErrorToast message={error} onRetry={() => runSolutions("Retry") } onDismiss={() => setError("")} />
    </main>
  );
}
