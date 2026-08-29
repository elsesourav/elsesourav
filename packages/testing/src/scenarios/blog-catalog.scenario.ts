import type { BlogQueryResult, BlogCategory, BlogTag } from '@elsesourav/types';
import { fixtureBlogPostListItems, fixtureBlogCategories, fixtureBlogTags } from '../fixtures/blog.fixtures';

export interface BlogCatalogScenarioData {
  readonly categories: readonly BlogCategory[];
  readonly tags: readonly BlogTag[];
  readonly result: BlogQueryResult;
}

export function createEmptyBlogCatalogScenario(): BlogCatalogScenarioData {
  return {
    categories: fixtureBlogCategories,
    tags: fixtureBlogTags,
    result: {
      items: [],
      totalCount: 0,
      page: 1,
      limit: 9,
      totalPages: 0,
      hasMore: false,
    },
  };
}

export function createPopulatedBlogCatalogScenario(): BlogCatalogScenarioData {
  return {
    categories: fixtureBlogCategories,
    tags: fixtureBlogTags,
    result: {
      items: fixtureBlogPostListItems,
      totalCount: fixtureBlogPostListItems.length,
      page: 1,
      limit: 9,
      totalPages: 1,
      hasMore: false,
    },
  };
}
