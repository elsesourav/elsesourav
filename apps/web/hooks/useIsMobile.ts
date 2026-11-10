'use client';

import * as React from 'react';

export interface UseIsMobileOptions {
  breakpoint?: number;
  defaultState?: boolean;
}

/**
 * High-performance responsive viewport hook.
 * Uses matchMedia with event listener, SSR-safe with hydration synchronization.
 */
export function useIsMobile(options?: UseIsMobileOptions): {
  isMobile: boolean;
  isMounted: boolean;
} {
  const breakpoint = options?.breakpoint ?? 768;
  const defaultState = options?.defaultState ?? false;

  const [isMobile, setIsMobile] = React.useState<boolean>(defaultState);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = `(max-width: ${breakpoint - 1}px)`;
    const mql = window.matchMedia(query);

    setIsMobile(mql.matches);
    setIsMounted(true);

    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, [breakpoint]);

  return { isMobile, isMounted };
}
