import Badge from "./Badge";

export default function ClusterCard({ cluster, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(cluster.id)}
      className={`card-soft w-full text-left transition-all duration-200 ${
        active ? "card-active border-blue-500/40" : "hover:border-slate-700 hover:shadow-xl"
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{cluster.title}</h4>
            <p className="text-xs text-slate-500">{cluster.location}</p>
          </div>
          <Badge label={`Confidence ${Math.round(cluster.confidence * 100)}%`} variant="accent" />
        </div>
        <p className="line-clamp-2 text-xs text-slate-300">{cluster.summary}</p>
        <div className="text-[11px] uppercase tracking-wider text-slate-500">
          {cluster.supportingPostIds.length} signals
        </div>
      </div>
    </button>
  );
}
