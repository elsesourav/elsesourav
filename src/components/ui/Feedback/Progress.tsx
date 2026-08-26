import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly value?: number;
  readonly max?: number;
  readonly isIndeterminate?: boolean;
  readonly label?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
  className,
  value = 0,
  max = 100,
  isIndeterminate = false,
  label,
  size = 'md',
  ...props
}) => {
  const percentage = isIndeterminate ? undefined : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn(
        'ui-progress-track',
        `ui-progress-track--${size}`,
        isIndeterminate && 'is-indeterminate',
        className
      )}
      {...props}
    >
      <div
        className="ui-progress-bar"
        style={{ width: percentage !== undefined ? `${percentage}%` : undefined }}
      />
    </div>
  );
};
