import * as React from 'react';
import { cn } from '../lib/utils';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'medium' | 'high';
}

export function GlassSurface({
  blur = 'md',
  intensity = 'medium',
  className,
  ...props
}: GlassSurfaceProps) {
  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const intensities = {
    subtle: 'bg-zinc-950/40 border-zinc-800/40',
    medium: 'bg-zinc-950/70 border-zinc-800/70',
    high: 'bg-zinc-950/90 border-zinc-700/80',
  };

  return (
    <div
      className={cn(
        'rounded-xl border shadow-xl transition-all',
        blurs[blur],
        intensities[intensity],
        className
      )}
      {...props}
    />
  );
}
