import { FirestoreRepository } from './firestore.repository';
import { createAppSchema, updateAppSchema } from '@/schemas/app.schema';
import { isErr, ok } from '@/lib/result';
import type { IAppRepository } from './interfaces';
import type { App, AppCategory, AppPlatform } from '@/types/app.types';
import type {
  QueryOptions,
  QueryFilter,
  RepositoryResult,
  PaginatedRepositoryResult,
} from './types';
import type { z } from 'zod';

export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDto = z.infer<typeof updateAppSchema>;

export class FirestoreAppRepository
  extends FirestoreRepository<App, CreateAppDto, UpdateAppDto>
  implements IAppRepository
{
  constructor() {
    super('apps', {
      createSchema: createAppSchema,
      updateSchema: updateAppSchema,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<App | null> {
    const result = await this.findMany({
      filters: [{ field: 'slug', operator: '==', value: slug }],
      limit: 1,
    });

    if (isErr(result)) {
      return result;
    }

    return ok(result.data.items[0] || null);
  }

  public async findFeatured(limit = 6): PaginatedRepositoryResult<App> {
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

  public async findByCategory(category: AppCategory, limit = 20): PaginatedRepositoryResult<App> {
    return this.findMany({
      filters: [
        { field: 'status', operator: '==', value: 'published' },
        { field: 'category', operator: '==', value: category },
      ],
      orderBy: 'sortOrder',
      orderDirection: 'asc',
      limit,
    });
  }

  public async findByPlatform(platform: AppPlatform, limit = 20): PaginatedRepositoryResult<App> {
    return this.findMany({
      filters: [
        { field: 'status', operator: '==', value: 'published' },
        { field: 'platforms', operator: 'array-contains', value: platform },
      ],
      orderBy: 'sortOrder',
      orderDirection: 'asc',
      limit,
    });
  }

  public async findByTag(tag: string, limit = 20): PaginatedRepositoryResult<App> {
    return this.findMany({
      filters: [
        { field: 'status', operator: '==', value: 'published' },
        { field: 'tags', operator: 'array-contains', value: tag },
      ],
      orderBy: 'sortOrder',
      orderDirection: 'asc',
      limit,
    });
  }

  public async findPublished(options?: QueryOptions): PaginatedRepositoryResult<App> {
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
}

export const appRepository = new FirestoreAppRepository();
