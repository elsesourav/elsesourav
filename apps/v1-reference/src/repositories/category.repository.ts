import { FirestoreRepository } from './firestore.repository';
import { createCategorySchema, updateCategorySchema } from '@/schemas/classification.schema';
import { isErr, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { ICategoryRepository } from './interfaces';
import type { Category } from '@/types/category.types';
import type { RepositoryResult, PaginatedRepositoryResult } from './types';
import type { Result } from '@/types/result.types';
import type { z } from 'zod';
import type { Firestore } from 'firebase/firestore';

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type CategoryEntity = Category;

export class CategoryRepository
  extends FirestoreRepository<Category, CreateCategoryDto, UpdateCategoryDto>
  implements ICategoryRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('categories', {
      createSchema: createCategorySchema,
      updateSchema: updateCategorySchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<Category | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for category lookup', 'slug'));
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

    if (excludeId && existingResult.data.id === excludeId) {
      return ok(true);
    }

    return ok(false);
  }

  public async findActive(): PaginatedRepositoryResult<Category> {
    return this.findMany({
      filters: [{ field: 'isActive', operator: '==', value: true }],
      orderBy: 'orderIndex',
      orderDirection: 'asc',
    });
  }

  public async deactivate(id: string): RepositoryResult<Category> {
    if (!id) {
      return err(AppError.badRequest('Category ID is required for deactivation', 'id'));
    }

    return this.update(id, {
      isActive: false,
    });
  }
}

export const categoryRepository = new CategoryRepository();
