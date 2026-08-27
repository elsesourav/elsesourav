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
