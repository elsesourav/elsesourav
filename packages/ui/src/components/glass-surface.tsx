import * as React from 'react';
import { cn } from '../lib/utils';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'medium' | 'high';
  interactive?: boolean;
}

export function GlassSurface({
  blur = 'md',
  intensity = 'medium',
  interactive = false,
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
    subtle: 'bg-zinc-950/40 border-white/[0.06]',
    medium: 'bg-zinc-950/70 border-white/[0.08]',
    high: 'bg-zinc-950/90 border-white/[0.14]',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-xl transition-all duration-200',
        blurs[blur],
        intensities[intensity],
        interactive &&
          'hover:border-white/[0.16] hover:bg-zinc-950/80 hover:shadow-2xl cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    />
  );
}
