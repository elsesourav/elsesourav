'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface CounterNumberProps {
  from?: number;
  to: number;
  duration?: number; // In seconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  ease?: 'linear' | 'easeOut' | 'easeInOut';
  className?: string;
}

/**
 * CounterNumber - 100% Standalone (Zero dependencies)
 * Animates counting numbers on scroll using requestAnimationFrame and cubic ease.
 */
export const CounterNumber: React.FC<CounterNumberProps> = ({
  from = 0,
  to,
  duration = 2.0,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  ease = 'easeOut',
  className = '',
}) => {
  const [value, setValue] = useState(from);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const startTime = performance.now();
          const totalMs = duration * 1000;

          const easeFn = (t: number) => {
            if (ease === 'linear') return t;
            if (ease === 'easeInOut') {
              return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            // default easeOut: 1 - (1 - t)^3
            return 1 - Math.pow(1 - t, 3);
          };

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / totalMs, 1);
            const easedProgress = easeFn(progress);

            const currentVal = from + (to - from) * easedProgress;
            setValue(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setValue(to);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [from, to, duration, ease]);

  const formattedNumber = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span ref={containerRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default CounterNumber;
