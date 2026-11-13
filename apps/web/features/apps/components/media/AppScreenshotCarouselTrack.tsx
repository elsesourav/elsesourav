'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card, IconButton } from '@elsesourav/ui';
import { ChevronLeft, ChevronRight, Maximize2, Smartphone, Monitor } from 'lucide-react';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import type { GalleryMediaItem, ScreenshotAspect } from './screenshot-grid-layout';

interface AppScreenshotCarouselTrackProps {
  appName: string;
  items: readonly GalleryMediaItem[];
  aspectMap: Record<string, ScreenshotAspect>;
  onOpenLightbox: (url: string) => void;
  onImageLoadAspect?: (url: string, aspect: ScreenshotAspect) => void;
}

export interface AppScreenshotCarouselTrackHandle {
  scrollLeft: () => void;
  scrollRight: () => void;
}

export const AppScreenshotCarouselTrack = React.forwardRef<
  AppScreenshotCarouselTrackHandle,
  AppScreenshotCarouselTrackProps
>(function AppScreenshotCarouselTrack(
  { appName, items, aspectMap, onOpenLightbox, onImageLoadAspect },
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
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

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
    const scrollAmount = Math.max(300, Math.floor(el.clientWidth * 0.75));
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
    <div className="relative w-full group/carousel">
      {/* Floating Left Arrow */}
      {canScrollLeft && (
        <div className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20">
          <IconButton
            icon={<ChevronLeft className="w-4 h-4" />}
            aria-label="Scroll left"
            size="md"
            variant="ghost"
            onClick={() => handleScrollStep('left')}
            className="rounded-full shadow-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md border border-white/20"
          />
        </div>
      )}

      {/* Floating Right Arrow */}
      {canScrollRight && (
        <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20">
          <IconButton
            icon={<ChevronRight className="w-4 h-4" />}
            aria-label="Scroll right"
            size="md"
            variant="ghost"
            onClick={() => handleScrollStep('right')}
            className="rounded-full shadow-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md border border-white/20"
          />
        </div>
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        onScroll={updateScrollBounds}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className={`flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 touch-pan-x select-none items-center h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] ${
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
              className={`relative h-full shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 sm:p-2.5 shadow-md hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 group/card ${
                isPortrait ? 'aspect-[9/16]' : 'aspect-[16/9]'
              } ${isVideo ? '' : 'cursor-pointer'}`}
            >
              <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                {isVideo ? (
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                    <AppMediaVideoCard
                      videoUrl={item.url}
                      appName={appName}
                      className="w-full h-full"
                    />
                    <span className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/80 text-white border border-white/20">
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
                      sizes="(max-width: 768px) 80vw, 800px"
                      className="w-full h-full object-contain rounded-xl sm:rounded-2xl group-hover/card:scale-[1.015] transition-transform duration-300 ease-out"
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

                    {/* Original Index Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-black/75 dark:bg-zinc-950/80 text-white backdrop-blur-md border border-white/10 pointer-events-none">
                      #{String(item.originalIndex).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                    </div>

                    {/* Aspect Ratio Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
                      {isPortrait ? (
                        <>
                          <Smartphone className="w-2.5 h-2.5 text-indigo-400" />
                          <span>9:16</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="w-2.5 h-2.5 text-emerald-400" />
                          <span>16:9</span>
                        </>
                      )}
                    </div>

                    {/* Expand Trigger Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLightbox(item.url);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/75 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 text-white backdrop-blur-xl transition-all active:scale-95 shadow-lg opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 flex items-center justify-center cursor-pointer z-10"
                      aria-label={`Expand screenshot ${item.originalIndex}`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
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
