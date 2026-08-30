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
 * Server Component query for public archive timeline index.
 */
export async function getArchivedApps(): Promise<AppListItem[]> {
  return appQueryService.listArchive();
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

/**
 * Calculates contextually related projects based on semantic category,
 * shared platform/technical attributes, and domain hierarchy.
 */
export async function getRelatedProjects(
  currentApp: PublicApp,
  limit: number = 3
): Promise<AppListItem[]> {
  const allApps = await getPublishedApps({ limit: 50 });
  const otherApps = allApps.filter((a) => a.id !== currentApp.id);

  // Score projects based on semantic closeness
  const scored = otherApps.map((candidate) => {
    let score = 0;

    // 1. Same category match
    if (candidate.categorySlug === currentApp.categorySlug) {
      score += 10;
    }

    // 2. Matching platforms
    const sharedPlatforms = candidate.platforms.filter((p) =>
      currentApp.platforms.includes(p)
    );
    score += sharedPlatforms.length * 2;

    // 3. Lab / Simulation affinity
    const isCurrentLab = currentApp.categorySlug === 'simulations';
    const isCandidateLab = candidate.categorySlug === 'simulations';
    if (isCurrentLab && isCandidateLab) {
      score += 5;
    }

    // 4. Featured boost for high quality tie-breaker
    if (candidate.isFeatured) {
      score += 1;
    }

    return { candidate, score };
  });

  // Sort descending by relevance score, then by sortOrder
  scored.sort((a, b) => b.score - a.score || a.candidate.sortOrder - b.candidate.sortOrder);

  return scored.slice(0, limit).map((s) => s.candidate);
}
