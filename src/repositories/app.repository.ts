import { FirestoreRepository } from './firestore.repository';
import { createAppSchema, updateAppSchema } from '@/schemas/app.schema';
import { isErr, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { IAppRepository } from './interfaces';
import type { App } from '@/types/app.types';
import type {
  QueryOptions,
  QueryFilter,
  RepositoryResult,
  PaginatedRepositoryResult,
} from './types';
import type { Result } from '@/types/result.types';
import type { z } from 'zod';
import type { Firestore } from 'firebase/firestore';

export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDto = z.infer<typeof updateAppSchema>;

export class FirestoreAppRepository
  extends FirestoreRepository<App, CreateAppDto, UpdateAppDto>
  implements IAppRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('apps', {
      createSchema: createAppSchema,
      updateSchema: updateAppSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<App | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for app lookup', 'slug'));
    }

    const result = await this.findMany({
      filters: [{ field: 'slug', operator: '==', value: slug.toLowerCase() }],
      limit: 1,
    });

    if (isErr(result)) {
      return result;
    }

    return ok(result.data.items[0] || null);
  }

  public async checkSlugUnique(
    slug: string,
    excludeId?: string
  ): Promise<Result<boolean, AppError>> {
    if (!slug) {
      return ok(false);
    }

    const existingResult = await this.findBySlug(slug);
    if (!existingResult.success) {
      return err(existingResult.error);
    }

    if (!existingResult.data) {
      return ok(true);
    }

    // If existing app is the one being updated, it's unique to itself
    if (excludeId && existingResult.data.id === excludeId) {
      return ok(true);
    }

    return ok(false);
  }

  public async publish(id: string): RepositoryResult<App> {
    if (!id) {
      return err(AppError.badRequest('App ID is required to publish', 'id'));
    }

    const now = Date.now();
    return this.update(id, {
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    } as unknown as UpdateAppDto);
  }

  public async unpublish(id: string): RepositoryResult<App> {
    if (!id) {
      return err(AppError.badRequest('App ID is required to unpublish', 'id'));
    }

    const now = Date.now();
    return this.update(id, {
      status: 'draft',
      updatedAt: now,
    } as unknown as UpdateAppDto);
  }

  public async archive(id: string): RepositoryResult<App> {
    if (!id) {
      return err(AppError.badRequest('App ID is required to archive', 'id'));
    }

    const now = Date.now();
    return this.update(id, {
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    } as unknown as UpdateAppDto);
  }

  public async listPublished(options?: QueryOptions): PaginatedRepositoryResult<App> {
    const filters: QueryFilter[] = [{ field: 'status', operator: '==', value: 'published' }];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'sortOrder',
      orderDirection: options?.orderDirection || 'asc',
    });
  }

  public async listFeatured(limit = 6): PaginatedRepositoryResult<App> {
    return this.findMany({
      filters: [
        { field: 'status', operator: '==', value: 'published' },
        { field: 'isFeatured', operator: '==', value: true },
      ],
      orderBy: 'sortOrder',
      orderDirection: 'asc',
      limit,
    });
  }

  public async listLatest(limit = 10): PaginatedRepositoryResult<App> {
    return this.findMany({
      filters: [{ field: 'status', operator: '==', value: 'published' }],
      orderBy: 'publishedAt',
      orderDirection: 'desc',
      limit,
    });
  }

  public async listByCategory(
    category: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<App> {
    const filters: QueryFilter[] = [
      { field: 'status', operator: '==', value: 'published' },
      { field: 'primaryCategory', operator: '==', value: category },
    ];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'sortOrder',
      orderDirection: options?.orderDirection || 'asc',
    });
  }

  public async listByTag(tag: string, options?: QueryOptions): PaginatedRepositoryResult<App> {
    const filters: QueryFilter[] = [
      { field: 'status', operator: '==', value: 'published' },
      { field: 'tags', operator: 'array-contains', value: tag },
    ];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'sortOrder',
      orderDirection: options?.orderDirection || 'asc',
    });
  }
}

export const appRepository = new FirestoreAppRepository();
