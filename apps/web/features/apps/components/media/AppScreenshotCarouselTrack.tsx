'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import type { GalleryMediaItem, ScreenshotAspect } from './screenshot-grid-layout';

interface AppScreenshotCarouselTrackProps {
  appName: string;
  items: readonly GalleryMediaItem[];
  aspectMap: Record<string, ScreenshotAspect>;
  onOpenLightbox: (url: string) => void;
  onImageLoadAspect?: (url: string, aspect: ScreenshotAspect) => void;
  onScrollBoundsChange?: (canLeft: boolean, canRight: boolean) => void;
}

export interface AppScreenshotCarouselTrackHandle {
  scrollLeft: () => void;
  scrollRight: () => void;
}

export const AppScreenshotCarouselTrack = React.forwardRef<
  AppScreenshotCarouselTrackHandle,
  AppScreenshotCarouselTrackProps
>(function AppScreenshotCarouselTrack(
  {
    appName,
    items,
    aspectMap,
    onOpenLightbox,
    onImageLoadAspect,
    onScrollBoundsChange,
  },
  ref
) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Mouse drag-to-scroll state
  const isDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftStartRef = React.useRef(0);
  const hasDraggedRef = React.useRef(false);
  const [isDraggingState, setIsDraggingState] = React.useState(false);

  // Update scroll navigation bounds
  const updateScrollBounds = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 6;
    const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 6;
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
    onScrollBoundsChange?.(canLeft, canRight);
  }, [onScrollBoundsChange]);

  React.useEffect(() => {
    updateScrollBounds();
    const el = trackRef.current;
    if (!el) return;

    const onResize = () => updateScrollBounds();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [items, updateScrollBounds]);

  const handleScrollStep = React.useCallback((direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = Math.max(320, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Expose scrollLeft and scrollRight to parent via ref
  React.useImperativeHandle(
    ref,
    () => ({
      scrollLeft: () => handleScrollStep('left'),
      scrollRight: () => handleScrollStep('right'),
    }),
    [handleScrollStep]
  );

  // Drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    const currentX = e.pageX - el.offsetLeft;
    const walk = currentX - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
      if (!isDraggingState) setIsDraggingState(true);
    }
    el.scrollLeft = scrollLeftStartRef.current - walk;
    updateScrollBounds();
  };

  const onMouseUpOrLeave = () => {
    isDownRef.current = false;
    if (isDraggingState) {
      setTimeout(() => {
        setIsDraggingState(false);
        hasDraggedRef.current = false;
      }, 50);
    }
  };

  const handleCardClick = (url: string) => {
    if (hasDraggedRef.current || isDraggingState) {
      return;
    }
    onOpenLightbox(url);
  };

  return (
    <div className="relative w-full group/carousel px-0 sm:px-10 lg:px-11">
      {/* Outer Left Slide Button - Dedicated side gutter, never covers image */}
      <button
        type="button"
        onClick={() => handleScrollStep('left')}
        disabled={!canScrollLeft}
        aria-label="Scroll screenshots left"
        className="hidden sm:flex absolute left-0.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-9 md:h-9 rounded-full items-center justify-center bg-white/95 hover:bg-white dark:bg-zinc-900/95 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white border border-zinc-200/90 dark:border-zinc-700/80 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:pointer-events-none backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-zinc-800 dark:text-white" />
      </button>

      {/* Outer Right Slide Button - Dedicated side gutter, never covers image */}
      <button
        type="button"
        onClick={() => handleScrollStep('right')}
        disabled={!canScrollRight}
        aria-label="Scroll screenshots right"
        className="hidden sm:flex absolute right-0.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-9 md:h-9 rounded-full items-center justify-center bg-white/95 hover:bg-white dark:bg-zinc-900/95 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white border border-zinc-200/90 dark:border-zinc-700/80 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:pointer-events-none backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-zinc-800 dark:text-white" />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        onScroll={updateScrollBounds}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className={`flex gap-2 sm:gap-2.5 md:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5 touch-pan-x select-none items-center h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] ${
          isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {items.map((item) => {
          const isVideo = item.type === 'video';
          const aspect = isVideo ? 'landscape' : aspectMap[item.url] || 'landscape';
          const isPortrait = aspect === 'portrait';

          return (
            <div
              key={item.id}
              onClick={() => !isVideo && handleCardClick(item.url)}
              className={`relative h-full shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-100/90 dark:bg-zinc-950/80 shadow-xs hover:shadow-lg hover:border-indigo-500/60 transition-all duration-200 group/card ${
                isPortrait ? 'aspect-[3/4]' : 'aspect-[16/9]'
              } ${isVideo ? '' : 'cursor-pointer'}`}
            >
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-100/60 dark:bg-black/40">
                {isVideo ? (
                  <div className="relative w-full h-full overflow-hidden bg-black">
                    <AppMediaVideoCard
                      videoUrl={item.url}
                      appName={appName}
                      className="w-full h-full"
                    />
                    <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-black/80 text-white border border-white/20">
                      VIDEO
                    </span>
                  </div>
                ) : (
                  <>
                    <Image
                      src={getAppScreenshotUrl(item.url, 2560, 1440, 'limit')}
                      alt={`${appName} screenshot ${item.originalIndex}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 85vw, 900px"
                      className="w-full h-full object-contain rounded-xl sm:rounded-2xl group-hover/card:scale-[1.01] transition-transform duration-300 ease-out"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth && img.naturalHeight && onImageLoadAspect) {
                          const detectedAspect: ScreenshotAspect =
                            img.naturalHeight > img.naturalWidth * 1.05
                              ? 'portrait'
                              : 'landscape';
                          if (detectedAspect !== aspect) {
                            onImageLoadAspect(item.url, detectedAspect);
                          }
                        }
                      }}
                    />

                    {/* Subtle Expand Indicator on Hover */}
                    <div className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-white/85 dark:bg-black/70 hover:bg-white dark:hover:bg-black/90 text-zinc-800 dark:text-white backdrop-blur-md border border-zinc-200 dark:border-white/15 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center pointer-events-none shadow-xs">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
