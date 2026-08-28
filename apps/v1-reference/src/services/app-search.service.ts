import type { AppSearchFilters, AppSearchResult, IAppSearchProvider } from '@/types/search.types';
import type { Result } from '@/types/result.types';
import type { App } from '@/types/app.types';
import type { AppError } from '@/lib/errors';
import type { IAppRepository } from '@/repositories/interfaces';
import { appRepository } from '@/repositories/app.repository';
import { ok, err } from '@/lib/result';

export class FirestoreAppSearchProvider implements IAppSearchProvider {
  constructor(private readonly appRepo: IAppRepository = appRepository) {}

  public async searchApps(filters: AppSearchFilters): Promise<Result<AppSearchResult, AppError>> {
    // 1. Fetch published apps only
    const repoResult = await this.appRepo.listPublished({
      limit: 100, // Fetch top published cohort for normalized client matching
    });

    if (!repoResult.success) {
      return err(repoResult.error);
    }

    let items = [...repoResult.data.items];

    // 2. Category Filter
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase().trim();
      items = items.filter((app) => app.primaryCategory.toLowerCase() === cat);
    }

    // 3. Tags Filter
    if (filters.tags && filters.tags.length > 0) {
      const activeTags = filters.tags.map((t) => t.toLowerCase().trim());
      items = items.filter((app) =>
        activeTags.every((t) => app.tags.some((appTag: string) => appTag.toLowerCase() === t))
      );
    }

    // 4. Featured Only Filter
    if (filters.featuredOnly) {
      items = items.filter((app) => app.isFeatured);
    }

    // 5. Normalized Text Search Query
    if (filters.query && filters.query.trim()) {
      const tokens = filters.query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);

      items = items.filter((app) => {
        const searchableText = [
          app.name,
          app.shortDescription,
          app.description,
          app.primaryCategory,
          ...app.tags,
        ]
          .join(' ')
          .toLowerCase();

        return tokens.every((token) => searchableText.includes(token));
      });
    }

    // 6. Sorting
    const sortBy = filters.sortBy || 'featured';
    items.sort((a, b) => this.sortApps(a, b, sortBy));

    const totalMatches = items.length;
    const limit = filters.limit || 24;
    const paginatedItems = items.slice(0, limit);
    const hasMore = items.length > limit;

    return ok({
      items: paginatedItems,
      hasMore,
      nextCursor: hasMore ? paginatedItems[paginatedItems.length - 1]?.id : undefined,
      totalMatches,
    });
  }

  private sortApps(a: App, b: App, sortBy: string): number {
    switch (sortBy) {
      case 'featured':
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        return a.sortOrder - b.sortOrder;

      case 'newest':
        return (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt);

      case 'updated':
        return b.updatedAt - a.updatedAt;

      case 'rating': {
        const ratingA = a.stats.ratingAverage ?? 5.0;
        const ratingB = b.stats.ratingAverage ?? 5.0;
        return ratingB - ratingA;
      }

      case 'popularity': {
        const scoreA =
          (a.stats.launches || 0) * 2 + (a.stats.views || 0) + (a.stats.libraryAdds || 0) * 3;
        const scoreB =
          (b.stats.launches || 0) * 2 + (b.stats.views || 0) + (b.stats.libraryAdds || 0) * 3;
        return scoreB - scoreA;
      }

      case 'name':
        return a.name.localeCompare(b.name);

      default:
        return 0;
    }
  }
}

export const appSearchService = new FirestoreAppSearchProvider();
