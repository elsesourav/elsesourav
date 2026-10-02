'use client';

import * as React from 'react';

/**
 * Calculates adaptive warmup delay in milliseconds based on client device specs.
 * - High-end (8+ cores, 8+ GB RAM): ~1600ms
 * - Mid-range (4-7 cores, 4+ GB RAM): ~2000ms
 * - Low-end / mobile / battery-saving: ~2500ms
 */
export function getDeviceWarmupDelay(): number {
  if (typeof window === 'undefined') return 2000;

  const nav = window.navigator as unknown as {
    hardwareConcurrency?: number;
    deviceMemory?: number;
  };

  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;

  if (cores >= 8 && memory >= 8) {
    return 1600; // ~1.6s
  }
  if (cores >= 4 && memory >= 4) {
    return 2000; // ~2.0s
  }
  return 2500; // ~2.5s or more for low-end / mobile
}

export interface UseScenePerformanceOptions {
  elementId?: string;
  threshold?: number;
}

export function useScenePerformance<T extends HTMLElement = HTMLDivElement>(
  options?: UseScenePerformanceOptions
) {
  const elementId = options?.elementId ?? 'hero';
  const threshold = options?.threshold ?? 0.05;
  const targetRef = React.useRef<T | null>(null);

  const [isSceneActive, setIsSceneActive] = React.useState(true);
  const [isWarmingUp, setIsWarmingUp] = React.useState(false);
  const [warmupDelay, setWarmupDelay] = React.useState(2000);

  const warmupTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const wasEverInactiveRef = React.useRef(false);
  const isIntersectingRef = React.useRef(true);
  const isDocVisibleRef = React.useRef(true);
  const isWindowFocusedRef = React.useRef(true);

  const clearTimer = React.useCallback(() => {
    if (warmupTimerRef.current) {
      clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
  }, []);

  const evaluateState = React.useCallback(() => {
    const isNowActive =
      isIntersectingRef.current &&
      isDocVisibleRef.current &&
      isWindowFocusedRef.current;

    if (!isNowActive) {
      // Section is not visible or window/tab is inactive:
      // Immediately stop animations, apply subtle blur, cancel any pending warmup
      wasEverInactiveRef.current = true;
      clearTimer();
      setIsWarmingUp(false);
      setIsSceneActive(false);
    } else {
      // Returning from inactive state:
      if (wasEverInactiveRef.current) {
        clearTimer();
        setIsWarmingUp(true);
        setIsSceneActive(false);

        const delay = getDeviceWarmupDelay();
        setWarmupDelay(delay);

        warmupTimerRef.current = setTimeout(() => {
          setIsSceneActive(true);
          setIsWarmingUp(false);
          warmupTimerRef.current = null;
        }, delay);
      } else {
        // Initial state
        setIsSceneActive(true);
        setIsWarmingUp(false);
      }
    }
  }, [clearTimer]);

  React.useEffect(() => {
    setWarmupDelay(getDeviceWarmupDelay());

    const handleFocus = () => {
      isWindowFocusedRef.current = true;
      evaluateState();
    };

    const handleBlur = () => {
      isWindowFocusedRef.current = false;
      evaluateState();
    };

    const handleVisibilityChange = () => {
      isDocVisibleRef.current = !document.hidden;
      evaluateState();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial environment state
    isDocVisibleRef.current = typeof document !== 'undefined' ? !document.hidden : true;
    isWindowFocusedRef.current =
      typeof document !== 'undefined' && typeof document.hasFocus === 'function'
        ? document.hasFocus()
        : true;

    // Observe element intersection
    const element =
      targetRef.current || (typeof document !== 'undefined' ? document.getElementById(elementId) : null);

    let observer: IntersectionObserver | null = null;
    if (element && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isIntersectingRef.current = entry?.isIntersecting ?? false;
          evaluateState();
        },
        { threshold }
      );
      observer.observe(element);
    }

    evaluateState();

    return () => {
      clearTimer();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [evaluateState, threshold, elementId, clearTimer]);

  const blurStyle: React.CSSProperties = React.useMemo(
    () => ({
      filter: isSceneActive ? 'blur(0px)' : 'blur(1.5px)',
      transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'filter',
    }),
    [isSceneActive]
  );

  return {
    targetRef,
    isSceneActive,
    isWarmingUp,
    warmupDelay,
    blurStyle,
    animationPlayState: (isSceneActive ? 'running' : 'paused') as 'running' | 'paused',
  };
}
