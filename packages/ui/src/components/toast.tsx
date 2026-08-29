'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration || 4000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Viewport Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const icons = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info,
          };
          const Icon = icons[toast.type || 'info'];

          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 fade-in duration-200 text-zinc-100',
                toast.type === 'success' && 'border-emerald-800/60',
                toast.type === 'error' && 'border-rose-800/60',
                toast.type === 'info' && 'border-indigo-800/60'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 mt-0.5',
                  toast.type === 'success' && 'text-emerald-400',
                  toast.type === 'error' && 'text-rose-400',
                  toast.type === 'info' && 'text-indigo-400'
                )}
              />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-zinc-100">{toast.title}</div>
                {toast.description && (
                  <div className="text-zinc-400 mt-0.5 leading-relaxed">{toast.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      addToast: () => {},
      removeToast: () => {},
      toasts: [],
    };
  }
  return context;
}
