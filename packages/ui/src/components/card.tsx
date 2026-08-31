import * as React from 'react';
import { cn } from '../lib/utils';

export type SurfaceDepth = 0 | 1 | 2 | 3 | 4;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'solid' | 'subtle' | 'elevated' | 'glass' | 'interactive';
  depth?: SurfaceDepth;
}

export function Card({ className, variant = 'default', depth, ...props }: CardProps) {
  const variants = {
    default: 'border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm',
    solid: 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-sm',
    subtle: 'border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-subtle))]',
    elevated: 'border-[hsl(var(--border-strong))] bg-[hsl(var(--surface-elevated))] shadow-xl',
    glass: 'border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-xl',
    interactive:
      'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:bg-[hsl(var(--surface-elevated))] hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer active:scale-[0.99] active:translate-y-0',
  };

  const depths = {
    0: 'border-transparent bg-transparent shadow-none',
    1: 'border-[hsl(var(--border-subtle))] bg-[hsl(var(--card))] shadow-sm',
    2: 'border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] shadow-md',
    3: 'border-[hsl(var(--border-strong))] bg-[hsl(var(--surface-elevated))] shadow-xl',
    4: 'border-indigo-500/80 bg-[hsl(var(--surface-elevated))] shadow-2xl ring-1 ring-indigo-500/50',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 text-[hsl(var(--foreground))]',
        depth !== undefined ? depths[depth] : variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-tight tracking-tight text-[hsl(var(--foreground))]',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-[hsl(var(--muted-foreground))] leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('pt-0 text-sm text-[hsl(var(--foreground))] leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center pt-4 border-t border-[hsl(var(--border-subtle))] mt-4',
        className
      )}
      {...props}
    />
  );
}
