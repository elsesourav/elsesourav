import { AppRepository, AppQueryService } from '@elsesourav/database';
import type {
  AppListItem,
  PublicApp,
  AppQueryOptions,
  AppSearchInput,
  AppSearchResult,
  CategorySummary,
  TagSummary,
} from '@elsesourav/types';

// Server-side singleton query service
const appRepo = new AppRepository();
const appQueryService = new AppQueryService(appRepo);

/**
 * Server Component query for public application catalog listings.
 */
export async function getPublishedApps(options?: AppQueryOptions): Promise<AppListItem[]> {
  return appQueryService.listPublicApps(options);
}

/**
 * Server Component query for a single public application page.
 */
export async function getPublicAppBySlug(slug: string): Promise<PublicApp> {
  return appQueryService.getPublicAppDetail(slug);
}

/**
 * Unified discovery query combining search keyword, category, tag, and sort.
 */
export async function discoverPublishedApps(input: AppSearchInput): Promise<AppSearchResult> {
  return appQueryService.discoverApps(input);
}

/**
 * Server query for public app search with filters.
 */
export async function searchPublishedApps(input: AppSearchInput): Promise<AppSearchResult> {
  return appQueryService.searchPublicApps(input);
}

/**
 * Retrieves all active public categories with publication counts.
 */
export async function getActiveCategories(): Promise<CategorySummary[]> {
  return appQueryService.listPublicCategories();
}

/**
 * Retrieves popular public tags.
 */
export async function getActiveTags(): Promise<TagSummary[]> {
  return appQueryService.listPublicTags();
}
