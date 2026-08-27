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
