import type { ID, Timestamp } from './common.types';

/**
 * General Feedback Classification
 */
export type FeedbackType = 'bug' | 'feature_idea' | 'improvement' | 'praise' | 'other';

export type FeedbackStatus =
  'pending' | 'reviewed' | 'planned' | 'in_progress' | 'completed' | 'declined';

/**
 * App Review Moderation States
 */
export type FeedbackModerationStatus = 'pending' | 'approved' | 'hidden';

/**
 * User Feedback Domain Entity
 */
export interface Feedback {
  readonly id: ID;
  readonly userId?: ID;
  readonly userEmail?: string;
  readonly appId?: ID;
  readonly type: FeedbackType;
  readonly status: FeedbackStatus;
  readonly rating?: number;
  readonly title: string;
  readonly comment: string;
  readonly url?: string;
  readonly userAgent?: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * App Rating & Review Model (Deterministic ID: ${userId}_${appId})
 */
export interface AppFeedback {
  readonly id: ID;
  readonly userId: ID;
  readonly userDisplayName?: string;
  readonly userPhotoUrl?: string;
  readonly appId: ID;
  readonly rating: number;
  readonly message: string;
  readonly status: FeedbackModerationStatus;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly moderatedAt?: Timestamp;
  readonly moderatedBy?: ID;
}

/**
 * App Rating Distribution and Aggregate Model
 */
export interface AppRatingAggregate {
  readonly id: ID;
  readonly appId: ID;
  readonly ratingCount: number;
  readonly averageRating: number;
  readonly distribution: {
    readonly 1: number;
    readonly 2: number;
    readonly 3: number;
    readonly 4: number;
    readonly 5: number;
  };
  readonly updatedAt: Timestamp;
}
