'use client';

import * as React from 'react';
import { ArrowUp } from 'lucide-react';

export interface BackToTopButtonProps {
  className?: string;
  label?: string;
}

export function BackToTopButton({
  className = '',
  label = 'Back to Top',
}: BackToTopButtonProps) {
  const rafIdRef = React.useRef<number | null>(null);

  /**
   * Ultra-smooth, interrupt-resistant requestAnimationFrame scroll-to-top engine.
   * Handles long pages (e.g., 5000px+), responsive re-renders, sticky headers, and
   * mobile containers without stalling or aborting midway.
   */
  const scrollToTop = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Cancel any ongoing scroll animation to prevent collision
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Accessibility: instantly reset if user requests reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const getScrollTop = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const currentY = getScrollTop();
    if (currentY <= 0) return;

    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      return;
    }

    const startY = currentY;
    const startTime = performance.now();
    // Dynamic duration based on scroll depth: min 320ms, max 620ms
    const duration = Math.min(620, Math.max(320, Math.sqrt(startY) * 9.5));

    // Deceleration easing curve for fluid, kinetic momentum
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const nextY = Math.round(startY * (1 - eased));

      window.scrollTo({ top: nextY, left: 0, behavior: 'instant' as ScrollBehavior });
      if (document.documentElement) document.documentElement.scrollTop = nextY;
      if (document.body) document.body.scrollTop = nextY;

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        // Guaranteed landing at top 0
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top of page"
      className={`group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--surface-subtle))]/90 hover:bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] hover:border-indigo-500/40 shadow-xs hover:shadow-indigo-500/10 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${className}`}
    >
      <span>{label}</span>
      <span className="w-4 h-4 rounded-full bg-[hsl(var(--surface))] flex items-center justify-center border border-[hsl(var(--border))] group-hover:border-indigo-400/50 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0">
        <ArrowUp className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))] group-hover:text-indigo-400 transition-colors" />
      </span>
    </button>
  );
}
