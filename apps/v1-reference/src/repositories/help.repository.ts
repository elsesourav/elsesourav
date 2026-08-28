import { FirestoreRepository } from './firestore.repository';
import type {
  IHelpCategoryRepository,
  IHelpArticleRepository,
  IHelpArticleFeedbackRepository,
  IHelpRepository,
  CreateHelpCategoryDto,
  UpdateHelpCategoryDto,
  CreateHelpArticleDto,
  UpdateHelpArticleDto,
  CreateHelpArticleFeedbackDto,
} from './interfaces';
import type {
  HelpCategory,
  HelpArticle,
  HelpArticleStatus,
  ArticleHelpfulnessFeedback,
} from '@/types/help.types';
import type {
  RepositoryResult,
  PaginatedRepositoryResult,
  QueryOptions,
  QueryFilter,
} from './types';
import {
  createHelpCategorySchema,
  updateHelpCategorySchema,
  createHelpArticleSchema,
  updateHelpArticleSchema,
  submitArticleHelpfulnessSchema,
} from '@/schemas/help.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { doc, updateDoc, increment, type Firestore } from 'firebase/firestore';

export type {
  CreateHelpCategoryDto,
  UpdateHelpCategoryDto,
  CreateHelpArticleDto,
  UpdateHelpArticleDto,
  CreateHelpArticleFeedbackDto,
};

/**
 * Help Category Firestore Repository
 */
export class HelpCategoryRepository
  extends FirestoreRepository<HelpCategory, CreateHelpCategoryDto, UpdateHelpCategoryDto>
  implements IHelpCategoryRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('helpCategories', {
      createSchema: createHelpCategorySchema,
      updateSchema: updateHelpCategorySchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<HelpCategory | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for help category lookup', 'slug'));
    }

    const result = await this.findMany({
      filters: [{ field: 'slug', operator: '==', value: slug.toLowerCase() }],
      limit: 1,
    });

    if (!result.success) {
      return result;
    }

    return ok(result.data.items[0] || null);
  }

  public async listActive(options?: QueryOptions): PaginatedRepositoryResult<HelpCategory> {
    const filters: QueryFilter[] = [{ field: 'isActive', operator: '==', value: true }];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'orderIndex',
      orderDirection: options?.orderDirection || 'asc',
    });
  }

  public async checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean> {
    const existing = await this.findBySlug(slug);
    if (!existing.success) {
      return existing;
    }

    if (!existing.data) {
      return ok(true);
    }

    if (excludeId && existing.data.id === excludeId) {
      return ok(true);
    }

    return ok(false);
  }
}

/**
 * Help Article Firestore Repository
 */
export class HelpArticleRepository
  extends FirestoreRepository<HelpArticle, CreateHelpArticleDto, UpdateHelpArticleDto>
  implements IHelpArticleRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('helpArticles', {
      createSchema: createHelpArticleSchema,
      updateSchema: updateHelpArticleSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<HelpArticle | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for help article lookup', 'slug'));
    }

    const result = await this.findMany({
      filters: [{ field: 'slug', operator: '==', value: slug.toLowerCase() }],
      limit: 1,
    });

    if (!result.success) {
      return result;
    }

    return ok(result.data.items[0] || null);
  }

  public async createDraft(data: CreateHelpArticleDto): RepositoryResult<HelpArticle> {
    return this.create(data);
  }

  public async publish(id: string): RepositoryResult<HelpArticle> {
    const now = Date.now();
    return this.update(id, {
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    });
  }

  public async unpublish(id: string): RepositoryResult<HelpArticle> {
    return this.update(id, {
      status: 'draft',
      updatedAt: Date.now(),
    });
  }

  public async archive(id: string): RepositoryResult<HelpArticle> {
    const now = Date.now();
    return this.update(id, {
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    });
  }

  public async restore(
    id: string,
    targetStatus: HelpArticleStatus = 'draft'
  ): RepositoryResult<HelpArticle> {
    return this.update(id, {
      status: targetStatus,
      archivedAt: undefined,
      updatedAt: Date.now(),
    });
  }

  public async listPublished(options?: QueryOptions): PaginatedRepositoryResult<HelpArticle> {
    const filters: QueryFilter[] = [{ field: 'status', operator: '==', value: 'published' }];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'orderIndex',
      orderDirection: options?.orderDirection || 'asc',
    });
  }

  public async listByCategory(
    categoryId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<HelpArticle> {
    const filters: QueryFilter[] = [
      { field: 'categoryId', operator: '==', value: categoryId },
      { field: 'status', operator: '==', value: 'published' },
    ];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'orderIndex',
      orderDirection: options?.orderDirection || 'asc',
    });
  }

  public async listFeatured(limit = 6): PaginatedRepositoryResult<HelpArticle> {
    return this.findMany({
      filters: [
        { field: 'featured', operator: '==', value: true },
        { field: 'status', operator: '==', value: 'published' },
      ],
      limit,
      orderBy: 'orderIndex',
      orderDirection: 'asc',
    });
  }

  public async searchArticles(
    queryText: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<HelpArticle> {
    const cleanQuery = queryText.toLowerCase().trim();
    if (!cleanQuery) {
      return this.listPublished(options);
    }

    const publishedRes = await this.listPublished({ limit: 100 });
    if (!publishedRes.success) {
      return publishedRes;
    }

    const filtered = publishedRes.data.items.filter((article) => {
      return (
        article.title.toLowerCase().includes(cleanQuery) ||
        article.slug.toLowerCase().includes(cleanQuery) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(cleanQuery)) ||
        article.content.toLowerCase().includes(cleanQuery)
      );
    });

    const pageSize = options?.limit || 10;
    return ok({
      items: filtered.slice(0, pageSize),
      hasMore: filtered.length > pageSize,
    });
  }

  public async checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean> {
    const existing = await this.findBySlug(slug);
    if (!existing.success) {
      return existing;
    }

    if (!existing.data) {
      return ok(true);
    }

    if (excludeId && existing.data.id === excludeId) {
      return ok(true);
    }

    return ok(false);
  }

  public async incrementHelpfulness(articleId: string, helpful: boolean): RepositoryResult<void> {
    const firestore = this.getFirestoreInstance();
    if (!firestore) {
      return err(AppError.internal('Firestore is not initialized'));
    }

    try {
      const articleRef = doc(firestore, 'helpArticles', articleId);
      await updateDoc(articleRef, {
        [helpful ? 'helpfulCount' : 'unhelpfulCount']: increment(1),
        updatedAt: Date.now(),
      });
      return ok(undefined);
    } catch (error) {
      return err(AppError.internal('Failed to update article helpfulness aggregate count', error));
    }
  }
}

/**
 * Help Article Feedback Firestore Repository
 */
export class HelpArticleFeedbackRepository
  extends FirestoreRepository<
    ArticleHelpfulnessFeedback,
    CreateHelpArticleFeedbackDto,
    Record<string, unknown>
  >
  implements IHelpArticleFeedbackRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('helpArticleFeedback', {
      createSchema: submitArticleHelpfulnessSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findByArticleAndUser(
    articleId: string,
    identifier: { userId?: string; sessionId: string }
  ): RepositoryResult<ArticleHelpfulnessFeedback | null> {
    if (!articleId) {
      return err(AppError.badRequest('Article ID is required', 'articleId'));
    }

    if (identifier.userId) {
      const userFeedback = await this.findMany({
        filters: [
          { field: 'articleId', operator: '==', value: articleId },
          { field: 'userId', operator: '==', value: identifier.userId },
        ],
        limit: 1,
      });

      if (!userFeedback.success) {
        return userFeedback;
      }

      if (userFeedback.data.items.length > 0) {
        return ok(userFeedback.data.items[0] ?? null);
      }
    }

    if (identifier.sessionId) {
      const sessionFeedback = await this.findMany({
        filters: [
          { field: 'articleId', operator: '==', value: articleId },
          { field: 'sessionId', operator: '==', value: identifier.sessionId },
        ],
        limit: 1,
      });

      if (!sessionFeedback.success) {
        return sessionFeedback;
      }

      if (sessionFeedback.data.items.length > 0) {
        return ok(sessionFeedback.data.items[0] ?? null);
      }
    }

    return ok(null);
  }

  public async incrementArticleHelpfulness(
    articleId: string,
    helpful: boolean
  ): RepositoryResult<void> {
    const firestore = this.getFirestoreInstance();
    if (!firestore) {
      return err(AppError.internal('Firestore is not initialized'));
    }

    try {
      const articleRef = doc(firestore, 'helpArticles', articleId);
      await updateDoc(articleRef, {
        [helpful ? 'helpfulCount' : 'unhelpfulCount']: increment(1),
        updatedAt: Date.now(),
      });
      return ok(undefined);
    } catch (error) {
      return err(AppError.internal('Failed to update article helpfulness aggregate count', error));
    }
  }
}

/**
 * Help Center Unified Facade Repository
 */
export class HelpRepository implements IHelpRepository {
  constructor(
    private readonly categoryRepo: IHelpCategoryRepository = new HelpCategoryRepository(),
    private readonly articleRepo: IHelpArticleRepository = new HelpArticleRepository(),
    private readonly feedbackRepo: IHelpArticleFeedbackRepository = new HelpArticleFeedbackRepository()
  ) {}

  public getCategoryBySlug(slug: string): RepositoryResult<HelpCategory | null> {
    return this.categoryRepo.findBySlug(slug);
  }

  public getArticleBySlug(slug: string): RepositoryResult<HelpArticle | null> {
    return this.articleRepo.findBySlug(slug);
  }

  public listCategories(options?: QueryOptions): PaginatedRepositoryResult<HelpCategory> {
    return this.categoryRepo.listActive(options);
  }

  public listPublishedArticles(options?: QueryOptions): PaginatedRepositoryResult<HelpArticle> {
    return this.articleRepo.listPublished(options);
  }

  public listArticlesByCategory(
    categoryId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<HelpArticle> {
    return this.articleRepo.listByCategory(categoryId, options);
  }

  public searchArticles(
    queryText: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<HelpArticle> {
    return this.articleRepo.searchArticles(queryText, options);
  }

  public createDraft(data: CreateHelpArticleDto): RepositoryResult<HelpArticle> {
    return this.articleRepo.createDraft(data);
  }

  public updateDraft(id: string, data: UpdateHelpArticleDto): RepositoryResult<HelpArticle> {
    return this.articleRepo.update(id, data);
  }

  public publish(id: string): RepositoryResult<HelpArticle> {
    return this.articleRepo.publish(id);
  }

  public unpublish(id: string): RepositoryResult<HelpArticle> {
    return this.articleRepo.unpublish(id);
  }

  public archive(id: string): RepositoryResult<HelpArticle> {
    return this.articleRepo.archive(id);
  }

  public async submitHelpfulness(
    data: CreateHelpArticleFeedbackDto
  ): RepositoryResult<ArticleHelpfulnessFeedback> {
    const feedbackRes = await this.feedbackRepo.create(data);
    if (!feedbackRes.success) {
      return feedbackRes;
    }

    // Atomic increment of helpfulCount / unhelpfulCount
    await this.feedbackRepo.incrementArticleHelpfulness(data.articleId, data.helpful);

    return feedbackRes;
  }

  public async hasUserVoted(
    articleId: string,
    identifier: { userId?: string; sessionId: string }
  ): RepositoryResult<boolean> {
    const existing = await this.feedbackRepo.findByArticleAndUser(articleId, identifier);
    if (!existing.success) {
      return existing;
    }
    return ok(existing.data !== null);
  }
}

export const helpCategoryRepository = new HelpCategoryRepository();
export const helpArticleRepository = new HelpArticleRepository();
export const helpArticleFeedbackRepository = new HelpArticleFeedbackRepository();
export const helpRepository = new HelpRepository(
  helpCategoryRepository,
  helpArticleRepository,
  helpArticleFeedbackRepository
);
