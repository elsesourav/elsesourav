import React, { useState, useCallback, useMemo } from 'react';
import { ToastContext, type ToastItem, type ToastFn } from './ToastContext';
import { Alert } from './Alert';
import { cn } from '@/utils/cn';

export const ToastProvider: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);

  const dismissToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback((): void => {
    setToasts([]);
  }, []);

  const baseToast = useCallback(
    ({ duration = 4000, ...rest }: Omit<ToastItem, 'id'>): string => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: ToastItem = { id, duration, ...rest };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = useMemo<ToastFn>(() => {
    const fn = (item: Omit<ToastItem, 'id'>) => baseToast(item);

    fn.success = (message: string, title?: string, duration = 4000) =>
      baseToast({ message, title, variant: 'success', duration });

    fn.error = (message: string, title?: string, duration = 5000) =>
      baseToast({ message, title, variant: 'error', duration });

    fn.info = (message: string, title?: string, duration = 4000) =>
      baseToast({ message, title, variant: 'info', duration });

    fn.warning = (message: string, title?: string, duration = 4500) =>
      baseToast({ message, title, variant: 'warning', duration });

    return fn as ToastFn;
  }, [baseToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast, clearToasts }}>
      {children}
      <div className="ui-toast-container" aria-live="polite" aria-label="Notifications">
        {toasts.map((item) => (
          <div key={item.id} className={cn('ui-toast-item')}>
            <Alert
              variant={item.variant || 'info'}
              title={item.title}
              onDismiss={() => dismissToast(item.id)}
            >
              {item.message}
            </Alert>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
