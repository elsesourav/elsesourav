import { BaseService } from './base.service';
import type {
  IHelpCategoryRepository,
  IHelpArticleRepository,
  IHelpArticleFeedbackRepository,
  CreateHelpCategoryDto,
  UpdateHelpCategoryDto,
  CreateHelpArticleDto,
  UpdateHelpArticleDto,
  CreateHelpArticleFeedbackDto,
} from '@/repositories/interfaces';
import {
  helpCategoryRepository,
  helpArticleRepository,
  helpArticleFeedbackRepository,
} from '@/repositories/help.repository';
import type {
  HelpCategory,
  HelpArticle,
  HelpArticleStatus,
  ArticleHelpfulnessFeedback,
  ArticleHelpfulnessStats,
} from '@/types/help.types';
import type { Result } from '@/types/result.types';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import { AppError } from '@/lib/errors';
import { ok, err } from '@/lib/result';
import {
  createHelpCategorySchema,
  updateHelpCategorySchema,
  createHelpArticleSchema,
  updateHelpArticleSchema,
  publishHelpArticleSchema,
  submitArticleHelpfulnessSchema,
  type CreateHelpCategoryInput,
  type UpdateHelpCategoryInput,
  type CreateHelpArticleInput,
  type UpdateHelpArticleInput,
  type SubmitArticleHelpfulnessInput,
} from '@/schemas/help.schema';
import { analyticsService } from './analytics.service';

/**
 * Help Center & Knowledge Base Domain Service
 */
export class HelpService extends BaseService {
  constructor(
    private readonly categoryRepo: IHelpCategoryRepository = helpCategoryRepository,
    private readonly articleRepo: IHelpArticleRepository = helpArticleRepository,
    private readonly feedbackRepo: IHelpArticleFeedbackRepository = helpArticleFeedbackRepository
  ) {
    super();
  }

  // =========================================================================
  // Category Management
  // =========================================================================

  public async createCategory(
    input: CreateHelpCategoryInput
  ): Promise<Result<HelpCategory, AppError>> {
    const parseResult = createHelpCategorySchema.safeParse(input);
    if (!parseResult.success) {
      return err(
        AppError.validation('Invalid help category data', undefined, parseResult.error.flatten())
      );
    }

    const data = parseResult.data;
    const cleanSlug = data.slug.toLowerCase().trim();

    const isUnique = await this.categoryRepo.checkSlugUnique(cleanSlug);
    if (!isUnique.success) {
      return isUnique;
    }
    if (!isUnique.data) {
      return err(
        AppError.conflict(`Help category with slug "${cleanSlug}" already exists`, 'slug')
      );
    }

    const payload: CreateHelpCategoryDto = {
      name: data.name.trim(),
      slug: cleanSlug,
      description: data.description?.trim(),
      icon: data.icon?.trim(),
      orderIndex: data.orderIndex ?? 0,
      isActive: data.isActive ?? true,
    };

    return this.categoryRepo.create(payload);
  }

  public async updateCategory(
    id: string,
    input: UpdateHelpCategoryInput
  ): Promise<Result<HelpCategory, AppError>> {
    const parseResult = updateHelpCategorySchema.safeParse(input);
    if (!parseResult.success) {
      return err(
        AppError.validation(
          'Invalid help category update data',
          undefined,
          parseResult.error.flatten()
        )
      );
    }

    const data = parseResult.data;
    if (data.slug) {
      const cleanSlug = data.slug.toLowerCase().trim();
      const isUnique = await this.categoryRepo.checkSlugUnique(cleanSlug, id);
      if (!isUnique.success) {
        return isUnique;
      }
      if (!isUnique.data) {
        return err(
          AppError.conflict(`Help category with slug "${cleanSlug}" already exists`, 'slug')
        );
      }
      data.slug = cleanSlug;
    }

    const payload: UpdateHelpCategoryDto = {
      ...data,
      updatedAt: Date.now(),
    };

    return this.categoryRepo.update(id, payload);
  }

  public async deleteCategory(id: string): Promise<Result<void, AppError>> {
    return this.categoryRepo.delete(id);
  }

  public async listActiveCategories(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<HelpCategory>, AppError>> {
    return this.categoryRepo.listActive(options);
  }

  public async getCategoryBySlug(slug: string): Promise<Result<HelpCategory | null, AppError>> {
    return this.categoryRepo.findBySlug(slug);
  }

  public async getCategoryById(id: string): Promise<Result<HelpCategory | null, AppError>> {
    return this.categoryRepo.findById(id);
  }

  public async checkCategorySlugUnique(
    slug: string,
    excludeId?: string
  ): Promise<Result<boolean, AppError>> {
    return this.categoryRepo.checkSlugUnique(slug.toLowerCase().trim(), excludeId);
  }

  // =========================================================================
  // Article Management (Authoring & Lifecycle)
  // =========================================================================

  public async createDraft(input: CreateHelpArticleInput): Promise<Result<HelpArticle, AppError>> {
    const parseResult = createHelpArticleSchema.safeParse(input);
    if (!parseResult.success) {
      return err(
        AppError.validation(
          'Invalid help article draft data',
          undefined,
          parseResult.error.flatten()
        )
      );
    }

    const data = parseResult.data;
    const cleanSlug = data.slug.toLowerCase().trim();

    // Verify Category Exists
    const categoryResult = await this.categoryRepo.findById(data.categoryId);
    if (!categoryResult.success) {
      return categoryResult;
    }
    if (!categoryResult.data) {
      return err(AppError.notFound(`Help category "${data.categoryId}" not found`, 'categoryId'));
    }

    // Verify Slug Uniqueness
    const isUnique = await this.articleRepo.checkSlugUnique(cleanSlug);
    if (!isUnique.success) {
      return isUnique;
    }
    if (!isUnique.data) {
      return err(AppError.conflict(`Help article with slug "${cleanSlug}" already exists`, 'slug'));
    }

    const payload: CreateHelpArticleDto = {
      categoryId: data.categoryId,
      title: data.title.trim(),
      slug: cleanSlug,
      excerpt: data.excerpt?.trim(),
      content: data.content,
      orderIndex: data.orderIndex ?? 0,
      featured: data.featured ?? false,
      seoTitle: data.seoTitle?.trim(),
      seoDescription: data.seoDescription?.trim(),
      socialImageUrl: data.socialImageUrl?.trim() || undefined,
    };

    return this.articleRepo.createDraft(payload);
  }

  public async updateDraft(
    id: string,
    input: UpdateHelpArticleInput
  ): Promise<Result<HelpArticle, AppError>> {
    const parseResult = updateHelpArticleSchema.safeParse(input);
    if (!parseResult.success) {
      return err(
        AppError.validation(
          'Invalid help article update data',
          undefined,
          parseResult.error.flatten()
        )
      );
    }

    const data = parseResult.data;

    if (data.categoryId) {
      const categoryResult = await this.categoryRepo.findById(data.categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }
      if (!categoryResult.data) {
        return err(AppError.notFound(`Help category "${data.categoryId}" not found`, 'categoryId'));
      }
    }

    if (data.slug) {
      const cleanSlug = data.slug.toLowerCase().trim();
      const isUnique = await this.articleRepo.checkSlugUnique(cleanSlug, id);
      if (!isUnique.success) {
        return isUnique;
      }
      if (!isUnique.data) {
        return err(
          AppError.conflict(`Help article with slug "${cleanSlug}" already exists`, 'slug')
        );
      }
      data.slug = cleanSlug;
    }

    const payload: UpdateHelpArticleDto = {
      ...data,
      updatedAt: Date.now(),
    };

    return this.articleRepo.update(id, payload);
  }

  public async publishArticle(id: string): Promise<Result<HelpArticle, AppError>> {
    const existingResult = await this.articleRepo.findById(id);
    if (!existingResult.success) {
      return existingResult;
    }
    if (!existingResult.data) {
      return err(AppError.notFound(`Help article "${id}" not found`));
    }

    const article = existingResult.data;

    // Validate readiness for publication
    const publishValidation = publishHelpArticleSchema.safeParse({
      title: article.title,
      slug: article.slug,
      categoryId: article.categoryId,
      content: article.content,
      excerpt: article.excerpt,
    });

    if (!publishValidation.success) {
      return err(
        AppError.validation(
          'Help article cannot be published due to validation errors',
          undefined,
          publishValidation.error.flatten()
        )
      );
    }

    // Verify parent category is active
    const categoryResult = await this.categoryRepo.findById(article.categoryId);
    if (!categoryResult.success || !categoryResult.data || !categoryResult.data.isActive) {
      return err(
        AppError.badRequest(
          'Cannot publish help article under an inactive or missing category',
          'categoryId'
        )
      );
    }

    return this.articleRepo.publish(id);
  }

  public async unpublishArticle(id: string): Promise<Result<HelpArticle, AppError>> {
    return this.articleRepo.unpublish(id);
  }

  public async archiveArticle(id: string): Promise<Result<HelpArticle, AppError>> {
    return this.articleRepo.archive(id);
  }

  public async restoreArticle(
    id: string,
    targetStatus: HelpArticleStatus = 'draft'
  ): Promise<Result<HelpArticle, AppError>> {
    return this.articleRepo.restore(id, targetStatus);
  }

  public async deleteArticle(id: string): Promise<Result<void, AppError>> {
    return this.articleRepo.delete(id);
  }

  public async checkArticleSlugUnique(
    slug: string,
    excludeId?: string
  ): Promise<Result<boolean, AppError>> {
    return this.articleRepo.checkSlugUnique(slug.toLowerCase().trim(), excludeId);
  }

  // =========================================================================
  // Public Discovery & Retrieval
  // =========================================================================

  public async getArticleBySlug(slug: string): Promise<Result<HelpArticle | null, AppError>> {
    return this.articleRepo.findBySlug(slug);
  }

  public async getArticleById(id: string): Promise<Result<HelpArticle | null, AppError>> {
    return this.articleRepo.findById(id);
  }

  public async listPublishedArticles(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<HelpArticle>, AppError>> {
    return this.articleRepo.listPublished(options);
  }

  public async listArticlesByCategory(
    categoryId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<HelpArticle>, AppError>> {
    return this.articleRepo.listByCategory(categoryId, options);
  }

  public async listFeaturedArticles(
    limit = 6
  ): Promise<Result<PaginatedResult<HelpArticle>, AppError>> {
    return this.articleRepo.listFeatured(limit);
  }

  // =========================================================================
  // Search Abstraction
  // =========================================================================

  public async searchArticles(
    queryText: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<HelpArticle>, AppError>> {
    return this.articleRepo.searchArticles(queryText, options);
  }

  // =========================================================================
  // Article Helpfulness & Feedback
  // =========================================================================

  public async submitHelpfulness(
    input: SubmitArticleHelpfulnessInput
  ): Promise<Result<ArticleHelpfulnessFeedback, AppError>> {
    const parseResult = submitArticleHelpfulnessSchema.safeParse(input);
    if (!parseResult.success) {
      return err(
        AppError.validation(
          'Invalid helpfulness feedback payload',
          undefined,
          parseResult.error.flatten()
        )
      );
    }

    const data = parseResult.data;

    // Verify Article Exists and is Published
    const articleRes = await this.articleRepo.findById(data.articleId);
    if (!articleRes.success) {
      return articleRes;
    }
    if (!articleRes.data || articleRes.data.status !== 'published') {
      return err(
        AppError.notFound(
          `Help article "${data.articleId}" not found or not published`,
          'articleId'
        )
      );
    }
    const article = articleRes.data;

    // Check duplicate vote prevention
    const existingFeedback = await this.feedbackRepo.findByArticleAndUser(data.articleId, {
      userId: data.userId,
      sessionId: data.sessionId,
    });
    if (!existingFeedback.success) {
      return existingFeedback;
    }
    if (existingFeedback.data) {
      return err(
        AppError.conflict('You have already submitted helpfulness feedback for this article')
      );
    }

    const payload: CreateHelpArticleFeedbackDto = {
      articleId: data.articleId,
      helpful: data.helpful,
      userId: data.userId,
      sessionId: data.sessionId,
    };

    const createRes = await this.feedbackRepo.create(payload);
    if (!createRes.success) {
      return createRes;
    }

    // Atomic increment of helpfulCount or unhelpfulCount
    await this.articleRepo.incrementHelpfulness(data.articleId, data.helpful);

    // Non-blocking analytics tracking
    void analyticsService.trackArticleHelpfulness(data.articleId, data.helpful, {
      categoryId: article.categoryId,
      slug: article.slug,
      userId: data.userId,
      sessionId: data.sessionId,
    });

    return createRes;
  }

  public async hasUserVoted(
    articleId: string,
    identifier: { userId?: string; sessionId: string }
  ): Promise<Result<boolean, AppError>> {
    const existing = await this.feedbackRepo.findByArticleAndUser(articleId, identifier);
    if (!existing.success) {
      return existing;
    }
    return ok(existing.data !== null);
  }

  public async getArticleHelpfulnessStats(
    articleId: string
  ): Promise<Result<ArticleHelpfulnessStats, AppError>> {
    const articleRes = await this.articleRepo.findById(articleId);
    if (!articleRes.success) {
      return articleRes;
    }
    if (!articleRes.data) {
      return err(AppError.notFound(`Help article "${articleId}" not found`, 'articleId'));
    }

    const helpfulCount = articleRes.data.helpfulCount ?? 0;
    const notHelpfulCount = articleRes.data.unhelpfulCount ?? 0;
    const total = helpfulCount + notHelpfulCount;
    const helpfulnessRatio = total > 0 ? helpfulCount / total : 1;

    return ok({
      articleId,
      helpfulCount,
      notHelpfulCount,
      helpfulnessRatio,
    });
  }
}

export const helpService = new HelpService();
