import { HelpRepository, HelpService } from '@elsesourav/database';
import type { PublicHelpArticle, HelpArticleListItem } from '@elsesourav/types';

const helpRepo = new HelpRepository();
const helpService = new HelpService(helpRepo);

export async function getPublicHelpArticleBySlug(slug: string): Promise<PublicHelpArticle | null> {
  try {
    return await helpService.getArticleBySlug(slug);
  } catch {
    return null;
  }
}

export async function getRelatedHelpArticles(
  articleId: string,
  categoryId: string,
  limit: number = 3
): Promise<HelpArticleListItem[]> {
  return helpService.getRelatedArticles(articleId, categoryId, limit);
}

export async function submitHelpVote(articleId: string, isHelpful: boolean): Promise<{ success: boolean }> {
  try {
    await helpService.voteHelpful(articleId, isHelpful);
    return { success: true };
  } catch {
    return { success: false };
  }
}
