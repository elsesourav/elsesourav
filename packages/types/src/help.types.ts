import type { ID, Timestamp } from './common.types';

export type HelpArticleStatus = 'draft' | 'published' | 'archived';

export interface HelpCategory {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly icon?: string;
  readonly orderIndex: number;
}

export interface HelpArticle {
  readonly id: ID;
  readonly categoryId: ID;
  readonly title: string;
  readonly slug: string;
  readonly excerpt?: string;
  readonly content: string;
  readonly status: HelpArticleStatus;
  readonly orderIndex: number;
  readonly helpfulCount: number;
  readonly unhelpfulCount: number;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
