import type { ID, Timestamp } from './common.types';

/**
 * Help Article Publishing Lifecycle Status
 */
export type HelpArticleStatus = 'draft' | 'published' | 'archived';

/**
 * Help Center Category Model
 */
export interface HelpCategory {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly icon?: string;
  readonly orderIndex: number;
  readonly isActive: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly deletedAt?: Timestamp;
}

/**
 * Help Center Knowledge Base Article Model
 */
export interface HelpArticle {
  readonly id: ID;
  readonly categoryId: ID;
  readonly title: string;
  readonly slug: string;
  readonly excerpt?: string;
  readonly content: string;
  readonly status: HelpArticleStatus;
  readonly orderIndex: number;
  readonly featured?: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly publishedAt?: Timestamp;
  readonly archivedAt?: Timestamp;
  readonly deletedAt?: Timestamp;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly socialImageUrl?: string;
  readonly viewsCount?: number;
  readonly helpfulCount?: number;
  readonly unhelpfulCount?: number;
}

/**
 * Privacy-conscious Help Article Feedback / Helpfulness Vote Model
 */
export interface ArticleHelpfulnessFeedback {
  readonly id: ID;
  readonly articleId: ID;
  readonly userId?: ID;
  readonly sessionId: string;
  readonly helpful: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * DTO for Submitting Article Helpfulness
 */
export interface SubmitArticleHelpfulnessDto {
  readonly articleId: ID;
  readonly helpful: boolean;
  readonly userId?: ID;
  readonly sessionId: string;
}

/**
 * Aggregate Helpfulness Statistics for an Article
 */
export interface ArticleHelpfulnessStats {
  readonly articleId: ID;
  readonly helpfulCount: number;
  readonly notHelpfulCount: number;
  readonly helpfulnessRatio: number; // 0 to 1
}
