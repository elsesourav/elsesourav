import type { ID, Timestamp } from './common.types';
import type { AppPlatform, AppActionType } from './app.types';

/**
 * Supported Analytics Event Types
 */
export type AnalyticsEventType =
  | 'view'
  | 'primary_action'
  | 'external_link'
  | 'library_add'
  | 'library_remove'
  | 'feedback_submit'
  | 'article_helpfulness';

/**
 * Granular Event Record (Append-only /analyticsEvents)
 */
export interface AnalyticsEvent {
  readonly id: ID;
  readonly appId: ID;
  readonly eventType: AnalyticsEventType;
  readonly platform?: AppPlatform;
  readonly action?: AppActionType;
  readonly linkId?: ID;
  readonly userId?: ID;
  readonly sessionId?: string;
  readonly source?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
}

/**
 * App Analytics Aggregate Counter (/appStatistics/{appId})
 */
export interface AppAnalyticsAggregate {
  readonly id: ID;
  readonly appId: ID;
  readonly viewCount: number;
  readonly uniqueViewCount: number;
  readonly actionCount: number;
  readonly libraryCount: number;
  readonly feedbackCount: number;
  readonly averageRating: number;
  readonly ratingCount: number;
  readonly lastViewedAt?: Timestamp;
  readonly lastActionAt?: Timestamp;
  readonly updatedAt: Timestamp;
}
