import type { ID, Timestamp } from './common.types';

export type HelpArticleStatus = 'draft' | 'published' | 'archived';

export interface HelpArticleAuthor {
  readonly id: ID;
  readonly displayName: string;
  readonly username?: string;
  readonly photoUrl?: string;
}

export interface HelpCategory {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly icon?: string;
  readonly orderIndex: number;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly articleCount?: number;
}

export interface HelpCategoryWithArticles extends HelpCategory {
  readonly articles: readonly HelpArticleListItem[];
}

export interface HelpArticleListItem {
  readonly id: ID;
  readonly slug: string;
  readonly title: string;
  readonly excerpt?: string;
  readonly categoryId: ID;
  readonly categorySlug: string;
  readonly categoryName: string;
  readonly orderIndex: number;
  readonly publishedAt?: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface PublicHelpArticle {
  readonly id: ID;
  readonly slug: string;
  readonly title: string;
  readonly excerpt?: string;
  readonly content: string;
  readonly category: {
    readonly id: ID;
    readonly name: string;
    readonly slug: string;
    readonly icon?: string;
  };
  readonly author?: HelpArticleAuthor;
  readonly helpfulCount: number;
  readonly unhelpfulCount: number;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly publishedAt?: Timestamp;
  readonly updatedAt: Timestamp;
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
  readonly authorId?: ID;
  readonly author?: HelpArticleAuthor;
  readonly category?: HelpCategory;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly deletedAt?: Timestamp;
}

export interface CreateHelpCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
}

export interface UpdateHelpCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
}

export interface CreateHelpArticleInput {
  categoryId: ID;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  orderIndex?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateHelpArticleInput {
  categoryId?: ID;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  orderIndex?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface HelpSearchInput {
  query: string;
  categorySlug?: string;
  limit?: number;
}

export interface HelpSearchResult {
  items: readonly HelpArticleListItem[];
  totalCount: number;
  query: string;
}

export interface HelpVoteInput {
  articleId: ID;
  isHelpful: boolean;
}
