import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../Foundation/Button';
import { cn } from '@/utils/cn';

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  readonly icon?: React.ReactNode;
  readonly title?: React.ReactNode;
  readonly message?: React.ReactNode;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly isRetrying?: boolean;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      icon = <AlertCircle size={36} aria-hidden="true" />,
      title = 'Something went wrong',
      message = 'An unexpected error occurred while loading this content.',
      onRetry,
      retryLabel = 'Try again',
      isRetrying = false,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} role="alert" className={cn('ui-error-state', className)} {...props}>
        {icon && <div className="ui-error-state__icon">{icon}</div>}
        {title && <h3 className="ui-error-state__title">{title}</h3>}
        {message && <p className="ui-error-state__message">{message}</p>}
        {onRetry && (
          <div className="ui-error-state__action">
            <Button
              variant="outline"
              size="sm"
              isLoading={isRetrying}
              leftIcon={<RotateCcw size={14} />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
