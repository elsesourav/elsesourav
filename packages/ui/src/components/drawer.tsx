'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: 'left' | 'right';
  children: React.ReactNode;
}

export function Drawer({ open, onOpenChange, position = 'right', children }: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Slide-over panel */}
      <div className={cn('fixed inset-y-0 flex max-w-full', position === 'right' ? 'right-0' : 'left-0')}>
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DrawerHeader({
  className,
  onClose,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-zinc-800', className)} {...props}>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="rounded-sm opacity-70 hover:opacity-100 text-zinc-400 hover:text-white p-1"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
