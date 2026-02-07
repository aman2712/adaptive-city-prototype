import { useState } from "react";

const agents = [
  { id: "leader", label: "Leader" },
  { id: "solutions", label: "Solutions" },
  { id: "finance", label: "Finance" },
  { id: "regulatory", label: "Regulatory" },
  { id: "ops", label: "Ops" },
];

export default function ChatPanel({ messages = [], agent, onAgentChange, onSend, loading, className = "" }) {
  const [input, setInput] = useState("");
  const containerClass = className || "h-full";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className={`card flex flex-col gap-4 p-4 ${containerClass}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Policy Studio</div>
        <div className="flex items-center rounded-full border border-slate-800 bg-slate-900/60 p-1">
          {agents.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onAgentChange(option.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider transition ${
                agent === option.id
                  ? "bg-blue-500/30 text-blue-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {option.label.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 text-sm">
        {messages.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Try</div>
            <div className="mt-2 space-y-1 text-slate-200">
              <div>@leader tighten executive summary</div>
              <div>@finance revise cost assumptions</div>
              <div>@ops adjust timeline</div>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs ${
                message.role === "user"
                  ? "bg-blue-500/20 text-blue-100"
                  : "bg-slate-900/60 text-slate-200"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-400">{message.agent}</div>
              <div className="mt-1 whitespace-pre-line">{message.text}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Message or @command"
          className="input-base flex-1 text-xs"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-sm disabled:opacity-60"
        >
          {loading ? "Sending" : "Send"}
        </button>
      </form>
    </div>
  );
}
