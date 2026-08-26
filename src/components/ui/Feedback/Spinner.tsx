import React from 'react';
import { cn } from '@/utils/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly size?: SpinnerSize;
  readonly label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = 'md',
  label = 'Loading...',
  ...props
}) => {
  return (
    <div
      role="status"
      className={cn('ui-spinner-wrap', `ui-spinner-wrap--${size}`, className)}
      {...props}
    >
      <div className="ui-spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};
