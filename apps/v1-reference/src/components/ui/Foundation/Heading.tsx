import React from 'react';
import { cn } from '@/utils/cn';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6 | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | '2xl'
  | 'xl'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xs'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  readonly level?: HeadingLevel;
  readonly size?: HeadingSize;
  readonly gradient?: boolean;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className, level = 'h2', size, gradient = false, ...props }, ref) => {
    const Component = (typeof level === 'number' ? `h${level}` : level) as React.ElementType;
    const resolvedSize = size || (typeof level === 'number' ? `h${level}` : level);

    return (
      <Component
        ref={ref}
        className={cn(
          'ui-heading',
          `ui-heading--${resolvedSize}`,
          gradient && 'ui-heading--gradient',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
