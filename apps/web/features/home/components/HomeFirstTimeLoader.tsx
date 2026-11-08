'use client';

import * as React from 'react';
import { CanvasLogoLoader } from './CanvasLogoLoader';
import { AnimatedLoadingText } from '@/components/loading/AnimatedLoadingText';
import type { LogoPixelTuple } from '@/components/loading/logoPixelData';

const INTRO_SESSION_KEY = 'elsesourav_intro_seen';

interface HomeFirstTimeLoaderProps {
  /** Optional custom site / brand name from database */
  siteName?: string;
  /** Optional custom logo URL from database */
  logoUrl?: string;
  /** Optional pre-computed pixel matrix */
  pixelData?: readonly LogoPixelTuple[];
  /** Force the loader to show regardless of sessionStorage (useful for previewing or testing) */
  forceShow?: boolean;
}

export function HomeFirstTimeLoader({
  siteName = 'ElseSourav',
  logoUrl,
  pixelData,
  forceShow = false,
}: HomeFirstTimeLoaderProps) {
  const [shouldRender, setShouldRender] = React.useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Check if user has already seen intro this session
    const hasSeen = window.sessionStorage.getItem(INTRO_SESSION_KEY);
    if (!hasSeen || forceShow) {
      setShouldRender(true);
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {
        // Ignore storage quotas / private mode limitations
      }
    }
  }, [forceShow]);

  // Handle smooth dismissal
  const handleComplete = React.useCallback(() => {
    setIsFadingOut(true);
    const timer = setTimeout(() => {
      setShouldRender(false);
    }, 220); // Matches transition duration

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut: Escape to skip immediately
  React.useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender, handleComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading ElseSourav digital experience"
      className={`fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center bg-[hsl(var(--background))] transition-opacity duration-200 ease-out select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background bloom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[100px] sm:blur-[130px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      <CanvasLogoLoader
        fullScreen
        durationMs={600}
        logoUrl={logoUrl}
        pixelData={pixelData}
        onComplete={handleComplete}
      />

      {/* Clean studio signature */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[110px] z-10 flex flex-col items-center gap-1.5 text-center pointer-events-none">
        <span className="text-sm font-semibold tracking-wider uppercase text-[hsl(var(--foreground))]">
          {siteName}
        </span>
        <AnimatedLoadingText label="Loading Studio" subLabel="Personal Software Studio" />
      </div>

      {/* Accessible subtle skip hint button */}
      <button
        type="button"
        onClick={handleComplete}
        className="absolute bottom-6 sm:bottom-8 text-xs font-mono text-[hsl(var(--subtle-foreground))] opacity-60 hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full hover:bg-[hsl(var(--surface-subtle))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 z-20"
      >
        Press Esc or click to enter
      </button>
    </div>
  );
}
