'use client';

import * as React from 'react';

export interface UseHeaderHeadroomOptions {
  /**
   * Minimum scroll delta in pixels required to hide on downward scroll.
   * @default 12
   */
  threshold?: number;
  /**
   * Minimum scroll delta in pixels required to reveal on upward scroll.
   * Lower value makes the header open instantly on upward flick.
   * @default 5
   */
  upThreshold?: number;
  /**
   * Distance from page top (in pixels) where the header is guaranteed visible.
   * @default 64
   */
  topOffset?: number;
  /**
   * When true, header visibility is locked to visible (e.g., when mobile menu or modal is open).
   * @default false
   */
  isLocked?: boolean;
}

export interface UseHeaderHeadroomReturn {
  /** Whether the header is currently visible (true = in view, false = hidden off-screen) */
  isVisible: boolean;
  /** Whether the page has been scrolled down past the initial threshold */
  isScrolled: boolean;
  /** Ref to attach to the `<header>` element for automatic focus tracking */
  headerRef: React.RefObject<HTMLElement | null>;
}

/**
 * High-performance headroom hook for smart auto-hiding navigation bars.
 * - Hides smoothly on downward scroll
 * - Automatically reveals on upward scroll
 * - Always visible at page top and when keyboard focus enters header
 * - Throttled via requestAnimationFrame and passive event listeners for silky 60/120fps
 * - Direction hysteresis to eliminate micro-scroll jitter
 */
export function useHeaderHeadroom({
  threshold = 12,
  upThreshold = 5,
  topOffset = 64,
  isLocked = false,
}: UseHeaderHeadroomOptions = {}): UseHeaderHeadroomReturn {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const headerRef = React.useRef<HTMLElement | null>(null);
  const lastScrollYRef = React.useRef<number>(0);
  const isVisibleRef = React.useRef<boolean>(true);
  const rafIdRef = React.useRef<number | null>(null);

  // Keep ref synchronized with state to avoid stale closures in event listeners
  isVisibleRef.current = isVisible;

  // If isLocked turns true, immediately ensure header is visible
  React.useEffect(() => {
    if (isLocked && !isVisibleRef.current) {
      isVisibleRef.current = true;
      setIsVisible(true);
    }
  }, [isLocked]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    lastScrollYRef.current = Math.max(0, window.scrollY);
    const initialScrolled = lastScrollYRef.current > 10;
    setIsScrolled(initialScrolled);

    const handleScroll = () => {
      if (rafIdRef.current !== null) return;

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;

        const currentScrollY = Math.max(0, window.scrollY);

        // Update isScrolled status for shadow/styling
        const hasScrolledPastTop = currentScrollY > 10;
        setIsScrolled((prev) => (prev !== hasScrolledPastTop ? hasScrolledPastTop : prev));

        // When locked, keep header pinned visible
        if (isLocked) {
          if (!isVisibleRef.current) {
            isVisibleRef.current = true;
            setIsVisible(true);
          }
          lastScrollYRef.current = currentScrollY;
          return;
        }

        // 1. Always visible when near top of document
        if (currentScrollY <= topOffset) {
          if (!isVisibleRef.current) {
            isVisibleRef.current = true;
            setIsVisible(true);
          }
          lastScrollYRef.current = currentScrollY;
          return;
        }

        // 2. Prevent bottom-bounce on macOS/iOS elastic scrolling
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (currentScrollY > maxScroll) {
          return;
        }

        const lastScrollY = lastScrollYRef.current;
        const currentlyVisible = isVisibleRef.current;

        if (currentlyVisible) {
          // If currently visible: track downward scroll
          if (currentScrollY < lastScrollY) {
            // Scrolling up: reset anchor point to current lower position
            lastScrollYRef.current = currentScrollY;
          } else if (currentScrollY - lastScrollY >= threshold) {
            // Scrolled DOWN beyond threshold -> hide header
            isVisibleRef.current = false;
            setIsVisible(false);
            lastScrollYRef.current = currentScrollY;
          }
        } else {
          // If currently hidden: track upward scroll
          if (currentScrollY > lastScrollY) {
            // Scrolling down further: reset anchor point to current higher position
            lastScrollYRef.current = currentScrollY;
          } else if (lastScrollY - currentScrollY >= upThreshold) {
            // Scrolled UP beyond upThreshold -> immediately reveal header
            isVisibleRef.current = true;
            setIsVisible(true);
            lastScrollYRef.current = currentScrollY;
          }
        }
      });
    };

    // Ensure keyboard navigation reveals the header if focus moves inside it
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Node | null;
      if (target && headerRef.current && headerRef.current.contains(target)) {
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsVisible(true);
          lastScrollYRef.current = Math.max(0, window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focusin', handleFocusIn);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [threshold, upThreshold, topOffset, isLocked]);

  return {
    isVisible,
    isScrolled,
    headerRef,
  };
}
