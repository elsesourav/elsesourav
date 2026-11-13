'use client';

import * as React from 'react';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Lightbox } from '@elsesourav/ui/interior';
import { cn, Button, IconButton } from '@elsesourav/ui';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import { AppMediaPhoneCard } from './AppMediaPhoneCard';
import { AppMediaLandscapeCard } from './AppMediaLandscapeCard';
import { inspectUrlDimensions, type ImageDimensionInfo } from '@/features/admin/media/utils/image-dimensions';
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Laptop,
  Monitor,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppMediaShowcaseProps {
  appName: string;
  screenshots: readonly string[];
  featuredImageUrl?: string | null;
  videoUrl?: string | null;
  platforms?: readonly string[];
}

type DeviceFilter = 'all' | 'desktop' | 'mobile';

export function AppMediaShowcase({
  appName,
  screenshots,
  featuredImageUrl,
  videoUrl,
  platforms = ['Web Browser'],
}: AppMediaShowcaseProps) {
  // Combine all images
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (featuredImageUrl) list.push(featuredImageUrl);
    if (screenshots && screenshots.length > 0) {
      for (const s of screenshots) {
        if (!list.includes(s)) list.push(s);
      }
    }
    return list;
  }, [featuredImageUrl, screenshots]);

  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<DeviceFilter>('all');
  const [dimensionsMap, setDimensionsMap] = React.useState<Record<string, ImageDimensionInfo>>({});

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Drag to scroll logic
  const isDraggingRef = React.useRef(false);
  const hasDraggedRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  // Inspect image dimensions for responsive framing (desktop vs mobile)
  React.useEffect(() => {
    let cancelled = false;

    allImages.forEach((src) => {
      if (dimensionsMap[src]) return;
      void inspectUrlDimensions(src).then((info) => {
        if (!cancelled) {
          setDimensionsMap((prev) => ({ ...prev, [src]: info }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [allImages, dimensionsMap]);

  // Count desktop vs mobile screenshots
  const { desktopCount, mobileCount } = React.useMemo(() => {
    let d = 0;
    let m = 0;
    for (const src of allImages) {
      const dim = dimensionsMap[src];
      if (dim?.isPortrait) {
        m++;
      } else {
        d++;
      }
    }
    return { desktopCount: d, mobileCount: m };
  }, [allImages, dimensionsMap]);

  // Filter images based on selected device filter
  const displayedImages = React.useMemo(() => {
    if (activeFilter === 'all') return allImages;
    return allImages.filter((src) => {
      const dim = dimensionsMap[src];
      if (activeFilter === 'mobile') return dim?.isPortrait === true;
      if (activeFilter === 'desktop') return !dim || dim.isPortrait === false;
      return true;
    });
  }, [allImages, activeFilter, dimensionsMap]);

  const checkScrollState = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  React.useEffect(() => {
    if (isExpanded) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollState();

    const handleScroll = () => {
      checkScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      checkScrollState();
    });
    ro.observe(el);

    const t1 = setTimeout(checkScrollState, 150);
    const t2 = setTimeout(checkScrollState, 350);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [checkScrollState, displayedImages.length, videoUrl, isExpanded, activeFilter]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollState, 250);
    setTimeout(checkScrollState, 450);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    checkScrollState();
  };

  const totalItems = (videoUrl ? 1 : 0) + displayedImages.length;
  if (totalItems === 0) return null;

  return (
    <section
      aria-labelledby="app-media-showcase-heading"
      className="space-y-3 relative group/showcase"
    >
      <AnimatePresence mode="wait" initial={false}>
        {/* ── Mode 1: Expanded View (All images shown on one page without scrollbars) ── */}
        {isExpanded ? (
          <motion.div
            key="expanded-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 pt-1"
          >
            {/* Optional Video Card in full-width expanded layout */}
            {videoUrl && (
              <div className="w-full">
                <AppMediaVideoCard
                  videoUrl={videoUrl}
                  posterUrl={featuredImageUrl || allImages[0]}
                  appName={appName}
                  className="w-full aspect-[16/10] sm:aspect-[16/9]"
                />
              </div>
            )}

            {/* Screenshots Grid: Adapts based on aspect ratios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 items-center">
              {displayedImages.map((src, idx) => {
                const isPortrait = dimensionsMap[src]?.isPortrait ?? false;
                const originalIndex = allImages.indexOf(src);

                if (isPortrait) {
                  return (
                    <div key={src} className="flex justify-center w-full">
                      <AppMediaPhoneCard
                        src={src}
                        appName={appName}
                        index={idx}
                        onExpand={() => setLightboxIndex(originalIndex !== -1 ? originalIndex : idx)}
                        className="w-full max-w-[280px]"
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={src}
                    className={
                      displayedImages.length === 1
                        ? 'md:col-span-2 lg:col-span-3'
                        : 'w-full'
                    }
                  >
                    <AppMediaLandscapeCard
                      src={src}
                      appName={appName}
                      index={idx}
                      onExpand={() => setLightboxIndex(originalIndex !== -1 ? originalIndex : idx)}
                      className="w-full aspect-[16/10] sm:aspect-[16/9]"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ── Mode 2: Collapsed Carousel View with Smooth Scroll ── */
          <motion.div
            key="carousel-mode"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Left Arrow Button */}
            <IconButton
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => scroll('left')}
              aria-label="Scroll media left"
              tabIndex={canScrollLeft ? 0 : -1}
              icon={<ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--foreground))]" />}
              className={cn(
                'absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 rounded-full shadow-xl backdrop-blur-xl transition-all duration-300',
                canScrollLeft
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-90 pointer-events-none'
              )}
            />

            {/* Right Arrow Button */}
            <IconButton
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => scroll('right')}
              aria-label="Scroll media right"
              tabIndex={canScrollRight ? 0 : -1}
              icon={<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--foreground))]" />}
              className={cn(
                'absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 rounded-full shadow-xl backdrop-blur-xl transition-all duration-300',
                canScrollRight
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-90 pointer-events-none'
              )}
            />

            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUpOrLeave}
              onMouseLeave={onMouseUpOrLeave}
              className="flex items-center gap-3 sm:gap-4 overflow-x-auto pt-2 pb-6 px-2 -mx-2 no-scrollbar cursor-grab active:cursor-grabbing select-none scroll-smooth snap-x snap-mandatory"
            >
              {/* Optional Video Card */}
              {videoUrl && (
                <AppMediaVideoCard
                  videoUrl={videoUrl}
                  posterUrl={featuredImageUrl || allImages[0]}
                  appName={appName}
                  className="w-[86vw] sm:w-[calc(50%-8px)] aspect-[16/10] snap-start shrink-0"
                />
              )}

              {/* Screenshot Cards: Ratio-Aware Desktop 16:9 vs Mobile 9:16 */}
              {displayedImages.map((src, idx) => {
                const isPortrait = dimensionsMap[src]?.isPortrait ?? false;
                const originalIndex = allImages.indexOf(src);

                const handleExpand = () => {
                  if (!hasDraggedRef.current) {
                    setLightboxIndex(originalIndex !== -1 ? originalIndex : idx);
                  }
                };

                if (isPortrait) {
                  return (
                    <AppMediaPhoneCard
                      key={src}
                      src={src}
                      appName={appName}
                      index={idx}
                      onExpand={handleExpand}
                      className="w-[210px] sm:w-[250px] shrink-0 snap-start"
                    />
                  );
                }

                return (
                  <AppMediaLandscapeCard
                    key={src}
                    src={src}
                    appName={appName}
                    index={idx}
                    onExpand={handleExpand}
                    className="w-[86vw] sm:w-[calc(50%-8px)] aspect-[16/10] shrink-0 snap-start"
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Device, Platform & Orientation Row with Expand / Collapse Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[hsl(var(--muted-foreground))] px-1 pt-1 border-b border-[hsl(var(--border-subtle))] pb-3">
        {/* Left: Device Icons & Platform or Ratio Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {desktopCount > 0 && mobileCount > 0 ? (
            /* Multi-Ratio Filter Buttons when both desktop & mobile exist */
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                All ({allImages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('desktop')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  activeFilter === 'desktop'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop ({desktopCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('mobile')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  activeFilter === 'mobile'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile ({mobileCount})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono">
              {mobileCount > 0 ? (
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <Laptop className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[hsl(var(--foreground))] font-medium text-[11px] sm:text-xs">
                {platforms.join(', ') || 'Web, Desktop & Mobile'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Expand / Collapse Toggle */}
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-xl px-3 self-end sm:self-auto"
          aria-expanded={isExpanded}
          title={isExpanded ? 'Collapse to carousel view' : 'Expand all images on one page'}
          leftIcon={
            isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
            )
          }
        >
          {isExpanded ? 'Collapse' : totalItems > 1 ? `Expand (${totalItems})` : 'Expand'}
        </Button>
      </div>

      {/* Lightbox for Fullscreen Image Inspection */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <Lightbox
          open={true}
          onClose={() => setLightboxIndex(null)}
          src={getAppScreenshotUrl(allImages[lightboxIndex], 1920, 1080, 'fit')}
          alt={`${appName} screenshot ${lightboxIndex + 1}`}
          caption={`${appName} — Screenshot ${lightboxIndex + 1} of ${allImages.length}`}
          index={lightboxIndex}
          total={allImages.length}
          onPrev={
            allImages.length > 1
              ? () =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : allImages.length - 1
                  )
              : undefined
          }
          onNext={
            allImages.length > 1
              ? () =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev < allImages.length - 1 ? prev + 1 : 0
                  )
              : undefined
          }
        />
      )}
    </section>
  );
}
