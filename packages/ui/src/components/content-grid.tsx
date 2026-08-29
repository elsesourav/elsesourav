import * as React from 'react';
import { cn } from '../lib/utils';

export type GridColumns = 1 | 2 | 3 | 4 | 'asymmetric' | 'sidebar-main' | 'main-sidebar';
export type GridGap = 'sm' | 'md' | 'lg' | 'xl';

export interface ContentGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: GridGap;
  as?: React.ElementType;
}

export function ContentGrid({
  columns = 3,
  gap = 'md',
  as: Component = 'div',
  className,
  children,
  ...props
}: ContentGridProps) {
  const columnStyles: Record<GridColumns, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    asymmetric: 'grid-cols-1 lg:grid-cols-12',
    'sidebar-main': 'grid-cols-1 lg:grid-cols-12',
    'main-sidebar': 'grid-cols-1 lg:grid-cols-12',
  };

  const gapStyles: Record<GridGap, string> = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12',
  };

  return (
    <Component
      className={cn('grid', columnStyles[columns], gapStyles[gap], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
