import React from 'react';
import { Card, type CardPadding } from './Card';
import { cn } from '@/utils/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly padding?: CardPadding;
  readonly blur?: 'sm' | 'md' | 'lg';
  readonly isInteractive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, padding = 'md', blur = 'md', isInteractive = false, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant={isInteractive ? 'interactive' : 'glass'}
        padding={padding}
        className={cn('ui-glass-card', `ui-glass-card--blur-${blur}`, className)}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

GlassCard.displayName = 'GlassCard';
