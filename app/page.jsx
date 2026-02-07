"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AgentIconRow from "../components/AgentIconRow";
import LanguageToggle from "../components/LanguageToggle";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const english = useMemo(
    () => ({
      brand: "Adaptive City",
      badge: "City Nervous System",
      title: "Adaptive City - Action Intelligence",
      subtitle: "The world's first City Action Intelligence System.",
      tagline: "From public signal to coordinated civic action.",
      cta: "Experience Efficiency",
      footerLeft: "Government-grade infrastructure demo",
      footerRight: "Action Intelligence Platform",
    }),
    [],
  );

  const flowSteps = useMemo(
    () => [
      { label: "Resident Report", detail: "Issue submitted" },
      { label: "Signal Intake", detail: "We gather feedback" },
      { label: "Issue Grouping", detail: "Common problems found" },
      { label: "Action Plan", detail: "Solutions drafted" },
      { label: "Feasibility Check", detail: "Budget / rules / ops" },
      { label: "Policy Memo", detail: "Decision summary" },
      { label: "Approval", detail: "Action authorized", accent: "success" },
    ],
    [],
  );

  const copy = english;

  return (
    <main className="min-h-screen bg-shell text-white">
      <div className="hero-blobs" aria-hidden="true">
        <div className="hero-blob blob-a" />
        <div className="hero-blob blob-b" />
        <div className="hero-blob blob-c" />
      </div>
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-6 py-12 md:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-lg font-semibold text-blue-100">
              R
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold text-slate-100">Rift</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Action Intelligence
              </div>
            </div>
          </div>
          <LanguageToggle />
        </header>

        {showIntro ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
            <div className="flex max-w-3xl flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-blue-200">
                Signal-to-Signature
              </div>
              <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-100 md:text-5xl">
                We turn public feedback into coordinated city action.
              </h1>
              <p className="max-w-2xl text-sm text-slate-400">
                Collect signals, group issues, draft a plan, check feasibility,
                and deliver a signed response in one flow.
              </p>
            </div>

            <div className="flow-chart w-full max-w-5xl flex-col gap-4 md:flex-row md:gap-6">
              {flowSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div
                    className={`flow-node ${step.accent ? "" : ""} animate-fade-in-up`}
                    style={{
                      animationDelay: `${index * 0.25}s`,
                      borderColor: step.accent
                        ? "rgba(16,185,129,0.5)"
                        : undefined,
                      background: step.accent
                        ? "rgba(16,185,129,0.15)"
                        : undefined,
                      color: step.accent ? "#d1fae5" : undefined,
                      boxShadow: step.accent
                        ? "0 0 20px rgba(16,185,129,0.28)"
                        : undefined,
                    }}
                  >
                    {step.label}
                    <strong>{step.detail}</strong>
                  </div>
                  {index < flowSteps.length - 1 ? (
                    <div
                      className="flow-line hidden md:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowIntro(false)}
              >
                Start Demo
              </button>
              <span className="text-xs text-slate-500">
                Live agents | Simulated signals | Clear decisions
              </span>
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
              <div className="flex max-w-3xl flex-col items-center space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                  {copy.badge}
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                </div>
                <h1 className="text-balance text-5xl font-bold leading-tight text-slate-100 md:text-6xl">
                  {copy.title}
                </h1>
                <p className="text-base leading-relaxed text-slate-300">
                  {copy.subtitle}
                </p>
                <p className="max-w-xl text-sm text-slate-500">
                  {copy.tagline}
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex justify-center">
                  <AgentIconRow />
                </div>
                <Link href="/collect" className="btn btn-primary">
                  {copy.cta}
                </Link>
              </div>
            </section>

            <footer className="flex items-center justify-between text-xs text-slate-500">
              <span>{copy.footerLeft}</span>
              <span>{copy.footerRight}</span>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
