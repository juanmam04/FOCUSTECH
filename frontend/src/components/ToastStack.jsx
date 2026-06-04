import './ToastStack.css';

const ICONS = {
  success: '✓',
  error: '!',
  warning: '⚠',
  info: 'i',
};

export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          role="status"
        >
          <span className="toast__icon" aria-hidden>
            {ICONS[t.type] || ICONS.info}
          </span>
          <div className="toast__content">
            {t.title ? <p className="toast__title">{t.title}</p> : null}
            <p className="toast__message">{t.message}</p>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(t.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
