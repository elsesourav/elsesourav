import type { HelpCategory, HelpArticle } from '@elsesourav/types';
import { fixtureHelpCategories, fixtureHelpArticles } from '../fixtures/help.fixtures';

export interface HelpCenterScenarioData {
  readonly categories: readonly HelpCategory[];
  readonly articles: readonly HelpArticle[];
}

export function createHelpCenterScenario(): HelpCenterScenarioData {
  return {
    categories: fixtureHelpCategories,
    articles: fixtureHelpArticles,
  };
}
