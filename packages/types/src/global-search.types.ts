/**
 * Content type categories for global search results.
 */
export type GlobalSearchResultType = 'project' | 'note' | 'page';

/**
 * Normalized search result that works across all content types.
 * Lightweight projection — does not duplicate full database records.
 */
export interface GlobalSearchResult {
  readonly type: GlobalSearchResultType;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly category?: string;
  readonly metadata?: Record<string, string>;
}

/**
 * Grouped search response returned by the search API.
 */
export interface GlobalSearchResponse {
  readonly query: string;
  readonly results: readonly GlobalSearchResult[];
  readonly grouped: Partial<Record<GlobalSearchResultType, readonly GlobalSearchResult[]>>;
  readonly totalCount: number;
}
