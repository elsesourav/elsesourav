import React from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant =
  'default' | 'mono' | 'success' | 'warning' | 'error' | 'accent' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className, variant = 'default', size = 'md', icon, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('ui-badge', `ui-badge--${variant}`, `ui-badge--${size}`, className)}
        {...props}
      >
        {icon && <span className="ui-badge__icon">{icon}</span>}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';
