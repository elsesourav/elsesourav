import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function Alert({
  className,
  variant = 'info',
  children,
  ...props
}: AlertProps) {
  const variants = {
    info: 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
    error: 'bg-red-950/40 border-red-800/60 text-red-200',
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
        'relative w-full rounded-lg border p-4 flex gap-3 text-sm items-start',
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

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('font-semibold leading-none tracking-tight mb-1', className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs opacity-90', className)} {...props} />;
}
