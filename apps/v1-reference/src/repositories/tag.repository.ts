import { FirestoreRepository } from './firestore.repository';
import { createTagSchema, updateTagSchema } from '@/schemas/classification.schema';
import { isErr, ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { ITagRepository } from './interfaces';
import type { Tag } from '@/types/tag.types';
import type { RepositoryResult, PaginatedRepositoryResult } from './types';
import type { Result } from '@/types/result.types';
import type { z } from 'zod';
import type { Firestore } from 'firebase/firestore';

export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;

export class TagRepository
  extends FirestoreRepository<Tag, CreateTagDto, UpdateTagDto>
  implements ITagRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('tags', {
      createSchema: createTagSchema,
      updateSchema: updateTagSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<Tag | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for tag lookup', 'slug'));
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

  public async findActive(): PaginatedRepositoryResult<Tag> {
    return this.findMany({
      filters: [{ field: 'isActive', operator: '==', value: true }],
      orderBy: 'name',
      orderDirection: 'asc',
    });
  }

  public async deactivate(id: string): RepositoryResult<Tag> {
    if (!id) {
      return err(AppError.badRequest('Tag ID is required for deactivation', 'id'));
    }

    return this.update(id, {
      isActive: false,
    });
  }
}

export const tagRepository = new TagRepository();
