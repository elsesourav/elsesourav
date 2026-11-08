'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Star, Send, LogIn, CheckCircle2 } from 'lucide-react';
import { Button, IconButton } from '@elsesourav/ui';
import type { StarRating } from '@elsesourav/types';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appSlug: string;
  appName?: string;
  isAuthenticated?: boolean;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<StarRating, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Outstanding!',
};

/**
 * Dedicated Write a Review Modal — shows strictly and only the review option.
 * Zero clutter, no bug/ticket options.
 */
export function WriteReviewModal({
  isOpen,
  onClose,
  appSlug,
  appName,
  isAuthenticated = false,
  onSuccess,
}: WriteReviewModalProps) {
  const [rating, setRating] = React.useState<StarRating>(5);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [review, setReview] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isRendered, setIsRendered] = React.useState(isOpen);
  const [isVisible, setIsVisible] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync open state with entry/exit animations
  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setError(null);
      setIsSubmitted(false);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setReview('');
        setRating(5);
      }, 220);
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

  // Handle escape key with smooth exit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);
    setError(null);

    const trimmedReview = review.trim();

    try {
      const res = await fetch(`/api/apps/${appSlug}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          message: trimmedReview || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to submit your review');
      }

      setIsSubmitted(true);
      onSuccess?.();

      // Auto close after brief celebration
      setTimeout(() => {
        handleClose();
      }, 1100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRendered || !mounted) return null;

  const currentDisplayRating = (hoverRating || rating) as StarRating;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      className={`fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-out overscroll-contain ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-3xl bg-[hsl(var(--card))] dark:bg-zinc-900 border border-[hsl(var(--border))] dark:border-zinc-800 shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Modal Window Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border-subtle))] dark:border-zinc-800/80 bg-[hsl(var(--surface-subtle))] dark:bg-zinc-900/60">
          <div>
            <h3
              id="write-review-title"
              className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))] font-display"
            >
              Write a Review
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {appName ? `for ${appName}` : 'Rate and share your thoughts'}
            </p>
          </div>
          <IconButton
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close review dialog"
            icon={<X className="w-4 h-4" />}
            onClick={onClose}
            className="rounded-full"
          />
        </div>

        {/* Modal Body: Only Review Option */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-in zoom-in-50 duration-300" />
              <h4 className="text-base font-bold text-[hsl(var(--foreground))]">
                Thank You for Your Review!
              </h4>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xs">
                Your rating and review have been recorded and are now active in the community.
              </p>
            </div>
          ) : !isAuthenticated ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <LogIn className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Sign In to Write a Review
                </h4>
                <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xs">
                  Verified user accounts keep application ratings authentic, helpful, and spam-free.
                </p>
              </div>
              <Link href={`/login?next=/apps/${encodeURIComponent(appSlug)}`}>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<LogIn className="w-4 h-4" />}
                  className="rounded-xl"
                >
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Star Rating Selection */}
              <div className="space-y-2 flex flex-col items-center justify-center p-4 rounded-2xl bg-[hsl(var(--surface-subtle))] dark:bg-zinc-950/60 border border-[hsl(var(--border-subtle))] dark:border-zinc-800/80">
                <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Tap to Rate
                </span>

                <div className="flex items-center gap-2 py-1">
                  {([1, 2, 3, 4, 5] as const).map((star) => {
                    const isFilled = star <= currentDisplayRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]'
                              : 'text-zinc-300 dark:text-zinc-700 fill-zinc-200 dark:fill-zinc-800'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                  {RATING_LABELS[currentDisplayRating]} ({currentDisplayRating} / 5)
                </div>
              </div>

              {/* 2. Review Comment */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-body"
                  className="block text-xs font-medium text-[hsl(var(--foreground))]"
                >
                  Review{' '}
                  <span className="text-[hsl(var(--muted-foreground))] font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="review-body"
                  rows={5}
                  maxLength={900}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this application... What features stood out to you? How is the performance and user experience?"
                  className="w-full p-3.5 rounded-xl bg-[hsl(var(--background))] dark:bg-zinc-950 border border-[hsl(var(--border))] dark:border-zinc-800 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                />
                <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
                  <span>Helpful feedback helps other users and the creator.</span>
                  <span>{review.length} / 900</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSubmitting}
                  loadingText="Submitting..."
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Submit Review
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
