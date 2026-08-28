import type { ID, Timestamp } from './common.types';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
}

export interface BlogPost {
  readonly id: ID;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly coverImageUrl?: string;
  readonly authorId: ID;
  readonly category: string;
  readonly tags: readonly string[];
  readonly status: BlogPostStatus;
  readonly isFeatured?: boolean;
  readonly readingTimeMinutes?: number;
  readonly viewsCount?: number;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly deletedAt?: Timestamp;
}
