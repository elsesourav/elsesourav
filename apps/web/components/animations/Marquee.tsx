'use client';

import React from 'react';

export interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // Duration in seconds for full loop
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  gap?: string; // CSS gap between items, e.g. '2rem'
}

/**
 * Marquee - 100% Standalone (Zero dependencies)
 * Seamless infinite ribbon scrolling using pure CSS keyframes.
 */
export const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = 25,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  gap = '2rem',
}) => {
  const animDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div
      className={`group relative flex overflow-hidden select-none ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div
        className={`flex shrink-0 items-center justify-around ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{
          gap,
          minWidth: '100%',
          animation: `infinite-marquee ${speed}s linear infinite ${animDirection}`,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-around ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{
          gap,
          minWidth: '100%',
          animation: `infinite-marquee ${speed}s linear infinite ${animDirection}`,
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes infinite-marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
