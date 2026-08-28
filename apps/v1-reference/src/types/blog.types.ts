import type { ID, Timestamp } from './common.types';

/**
 * Blog Post Publication Lifecycle Status
 * Only 'published' posts are publicly accessible.
 */
export type BlogPostStatus = 'draft' | 'published' | 'archived';
export type BlogStatus = BlogPostStatus;

/**
 * Blog Category Entity (Content Classification Taxonomy)
 */
export interface BlogCategory {
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
 * Blog Tag Entity (Content Classification Taxonomy)
 */
export interface BlogTag {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly deletedAt?: Timestamp;
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
  readonly authorId: ID;
  readonly authorName?: string;
  readonly authorAvatarUrl?: string;
  readonly category: string;
  readonly categoryId?: string;
  readonly tags: readonly string[];
  readonly status: BlogPostStatus;
  readonly isFeatured?: boolean;
  readonly readingTime?: number;
  readonly readingTimeMinutes?: number;
  readonly viewsCount?: number;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly canonicalUrl?: string;
  readonly socialImageUrl?: string;
  readonly publishedAt?: Timestamp;
  readonly schemaVersion?: number;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly archivedAt?: Timestamp;
  readonly deletedAt?: Timestamp;
}
