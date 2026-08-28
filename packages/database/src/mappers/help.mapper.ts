import type {
  HelpCategory as PrismaHelpCategory,
  HelpArticle as PrismaHelpArticle,
  User as PrismaUser,
} from '@prisma/client';
import type {
  HelpCategory as DomainHelpCategory,
  HelpArticleListItem,
  PublicHelpArticle,
  HelpArticle as DomainHelpArticle,
  HelpArticleAuthor,
  HelpArticleStatus,
} from '@elsesourav/types';

export type PrismaHelpArticleWithRelations = PrismaHelpArticle & {
  category?: PrismaHelpCategory | null;
  author?: PrismaUser | null;
};

export type PrismaHelpCategoryWithArticles = PrismaHelpCategory & {
  articles?: PrismaHelpArticle[] | null;
  _count?: {
    articles: number;
  };
};

export function mapPrismaHelpAuthorToDomain(author?: PrismaUser | null): HelpArticleAuthor | undefined {
  if (!author) return undefined;
  return {
    id: author.id,
    displayName: author.displayName || 'ElseSourav Team',
    username: author.username ?? undefined,
    photoUrl: author.photoUrl ?? undefined,
  };
}

export function mapPrismaHelpCategoryToDomain(
  category: PrismaHelpCategoryWithArticles
): DomainHelpCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    icon: category.icon ?? undefined,
    orderIndex: category.orderIndex,
    createdAt: category.createdAt.getTime(),
    updatedAt: category.updatedAt.getTime(),
    articleCount: category._count?.articles ?? (category.articles ? category.articles.length : 0),
  };
}

export function mapPrismaHelpArticleToListItem(
  article: PrismaHelpArticleWithRelations
): HelpArticleListItem {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? undefined,
    categoryId: article.categoryId,
    categorySlug: article.category?.slug ?? '',
    categoryName: article.category?.name ?? 'General',
    orderIndex: article.orderIndex,
    publishedAt: article.publishedAt ? article.publishedAt.getTime() : undefined,
    updatedAt: article.updatedAt.getTime(),
  };
}

export function mapPrismaHelpArticleToPublic(
  article: PrismaHelpArticleWithRelations
): PublicHelpArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? undefined,
    content: article.content,
    category: {
      id: article.category?.id ?? article.categoryId,
      name: article.category?.name ?? 'General',
      slug: article.category?.slug ?? '',
      icon: article.category?.icon ?? undefined,
    },
    author: mapPrismaHelpAuthorToDomain(article.author),
    helpfulCount: article.helpfulCount,
    unhelpfulCount: article.unhelpfulCount,
    seoTitle: article.seoTitle ?? undefined,
    seoDescription: article.seoDescription ?? undefined,
    publishedAt: article.publishedAt ? article.publishedAt.getTime() : undefined,
    updatedAt: article.updatedAt.getTime(),
  };
}

export function mapPrismaHelpArticleToDomain(
  article: PrismaHelpArticleWithRelations
): DomainHelpArticle {
  return {
    id: article.id,
    categoryId: article.categoryId,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? undefined,
    content: article.content,
    status: article.status.toLowerCase() as HelpArticleStatus,
    orderIndex: article.orderIndex,
    helpfulCount: article.helpfulCount,
    unhelpfulCount: article.unhelpfulCount,
    authorId: article.authorId ?? undefined,
    author: mapPrismaHelpAuthorToDomain(article.author),
    category: article.category ? mapPrismaHelpCategoryToDomain(article.category) : undefined,
    seoTitle: article.seoTitle ?? undefined,
    seoDescription: article.seoDescription ?? undefined,
    publishedAt: article.publishedAt ? article.publishedAt.getTime() : undefined,
    createdAt: article.createdAt.getTime(),
    updatedAt: article.updatedAt.getTime(),
    deletedAt: article.deletedAt ? article.deletedAt.getTime() : undefined,
  };
}
