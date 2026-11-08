'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CanvasLogoLoader } from './CanvasLogoLoader';
import { AnimatedLoadingText } from './AnimatedLoadingText';
import { parseLogoPixels, type LogoPixelTuple } from './logoPixelData';

export interface PageTransitionLoaderProps {
  /** Optional custom site / brand name from database */
  siteName?: string;
  /** Optional custom logo URL from database */
  logoUrl?: string;
  /** Optional serialized logo pixel tuples */
  logoPixelsJson?: string | null;
  /** Pre-computed pixel matrix */
  pixelData?: readonly LogoPixelTuple[];
}

/**
 * Triggers full-screen page transition loader for programmatic navigations
 * (only fires when navigating to a different pathname).
 */
export function triggerPageTransition(targetPath: string) {
  if (typeof window === 'undefined') return;
  try {
    const targetUrl = new URL(targetPath, window.location.origin);
    if (targetUrl.pathname !== window.location.pathname) {
      window.dispatchEvent(
        new CustomEvent('page-transition-start', {
          detail: { pathname: targetUrl.pathname, url: targetPath },
        })
      );
    }
  } catch {
    // Ignore invalid URLs
  }
}

function PageTransitionLoaderInner({
  siteName = 'ElseSourav',
  logoUrl,
  logoPixelsJson,
  pixelData: directPixelData,
}: PageTransitionLoaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Initially active so cold load & page reload display the canvas animation
  const [isNavigating, setIsNavigating] = React.useState(true);
  const [isFadingOut, setIsFadingOut] = React.useState(false);
  const isInitialMountRef = React.useRef(true);
  const currentPathRef = React.useRef(pathname);
  const navStartTimeRef = React.useRef(0);

  const parsedPixelData = React.useMemo(() => {
    if (directPixelData && directPixelData.length > 0) return directPixelData;
    if (!logoPixelsJson) return undefined;
    try {
      return parseLogoPixels(logoPixelsJson);
    } catch {
      return undefined;
    }
  }, [directPixelData, logoPixelsJson]);

  // 1. Initial Page Load & Page Reload Handler
  React.useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      navStartTimeRef.current = performance.now();

      // Allow initial particle convergence (~1250ms) to complete smoothly on reload
      const minInitialDisplayMs = 1250;
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const finishTimer = setTimeout(() => {
          setIsNavigating(false);
          setIsFadingOut(false);
        }, 320);
        return () => clearTimeout(finishTimer);
      }, minInitialDisplayMs);

      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Cross-Route Page Navigation Handler
  React.useEffect(() => {
    if (currentPathRef.current !== pathname) {
      currentPathRef.current = pathname;
      if (isNavigating) {
        // Enforce smooth minimum display time so fast pages don't abruptly flash or jerk
        const elapsed = performance.now() - navStartTimeRef.current;
        const minVisibleMs = 450;
        const delay = Math.max(0, minVisibleMs - elapsed);

        const timer = setTimeout(() => {
          setIsFadingOut(true);
          const finishTimer = setTimeout(() => {
            setIsNavigating(false);
            setIsFadingOut(false);
          }, 320);
          return () => clearTimeout(finishTimer);
        }, delay);

        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isNavigating]);

  // 3. Intercept Client Link Clicks & Custom Page Transition Events
  React.useEffect(() => {
    const startTransition = (destination: string) => {
      navStartTimeRef.current = performance.now();

      // Explicitly navigate via router to guarantee the transition starts
      router.push(destination);

      // Render the transition overlay on the next animation frame
      // so native click dispatch finishes without being aborted by React DOM reconciliation
      requestAnimationFrame(() => {
        setIsFadingOut(false);
        setIsNavigating(true);
      });
    };

    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore non-primary or modified clicks (Ctrl, Cmd, Shift, Alt)
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore fragments, protocols, download links, target=_blank
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('target') === '_blank'
      ) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.origin);
        // Only trigger for same-origin navigations
        if (targetUrl.origin !== window.location.origin) {
          return;
        }

        // CRITICAL: ONLY trigger when changing to a DIFFERENT pathname / page!
        // Ignore same-page filter changes, search queries, pagination, or tab changes!
        if (targetUrl.pathname === window.location.pathname) {
          return;
        }

        const destination = targetUrl.pathname + targetUrl.search + targetUrl.hash;
        startTransition(destination);
      } catch {
        // Ignore invalid URLs
      }
    };

    const handlePopState = () => {
      if (window.location.pathname !== currentPathRef.current) {
        navStartTimeRef.current = performance.now();
        setIsFadingOut(false);
        setIsNavigating(true);
      }
    };

    const handleCustomTransition = (e: Event) => {
      const customEvent = e as CustomEvent<{ pathname?: string; url?: string }>;
      const dest = customEvent.detail?.url || customEvent.detail?.pathname;
      if (dest) {
        try {
          const targetUrl = new URL(dest, window.location.origin);
          if (targetUrl.pathname !== window.location.pathname) {
            startTransition(targetUrl.pathname + targetUrl.search + targetUrl.hash);
          }
        } catch {
          // Ignore invalid URLs
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('page-transition-start', handleCustomTransition);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('page-transition-start', handleCustomTransition);
    };
  }, [router]);

  // Safety fallback: auto-dismiss after 6 seconds in case navigation is cancelled or errors
  React.useEffect(() => {
    if (!isNavigating) return;

    const safetyTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsNavigating(false);
        setIsFadingOut(false);
      }, 320);
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [isNavigating]);

  // Keyboard shortcut: Escape to immediately cancel loader overlay
  React.useEffect(() => {
    if (!isNavigating) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsNavigating(false);
          setIsFadingOut(false);
        }, 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading requested page"
      className={`fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center bg-[hsl(var(--background))]/85 backdrop-blur-md transition-opacity duration-300 ease-out select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background bloom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] bg-indigo-500/15 blur-[100px] sm:blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] bg-cyan-500/15 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      <CanvasLogoLoader
        fullScreen
        durationMs={1400}
        logoUrl={logoUrl}
        pixelData={parsedPixelData}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[110px] z-10 flex flex-col items-center gap-1.5 text-center pointer-events-none">
        <span className="text-sm font-semibold tracking-wider uppercase text-[hsl(var(--foreground))]">
          {siteName}
        </span>
        <AnimatedLoadingText label="Loading" subLabel="Personal Software Studio" />
      </div>
    </div>
  );
}

export function PageTransitionLoader(props: PageTransitionLoaderProps) {
  return (
    <React.Suspense fallback={null}>
      <PageTransitionLoaderInner {...props} />
    </React.Suspense>
  );
}
