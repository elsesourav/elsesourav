import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function Alert({ className, variant = 'info', children, ...props }: AlertProps) {
  const variants = {
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200',
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
        'relative w-full rounded-2xl border p-4 flex gap-3 text-sm items-start shadow-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn('font-semibold leading-none tracking-tight mb-1', className)} {...props} />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs opacity-90', className)} {...props} />;
}
