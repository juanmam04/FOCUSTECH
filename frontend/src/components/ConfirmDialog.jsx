import './ConfirmDialog.css';

export default function ConfirmDialog({
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  return (
    <div className="confirm-overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog animate-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`} aria-hidden>
          {variant === 'danger' ? '!' : '?'}
        </div>
        <h2 id="confirm-title" className="confirm-dialog__title">{title}</h2>
        {message ? <p id="confirm-desc" className="confirm-dialog__message">{message}</p> : null}
        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
