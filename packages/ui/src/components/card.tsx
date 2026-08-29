import * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive' | 'bordered';
}

export function Card({
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variants: Record<string, string> = {
    default:
      'border border-zinc-800 bg-zinc-950/70 shadow-lg',
    elevated:
      'border border-zinc-800/80 bg-zinc-900/90 shadow-2xl shadow-black/40',
    glass:
      'border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-xl shadow-xl',
    interactive:
      'border border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer active:scale-[0.995]',
    bordered:
      'border border-zinc-700/60 bg-transparent',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-tight tracking-tight text-white',
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
      className={cn('text-sm text-zinc-400 leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pt-0', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-zinc-800/60 mt-4', className)}
      {...props}
    />
  );
}
