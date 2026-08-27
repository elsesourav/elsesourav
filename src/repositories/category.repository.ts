import { FirestoreRepository } from './firestore.repository';
import { createCategorySchema, updateCategorySchema } from '@/schemas/category.schema';
import { isErr, ok } from '@/lib/result';
import type { BaseEntity, RepositoryResult, PaginatedRepositoryResult } from './types';
import type { ID, Timestamp } from '@/types/common.types';
import type { z } from 'zod';

export interface CategoryEntity extends BaseEntity {
  readonly id: ID;
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export interface ICategoryRepository {
  findById(id: string): RepositoryResult<CategoryEntity | null>;
  findBySlug(slug: string): RepositoryResult<CategoryEntity | null>;
  findActive(): PaginatedRepositoryResult<CategoryEntity>;
  create(data: CreateCategoryDto, customId?: string): RepositoryResult<CategoryEntity>;
  update(id: string, data: UpdateCategoryDto): RepositoryResult<CategoryEntity>;
  delete(id: string): RepositoryResult<void>;
}

export class CategoryRepository
  extends FirestoreRepository<CategoryEntity, CreateCategoryDto, UpdateCategoryDto>
  implements ICategoryRepository
{
  constructor() {
    super('categories', {
      createSchema: createCategorySchema,
      updateSchema: updateCategorySchema,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<CategoryEntity | null> {
    const result = await this.findMany({
      filters: [{ field: 'slug', operator: '==', value: slug }],
      limit: 1,
    });

    if (isErr(result)) {
      return result;
    }

    return ok(result.data.items[0] || null);
  }

  public async findActive(): PaginatedRepositoryResult<CategoryEntity> {
    return this.findMany({
      filters: [{ field: 'isActive', operator: '==', value: true }],
      orderBy: 'displayOrder',
      orderDirection: 'asc',
    });
  }
}

export const categoryRepository = new CategoryRepository();
