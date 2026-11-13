'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight, ChevronLeft, Lock } from 'lucide-react';
import { getAppIconUrl } from '@elsesourav/media';
import type { AppListItem } from '@elsesourav/types';
import { cn } from '@elsesourav/ui';

export interface ShelfCarouselRowProps {
  items: AppListItem[];
}

/**
 * Interactive Horizontal Carousel Track with Left/Right Navigation,
 * Drag-to-Scroll, and Smooth Adaptive Edge Gradient Fades.
 */
export function ShelfCarouselRow({ items }: ShelfCarouselRowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Drag interaction states
  const isMouseDownRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const startXRef = React.useRef(0);
  const scrollStartRef = React.useRef(0);
  const hasDraggedRef = React.useRef(false);

  const checkScrollState = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
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

    // Initial check after paint
    const t = setTimeout(checkScrollState, 150);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      ro.disconnect();
      clearTimeout(t);
    };
  }, [checkScrollState, items]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const cardStep = Math.min(el.clientWidth * 0.8, 680);
    el.scrollBy({
      left: direction === 'left' ? -cardStep : cardStep,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollStartRef.current = el.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      if (!isDragging) setIsDragging(true);
      hasDraggedRef.current = true;
    }
    containerRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
    checkScrollState();
  };

  return (
    <div className="relative group/carousel w-full max-w-full">
      {/* Left Edge Theme-Adaptive Gradient Scrim (Softened by 30%) */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-18',
          'transition-opacity duration-300 ease-out',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to right, hsl(var(--background) / 0.70) 0%, hsl(var(--background) / 0.35) 45%, hsl(var(--background) / 0) 100%)',
        }}
      />

      {/* Right Edge Theme-Adaptive Gradient Scrim (Softened by 30%) */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-18',
          'transition-opacity duration-300 ease-out',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to left, hsl(var(--background) / 0.70) 0%, hsl(var(--background) / 0.35) 45%, hsl(var(--background) / 0) 100%)',
        }}
      />

      {/* Floating Left Button — Softened blur & transparent surface */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        tabIndex={canScrollLeft ? 0 : -1}
        className={cn(
          'absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20',
          'w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center',
          'bg-[hsl(var(--card))]/85 hover:bg-[hsl(var(--surface-elevated))] dark:bg-zinc-800/85 dark:hover:bg-zinc-700/90',
          'text-[hsl(var(--foreground))] border border-[hsl(var(--border))]',
          'shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          canScrollLeft
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        )}
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[hsl(var(--foreground))]" />
      </button>

      {/* Floating Right Button — Softened blur & transparent surface */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        tabIndex={canScrollRight ? 0 : -1}
        className={cn(
          'absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20',
          'w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center',
          'bg-[hsl(var(--card))]/85 hover:bg-[hsl(var(--surface-elevated))] dark:bg-zinc-800/85 dark:hover:bg-zinc-700/90',
          'text-[hsl(var(--foreground))] border border-[hsl(var(--border))]',
          'shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          canScrollRight
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        )}
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[hsl(var(--foreground))]" />
      </button>

      {/* Horizontal Carousel Track */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={cn(
          'flex gap-2 sm:gap-3.5 md:gap-4 overflow-x-auto scroll-smooth scrollbar-none py-1 sm:py-1.5 px-0.5 select-none snap-x snap-mandatory',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        {items.map((app) => {
          const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
          const bannerUrl = app.featuredImageUrl || iconUrl || app.iconUrl;
          const hasRating = Boolean(
            app.ratingAverage &&
              app.ratingAverage > 0 &&
              (app.ratingCount === undefined || app.ratingCount > 0)
          );
          const rating = hasRating && app.ratingAverage ? app.ratingAverage.toFixed(1) : null;

          return (
            <Link
              key={app.id}
              href={`/apps/${app.slug}`}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  hasDraggedRef.current = false;
                }
              }}
              className="group/item block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 w-[230px] xs:w-[260px] sm:w-[300px] md:w-[340px] shrink-0 snap-start h-full flex flex-col"
            >
              {/* Unified Card Container */}
              <div className="relative rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all duration-300 ease-out group-hover/item:-translate-y-1 overflow-hidden p-2 sm:p-2.5 md:p-3 flex flex-col space-y-2 sm:space-y-2.5 h-full flex-1">
                {/* 21:9 Desktop / 16:10 Mobile Banner Cover */}
                <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-md overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
                  {bannerUrl ? (
                    <Image
                      src={bannerUrl}
                      alt={`${app.name} preview`}
                      fill
                      sizes="(max-width: 640px) 240px, 340px"
                      unoptimized
                      className="object-cover object-center pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-zinc-900 flex items-center justify-center">
                      <span className="text-xl font-bold font-mono text-white/50">
                        {app.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Dark scrim gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                  {/* Top-Right Badges: Member Lock + Version */}
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 sm:gap-1.5">
                    {app.requiresAuth && (
                      <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-semibold text-white border border-amber-300/30 flex items-center gap-1 shadow-xs">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Member</span>
                      </span>
                    )}
                    {app.currentVersion && (
                      <span className="rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-medium text-zinc-900 dark:text-white/90 border border-black/10 dark:border-white/15 shadow-xs transition-colors">
                        v{app.currentVersion}
                      </span>
                    )}
                  </div>
                </div>

                {/* App Metadata Row: Icon + Title + Rating (Centered vertically for balanced space management) */}
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 px-0.5 flex-1">
                  {/* App Icon (y-centered) */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-md overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] shrink-0 shadow-xs flex items-center justify-center">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt={`${app.name} icon`}
                        width={44}
                        height={44}
                        unoptimized
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-mono font-bold text-xs bg-indigo-600/30">
                        {app.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Title & Category Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-[13px] md:text-sm text-[hsl(var(--foreground))] group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors truncate leading-snug font-display">
                      {app.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] truncate leading-tight mt-0.5">
                      {app.primaryCategory}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[10px] sm:text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                      {hasRating ? (
                        <>
                          <span className="text-[hsl(var(--foreground))] font-semibold">{rating}</span>
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                        </>
                      ) : (
                        <span className="text-amber-500/90 dark:text-amber-400/90 font-medium text-[10px]">New</span>
                      )}
                      {app.platforms.length > 0 && (
                        <>
                          <span className="text-[hsl(var(--border-strong))]">•</span>
                          <span className="capitalize truncate">{app.platforms[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
