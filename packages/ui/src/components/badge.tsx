import * as React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  const variants = {
    default:
      'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border-[hsl(var(--border))]',
    primary: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    secondary:
      'bg-[hsl(var(--surface-subtle))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border-subtle))]',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    outline: 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] bg-transparent',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-medium tracking-wide',
    md: 'px-2.5 py-0.5 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
