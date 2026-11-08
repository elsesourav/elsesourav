import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function Alert({ className, variant = 'info', children, ...props }: AlertProps) {
  const variants = {
    info: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/70 text-sky-950 dark:text-sky-100',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-100',
    warning: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-100',
    error: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100',
  };

  const iconVariants = {
    info: 'text-sky-600 dark:text-sky-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-rose-600 dark:text-rose-400',
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const IconComponent = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-2xl border p-3.5 sm:p-4 flex gap-3 text-sm items-start shadow-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      <IconComponent className={cn('h-5 w-5 shrink-0 mt-0.5', iconVariants[variant])} />
      <div className="flex-1 leading-relaxed font-medium">{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn('font-semibold leading-none tracking-tight mb-1 text-inherit', className)} {...props} />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-xs font-medium leading-relaxed text-inherit', className)} {...props} />;
}
