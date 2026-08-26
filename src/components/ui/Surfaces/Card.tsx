import React from 'react';
import { cn } from '@/utils/cn';
import './Surfaces.css';

export type CardVariant = 'default' | 'elevated' | 'outline' | 'glass' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: CardVariant;
  readonly padding?: CardPadding;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = 'default', padding = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('ui-card', `ui-card--${variant}`, `ui-card--pad-${padding}`, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
