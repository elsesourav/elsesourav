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
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-overlay-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full',
          position === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          className={cn(
            'w-screen max-w-md bg-[hsl(var(--surface-elevated))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] p-6 shadow-2xl flex flex-col justify-between animate-in duration-300',
            position === 'right'
              ? 'border-l slide-in-from-right'
              : 'border-r slide-in-from-left'
          )}
        >
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
    <div
      className={cn('flex items-center justify-between pb-4 border-b border-[hsl(var(--border-subtle))]', className)}
      {...props}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          className="rounded-lg p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
