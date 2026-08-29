import { PrismaClient, PublishStatus, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
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
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Lists all public categories with published article counts and previews
   */
  async findPublicCategories(): Promise<HelpCategoryWithArticles[]> {
    const categories = await this.prisma.helpCategory.findMany({
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
    const category = await this.prisma.helpCategory.findUnique({
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
    const article = await this.prisma.helpArticle.findFirst({
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
      this.prisma.helpArticle.findMany({
        where: whereClause,
        orderBy: { orderIndex: 'asc' },
        take: limit,
        include: {
          category: true,
        },
      }),
      this.prisma.helpArticle.count({ where: whereClause }),
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
    const articles = await this.prisma.helpArticle.findMany({
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
  async createCategory(data: CreateHelpCategoryInput, slug: string): Promise<DomainHelpCategory> {
    const category = await this.prisma.helpCategory.create({
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
  async updateCategory(id: string, data: UpdateHelpCategoryInput): Promise<DomainHelpCategory> {
    const category = await this.prisma.helpCategory.update({
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
    const article = await this.prisma.helpArticle.create({
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
  async updateArticle(id: string, data: UpdateHelpArticleInput): Promise<DomainHelpArticle> {
    const article = await this.prisma.helpArticle.update({
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
    const article = await this.prisma.helpArticle.update({
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
    const article = await this.prisma.helpArticle.update({
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

  async findArticleById(id: string): Promise<DomainHelpArticle | null> {
    const article = await this.prisma.helpArticle.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
      },
    });
    if (!article || article.deletedAt) return null;
    return mapPrismaHelpArticleToDomain(article);
  }

  async listAdminArticles(
    options: {
      categorySlug?: string;
      search?: string;
      limit?: number;
    } = {}
  ): Promise<DomainHelpArticle[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const where: Prisma.HelpArticleWhereInput = { deletedAt: null };

    if (options.categorySlug && options.categorySlug !== 'all') {
      where.category = { slug: options.categorySlug };
    }

    if (options.search && options.search.trim().length > 0) {
      const term = options.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.helpArticle.findMany({
      where,
      take: limit,
      orderBy: [{ category: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
      include: {
        category: true,
        author: true,
      },
    });

    return records.map(mapPrismaHelpArticleToDomain);
  }

  async deleteArticle(id: string): Promise<void> {
    await this.prisma.helpArticle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: PublishStatus.ARCHIVED,
      },
    });
  }

  /**
   * Increments helpfulness votes
   */
  async voteHelpful(articleId: string, isHelpful: boolean): Promise<void> {
    await this.prisma.helpArticle.update({
      where: { id: articleId },
      data: {
        helpfulCount: isHelpful ? { increment: 1 } : undefined,
        unhelpfulCount: !isHelpful ? { increment: 1 } : undefined,
      },
    });
  }
}
