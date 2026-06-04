import './Alert.css';

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 12l2 2 4-4M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3L2 20h20L12 3z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  ),
};

export default function Alert({
  variant = 'error',
  title,
  children,
  onDismiss,
  className = '',
}) {
  return (
    <div
      className={`ft-alert ft-alert--${variant} ${className}`.trim()}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className="ft-alert__icon">{ICONS[variant] || ICONS.info}</span>
      <div className="ft-alert__body">
        {title && children ? (
          <>
            <p className="ft-alert__title">{title}</p>
            <p className="ft-alert__message">{children}</p>
          </>
        ) : (
          <p className="ft-alert__message">{children || title}</p>
        )}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="ft-alert__close"
          onClick={onDismiss}
          aria-label="Cerrar"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
