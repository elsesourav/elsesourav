import { createContext } from 'react';
import type { AlertVariant } from './Alert';

export interface ToastItem {
  readonly id: string;
  readonly title?: string;
  readonly message: string;
  readonly variant?: AlertVariant;
  readonly duration?: number;
}

export interface ToastFn {
  (item: Omit<ToastItem, 'id'>): string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
}

export interface ToastContextValue {
  readonly toasts: readonly ToastItem[];
  readonly toast: ToastFn;
  readonly dismissToast: (id: string) => void;
  readonly clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
