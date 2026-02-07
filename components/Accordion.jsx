export default function Accordion({ title, items = [] }) {
  return (
    <details className="card-soft group">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-100">
        {title}
        <span className="float-right text-xs text-slate-500 group-open:text-slate-200">Toggle</span>
      </summary>
      <div className="space-y-2 px-4 pb-4 text-xs text-slate-300">
        {items.length === 0 && <div className="text-slate-500">No evidence yet.</div>}
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="rounded-lg border border-white/5 bg-white/5 p-2">
            &quot;{item}&quot;
          </div>
        ))}
      </div>
    </details>
  );
}
