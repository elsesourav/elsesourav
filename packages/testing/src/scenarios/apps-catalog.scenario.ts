import type { AppSearchResult, CategorySummary, TagSummary, AppListItem } from '@elsesourav/types';
import { fixtureAppListItems, fixtureCategories, fixtureTags } from '../fixtures/apps.fixtures';
import { createApp, createAppListItem } from '../factories/app.factory';

export interface AppsCatalogScenarioData {
  readonly categories: readonly CategorySummary[];
  readonly tags: readonly TagSummary[];
  readonly searchResult: AppSearchResult;
}

export function createEmptyAppsCatalogScenario(): AppsCatalogScenarioData {
  return {
    categories: fixtureCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      orderIndex: c.orderIndex,
      appCount: 0,
    })),
    tags: fixtureTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, appCount: 0 })),
    searchResult: {
      items: [],
      totalCount: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasMore: false,
    },
  };
}

export function createPopulatedAppsCatalogScenario(): AppsCatalogScenarioData {
  return {
    categories: fixtureCategories.map((c, i) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      orderIndex: c.orderIndex,
      appCount: i === 0 ? 2 : 1,
    })),
    tags: fixtureTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, appCount: 1 })),
    searchResult: {
      items: fixtureAppListItems,
      totalCount: fixtureAppListItems.length,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasMore: false,
    },
  };
}

export function createLargePaginatedAppsCatalogScenario(total = 30, page = 1, limit = 12): AppsCatalogScenarioData {
  const allItems: AppListItem[] = Array.from({ length: total }).map((_, i) => {
    const app = createApp({
      id: `app-page-${i + 1}`,
      slug: `developer-tool-${i + 1}`,
      name: `Developer Utility #${i + 1}`,
      shortDescription: `Automated utility #${i + 1} for high-throughput build testing and benchmarking.`,
      sortOrder: i + 1,
    });
    return createAppListItem(app);
  });

  const startIndex = (page - 1) * limit;
  const pageItems = allItems.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(total / limit);

  return {
    categories: fixtureCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      orderIndex: c.orderIndex,
      appCount: Math.floor(total / fixtureCategories.length),
    })),
    tags: fixtureTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, appCount: 5 })),
    searchResult: {
      items: pageItems,
      totalCount: total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}
