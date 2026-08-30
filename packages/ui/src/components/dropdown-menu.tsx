'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be within DropdownMenu');

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={context.open}
      onClick={() => context.setOpen(!context.open)}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'right';
}

export function DropdownMenuContent({
  align = 'right',
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context || !context.open) return null;

  return (
    <div
      role="menu"
      className={cn(
        'absolute z-50 mt-2 min-w-[180px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] p-1.5 shadow-2xl backdrop-blur-xl animate-popup-in',
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownMenuItem({
  className,
  destructive = false,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  return (
    <button
      role="menuitem"
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-colors text-left font-medium select-none focus:outline-none focus:bg-[hsl(var(--accent))]',
        destructive
          ? 'text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400'
          : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px bg-[hsl(var(--border-subtle))] my-1', className)} />;
}
