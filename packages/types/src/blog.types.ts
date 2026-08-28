import type { ID, Timestamp } from './common.types';

export type BlogPostStatus = 'draft' | 'published' | 'archived';
export type BlogStatus = BlogPostStatus;

export interface BlogAuthor {
  readonly id: ID;
  readonly displayName: string;
  readonly username?: string;
  readonly photoUrl?: string;
  readonly bio?: string;
}

export interface BlogCategory {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly orderIndex: number;
  readonly postCount?: number;
}

export interface BlogTag {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly postCount?: number;
}

export interface BlogPostListItem {
  readonly id: ID;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly coverImageUrl?: string;
  readonly author: BlogAuthor;
  readonly category?: BlogCategory;
  readonly tags: readonly BlogTag[];
  readonly readingTime: number;
  readonly viewsCount: number;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
}

export interface PublicBlogPost extends BlogPostListItem {
  readonly content: string;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly updatedAt: Timestamp;
}

export interface BlogPost {
  readonly id: ID;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly coverImageUrl?: string;
  readonly authorId?: ID;
  readonly author?: BlogAuthor;
  readonly categoryId?: ID;
  readonly category?: BlogCategory;
  readonly tags: readonly BlogTag[];
  readonly status: BlogPostStatus;
  readonly readingTime: number;
  readonly viewsCount: number;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly deletedAt?: Timestamp;
}

export interface CreateBlogPostInput {
  readonly title: string;
  readonly slug?: string;
  readonly excerpt: string;
  readonly content: string;
  readonly coverImageUrl?: string;
  readonly categoryId?: string;
  readonly tagIds?: readonly string[];
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly readingTime?: number;
}

export interface UpdateBlogPostInput {
  readonly title?: string;
  readonly slug?: string;
  readonly excerpt?: string;
  readonly content?: string;
  readonly coverImageUrl?: string;
  readonly categoryId?: string;
  readonly tagIds?: readonly string[];
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly readingTime?: number;
  readonly status?: BlogPostStatus;
}

export interface BlogQueryInput {
  readonly categorySlug?: string;
  readonly tagSlug?: string;
  readonly query?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface BlogQueryResult {
  readonly items: readonly BlogPostListItem[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasMore: boolean;
}
