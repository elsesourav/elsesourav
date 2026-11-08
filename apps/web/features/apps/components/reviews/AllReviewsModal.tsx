'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Star, SlidersHorizontal, MessageSquarePlus } from 'lucide-react';
import { Button } from '@elsesourav/ui';
import { AppReviewCard } from './AppReviewCard';
import type {
  AppFeedbackItem,
  AppFeedbackSummary,
  FeedbackSort,
  StarRating,
} from '@elsesourav/types';

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appSlug: string;
  appName?: string;
  isAuthenticated?: boolean;
  initialSummary?: AppFeedbackSummary | null;
  onReviewSubmitted?: () => void;
  onOpenWriteReview?: () => void;
}

function formatRatingCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M Ratings`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K Ratings`;
  if (count === 1) return '1 Rating';
  if (count === 0) return 'No ratings yet';
  return `${count} Ratings`;
}

/**
 * Floating Fullscreen Window for Ratings & Reviews.
 * Stays on the same page while providing an immersive, focused App Store review experience.
 */
export function AllReviewsModal({
  isOpen,
  onClose,
  appSlug,
  appName,
  initialSummary,
  onOpenWriteReview,
}: AllReviewsModalProps) {
  const [sort, setSort] = React.useState<FeedbackSort>('newest');
  const [reviews, setReviews] = React.useState<AppFeedbackItem[]>([]);
  const [summary, setSummary] = React.useState<AppFeedbackSummary | null>(initialSummary || null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);

  // Fetch reviews whenever sort changes or modal opens
  const fetchReviews = React.useCallback(
    async (sortOption: FeedbackSort, pageNum: number = 1) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/apps/${appSlug}/feedback?sort=${sortOption}&page=${pageNum}&limit=15`
        );
        if (res.ok) {
          const data = await res.json();
          if (pageNum === 1) {
            setReviews(data.items || []);
          } else {
            setReviews((prev) => [...prev, ...(data.items || [])]);
          }
          if (data.summary) {
            setSummary(data.summary);
          }
          setHasMore(data.pagination?.hasMore ?? false);
          setPage(pageNum);
        }
      } catch {
        // Handled silently
      } finally {
        setIsLoading(false);
      }
    },
    [appSlug]
  );

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [isRendered, setIsRendered] = React.useState(isOpen);
  const [isVisible, setIsVisible] = React.useState(false);

  // Sync open state with entry/exit animations
  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  // Clean, non-destructive background scroll locking on body
  React.useEffect(() => {
    if (isRendered) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isRendered]);

  React.useEffect(() => {
    if (isOpen) {
      fetchReviews(sort, 1);
    }
  }, [isOpen, sort, fetchReviews]);

  // Handle escape key with smooth exit
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  const handleSortChange = (newSort: FeedbackSort) => {
    setSort(newSort);
    fetchReviews(newSort, 1);
  };

  if (!isRendered || !mounted) return null;

  const averageRating = summary?.averageRating ?? 0;
  const totalCount = summary?.totalCount ?? 0;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-reviews-fullscreen-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-5 lg:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-out overscroll-contain ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      {/* Floating Fullscreen Window Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-6xl h-[calc(100dvh-20px)] sm:h-[calc(100dvh-32px)] md:h-[calc(100dvh-40px)] flex flex-col rounded-3xl sm:rounded-4xl bg-[hsl(var(--card))] dark:bg-zinc-900 border border-[hsl(var(--border))] dark:border-zinc-800 shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Window Chrome Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border-subtle))] dark:border-zinc-800/80 bg-[hsl(var(--surface-subtle))] dark:bg-zinc-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="all-reviews-fullscreen-title"
                  className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] font-display tracking-tight"
                >
                  Ratings & Reviews
                </h2>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                {appName ? `Verified user community feedback for ${appName}` : 'Community reviews'}
              </p>
            </div>
          </div>

          {/* Window Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={handleClose}
              aria-label="Close ratings and reviews window"
              rightIcon={<X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
              className="rounded-xl px-3"
            >
              Done
            </Button>
          </div>
        </div>

        {/* Window Content: 2-Column Split Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Summary, Score & Star Pyramid */}
          <div className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[hsl(var(--border-subtle))] dark:border-zinc-800/80 bg-[hsl(var(--surface-subtle))]/50 dark:bg-zinc-900/30 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Overview & Distribution
              </span>

              {/* Large Score Card */}
              <div className="p-6 rounded-2xl bg-[hsl(var(--card))] dark:bg-zinc-900 border border-[hsl(var(--border-subtle))] dark:border-zinc-800/60 text-center space-y-2 shadow-xs">
                <div className="text-5xl sm:text-6xl font-extrabold text-[hsl(var(--foreground))] font-display tracking-tight">
                  {totalCount > 0 ? averageRating.toFixed(1) : '0'}
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        totalCount > 0 && i < Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] font-mono">
                  {totalCount > 0 ? `out of 5 · ${formatRatingCount(totalCount)}` : 'No ratings yet'}
                </div>
              </div>

              {/* Star Breakdown Pyramid */}
              <div className="p-5 rounded-2xl bg-[hsl(var(--card))] dark:bg-zinc-900 border border-[hsl(var(--border-subtle))] dark:border-zinc-800/60 space-y-2 shadow-xs">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = summary?.distribution[star as StarRating] ?? 0;
                  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-2.5 text-xs">
                      <div className="w-12 flex items-center justify-end gap-0.5 text-zinc-400 dark:text-zinc-500 shrink-0 font-mono">
                        <span className="text-[11px] mr-1">{star}</span>
                        <Star className="w-3 h-3 fill-current text-current" />
                      </div>

                      <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="w-8 text-right font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Single Dedicated Write Review Button at Left Column Bottom */}
              {onOpenWriteReview && totalCount > 0 && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onOpenWriteReview}
                    leftIcon={<MessageSquarePlus className="w-4 h-4" />}
                    className="w-full rounded-2xl py-3 font-semibold shadow-md shadow-indigo-600/25"
                  >
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sort Filters & Scrollable Reviews Feed (Comment Section Index) */}
          <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
            {/* Sticky Header with Sort Controls - Only when reviews exist */}
            {totalCount > 0 && (
              <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-3.5 border-b border-[hsl(var(--border-subtle))] dark:border-zinc-800/80 bg-[hsl(var(--card))]/90 dark:bg-zinc-900/90 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium hidden sm:inline">Sort:</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
                  {(
                    [
                      { id: 'newest', label: 'Newest' },
                      { id: 'oldest', label: 'Oldest' },
                      { id: 'highest', label: 'Highest' },
                      { id: 'lowest', label: 'Lowest' },
                    ] as const
                  ).map((tab) => (
                    <Button
                      key={tab.id}
                      type="button"
                      variant={sort === tab.id ? 'secondary' : 'ghost'}
                      size="xs"
                      onClick={() => handleSortChange(tab.id)}
                      className="rounded-xl px-3 shrink-0"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Scrollable Reviews Feed / First Review Action */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Skeleton Loading State for Comments */}
              {isLoading && reviews.length === 0 ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-5 sm:p-6 rounded-3xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] animate-pulse space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="h-4 bg-[hsl(var(--border))] rounded-md w-1/3" />
                        <div className="h-3 bg-[hsl(var(--border))]/70 rounded-md w-20" />
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className="w-3.5 h-3.5 rounded-full bg-[hsl(var(--border))]"
                          />
                        ))}
                      </div>
                      <div className="space-y-2 pt-1">
                        <div className="h-3.5 bg-[hsl(var(--border))]/80 rounded-md w-full" />
                        <div className="h-3.5 bg-[hsl(var(--border))]/60 rounded-md w-4/5" />
                      </div>
                      <div className="pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between">
                        <div className="h-3 bg-[hsl(var(--border))]/60 rounded w-20" />
                        <div className="h-6 bg-[hsl(var(--border))] rounded-lg w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : totalCount === 0 ? (
                <div className="h-full min-h-[360px] flex items-center justify-center p-8">
                  {onOpenWriteReview && (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={onOpenWriteReview}
                      leftIcon={<MessageSquarePlus className="w-4 h-4" />}
                      className="rounded-2xl px-6 py-3 font-semibold shadow-lg shadow-indigo-600/25"
                    >
                      Write First Review
                    </Button>
                  )}
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-24 text-center space-y-2 flex flex-col items-center justify-center">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    No reviews yet for this filter
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
                    Try selecting a different sort filter above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <AppReviewCard
                      key={rev.id}
                      item={rev}
                      appSlug={appSlug}
                      onLike={(id, count, hasLiked) => {
                        setReviews((prev) =>
                          prev.map((r) =>
                            r.id === id ? { ...r, helpfulCount: count, hasLiked } : r
                          )
                        );
                      }}
                    />
                  ))}

                  {hasMore && (
                    <div className="text-center pt-4 pb-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        loading={isLoading}
                        loadingText="Loading More..."
                        onClick={() => fetchReviews(sort, page + 1)}
                        className="rounded-xl px-5 py-2.5 font-semibold"
                      >
                        Load More Reviews
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
