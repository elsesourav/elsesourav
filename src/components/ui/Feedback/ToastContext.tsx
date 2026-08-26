import { createContext } from 'react';
import type { AlertVariant } from './Alert';

export interface ToastItem {
  readonly id: string;
  readonly title?: string;
  readonly message: string;
  readonly variant?: AlertVariant;
  readonly duration?: number;
}

export interface ToastContextValue {
  readonly toasts: readonly ToastItem[];
  readonly toast: (item: Omit<ToastItem, 'id'>) => string;
  readonly dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
