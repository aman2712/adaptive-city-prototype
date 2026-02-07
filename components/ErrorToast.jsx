export default function ErrorToast({ message, onRetry, onDismiss }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 top-6 z-50 w-[320px] rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-100 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="font-semibold">Action Engine Error</div>
      <p className="mt-2 text-red-100/80">{message}</p>
      <div className="mt-3 flex items-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary btn-xs"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-danger btn-xs"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
