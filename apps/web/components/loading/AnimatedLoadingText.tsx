'use client';

import * as React from 'react';

export interface AnimatedLoadingTextProps {
  /** Leading text string (defaults to "Loading") */
  label?: string;
  /** Subtitle or descriptor text */
  subLabel?: string;
  /** Custom classes for outer container */
  className?: string;
}

export function AnimatedLoadingText({
  label = 'Loading',
  subLabel,
  className = '',
}: AnimatedLoadingTextProps) {
  const [dotCount, setDotCount] = React.useState<number>(1);
  const [direction, setDirection] = React.useState<1 | -1>(1);

  React.useEffect(() => {
    // Slowly cycle dots: 1 -> 2 -> 3 -> 2 -> 1
    const interval = setInterval(() => {
      setDotCount((prev) => {
        if (prev >= 3) {
          setDirection(-1);
          return 2;
        }
        if (prev <= 1) {
          setDirection(1);
          return 2;
        }
        return prev + direction;
      });
    }, 420);

    return () => clearInterval(interval);
  }, [direction]);

  const dots = '.'.repeat(dotCount);

  return (
    <div className={`flex flex-col items-center gap-1.5 text-center ${className}`}>
      <span className="inline-flex items-baseline text-xs font-mono tracking-widest text-[hsl(var(--subtle-foreground))] opacity-85 select-none">
        <span>{label}</span>
        <span
          aria-hidden="true"
          className="inline-block min-w-[2.2ch] text-left font-mono font-bold text-indigo-400 transition-all duration-200"
        >
          {dots}
        </span>
      </span>
      {subLabel && (
        <span className="text-[11px] font-mono tracking-wider text-[hsl(var(--muted-foreground))] opacity-60">
          {subLabel}
        </span>
      )}
    </div>
  );
}
