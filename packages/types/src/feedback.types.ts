import type { ID, Timestamp } from './common.types';

/** Status of a feedback entry for moderation */
export type FeedbackStatus = 'pending' | 'approved' | 'hidden';

/** Sort options for feedback listing */
export type FeedbackSort = 'newest' | 'oldest' | 'highest' | 'lowest';

/** Star rating value (1–5) */
export type StarRating = 1 | 2 | 3 | 4 | 5;

/**
 * A single user feedback/review for an application.
 */
export interface AppFeedbackItem {
  readonly id: ID;
  readonly userId: string;
  readonly appId: string;
  readonly rating: number;
  readonly message?: string;
  readonly status: FeedbackStatus;
  readonly helpfulCount?: number;
  readonly hasLiked?: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly user: {
    readonly displayName: string;
    readonly photoUrl?: string;
    readonly username?: string;
  };
}

/**
 * Aggregated rating summary for an application.
 */
export interface AppFeedbackSummary {
  readonly averageRating: number;
  readonly totalCount: number;
  readonly distribution: Readonly<Record<StarRating, number>>;
}

/**
 * Input payload for creating or updating a feedback entry.
 */
export interface CreateFeedbackInput {
  readonly rating: number;
  readonly message?: string;
}

/**
 * Paginated result set for feedback listing.
 */
export interface FeedbackListResult {
  readonly items: readonly AppFeedbackItem[];
  readonly summary: AppFeedbackSummary;
  readonly userFeedback?: AppFeedbackItem;
  readonly page: number;
  readonly totalPages: number;
  readonly hasMore: boolean;
}
