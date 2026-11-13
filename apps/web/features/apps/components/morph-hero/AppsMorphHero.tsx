'use client';

import { getAppBannerDesktopUrl, getAppBannerMobileUrl } from '@elsesourav/media';
import type { AppListItem } from '@elsesourav/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import MorphSlider, { type MorphSliderRef } from './MorphSlider';
import { triggerPageTransition } from '@/components/loading/PageTransitionLoader';

const FALLBACK_HERO_DESKTOP_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=2100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=2100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=2100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2100&auto=format&fit=crop&q=80',
];

const FALLBACK_HERO_MOBILE_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=1600&auto=format&fit=crop&q=80',
];

export interface AppsMorphHeroProps {
  apps: readonly AppListItem[];
  /** Autoplay interval in seconds. Defaults to 5. */
  autoplayIntervalSeconds?: number;
  /** Whether to pause autoplay when hovering over the slider. Defaults to false. */
  pauseOnHover?: boolean;
}

/**
 * Featured Projects Showcase using MorphSlider GPU-accelerated transition.
 * - Mobile: 3:4 aspect ratio with mobile banner (featuredImageMobileUrl)
 * - Desktop: 21:9 aspect ratio with desktop banner (featuredImageUrl)
 * - Pure graphic banner artwork with ZERO overlaid text, badges, or gradient darkness.
 * - Clicking the slide directly opens the application.
 */
export function AppsMorphHero({
  apps,
  autoplayIntervalSeconds = 5,
  pauseOnHover = false,
}: AppsMorphHeroProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [progressKey, setProgressKey] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const sliderRef = React.useRef<MorphSliderRef>(null);

  const isPaused = pauseOnHover && isHovered;

  const handleIndexChange = React.useCallback((nextIndex: number) => {
    setActiveIndex(nextIndex);
    setProgressKey((k) => k + 1);
  }, []);

  // Track click vs drag to avoid accidental navigation during swipe/drag
  const pointerStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingGestureRef = React.useRef(false);

  // Responsive media query listener for mobile vs desktop aspect ratio image source
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 639px)');
    setIsMobile(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const morphItems = React.useMemo(() => {
    return apps.map((app, index) => {
      let imageUrl: string;
      if (isMobile) {
        imageUrl = app.featuredImageMobileUrl
          ? getAppBannerMobileUrl(app.featuredImageMobileUrl)
          : app.featuredImageUrl
            ? getAppBannerMobileUrl(app.featuredImageUrl)
            : FALLBACK_HERO_MOBILE_IMAGES[index % FALLBACK_HERO_MOBILE_IMAGES.length]!;
      } else {
        imageUrl = app.featuredImageUrl
          ? getAppBannerDesktopUrl(app.featuredImageUrl)
          : app.featuredImageMobileUrl
            ? getAppBannerDesktopUrl(app.featuredImageMobileUrl)
            : FALLBACK_HERO_DESKTOP_IMAGES[index % FALLBACK_HERO_DESKTOP_IMAGES.length]!;
      }
      return {
        image: imageUrl,
        caption: app.name,
      };
    });
  }, [apps, isMobile]);

  const handlePrev = React.useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    pointerStartRef.current = null;
    isDraggingGestureRef.current = false;
    setProgressKey((k) => k + 1);
    sliderRef.current?.prev();
  }, []);

  const handleNext = React.useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    pointerStartRef.current = null;
    isDraggingGestureRef.current = false;
    setProgressKey((k) => k + 1);
    sliderRef.current?.next();
  }, []);

  const handleGoToIndex = React.useCallback((targetIndex: number, e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    pointerStartRef.current = null;
    isDraggingGestureRef.current = false;
    setProgressKey((k) => k + 1);
    sliderRef.current?.goToIndex(targetIndex);
  }, []);

  const isInteractiveTarget = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(target.closest('button, [role="tab"], [role="button"], a'));
  };

  // Pointer interactions for click vs drag detection
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isInteractiveTarget(e.target)) {
      pointerStartRef.current = null;
      isDraggingGestureRef.current = false;
      return;
    }
    isDraggingGestureRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 8 || dy > 8) {
      isDraggingGestureRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isInteractiveTarget(e.target)) {
      pointerStartRef.current = null;
      isDraggingGestureRef.current = false;
      return;
    }
    if (!pointerStartRef.current || isDraggingGestureRef.current) {
      pointerStartRef.current = null;
      isDraggingGestureRef.current = false;
      return;
    }
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    const dt = Date.now() - pointerStartRef.current.time;

    // If pointer barely moved (< 8px) and was quick (< 450ms), treat as click on slide banner
    if (dx < 8 && dy < 8 && dt < 450) {
      const activeApp = apps[activeIndex];
      if (activeApp?.slug) {
        triggerPageTransition(`/apps/${activeApp.slug}`);
        router.push(`/apps/${activeApp.slug}`);
      }
    }
    pointerStartRef.current = null;
    isDraggingGestureRef.current = false;
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
    isDraggingGestureRef.current = false;
  };

  const activeApp = apps[activeIndex] ?? apps[0];
  if (!activeApp || apps.length === 0) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Projects Banner Showcase"
      style={{
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        maskImage: 'radial-gradient(white, black)',
      }}
      className="group/hero relative w-full rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] dark:bg-[#0a0a0c] isolate [transform:translateZ(0)]"
    >
      <h2 className="sr-only">Featured Projects Showcase</h2>

      {/* 
        Aspect Ratio Container:
        - Mobile: aspect-[3/4] (3:4 portrait ratio for mobile screens)
        - Tablet & Desktop (sm and up): sm:aspect-[21/9] (21:9 ultrawide ratio)
        Pure Graphic Artwork — NO content or gradients overlaid on top!
      */}
      <div
        style={{
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          maskImage: 'radial-gradient(white, black)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        className="relative w-full aspect-[3/4] sm:aspect-[21/9] sm:max-h-none overflow-hidden rounded-[14px] isolate [transform:translateZ(0)] cursor-pointer"
      >
        <MorphSlider
          ref={sliderRef}
          items={morphItems}
          transition="melt"
          intensity={0.45}
          aberration={0.25}
          drift={0}
          duration={0.85}
          autoplay={apps.length > 1}
          autoplayDelay={autoplayIntervalSeconds}
          pauseOnHover={pauseOnHover}
          loop
          radius={14}
          overlayColor="#0a0a0c"
          showCaptions={false}
          showControls={false}
          showIndicators={false}
          onIndexChange={handleIndexChange}
          className="absolute inset-0 w-full h-full z-[2]"
        />

        {/* Left & Right Chevrons — Smooth entrance transition on hover */}
        {apps.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              onPointerDown={(e) => {
                e.stopPropagation();
                pointerStartRef.current = null;
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                pointerStartRef.current = null;
              }}
              aria-label="Previous project"
              className="pointer-events-auto absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-[20] w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/85 text-zinc-900 border border-zinc-200/90 shadow-md dark:bg-black/60 dark:text-white dark:border-white/20 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 backdrop-blur-md opacity-95 translate-x-0 sm:opacity-0 sm:-translate-x-3 sm:pointer-events-none sm:group-hover/hero:opacity-100 sm:group-hover/hero:translate-x-0 sm:group-hover/hero:pointer-events-auto active:scale-95 transition-all duration-300 ease-out group/btn"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-zinc-900 dark:text-white/90 transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              onPointerDown={(e) => {
                e.stopPropagation();
                pointerStartRef.current = null;
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                pointerStartRef.current = null;
              }}
              aria-label="Next project"
              className="pointer-events-auto absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-[20] w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/85 text-zinc-900 border border-zinc-200/90 shadow-md dark:bg-black/60 dark:text-white dark:border-white/20 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 backdrop-blur-md opacity-95 translate-x-0 sm:opacity-0 sm:translate-x-3 sm:pointer-events-none sm:group-hover/hero:opacity-100 sm:group-hover/hero:translate-x-0 sm:group-hover/hero:pointer-events-auto active:scale-95 transition-all duration-300 ease-out group/btn"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-zinc-900 dark:text-white/90 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>

            {/* Pagination Dots at Bottom Right with Auto-Advancing Progress Bar */}
            <div
              role="tablist"
              aria-label="Project slides"
              onPointerDown={(e) => {
                e.stopPropagation();
                pointerStartRef.current = null;
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                pointerStartRef.current = null;
              }}
              className="pointer-events-auto absolute bottom-2 right-2 sm:bottom-3 sm:right-4 z-[20] flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/10 shadow-sm"
            >
              {apps.map((app, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={app.id || index}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${index + 1}: ${app.name}`}
                    onClick={(e) => handleGoToIndex(index, e)}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      pointerStartRef.current = null;
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      pointerStartRef.current = null;
                    }}
                    className={`cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white relative overflow-hidden ${
                      isActive
                        ? 'w-4 sm:w-6 h-1 sm:h-1.5 bg-white/30 dark:bg-white/20 shadow-xs'
                        : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  >
                    {isActive && (
                      <span
                        key={`hero-progress-${index}-${progressKey}`}
                        className="animate-hero-progress absolute inset-y-0 left-0 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]"
                        style={{
                          animationDuration: `${autoplayIntervalSeconds}s`,
                          animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
