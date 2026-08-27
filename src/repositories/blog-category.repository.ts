import { FirestoreRepository } from './firestore.repository';
import type {
  IBlogCategoryRepository,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from './interfaces';
import type { BlogCategory } from '@/types/blog.types';
import type {
  RepositoryResult,
  PaginatedRepositoryResult,
  QueryOptions,
  QueryFilter,
} from './types';
import { createBlogCategorySchema, updateBlogCategorySchema } from '@/schemas/blog.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { Firestore } from 'firebase/firestore';

export class BlogCategoryRepository
  extends FirestoreRepository<BlogCategory, CreateBlogCategoryDto, UpdateBlogCategoryDto>
  implements IBlogCategoryRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('blogCategories', {
      createSchema: createBlogCategorySchema,
      updateSchema: updateBlogCategorySchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<BlogCategory | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for blog category lookup', 'slug'));
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

  public async findActive(options?: QueryOptions): PaginatedRepositoryResult<BlogCategory> {
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

  public async deactivate(id: string): RepositoryResult<BlogCategory> {
    return this.update(id, { isActive: false });
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

export const blogCategoryRepository = new BlogCategoryRepository();
