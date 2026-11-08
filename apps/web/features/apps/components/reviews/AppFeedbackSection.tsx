'use client';

import * as React from 'react';
import { Star, ChevronRight, ChevronLeft, MessageSquare, Sparkles } from 'lucide-react';
import { Button, IconButton } from '@elsesourav/ui';
import { AppReviewCard } from './AppReviewCard';
import { AllReviewsModal } from './AllReviewsModal';
import { WriteReviewModal } from './WriteReviewModal';
import type { FeedbackListResult, StarRating } from '@elsesourav/types';

interface AppFeedbackSectionProps {
  appSlug: string;
  appName?: string;
  isAuthenticated?: boolean;
}

function formatRatingCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M Ratings`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K Ratings`;
  }
  if (count === 1) {
    return '1 Rating';
  }
  if (count === 0) {
    return 'No ratings yet';
  }
  return `${count} Ratings`;
}

export function AppFeedbackSection({
  appSlug,
  appName,
  isAuthenticated = false,
}: AppFeedbackSectionProps) {
  const [data, setData] = React.useState<FeedbackListResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isReviewsWindowOpen, setIsReviewsWindowOpen] = React.useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = React.useState(false);

  // Horizontal carousel ref and scroll states
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Mouse drag-to-scroll logic
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  const fetchFeedback = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/apps/${appSlug}/feedback?page=1&limit=10&sort=newest`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, [appSlug]);

  React.useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, data?.items?.length]);

  const scrollByAmount = (offset: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const summary = data?.summary;
  const items = data?.items || [];
  const averageRating = summary?.averageRating ?? 0;
  const totalCount = summary?.totalCount ?? 0;

  return (
    <section
      aria-labelledby="ratings-reviews-heading"
      className="space-y-6 pt-10 border-t border-[hsl(var(--border-subtle))]"
    >
      {/* 1. Header: "Ratings & Reviews >" button & Quick Actions */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border-subtle))]">
        <button
          type="button"
          onClick={() => setIsReviewsWindowOpen(true)}
          className="group flex items-center gap-1.5 text-lg sm:text-xl font-bold tracking-tight text-[hsl(var(--foreground))] font-display hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <span id="ratings-reviews-heading">Ratings & Reviews</span>
          <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => setIsWriteReviewOpen(true)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            className="rounded-xl px-3"
          >
            <span className="hidden sm:inline">Write a Review</span>
            <span className="sm:hidden">Review</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setIsReviewsWindowOpen(true)}
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            See All ({totalCount})
          </Button>
        </div>
      </div>

      {/* 2. Line 1: Ratings Overview & Breakdown Section (Takes generous full width matching user reference) */}
      {isLoading || !summary ? (
        <div
          aria-label="Loading rating statistics"
          className="w-full flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 py-2 animate-pulse"
        >
          {/* Skeleton Numerical Score on Left */}
          <div className="flex flex-col items-start shrink-0 space-y-2">
            <div className="h-14 sm:h-16 w-24 sm:w-28 rounded-2xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]" />
            <div className="h-4 w-16 rounded-md bg-[hsl(var(--surface-subtle))]" />
          </div>

          {/* Skeleton Pyramid Star Rows & Horizontal Bars */}
          <div className="flex-1 w-full space-y-2.5 min-w-0">
            {([5, 4, 3, 2, 1] as const).map((star) => (
              <div key={star} className="flex items-center gap-2 sm:gap-3">
                <div className="w-12 sm:w-16 flex items-center justify-end gap-0.5 shrink-0">
                  <div className="h-2.5 w-10 sm:w-12 rounded bg-[hsl(var(--surface-subtle))]" />
                </div>
                <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-[hsl(var(--surface-subtle))] overflow-hidden" />
              </div>
            ))}
            <div className="flex justify-end pt-1">
              <div className="h-3 w-20 rounded bg-[hsl(var(--surface-subtle))]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 py-2 animate-in fade-in duration-200">
          {/* Numerical Score on Left */}
          <div className="flex flex-col items-start shrink-0">
            <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[hsl(var(--foreground))] tracking-tight font-display leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[hsl(var(--muted-foreground))] mt-2 font-mono">
              out of 5
            </span>
          </div>

          {/* Pyramid Star Rows & Horizontal Bars (taking wide expansive width) */}
          <div className="flex-1 w-full space-y-1.5 min-w-0">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = summary.distribution[star as StarRating] ?? 0;
              const percentage = totalCount > 0 ? (count / totalCount) * 100 : star === 5 ? 85 : 10;

              return (
                <div key={star} className="flex items-center gap-2 sm:gap-3">
                  {/* Right-aligned descending star icons */}
                  <div className="w-12 sm:w-16 flex items-center justify-end gap-0.5 text-zinc-400 dark:text-zinc-500 shrink-0">
                    {Array.from({ length: star }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current text-current"
                      />
                    ))}
                  </div>

                  {/* Horizontal Bar Track & Fill with Theme Support - Wide stretching bar */}
                  <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-zinc-200 dark:bg-zinc-800/90 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Total Ratings Counter Aligned Under Bars to the right */}
            <div className="text-right text-[11px] sm:text-xs font-mono text-[hsl(var(--muted-foreground))] pt-1">
              {formatRatingCount(totalCount)}
            </div>
          </div>
        </div>
      )}

      {/* 3. Line 2: Horizontal Carousel of Top Reviews (Dedicated separate line below ratings) */}
      <div className="relative group/reviews w-full min-w-0 pt-2">
        {/* Edge Navigation Chevron Buttons (< and >) */}
        {canScrollLeft && (
          <IconButton
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => scrollByAmount(-400)}
            aria-label="Scroll reviews left"
            icon={<ChevronLeft className="w-5 h-5" />}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-xl backdrop-blur-xl"
          />
        )}

        {canScrollRight && (
          <IconButton
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => scrollByAmount(400)}
            aria-label="Scroll reviews right"
            icon={<ChevronRight className="w-5 h-5" />}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 rounded-full shadow-xl backdrop-blur-xl"
          />
        )}

        {/* Horizontal Drag & Touch Container */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpOrLeave}
          onMouseLeave={onMouseUpOrLeave}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar cursor-grab active:cursor-grabbing select-none scroll-smooth snap-x snap-mandatory"
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-[88vw] sm:w-[380px] md:w-[440px] h-[195px] shrink-0 rounded-3xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] animate-pulse p-6 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="h-4 bg-[hsl(var(--border))] rounded-md w-1/2" />
                  <div className="h-3 bg-[hsl(var(--border))]/70 rounded-md w-16" />
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="w-3.5 h-3.5 rounded-full bg-[hsl(var(--border))]" />
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 bg-[hsl(var(--border))]/80 rounded-md w-full" />
                  <div className="h-3.5 bg-[hsl(var(--border))]/60 rounded-md w-3/4" />
                </div>
                <div className="pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between">
                  <div className="h-3 bg-[hsl(var(--border))]/60 rounded w-20" />
                  <div className="h-6 bg-[hsl(var(--border))] rounded-lg w-16" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="w-full p-8 rounded-3xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto opacity-70" />
              <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Be the first to review {appName || appSlug}!
              </h4>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
                Share your impressions, suggest features, or rate the design.
              </p>
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Write Review
              </button>
            </div>
          ) : (
            items.map((review) => (
              <AppReviewCard
                key={review.id}
                item={review}
                appSlug={appSlug}
                className="w-[88vw] sm:w-[380px] md:w-[440px] shrink-0 snap-start"
                onLike={(id, count, hasLiked) => {
                  setData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      items: prev.items.map((r) =>
                        r.id === id ? { ...r, helpfulCount: count, hasLiked } : r
                      ),
                    };
                  });
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* 3. Floating Fullscreen Ratings & Reviews Window */}
      <AllReviewsModal
        isOpen={isReviewsWindowOpen}
        onClose={() => setIsReviewsWindowOpen(false)}
        appSlug={appSlug}
        appName={appName}
        isAuthenticated={isAuthenticated}
        initialSummary={summary}
        onReviewSubmitted={fetchFeedback}
        onOpenWriteReview={() => {
          setIsWriteReviewOpen(true);
        }}
      />

      {/* 4. Dedicated Write a Review Modal (Shows Strictly and Only the Review Option) */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        appSlug={appSlug}
        appName={appName}
        isAuthenticated={isAuthenticated}
        onSuccess={fetchFeedback}
      />
    </section>
  );
}
