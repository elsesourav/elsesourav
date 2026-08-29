import * as React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    primary: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    secondary: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    info: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    outline: 'border-zinc-700 text-zinc-300 bg-transparent',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-zinc-400',
    primary: 'bg-indigo-400',
    secondary: 'bg-zinc-500',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-cyan-400',
    outline: 'bg-zinc-400',
  };

  const sizes: Record<string, string> = {
    sm: 'text-[10px] px-2 py-0.25 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none tracking-tight',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0 animate-pulse',
            dotColors[variant] || dotColors.default
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
