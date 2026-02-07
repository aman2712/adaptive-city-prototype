"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepperRail from "../../components/StepperRail";
import ChatPanel from "../../components/ChatPanel";
import MemoRenderer from "../../components/MemoRenderer";
import ErrorToast from "../../components/ErrorToast";
import { useCityStore } from "../../store/useCityStore";

const agentAliases = {
  leader: "Leader",
  solutions: "Solutions",
  finance: "Finance",
  regulatory: "Regulatory",
  ops: "Ops",
};

export default function StudioPage() {
  const router = useRouter();
  const hasHydrated = useCityStore((state) => state.hasHydrated);
  const feasibilityApproved = useCityStore((state) => state.feasibilityApproved);
  const policyMemo = useCityStore((state) => state.policyMemo);
  const chatLog = useCityStore((state) => state.chatLog);
  const addChatMessage = useCityStore((state) => state.addChatMessage);
  const setPolicyMemo = useCityStore((state) => state.setPolicyMemo);
  const resetAll = useCityStore((state) => state.resetAll);

  const [agent, setAgent] = useState("leader");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedSections, setHighlightedSections] = useState([]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!feasibilityApproved) {
      router.replace("/feasibility");
    }
  }, [hasHydrated, feasibilityApproved, router]);

  const handleSend = async (text) => {
    if (!policyMemo) return;
    setError("");
    const trimmed = text.trim();
    let targetAgent = agent;
    if (trimmed.startsWith("@")) {
      const token = trimmed.split(" ")[0].replace("@", "");
      if (agentAliases[token]) {
        targetAgent = token;
      }
    }

    addChatMessage({ role: "user", agent: targetAgent, text: trimmed });
    setLoading(true);

    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo: policyMemo,
          message: trimmed,
          agent: targetAgent,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Patch failed");
      const { reply, patches = [] } = json.data;

      if (patches.length > 0) {
        const updatedSections = { ...policyMemo.sections };
        patches.forEach((patch) => {
          if (patch.action === "replace" && updatedSections[patch.section] !== undefined) {
            updatedSections[patch.section] = patch.content;
          }
        });
        const updatedMemo = {
          ...policyMemo,
          sections: updatedSections,
          lastEditedAt: new Date().toISOString(),
        };
        setPolicyMemo(updatedMemo);
        setHighlightedSections(patches.map((patch) => patch.section));
        setTimeout(() => setHighlightedSections([]), 1800);
      }

      addChatMessage({ role: "assistant", agent: targetAgent, text: reply || "Updates applied." });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-shell text-white">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <StepperRail activeIds={["ops"]} />
      <div className="min-h-screen px-6 pb-12 pt-28 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Policy Studio</div>
                <h1 className="text-3xl font-semibold text-slate-100">Memo Control Room</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn btn-primary btn-sm"
                >
                  Download Memo
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="btn btn-secondary btn-sm"
                >
                  Back to Start
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    router.push("/");
                  }}
                  className="btn btn-danger btn-sm"
                >
                  New Run (Reset)
                </button>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
              <div className="no-print">
                <ChatPanel
                  messages={chatLog}
                  agent={agent}
                  onAgentChange={setAgent}
                  onSend={handleSend}
                  loading={loading}
                />
              </div>
              <div>
                <MemoRenderer memo={policyMemo} highlightedSections={highlightedSections} />
              </div>
            </div>
        </div>
      </div>
      <ErrorToast message={error} onRetry={() => handleSend("@leader retry latest") } onDismiss={() => setError("")} />
    </main>
  );
}
