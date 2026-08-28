import type { AppMedia, AppMediaType } from '@/types/media.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  appMediaRepository,
  type IAppMediaRepository,
  type CreateAppMediaDto,
  type UpdateAppMediaDto,
} from '@/repositories';
import { isErr, ok } from '@/lib/result';

export type { CreateAppMediaDto, UpdateAppMediaDto };

export interface IAppMediaService {
  getMedia(appId: string, mediaId: string): Promise<Result<AppMedia | null, AppError>>;
  listMedia(
    appId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppMedia>, AppError>>;
  listMediaByType(
    appId: string,
    type: AppMediaType,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppMedia>, AppError>>;
  listScreenshots(appId: string): Promise<Result<PaginatedResult<AppMedia>, AppError>>;
  getAppIcon(appId: string): Promise<Result<AppMedia | null, AppError>>;
  getHeroImage(appId: string): Promise<Result<AppMedia | null, AppError>>;
  getSocialImage(appId: string): Promise<Result<AppMedia | null, AppError>>;
  createMedia(appId: string, data: CreateAppMediaDto): Promise<Result<AppMedia, AppError>>;
  updateMedia(
    appId: string,
    mediaId: string,
    data: UpdateAppMediaDto
  ): Promise<Result<AppMedia, AppError>>;
  deleteMedia(appId: string, mediaId: string): Promise<Result<void, AppError>>;
  reorderMedia(appId: string, orderedMediaIds: string[]): Promise<Result<void, AppError>>;
}

export class AppMediaService implements IAppMediaService {
  constructor(private readonly mediaRepo: IAppMediaRepository = appMediaRepository) {}

  public async getMedia(
    appId: string,
    mediaId: string
  ): Promise<Result<AppMedia | null, AppError>> {
    return this.mediaRepo.findById(appId, mediaId);
  }

  public async listMedia(
    appId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppMedia>, AppError>> {
    return this.mediaRepo.listByApp(appId, options);
  }

  public async listMediaByType(
    appId: string,
    type: AppMediaType,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppMedia>, AppError>> {
    return this.mediaRepo.listByType(appId, type, options);
  }

  public async listScreenshots(
    appId: string
  ): Promise<Result<PaginatedResult<AppMedia>, AppError>> {
    return this.mediaRepo.listByType(appId, 'screenshot');
  }

  public async getAppIcon(appId: string): Promise<Result<AppMedia | null, AppError>> {
    const result = await this.mediaRepo.listByType(appId, 'icon', { limit: 1 });
    if (isErr(result)) return result;
    return ok(result.data.items[0] || null);
  }

  public async getHeroImage(appId: string): Promise<Result<AppMedia | null, AppError>> {
    const result = await this.mediaRepo.listByType(appId, 'hero', { limit: 1 });
    if (isErr(result)) return result;
    return ok(result.data.items[0] || null);
  }

  public async getSocialImage(appId: string): Promise<Result<AppMedia | null, AppError>> {
    const result = await this.mediaRepo.listByType(appId, 'social', { limit: 1 });
    if (isErr(result)) return result;
    return ok(result.data.items[0] || null);
  }

  public async createMedia(
    appId: string,
    data: CreateAppMediaDto
  ): Promise<Result<AppMedia, AppError>> {
    return this.mediaRepo.create(appId, data);
  }

  public async updateMedia(
    appId: string,
    mediaId: string,
    data: UpdateAppMediaDto
  ): Promise<Result<AppMedia, AppError>> {
    return this.mediaRepo.update(appId, mediaId, data);
  }

  public async deleteMedia(appId: string, mediaId: string): Promise<Result<void, AppError>> {
    return this.mediaRepo.delete(appId, mediaId);
  }

  public async reorderMedia(
    appId: string,
    orderedMediaIds: string[]
  ): Promise<Result<void, AppError>> {
    return this.mediaRepo.reorder(appId, orderedMediaIds);
  }
}

export const appMediaService = new AppMediaService();
