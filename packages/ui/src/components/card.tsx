import * as React from 'react';
import { cn } from '../lib/utils';

export type SurfaceDepth = 0 | 1 | 2 | 3 | 4;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'solid' | 'subtle' | 'elevated' | 'glass' | 'interactive';
  depth?: SurfaceDepth;
}

export function Card({
  className,
  variant = 'default',
  depth,
  ...props
}: CardProps) {
  const variants = {
    default: 'border-zinc-800 bg-zinc-950/70 backdrop-blur-md shadow-md',
    solid: 'border-zinc-800 bg-zinc-900 shadow-sm',
    subtle: 'border-zinc-800/60 bg-zinc-950/40',
    elevated: 'border-zinc-700 bg-zinc-900/90 shadow-2xl',
    glass: 'border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl shadow-xl',
    interactive:
      'border-zinc-800 bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.99]',
  };

  const depths = {
    0: 'border-transparent bg-transparent shadow-none',
    1: 'border-zinc-800/80 bg-zinc-900/60 shadow-sm',
    2: 'border-zinc-700/80 bg-zinc-900/90 shadow-xl',
    3: 'border-zinc-700 bg-zinc-950/95 shadow-2xl backdrop-blur-xl',
    4: 'border-indigo-500/80 bg-zinc-900/95 shadow-2xl ring-1 ring-indigo-500/50',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 text-zinc-100',
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
      className={cn('text-lg font-semibold leading-tight tracking-tight text-white', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-zinc-400 leading-relaxed', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pt-0 text-sm text-zinc-300 leading-relaxed', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-zinc-800/60 mt-4', className)}
      {...props}
    />
  );
}
