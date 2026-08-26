import React from 'react';
import { cn } from '@/utils/cn';
import './Badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: 'default' | 'mono' | 'success' | 'accent' | 'outline';
  readonly size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  return (
    <span
      className={cn('ui-badge', `ui-badge--${variant}`, `ui-badge--${size}`, className)}
      {...props}
    >
      {children}
    </span>
  );
};
