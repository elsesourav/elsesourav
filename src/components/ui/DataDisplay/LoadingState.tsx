import React from 'react';
import { Spinner, type SpinnerSize } from '../Feedback/Spinner';
import { cn } from '@/utils/cn';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly message?: React.ReactNode;
  readonly spinnerSize?: SpinnerSize;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message = 'Loading...', spinnerSize = 'lg', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('ui-loading-state', className)} {...props}>
        <Spinner size={spinnerSize} label={typeof message === 'string' ? message : 'Loading'} />
        {message && <p className="ui-loading-state__message">{message}</p>}
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';
