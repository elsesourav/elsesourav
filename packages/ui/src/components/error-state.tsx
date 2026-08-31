import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export function ErrorState({
  title = 'Unable to Load Content',
  description = 'An unexpected issue occurred while retrieving this information.',
  onRetry,
  retryLabel = 'Try Again',
  action,
  compact = false,
  className,
  ...props
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          'p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 flex items-center justify-between gap-4 text-xs',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2.5 text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">
            {title} — {description}
          </span>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="border-rose-800 text-rose-300 hover:bg-rose-900/40 shrink-0 text-[11px] h-7 px-2.5"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      role="alert"
      className={cn(
        'text-center py-12 px-6 border-rose-500/30 bg-[hsl(var(--card))] rounded-2xl flex flex-col items-center justify-center shadow-sm',
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-col items-center p-0 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-2">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <CardTitle className="text-lg text-[hsl(var(--foreground))] font-semibold">
          {title}
        </CardTitle>
        <CardDescription className="max-w-sm text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      {(onRetry || action) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="secondary" size="sm" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </Card>
  );
}
