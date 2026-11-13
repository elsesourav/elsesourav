'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Lightbox } from '@elsesourav/ui/interior';
import { cn, Button, IconButton } from '@elsesourav/ui';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Smartphone,
  Laptop,
  Monitor,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function isVideoMedia(url?: string | null): boolean {
  if (!url) return false;
  const parts = url.split('?');
  const base = parts[0] ? parts[0].toLowerCase() : '';
  return (
    base.endsWith('.mp4') ||
    base.endsWith('.webm') ||
    base.endsWith('.ogg') ||
    base.endsWith('.mov') ||
    base.includes('youtube.com') ||
    base.includes('youtu.be') ||
    base.includes('vimeo.com')
  );
}

interface AppMediaShowcaseProps {
  appName: string;
  screenshots: readonly string[];
  featuredImageUrl?: string | null;
  videoUrl?: string | null;
  platforms?: readonly string[];
}

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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Drag to scroll logic
  const isDraggingRef = React.useRef(false);
  const hasDraggedRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

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
  }, [checkScrollState, allImages.length, videoUrl, isExpanded]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth;
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

  const totalItems = (videoUrl ? 1 : 0) + allImages.length;
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
            className="space-y-3 sm:space-y-4 pt-1"
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

            {/* Screenshots Grid: 1 col for single image, 2 cols for gallery with tight, elegant gap */}
            <div
              className={
                allImages.length === 1
                  ? 'w-full'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5'
              }
            >
              {allImages.map((src, idx) => {
                const transformed = getAppScreenshotUrl(src, 1600, 1000);
                const isVideo = isVideoMedia(src);
                return (
                  <div
                    key={src}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden border border-[hsl(var(--border))] dark:border-zinc-800/80 bg-[hsl(var(--card))] dark:bg-zinc-950 shadow-sm transition-colors duration-200 group/card cursor-zoom-in"
                  >
                    <Image
                      src={transformed}
                      alt={`${appName} preview ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Bottom Line Controls: Expand icon only in bottom right position, smooth transition on hover, zero effect on image */}
                    <div className="absolute right-3 bottom-3 z-10 opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-300 ease-out pointer-events-none">
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(idx);
                        }}
                        aria-label={`Expand ${appName} preview ${idx + 1}`}
                        icon={<Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                        className="rounded-xl bg-black/70 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 dark:border-zinc-700/80 text-white backdrop-blur-xl pointer-events-auto"
                      />
                    </div>
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
                'absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-xl backdrop-blur-xl transition-all duration-300',
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
                'absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-xl backdrop-blur-xl transition-all duration-300',
                canScrollRight
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-90 pointer-events-none'
              )}
            />

            {/* Scroll Container with breathing padding (pt-2 pb-6 px-2) preventing shadow clipping */}
            <div
              ref={scrollContainerRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUpOrLeave}
              onMouseLeave={onMouseUpOrLeave}
              className="flex items-center gap-3 sm:gap-4 overflow-x-auto pt-2 pb-6 px-2 -mx-2 no-scrollbar cursor-grab active:cursor-grabbing select-none scroll-smooth snap-x snap-mandatory"
            >
              {/* Optional Video Card with identical 2-card fit */}
              {videoUrl && (
                <AppMediaVideoCard
                  videoUrl={videoUrl}
                  posterUrl={featuredImageUrl || allImages[0]}
                  appName={appName}
                  className="w-[86vw] sm:w-[calc(50%-8px)] aspect-[16/10] snap-start shrink-0"
                />
              )}

              {/* Screenshot Cards: exactly 2 images fit per view on sm+ */}
              {allImages.map((src, idx) => {
                const transformed = getAppScreenshotUrl(src, 1600, 1000);
                return (
                  <div
                    key={src}
                    onClick={() => {
                      if (!hasDraggedRef.current) {
                        setLightboxIndex(idx);
                      }
                    }}
                    className="relative w-[86vw] sm:w-[calc(50%-8px)] aspect-[16/10] shrink-0 rounded-xl overflow-hidden border border-[hsl(var(--border))] dark:border-zinc-800/80 bg-[hsl(var(--card))] dark:bg-zinc-950 shadow-sm transition-colors duration-200 group/card cursor-zoom-in snap-start"
                  >
                    <Image
                      src={transformed}
                      alt={`${appName} preview ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Bottom Line Controls: Expand icon only in bottom right position, smooth transition on hover, zero effect on image */}
                    <div className="absolute right-3 bottom-3 z-10 opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-300 ease-out pointer-events-none">
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(idx);
                        }}
                        aria-label={`Expand ${appName} preview ${idx + 1}`}
                        icon={<Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                        className="rounded-xl bg-black/70 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 dark:border-zinc-700/80 text-white backdrop-blur-xl pointer-events-auto"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Device & Platform Row with Expand / Collapse Toggle on the Right ── */}
      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] px-1 pt-1 border-b border-[hsl(var(--border-subtle))] pb-3">
        {/* Left: Device Icons & Platform Names */}
        <div className="flex items-center gap-2 font-mono">
          <Smartphone className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <Laptop className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <Monitor className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <span className="text-[hsl(var(--foreground))] font-medium text-[11px] sm:text-xs">
            {platforms.join(', ') || 'Web, Desktop & Mobile'}
          </span>
        </div>

        {/* Right: Expand / Collapse Toggle with downward arrow for Expand and upward for Collapse */}
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-xl px-3"
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
          src={getAppScreenshotUrl(allImages[lightboxIndex], 1920, 1080)}
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
