import type { App, AppStatus, AppStatistics } from '@/types/app.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  appRepository,
  type IAppRepository,
  type CreateAppDto,
  type UpdateAppDto,
} from '@/repositories';
import { ok, err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';

export type { CreateAppDto, UpdateAppDto };

/**
 * Deterministic weighted scoring algorithm for trending software
 * Weights: library saves (5) > launches (3) > rating score (2) > views (1)
 */
export function calculateTrendingScore(stats?: AppStatistics): number {
  if (!stats) return 0;
  const views = stats.views || 0;
  const launches = stats.launches || 0;
  const libraryAdds = stats.libraryAdds || 0;
  const ratingAvg = stats.ratingAverage || 0;
  const ratingCount = stats.ratingCount || 0;

  return views * 1 + launches * 3 + libraryAdds * 5 + ratingAvg * ratingCount * 2;
}

export interface IAppService {
  getAppById(id: string): Promise<Result<App | null, AppError>>;
  getAppBySlug(slug: string): Promise<Result<App | null, AppError>>;
  createApp(data: CreateAppDto): Promise<Result<App, AppError>>;
  createDraft(data: CreateAppDto): Promise<Result<App, AppError>>;
  updateApp(id: string, data: UpdateAppDto): Promise<Result<App, AppError>>;
  updateDraft(id: string, data: UpdateAppDto): Promise<Result<App, AppError>>;
  validateForPublish(app: App): Result<void, AppError>;
  publishApp(id: string): Promise<Result<App, AppError>>;
  unpublishApp(id: string): Promise<Result<App, AppError>>;
  archiveApp(id: string): Promise<Result<App, AppError>>;
  restoreApp(id: string, targetStatus?: AppStatus): Promise<Result<App, AppError>>;
  listPublishedApps(options?: QueryOptions): Promise<Result<PaginatedResult<App>, AppError>>;
  listFeaturedApps(limit?: number): Promise<Result<PaginatedResult<App>, AppError>>;
  listLatestApps(limit?: number): Promise<Result<PaginatedResult<App>, AppError>>;
  listTrendingApps(limit?: number): Promise<Result<PaginatedResult<App>, AppError>>;
  listAppsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>>;
  listAppsByTag(
    tag: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>>;
  getRelatedApps(
    appId: string,
    category: string,
    tags?: readonly string[],
    limit?: number
  ): Promise<Result<App[], AppError>>;
}

export class AppService implements IAppService {
  constructor(private readonly appRepo: IAppRepository = appRepository) {}

  public async getAppById(id: string): Promise<Result<App | null, AppError>> {
    return this.appRepo.findById(id);
  }

  public async getAppBySlug(slug: string): Promise<Result<App | null, AppError>> {
    return this.appRepo.findBySlug(slug);
  }

  public async createApp(data: CreateAppDto): Promise<Result<App, AppError>> {
    const isUnique = await this.appRepo.checkSlugUnique(data.slug);
    if (!isUnique.success) {
      return err(isUnique.error);
    }

    if (!isUnique.data) {
      return err(
        ErrorFactory.badRequest(
          `An application with the slug "${data.slug}" already exists.`,
          'slug'
        )
      );
    }

    return this.appRepo.create(data);
  }

  public async createDraft(data: CreateAppDto): Promise<Result<App, AppError>> {
    const isUnique = await this.appRepo.checkSlugUnique(data.slug);
    if (!isUnique.success) {
      return err(isUnique.error);
    }

    if (!isUnique.data) {
      return err(
        ErrorFactory.badRequest(
          `An application with the slug "${data.slug}" already exists.`,
          'slug'
        )
      );
    }

    return this.appRepo.createDraft(data);
  }

  public async updateApp(id: string, data: UpdateAppDto): Promise<Result<App, AppError>> {
    if (data.slug) {
      const isUnique = await this.appRepo.checkSlugUnique(data.slug, id);
      if (!isUnique.success) {
        return err(isUnique.error);
      }

      if (!isUnique.data) {
        return err(
          ErrorFactory.badRequest(
            `An application with the slug "${data.slug}" already exists.`,
            'slug'
          )
        );
      }
    }

    return this.appRepo.update(id, data);
  }

  public async updateDraft(id: string, data: UpdateAppDto): Promise<Result<App, AppError>> {
    return this.updateApp(id, data);
  }

  public validateForPublish(app: App): Result<void, AppError> {
    return this.appRepo.validateForPublish(app);
  }

  public async publishApp(id: string): Promise<Result<App, AppError>> {
    return this.appRepo.publish(id);
  }

  public async unpublishApp(id: string): Promise<Result<App, AppError>> {
    return this.appRepo.unpublish(id);
  }

  public async archiveApp(id: string): Promise<Result<App, AppError>> {
    return this.appRepo.archive(id);
  }

  public async restoreApp(id: string, targetStatus?: AppStatus): Promise<Result<App, AppError>> {
    return this.appRepo.restore(id, targetStatus);
  }

  public async listPublishedApps(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>> {
    return this.appRepo.listPublished(options);
  }

  public async listFeaturedApps(limit = 6): Promise<Result<PaginatedResult<App>, AppError>> {
    return this.appRepo.listFeatured(limit);
  }

  public async listLatestApps(limit = 10): Promise<Result<PaginatedResult<App>, AppError>> {
    return this.appRepo.listLatest(limit);
  }

  public async listTrendingApps(limit = 6): Promise<Result<PaginatedResult<App>, AppError>> {
    const result = await this.appRepo.listPublished({ limit: Math.max(limit * 3, 15) });
    if (!result.success) {
      return result;
    }

    const items = [...result.data.items];

    // Rank deterministically by aggregate trending score
    items.sort((a, b) => {
      const scoreA = calculateTrendingScore(a.stats);
      const scoreB = calculateTrendingScore(b.stats);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB - dateA;
    });

    const topItems = items.slice(0, limit);

    return ok({
      items: topItems,
      hasMore: items.length > limit,
      totalCount: result.data.totalCount,
    });
  }

  public async listAppsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>> {
    return this.appRepo.listByCategory(category, options);
  }

  public async listAppsByTag(
    tag: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>> {
    return this.appRepo.listByTag(tag, options);
  }

  public async getRelatedApps(
    appId: string,
    category: string,
    tags?: readonly string[],
    limit = 3
  ): Promise<Result<App[], AppError>> {
    // 1. Query same category published apps
    const catResult = await this.appRepo.listByCategory(category, { limit: limit + 2 });
    if (!catResult.success) {
      return catResult;
    }

    const filtered = catResult.data.items.filter((a) => a.id !== appId && a.status === 'published');

    // 2. If needed, supplement with tag matches
    if (filtered.length < limit && tags && tags.length > 0) {
      for (const tag of tags) {
        if (filtered.length >= limit) break;
        const tagResult = await this.appRepo.listByTag(tag, { limit });
        if (tagResult.success) {
          for (const item of tagResult.data.items) {
            if (
              item.id !== appId &&
              item.status === 'published' &&
              !filtered.some((existing) => existing.id === item.id)
            ) {
              filtered.push(item);
              if (filtered.length >= limit) break;
            }
          }
        }
      }
    }

    return ok(filtered.slice(0, limit));
  }
}

export const appService = new AppService();
