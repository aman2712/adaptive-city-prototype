"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StepperRail from "../../components/StepperRail";
import ErrorToast from "../../components/ErrorToast";
import { useCityStore } from "../../store/useCityStore";
import { generateFeedbackItem } from "../../lib/sim/feedback";
import { makeId } from "../../lib/utils";

export default function CollectPage() {
  const router = useRouter();
  const rawFeedback = useCityStore((state) => state.rawFeedback);
  const clusters = useCityStore((state) => state.clusters);
  const selectedClusterId = useCityStore((state) => state.selectedClusterId);
  const addFeedback = useCityStore((state) => state.addFeedback);
  const setClusters = useCityStore((state) => state.setClusters);
  const selectCluster = useCityStore((state) => state.selectCluster);
  const resetAll = useCityStore((state) => state.resetAll);

  const [streaming, setStreaming] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [error, setError] = useState("");
  const [autoStatus, setAutoStatus] = useState("idle");
  const [targetCount, setTargetCount] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [intakeCounts, setIntakeCounts] = useState({
    reddit: 0,
    facebook: 0,
    blog: 0,
  });
  const [otherCounts, setOtherCounts] = useState({
    hotline: 0,
    sensors: 0,
    municipal: 0,
  });
  const [expandedClusterId, setExpandedClusterId] = useState(null);
  const collectedRef = useRef([]);

  const pickChannel = (source) => {
    if (source === "social") return Math.random() < 0.55 ? "reddit" : "facebook";
    if (source === "news") return "blog";
    return Math.random() < 0.6 ? "blog" : "reddit";
  };

  const runClustering = useCallback(async (itemsOverride) => {
    const items = itemsOverride || collectedRef.current || [];
    if (items.length === 0) return;
    setIsClustering(true);
    setAutoStatus("clustering");
    setError("");
    try {
      const res = await fetch("/api/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Cluster failed");
      const mapped = (json.data.clusters || []).slice(0, 3).map((cluster) => ({
        id: makeId("cluster"),
        title: cluster.title,
        summary: cluster.summary,
        location: cluster.location,
        confidence: Math.min(Math.max(Number(cluster.confidence) || 0.7, 0.45), 0.98),
        supportingPostIds: Array.isArray(cluster.supportingPostIds)
          ? cluster.supportingPostIds
          : [],
        createdAt: new Date().toISOString(),
      }));
      setClusters(mapped);
      selectCluster(null);
      setAutoStatus("ready");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsClustering(false);
    }
  }, [setClusters, selectCluster]);

  useEffect(() => {
    if (!streaming) return;
    let cancelled = false;
    let timeoutId;

    const schedule = () => {
      if (cancelled) return;
      const baseItem = generateFeedbackItem();
      const channel = pickChannel(baseItem.source);
      const newItem = { ...baseItem, channel };
      collectedRef.current.push(newItem);
      addFeedback(newItem);
      setIntakeCounts((prev) => ({ ...prev, [channel]: prev[channel] + 1 }));
      if (Math.random() < 0.6) {
        const otherKeys = ["hotline", "sensors", "municipal"];
        const key = otherKeys[Math.floor(Math.random() * otherKeys.length)];
        setOtherCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
      }
      setTotalCount((prev) => {
        const next = prev + 1;
        if (next >= targetCount) {
          setStreaming(false);
          setTimeout(() => runClustering(collectedRef.current), 300);
        }
        return next;
      });
      const nextDelay = 250 + Math.random() * 600;
      timeoutId = setTimeout(schedule, nextDelay);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [streaming, addFeedback, targetCount, runClustering]);

  const handleStart = () => {
    setClusters([]);
    selectCluster(null);
    setExpandedClusterId(null);
    setTotalCount(0);
    setIntakeCounts({ reddit: 0, facebook: 0, blog: 0 });
    setOtherCounts({ hotline: 0, sensors: 0, municipal: 0 });
    setAutoStatus("collecting");
    setTargetCount(50);
    collectedRef.current = [];
    setStreaming(true);
  };

  const handleContinue = () => {
    if (selectedClusterId) {
      router.push("/solutions");
    }
  };

  const displayClusters = clusters.slice(0, 3);
  const progress = targetCount ? Math.min(totalCount / targetCount, 1) : 0;

  return (
    <main className="min-h-screen bg-shell text-white">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <StepperRail activeIds={["data"]} />
      <div className="min-h-screen px-6 pb-12 pt-28 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Data Agent</div>
                <h1 className="text-3xl font-semibold text-slate-100">Live Collection</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    router.push("/");
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Reset Demo
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={streaming}
                  className="btn btn-primary btn-sm disabled:opacity-60"
                >
                  {streaming ? "Collecting..." : "Start Collection"}
                </button>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[0.65fr_0.35fr]">
              <section className="card flex flex-col gap-5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Signal Intake</div>
                    <h2 className="text-lg font-semibold text-slate-100">Live Signal Summary</h2>
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Signals captured</div>
                    <div className="text-3xl font-semibold text-slate-100">{totalCount}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Target intake <span className="font-mono text-slate-300">{targetCount}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/60">
                  <div className="h-full bg-blue-500/40" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { key: "reddit", label: "Reddit posts", count: intakeCounts.reddit },
                    { key: "facebook", label: "Facebook chatter", count: intakeCounts.facebook },
                    { key: "blog", label: "Blog articles", count: intakeCounts.blog },
                  ].map((item) => (
                    <div key={item.key} className="card-soft p-4">
                      <div className="text-xs uppercase tracking-wider text-slate-500">{item.label}</div>
                      <div className="mt-2 text-xl font-semibold text-slate-100">{item.count}</div>
                    </div>
                  ))}
                  <div className="card-soft p-4">
                    <div className="text-xs uppercase tracking-wider text-slate-500">Other Sources</div>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Service hotline</span>
                        <span className="font-mono text-slate-100">{otherCounts.hotline}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>IoT sensors</span>
                        <span className="font-mono text-slate-100">{otherCounts.sensors}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Municipal logs</span>
                        <span className="font-mono text-slate-100">{otherCounts.municipal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card flex flex-col gap-4 p-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Auto Analysis</div>
                  <h2 className="text-lg font-semibold text-slate-100">System Status</h2>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  {[
                    { id: "collecting", label: "Collecting signals" },
                    { id: "clustering", label: "Auto clustering" },
                    { id: "ready", label: "Issues ready" },
                  ].map((step) => {
                    const active = autoStatus === step.id || (step.id === "collecting" && streaming);
                    return (
                      <div key={step.id} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                        <span className={`h-2 w-2 rounded-full ${active ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]" : "bg-slate-600"}`} />
                        <span className={active ? "text-slate-100" : "text-slate-500"}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-auto rounded-lg border border-dashed border-slate-800 p-3 text-xs text-slate-500">
                  {streaming && "Auto-stop enabled. Clustering will begin once intake threshold is met."}
                  {!streaming && !isClustering && autoStatus === "idle" && "Start the intake to begin."}
                  {isClustering && "Clustering in progress..."}
                  {!isClustering && autoStatus === "ready" && "Top issues generated."}
                </div>
              </section>
            </div>

            <section className="card flex flex-col gap-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Major Problems Affecting Abu Dhabi</div>
                  <h2 className="text-lg font-semibold text-slate-100">Derived from live intake</h2>
                </div>
                <div className="text-xs text-slate-500">Showing {displayClusters.length} of 3</div>
              </div>

              {displayClusters.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  {isClustering ? (
                    <div className="space-y-3">
                      <div className="loading-shimmer h-4 w-40 rounded-lg" />
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="loading-shimmer h-28 w-full rounded-lg" />
                        <div className="loading-shimmer h-28 w-full rounded-lg" />
                        <div className="loading-shimmer h-28 w-full rounded-lg" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Awaiting clustered problems.</div>
                  )}
                </div>
              )}

              {displayClusters.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  {displayClusters.map((cluster) => {
                    const supportingPosts = rawFeedback
                      .filter((item) => (cluster.supportingPostIds || []).includes(item.id))
                      .slice(0, 4);
                    const isExpanded = expandedClusterId === cluster.id;
                    return (
                      <div key={cluster.id} className={`card-soft p-5 ${cluster.id === selectedClusterId ? "card-active" : ""}`}>
                        <button type="button" onClick={() => selectCluster(cluster.id)} className="w-full text-left">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-wider text-slate-500">Issue</div>
                              <h3 className="text-lg font-semibold text-slate-100">{cluster.title}</h3>
                              <p className="mt-1 text-sm text-slate-400">{cluster.summary}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                              <div className="badge badge-info">{cluster.location}</div>
                              <div className="badge badge-accent">Confidence {Math.round(cluster.confidence * 100)}%</div>
                            </div>
                          </div>
                        </button>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span>{cluster.supportingPostIds.length} supporting signals</span>
                          <button
                            type="button"
                            onClick={() => setExpandedClusterId(isExpanded ? null : cluster.id)}
                            className="text-xs uppercase tracking-wider text-blue-300"
                          >
                            {isExpanded ? "Hide signal trace" : "View signal trace"}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 grid gap-2">
                            {supportingPosts.length === 0 && (
                              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-500">
                                Signals are being indexed.
                              </div>
                            )}
                            {supportingPosts.map((post) => (
                              <div key={post.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-200">
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                                  <span>{post.channel || post.source}</span>
                                  <span className="font-mono">{new Date(post.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <p className="mt-2 text-slate-300">{post.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedClusterId}
                className="btn btn-primary btn-sm self-end disabled:opacity-50"
              >
                Continue
              </button>
            </section>
        </div>
      </div>
      <ErrorToast message={error} onRetry={() => runClustering(collectedRef.current)} onDismiss={() => setError("")} />
    </main>
  );
}
