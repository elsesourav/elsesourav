import type { ID, Timestamp } from './common.types';

/**
 * Feedback Classification
 */
export type FeedbackType = 'bug' | 'feature_idea' | 'improvement' | 'praise' | 'other';

export type FeedbackStatus =
  'pending' | 'reviewed' | 'planned' | 'in_progress' | 'completed' | 'declined';

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
