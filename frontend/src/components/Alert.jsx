export default function Alert({ type = 'info', message, onDismiss }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error:   'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  const icons = { info: 'ℹ', success: '✓', error: '✕', warning: '⚠' };

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[type]} animate-fade-in`}>
      <span className="mt-0.5 shrink-0 font-bold">{icons[type]}</span>
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 text-base leading-none">×</button>
      )}
    </div>
  );
}
