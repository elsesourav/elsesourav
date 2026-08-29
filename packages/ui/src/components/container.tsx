import * as React from 'react';
import { cn } from '../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'prose' | 'full';
  as?: React.ElementType;
}

export function Container({
  size = 'lg',
  as: Component = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    prose: 'max-w-prose',
    full: 'max-w-full',
  };

  return (
    <Component
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
