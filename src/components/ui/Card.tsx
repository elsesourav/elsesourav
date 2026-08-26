import React from 'react';
import { cn } from '@/utils/cn';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  padding = 'md',
  ...props
}) => {
  return (
    <div
      className={cn('ui-card', `ui-card--${variant}`, `ui-card--pad-${padding}`, className)}
      {...props}
    >
      {children}
    </div>
  );
};
