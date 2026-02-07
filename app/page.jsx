import Link from "next/link";
import AgentIconRow from "../components/AgentIconRow";

export default function Home() {
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
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Action Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <span className="text-slate-100">EN</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">AR (Preview)</span>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
          <div className="flex max-w-3xl flex-col items-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
              City Nervous System
              <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </div>
            <h1 className="text-balance text-5xl font-bold leading-tight text-slate-100 md:text-6xl">
              Adaptive City - Action Intelligence
            </h1>
            <p className="text-base leading-relaxed text-slate-300">
              The world&apos;s first City Action Intelligence System.
            </p>
            <p className="max-w-xl text-sm text-slate-500">
              From public signal to coordinated civic action.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center">
              <AgentIconRow />
            </div>
            <Link href="/collect" className="btn btn-primary">
              Experience Efficiency
            </Link>
          </div>
        </section>

        <footer className="flex items-center justify-between text-xs text-slate-500">
          <span>Government-grade infrastructure demo</span>
          <span>Action Intelligence Platform</span>
        </footer>
      </div>
    </main>
  );
}
