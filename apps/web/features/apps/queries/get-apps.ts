import { AppRepository, AppQueryService } from '@elsesourav/database';
import type { AppListItem, PublicApp, AppQueryOptions, AppSearchInput, AppSearchResult } from '@elsesourav/types';

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
 * Server query for public app search with filters.
 */
export async function searchPublishedApps(input: AppSearchInput): Promise<AppSearchResult> {
  return appQueryService.searchPublicApps(input);
}
