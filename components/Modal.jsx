export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-lg p-6 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-100"
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-4 text-sm text-slate-300">{children}</div>
      </div>
    </div>
  );
}
