import { HelpRepository, HelpService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { HelpArticle, HelpCategoryWithArticles } from '@elsesourav/types';

const helpRepo = new HelpRepository();
const helpService = new HelpService(helpRepo);

export interface AdminHelpListData {
  articles: HelpArticle[];
  categories: HelpCategoryWithArticles[];
}

export async function getAdminHelpList(
  options: {
    categorySlug?: string;
    search?: string;
  } = {}
): Promise<AdminHelpListData> {
  const context = await requireAdmin();

  const [articles, categories] = await Promise.all([
    helpService.listAdminArticles(context.role, options),
    helpService.listPublicCategories(),
  ]);

  return {
    articles,
    categories,
  };
}

export interface AdminHelpEditData {
  article: HelpArticle;
  categories: HelpCategoryWithArticles[];
}

export async function getAdminArticleForEdit(articleId: string): Promise<AdminHelpEditData> {
  const context = await requireAdmin();

  const [article, categories] = await Promise.all([
    helpService.getAdminArticleById(context.role, articleId),
    helpService.listPublicCategories(),
  ]);

  return {
    article,
    categories,
  };
}
