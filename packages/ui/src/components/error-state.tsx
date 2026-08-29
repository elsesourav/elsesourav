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
}

export function ErrorState({
  title = 'Failed to Load Data',
  description = 'An unexpected error occurred while fetching information.',
  onRetry,
  retryLabel = 'Try Again',
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <Card
      className={cn(
        'text-center py-12 px-6 border-red-900/40 bg-zinc-950/80 flex flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-col items-center p-0">
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <CardTitle className="text-lg text-red-200">{title}</CardTitle>
        <CardDescription className="max-w-sm mt-1.5">{description}</CardDescription>
      </CardHeader>
      {(onRetry || action) && (
        <div className="mt-6 flex items-center justify-center gap-3">
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
