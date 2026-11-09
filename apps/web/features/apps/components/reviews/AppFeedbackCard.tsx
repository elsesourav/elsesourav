'use client';

import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { UserAvatar } from '@elsesourav/ui';
import { AppStarRating } from './AppStarRating';
import type { AppFeedbackItem } from '@elsesourav/types';

/** Lightweight time-ago formatter without external dependency */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
interface AppFeedbackCardProps {
  feedback: AppFeedbackItem;
  /** Whether this card belongs to the currently authenticated user */
  isOwn?: boolean;
  /** Called when the user wants to delete their own review */
  onDelete?: () => void;
  /** Whether a delete operation is in progress */
  isDeleting?: boolean;
}

export function AppFeedbackCard({
  feedback,
  isOwn = false,
  onDelete,
  isDeleting = false,
}: AppFeedbackCardProps) {
  const timeAgo = formatTimeAgo(feedback.createdAt);
  const wasEdited = feedback.updatedAt > feedback.createdAt + 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`
        relative p-3 sm:p-3.5 md:p-4 rounded-2xl border transition-colors
        ${
          isOwn
            ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/[0.03]'
            : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
        }
      `}
    >
      {/* Header: Avatar + Name + Stars + Time */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <UserAvatar
            src={feedback.user.photoUrl}
            name={feedback.user.displayName}
            identifier={feedback.user.username || feedback.user.displayName}
            alt={feedback.user.displayName}
            size="sm"
            className="shrink-0"
          />

          {/* Name + Rating */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                {feedback.user.displayName}
              </span>
              {isOwn && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <AppStarRating value={feedback.rating} readonly size="sm" />
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                {timeAgo}
                {wasEdited && ' · edited'}
              </span>
            </div>
          </div>
        </div>

        {/* Delete button (own reviews only) */}
        {isOwn && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="Delete your review"
            className="shrink-0 p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Message body */}
      {feedback.message && (
        <p className="mt-3 text-sm text-[hsl(var(--foreground))]/85 leading-relaxed whitespace-pre-wrap">
          {feedback.message}
        </p>
      )}
    </motion.div>
  );
}
