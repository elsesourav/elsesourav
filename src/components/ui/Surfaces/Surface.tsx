import React from 'react';
import { cn } from '@/utils/cn';

export type SurfaceLevel = 'canvas' | 'surface' | 'elevated' | 'sunken';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly level?: SurfaceLevel;
  readonly bordered?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className, level = 'surface', bordered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'ui-surface',
          `ui-surface--${level}`,
          bordered && 'ui-surface--bordered',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';
