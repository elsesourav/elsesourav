import type { ID, Paginated } from './common.types';
import type { AppListItem, AppPlatform } from './app.types';

export type AppSortOption = 'sortOrder' | 'newest' | 'name' | 'popularity';

export interface AppSearchFilters {
  readonly categorySlug?: string;
  readonly tagSlug?: string;
  readonly platform?: AppPlatform;
  readonly isFeatured?: boolean;
}

export interface AppSearchInput {
  readonly query?: string;
  readonly filters?: AppSearchFilters;
  readonly sort?: AppSortOption;
  readonly page?: number;
  readonly limit?: number;
  readonly cursor?: string;
}

export interface CategorySummary {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly orderIndex: number;
  readonly appCount?: number;
}

export interface TagSummary {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly appCount?: number;
}

export interface AppSearchResult {
  readonly items: readonly AppListItem[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

export type PaginatedApps = Paginated<AppListItem>;
