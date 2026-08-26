import type { ID, Timestamp } from './common.types';

/**
 * Blog Post Publication Status
 */
export type BlogStatus = 'draft' | 'published' | 'archived';

/**
 * Blog Tag Entity
 */
export interface BlogTag {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
}

/**
 * Blog Post Domain Entity
 */
export interface BlogPost {
  readonly id: ID;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly coverImageUrl?: string;
  readonly tags: readonly string[];
  readonly status: BlogStatus;
  readonly readingTimeMinutes: number;
  readonly viewsCount: number;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
