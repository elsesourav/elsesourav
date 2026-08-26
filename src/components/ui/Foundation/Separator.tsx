import React from 'react';
import { cn } from '@/utils/cn';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly orientation?: 'horizontal' | 'vertical';
  readonly decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={cn('ui-separator', `ui-separator--${orientation}`, className)}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';
