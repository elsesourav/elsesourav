import type { AppSearchResult, BlogQueryResult } from '@elsesourav/types';
import { fixtureAppListItems } from '../fixtures/apps.fixtures';
import { fixtureBlogPostListItems } from '../fixtures/blog.fixtures';

export interface PublicHomeScenarioData {
  readonly appsResult: AppSearchResult;
  readonly blogResult: BlogQueryResult;
}

export function createPublicHomeScenario(): PublicHomeScenarioData {
  return {
    appsResult: {
      items: fixtureAppListItems.slice(0, 5),
      totalCount: 5,
      page: 1,
      limit: 6,
      totalPages: 1,
      hasMore: false,
    },
    blogResult: {
      items: fixtureBlogPostListItems,
      totalCount: 3,
      page: 1,
      limit: 3,
      totalPages: 1,
      hasMore: false,
    },
  };
}
