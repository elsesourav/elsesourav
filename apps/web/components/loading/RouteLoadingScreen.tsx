'use client';

import * as React from 'react';
import { CanvasLogoLoader } from './CanvasLogoLoader';
import { AnimatedLoadingText } from './AnimatedLoadingText';
import type { LogoPixelTuple } from './logoPixelData';

export interface RouteLoadingScreenProps {
  /** Optional custom title (default: "ElseSourav") */
  title?: string;
  /** Optional custom subtitle (default: "Personal Software Studio") */
  subtitle?: string;
  /** Canvas visual diameter in pixels (default: 240) */
  size?: number;
  /** Whether to render as fixed full screen overlay at top of screen (default: true) */
  fullScreen?: boolean;
  /** Custom pixel data tuples */
  pixelData?: readonly LogoPixelTuple[];
  /** Optional custom logo URL */
  logoUrl?: string;
  /** Optional extra classes */
  className?: string;
}

export function RouteLoadingScreen({
  title = 'ElseSourav',
  subtitle = 'Personal Software Studio',
  size = 240,
  fullScreen = true,
  pixelData,
  logoUrl,
  className = '',
}: RouteLoadingScreenProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center bg-[hsl(var(--background))]/85 backdrop-blur-md select-none overflow-hidden'
    : 'min-h-[65vh] w-full flex-1 flex flex-col items-center justify-center p-6 relative select-none overflow-hidden';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${title} - ${subtitle}`}
      className={`${containerClasses} ${className}`}
    >
      {/* Ambient background bloom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-indigo-500/10 blur-[100px] sm:blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] bg-cyan-500/10 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      <CanvasLogoLoader
        size={size}
        durationMs={1600}
        fullScreen={fullScreen}
        pixelData={pixelData}
        logoUrl={logoUrl}
      />

      <div
        className={
          fullScreen
            ? 'absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[110px] z-10 flex flex-col items-center gap-1.5 text-center pointer-events-none'
            : 'mt-4 flex flex-col items-center gap-1.5 text-center'
        }
      >
        <span className="text-sm font-semibold tracking-wider uppercase text-[hsl(var(--foreground))]">
          {title}
        </span>
        <AnimatedLoadingText label="Loading" subLabel={subtitle} />
      </div>
    </div>
  );
}
