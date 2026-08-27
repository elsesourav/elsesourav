import { FirestoreRepository } from './firestore.repository';
import type {
  IHelpCategoryRepository,
  IHelpArticleRepository,
  IHelpRepository,
  CreateHelpCategoryDto,
  UpdateHelpCategoryDto,
  CreateHelpArticleDto,
  UpdateHelpArticleDto,
} from './interfaces';
import type { HelpCategory, HelpArticle, HelpArticleStatus } from '@/types/help.types';
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
} from '@/schemas/help.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { Firestore } from 'firebase/firestore';

export type {
  CreateHelpCategoryDto,
  UpdateHelpCategoryDto,
  CreateHelpArticleDto,
  UpdateHelpArticleDto,
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
    const now = Date.now();
    const payload = {
      ...data,
      slug: data.slug.toLowerCase(),
      status: 'draft' as const,
      orderIndex: data.orderIndex ?? 0,
      featured: data.featured ?? false,
      viewsCount: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    return this.create(payload as unknown as CreateHelpArticleDto);
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
      updatedAt: Date.now(),
      deletedAt: undefined,
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
        { field: 'status', operator: '==', value: 'published' },
        { field: 'featured', operator: '==', value: true },
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
    const publishedRes = await this.listPublished({
      limit: options?.limit ? Math.max(options.limit * 3, 30) : 50,
    });

    if (!publishedRes.success) {
      return publishedRes;
    }

    const cleanQuery = queryText.toLowerCase().trim();
    if (!cleanQuery) {
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
}

/**
 * Help Center Unified Facade Repository
 */
export class HelpRepository implements IHelpRepository {
  constructor(
    private readonly categoryRepo: IHelpCategoryRepository = new HelpCategoryRepository(),
    private readonly articleRepo: IHelpArticleRepository = new HelpArticleRepository()
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
}

export const helpCategoryRepository = new HelpCategoryRepository();
export const helpArticleRepository = new HelpArticleRepository();
export const helpRepository = new HelpRepository(helpCategoryRepository, helpArticleRepository);
