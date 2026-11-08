'use client';

import * as React from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '@elsesourav/ui';
import type { AppFeedbackItem } from '@elsesourav/types';

interface AppReviewCardProps {
  item: AppFeedbackItem;
  appSlug: string;
  onLike?: (feedbackId: string, newCount: number, hasLiked: boolean) => void;
  className?: string;
}

export function AppReviewCard({ item, appSlug, onLike, className = '' }: AppReviewCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [likes, setLikes] = React.useState(item.helpfulCount ?? 0);
  const [hasLiked, setHasLiked] = React.useState(item.hasLiked ?? false);
  const [isLiking, setIsLiking] = React.useState(false);

  React.useEffect(() => {
    setLikes(item.helpfulCount ?? 0);
    if (item.hasLiked !== undefined) {
      setHasLiked(item.hasLiked);
    }
  }, [item.helpfulCount, item.hasLiked]);

  // Check localStorage for offline/anonymous persistence
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !hasLiked) {
      try {
        const storedLikes: string[] = JSON.parse(
          localStorage.getItem(`app_review_likes_${appSlug}`) || '[]'
        );
        if (storedLikes.includes(item.id)) {
          setHasLiked(true);
        }
      } catch {
        // Ignore
      }
    }
  }, [item.id, appSlug, hasLiked]);

  const formattedDate = React.useMemo(() => {
    return new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [item.createdAt]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    const newHasLiked = !hasLiked;
    const optimisticLikes = newHasLiked ? likes + 1 : Math.max(0, likes - 1);
    setLikes(optimisticLikes);
    setHasLiked(newHasLiked);

    try {
      const res = await fetch(`/api/apps/${appSlug}/feedback/${item.id}/like`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.helpfulCount === 'number') {
        const finalLiked = typeof data.hasLiked === 'boolean' ? data.hasLiked : newHasLiked;
        setLikes(data.helpfulCount);
        setHasLiked(finalLiked);
        onLike?.(item.id, data.helpfulCount, finalLiked);

        // Synchronize with localStorage
        try {
          const storedLikes: string[] = JSON.parse(
            localStorage.getItem(`app_review_likes_${appSlug}`) || '[]'
          );
          if (finalLiked) {
            if (!storedLikes.includes(item.id)) storedLikes.push(item.id);
          } else {
            const idx = storedLikes.indexOf(item.id);
            if (idx > -1) storedLikes.splice(idx, 1);
          }
          localStorage.setItem(`app_review_likes_${appSlug}`, JSON.stringify(storedLikes));
        } catch {
          // Ignore
        }
      } else {
        // Revert on error
        setLikes(likes);
        setHasLiked(hasLiked);
      }
    } catch {
      // Revert on network failure
      setLikes(likes);
      setHasLiked(hasLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const message = item.message?.trim() || 'Rating submitted with no written comments.';
  const isLong = message.length > 150;

  return (
    <article
      className={`p-3 sm:p-3.5 md:p-4 lg:p-4.5 rounded-2xl sm:rounded-3xl bg-[hsl(var(--card))] dark:bg-zinc-900/60 border border-[hsl(var(--border))] dark:border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between space-y-3 shadow-md dark:shadow-xl transition-all hover:border-[hsl(var(--primary))]/40 dark:hover:border-zinc-700/80 select-text ${className}`}
    >
      <div className="space-y-2.5">
        {/* Top Header Row: User Name & Rating on Left, Date on Right */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-sm font-bold text-[hsl(var(--foreground))] truncate block font-display">
              {item.user.displayName || 'Anonymous User'}
            </span>
            {/* 5-Star Rating Row */}
            <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < item.rating
                      ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400'
                      : 'text-zinc-300 dark:text-zinc-700 fill-zinc-200 dark:fill-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-[11px] font-mono text-[hsl(var(--muted-foreground))] shrink-0 pt-0.5">
            {formattedDate}
          </span>
        </div>

        {/* Review Comment Text */}
        <div className="text-xs sm:text-sm text-[hsl(var(--foreground))]/85 dark:text-zinc-300 leading-relaxed pt-1">
          <p className={!isExpanded && isLong ? 'line-clamp-4' : 'whitespace-pre-line'}>
            {message}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-xs font-semibold mt-1 cursor-pointer inline-block"
            >
              {isExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      </div>

      {/* Helpful Reaction Bar (Can toggle like on/off) */}
      <div className="pt-3 border-t border-[hsl(var(--border-subtle))] dark:border-zinc-800/60 flex items-center justify-between text-xs mt-auto">
        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Was this helpful?</span>
        <Button
          type="button"
          variant={hasLiked ? 'subtle' : 'outline'}
          size="xs"
          onClick={handleLike}
          disabled={isLiking}
          leftIcon={<ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current text-indigo-500' : ''}`} />}
          title={hasLiked ? 'Click to remove helpful vote' : 'Click to vote helpful'}
          aria-label={hasLiked ? 'Remove helpful vote' : 'Vote review as helpful'}
          className={hasLiked ? 'border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-semibold' : ''}
        >
          {likes > 0 ? likes : 'Helpful'}
        </Button>
      </div>
    </article>
  );
}
