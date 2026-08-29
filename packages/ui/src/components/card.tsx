import * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'solid' | 'subtle' | 'elevated' | 'glass' | 'interactive';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'border-zinc-800 bg-zinc-950/70 backdrop-blur-md shadow-md',
    solid: 'border-zinc-800 bg-zinc-900 shadow-sm',
    subtle: 'border-zinc-800/60 bg-zinc-950/40',
    elevated: 'border-zinc-700 bg-zinc-900/90 shadow-2xl',
    glass: 'border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl shadow-xl',
    interactive:
      'border-zinc-800 bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.99]',
  };

  return (
    <div
      className={cn('rounded-2xl border p-6 text-zinc-100', variants[variant], className)}
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
