import type { App } from './app.types';
import type { Result } from './result.types';
import type { AppError } from '@/lib/errors';

export type AppSearchSortOption =
  'featured' | 'newest' | 'updated' | 'rating' | 'popularity' | 'name';

export interface AppSearchFilters {
  readonly query?: string;
  readonly category?: string;
  readonly tags?: string[];
  readonly sortBy?: AppSearchSortOption;
  readonly featuredOnly?: boolean;
  readonly limit?: number;
  readonly cursor?: string;
}

export interface AppSearchResult {
  readonly items: App[];
  readonly hasMore: boolean;
  readonly nextCursor?: string;
  readonly totalMatches: number;
}

export interface IAppSearchProvider {
  searchApps(filters: AppSearchFilters): Promise<Result<AppSearchResult, AppError>>;
}

/**
 * Global Platform Search Types
 */
export type GlobalSearchResultType = 'app' | 'blog_post' | 'help_article';

export interface GlobalSearchResultItem {
  readonly id: string;
  readonly type: GlobalSearchResultType;
  readonly title: string;
  readonly description: string;
  readonly destination: string;
  readonly category?: string;
  readonly iconUrl?: string;
  readonly iconName?: string;
  readonly badges?: readonly string[];
  readonly publishedAt?: number;
  readonly relevanceScore?: number;
  readonly matchReason?:
    'exact_title' | 'prefix_title' | 'title_contains' | 'tag_match' | 'content_match';
  readonly metadata?: Record<string, unknown>;
}

export interface GlobalSearchResult {
  readonly query: string;
  readonly apps: readonly GlobalSearchResultItem[];
  readonly blogPosts: readonly GlobalSearchResultItem[];
  readonly helpArticles: readonly GlobalSearchResultItem[];
  readonly totalCount: number;
}

export interface GlobalSearchFilters {
  readonly query: string;
  readonly type?: GlobalSearchResultType | 'all';
  readonly category?: string;
  readonly limit?: number;
}
