import type { App, AppStatus } from '@/types/app.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  appRepository,
  type IAppRepository,
  type CreateAppDto,
  type UpdateAppDto,
} from '@/repositories';
import { err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';

export type { CreateAppDto, UpdateAppDto };

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
  listAppsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>>;
  listAppsByTag(
    tag: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<App>, AppError>>;
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
}

export const appService = new AppService();
