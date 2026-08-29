import * as React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-200 border-zinc-700/80',
    primary: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
    secondary: 'bg-zinc-900 text-zinc-300 border-zinc-800',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    error: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    info: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    outline: 'border-zinc-700 text-zinc-400 bg-transparent',
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
