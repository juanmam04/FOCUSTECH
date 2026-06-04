import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import ToastStack from '../components/ToastStack';

const AlertContext = createContext(null);

let toastId = 0;
function nextId() {
  toastId += 1;
  return `toast-${toastId}`;
}

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type, message, options = {}) => {
      const id = nextId();
      const duration = options.duration ?? 4200;
      const entry = {
        id,
        type,
        message,
        title: options.title || null,
      };

      setToasts((prev) => [...prev, entry]);

      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = useMemo(
    () => ({
      show: (message, options) => showToast(options?.type || 'info', message, options),
      success: (message, options) => showToast('success', message, options),
      error: (message, options) => showToast('error', message, options),
      warning: (message, options) => showToast('warning', message, options),
      info: (message, options) => showToast('info', message, options),
      dismiss: dismissToast,
    }),
    [showToast, dismissToast]
  );

  const confirm = useCallback(
    ({
      title = '¿Confirmar?',
      message = '',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      variant = 'danger',
    } = {}) =>
      new Promise((resolve) => {
        setConfirmState({
          title,
          message,
          confirmText,
          cancelText,
          variant,
          resolve,
        });
      }),
    []
  );

  const closeConfirm = useCallback((result) => {
    setConfirmState((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      {confirmState && (
        <ConfirmDialog
          {...confirmState}
          onConfirm={() => closeConfirm(true)}
          onCancel={() => closeConfirm(false)}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert debe usarse dentro de AlertProvider');
  return ctx;
}
