import { HelpRepository, HelpService } from '@elsesourav/database';
import type {
  HelpCategoryWithArticles,
  HelpSearchInput,
  HelpSearchResult,
} from '@elsesourav/types';

const helpRepo = new HelpRepository();
const helpService = new HelpService(helpRepo);

export async function getPublicHelpCategories(): Promise<HelpCategoryWithArticles[]> {
  return helpService.listPublicCategories();
}

export async function getHelpCategoryBySlug(slug: string): Promise<HelpCategoryWithArticles | null> {
  try {
    return await helpService.getCategoryBySlug(slug);
  } catch {
    return null;
  }
}

export async function searchPublicHelpArticles(input: HelpSearchInput): Promise<HelpSearchResult> {
  return helpService.searchArticles(input);
}
