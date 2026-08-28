import { prisma } from '../client';
import { PublishStatus, Prisma } from '@prisma/client';
import {
  mapPrismaHelpCategoryToDomain,
  mapPrismaHelpArticleToListItem,
  mapPrismaHelpArticleToPublic,
  mapPrismaHelpArticleToDomain,
} from '../mappers/help.mapper';
import type {
  HelpCategory as DomainHelpCategory,
  HelpCategoryWithArticles,
  HelpArticleListItem,
  PublicHelpArticle,
  HelpArticle as DomainHelpArticle,
  CreateHelpCategoryInput,
  UpdateHelpCategoryInput,
  CreateHelpArticleInput,
  UpdateHelpArticleInput,
  HelpSearchInput,
  HelpSearchResult,
} from '@elsesourav/types';

export class HelpRepository {
  /**
   * Lists all public categories with published article counts and previews
   */
  async findPublicCategories(): Promise<HelpCategoryWithArticles[]> {
    const categories = await prisma.helpCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        articles: {
          where: {
            status: PublishStatus.PUBLISHED,
            deletedAt: null,
          },
          orderBy: { orderIndex: 'asc' },
          include: {
            category: true,
          },
        },
      },
    });

    return categories.map((cat) => ({
      ...mapPrismaHelpCategoryToDomain(cat),
      articles: cat.articles.map(mapPrismaHelpArticleToListItem),
    }));
  }

  /**
   * Finds a category by slug with all its published articles
   */
  async findCategoryBySlug(slug: string): Promise<HelpCategoryWithArticles | null> {
    const category = await prisma.helpCategory.findUnique({
      where: { slug },
      include: {
        articles: {
          where: {
            status: PublishStatus.PUBLISHED,
            deletedAt: null,
          },
          orderBy: { orderIndex: 'asc' },
          include: {
            category: true,
          },
        },
      },
    });

    if (!category) return null;

    return {
      ...mapPrismaHelpCategoryToDomain(category),
      articles: category.articles.map(mapPrismaHelpArticleToListItem),
    };
  }

  /**
   * Finds a published article by slug
   */
  async findArticleBySlug(slug: string): Promise<PublicHelpArticle | null> {
    const article = await prisma.helpArticle.findFirst({
      where: {
        slug,
        status: PublishStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        category: true,
        author: true,
      },
    });

    if (!article) return null;

    return mapPrismaHelpArticleToPublic(article);
  }

  /**
   * Search published help articles
   */
  async searchPublicArticles(input: HelpSearchInput): Promise<HelpSearchResult> {
    const limit = Math.min(input.limit || 10, 50);
    const searchTerms = input.query.trim().toLowerCase();

    const whereClause: Prisma.HelpArticleWhereInput = {
      status: PublishStatus.PUBLISHED,
      deletedAt: null,
      AND: [
        {
          OR: [
            { title: { contains: searchTerms, mode: 'insensitive' } },
            { excerpt: { contains: searchTerms, mode: 'insensitive' } },
            { content: { contains: searchTerms, mode: 'insensitive' } },
          ],
        },
      ],
    };

    if (input.categorySlug) {
      whereClause.category = { slug: input.categorySlug };
    }

    const [articles, totalCount] = await Promise.all([
      prisma.helpArticle.findMany({
        where: whereClause,
        orderBy: { orderIndex: 'asc' },
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.helpArticle.count({ where: whereClause }),
    ]);

    return {
      items: articles.map(mapPrismaHelpArticleToListItem),
      totalCount,
      query: input.query,
    };
  }

  /**
   * Finds related published articles in the same category
   */
  async findRelatedArticles(
    articleId: string,
    categoryId: string,
    limit: number = 3
  ): Promise<HelpArticleListItem[]> {
    const articles = await prisma.helpArticle.findMany({
      where: {
        categoryId,
        id: { not: articleId },
        status: PublishStatus.PUBLISHED,
        deletedAt: null,
      },
      orderBy: { orderIndex: 'asc' },
      take: limit,
      include: {
        category: true,
      },
    });

    return articles.map(mapPrismaHelpArticleToListItem);
  }

  /**
   * Creates a new Help Category
   */
  async createCategory(
    data: CreateHelpCategoryInput,
    slug: string
  ): Promise<DomainHelpCategory> {
    const category = await prisma.helpCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        orderIndex: data.orderIndex ?? 0,
      },
    });

    return mapPrismaHelpCategoryToDomain(category);
  }

  /**
   * Updates an existing Help Category
   */
  async updateCategory(
    id: string,
    data: UpdateHelpCategoryInput
  ): Promise<DomainHelpCategory> {
    const category = await prisma.helpCategory.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
      },
    });

    return mapPrismaHelpCategoryToDomain(category);
  }

  /**
   * Creates a new Help Article (DRAFT)
   */
  async createArticle(
    data: CreateHelpArticleInput,
    slug: string,
    authorId?: string
  ): Promise<DomainHelpArticle> {
    const article = await prisma.helpArticle.create({
      data: {
        categoryId: data.categoryId,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        status: PublishStatus.DRAFT,
        orderIndex: data.orderIndex ?? 0,
        authorId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
      include: {
        category: true,
        author: true,
      },
    });

    return mapPrismaHelpArticleToDomain(article);
  }

  /**
   * Updates an existing Help Article
   */
  async updateArticle(
    id: string,
    data: UpdateHelpArticleInput
  ): Promise<DomainHelpArticle> {
    const article = await prisma.helpArticle.update({
      where: { id },
      data: {
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content && { content: data.content }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
      include: {
        category: true,
        author: true,
      },
    });

    return mapPrismaHelpArticleToDomain(article);
  }

  /**
   * Publishes a Help Article
   */
  async publishArticle(id: string): Promise<DomainHelpArticle> {
    const article = await prisma.helpArticle.update({
      where: { id },
      data: {
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        category: true,
        author: true,
      },
    });

    return mapPrismaHelpArticleToDomain(article);
  }

  /**
   * Archives a Help Article
   */
  async archiveArticle(id: string): Promise<DomainHelpArticle> {
    const article = await prisma.helpArticle.update({
      where: { id },
      data: {
        status: PublishStatus.ARCHIVED,
      },
      include: {
        category: true,
        author: true,
      },
    });

    return mapPrismaHelpArticleToDomain(article);
  }

  /**
   * Increments helpfulness votes
   */
  async voteHelpful(articleId: string, isHelpful: boolean): Promise<void> {
    await prisma.helpArticle.update({
      where: { id: articleId },
      data: {
        helpfulCount: isHelpful ? { increment: 1 } : undefined,
        unhelpfulCount: !isHelpful ? { increment: 1 } : undefined,
      },
    });
  }
}
