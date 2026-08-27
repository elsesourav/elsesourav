import { FirestoreRepository } from './firestore.repository';
import type { IBlogRepository, CreateBlogPostDto, UpdateBlogPostDto } from './interfaces';
import type { BlogPost, BlogPostStatus } from '@/types/blog.types';
import type {
  RepositoryResult,
  PaginatedRepositoryResult,
  QueryOptions,
  QueryFilter,
} from './types';
import { createBlogPostSchema, updateBlogPostSchema } from '@/schemas/blog.schema';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { Firestore } from 'firebase/firestore';

export type { CreateBlogPostDto, UpdateBlogPostDto };

export class BlogRepository
  extends FirestoreRepository<BlogPost, CreateBlogPostDto, UpdateBlogPostDto>
  implements IBlogRepository
{
  constructor(getFirestoreInstance?: () => Firestore) {
    super('blogPosts', {
      createSchema: createBlogPostSchema,
      updateSchema: updateBlogPostSchema,
      getFirestore: getFirestoreInstance,
    });
  }

  public async findBySlug(slug: string): RepositoryResult<BlogPost | null> {
    if (!slug || typeof slug !== 'string') {
      return err(AppError.badRequest('Invalid slug provided for blog lookup', 'slug'));
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

  public async createDraft(data: CreateBlogPostDto): RepositoryResult<BlogPost> {
    const now = Date.now();
    const payload = {
      ...data,
      slug: data.slug.toLowerCase(),
      authorId: data.authorId || 'admin',
      tags: data.tags || [],
      status: 'draft' as const,
      viewsCount: 0,
      readingTime: data.readingTime || data.readingTimeMinutes || 1,
      createdAt: now,
      updatedAt: now,
    };

    return this.create(payload as unknown as CreateBlogPostDto);
  }

  public async publish(id: string): RepositoryResult<BlogPost> {
    const now = Date.now();
    return this.update(id, {
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    });
  }

  public async unpublish(id: string): RepositoryResult<BlogPost> {
    return this.update(id, {
      status: 'draft',
      updatedAt: Date.now(),
    });
  }

  public async archive(id: string): RepositoryResult<BlogPost> {
    const now = Date.now();
    return this.update(id, {
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    });
  }

  public async restore(
    id: string,
    targetStatus: BlogPostStatus = 'draft'
  ): RepositoryResult<BlogPost> {
    return this.update(id, {
      status: targetStatus,
      archivedAt: undefined,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  }

  public async listPublished(options?: QueryOptions): PaginatedRepositoryResult<BlogPost> {
    const filters: QueryFilter[] = [{ field: 'status', operator: '==', value: 'published' }];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'publishedAt',
      orderDirection: options?.orderDirection || 'desc',
    });
  }

  public async listLatest(limit = 10): PaginatedRepositoryResult<BlogPost> {
    return this.listPublished({
      limit,
      orderBy: 'publishedAt',
      orderDirection: 'desc',
    });
  }

  public async listByCategory(
    category: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<BlogPost> {
    const filters: QueryFilter[] = [
      { field: 'status', operator: '==', value: 'published' },
      { field: 'category', operator: '==', value: category },
    ];
    if (options?.filters) {
      filters.push(...options.filters);
    }

    return this.findMany({
      ...options,
      filters,
      orderBy: options?.orderBy || 'publishedAt',
      orderDirection: options?.orderDirection || 'desc',
    });
  }

  public async listByTag(tag: string, options?: QueryOptions): PaginatedRepositoryResult<BlogPost> {
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
      orderBy: options?.orderBy || 'publishedAt',
      orderDirection: options?.orderDirection || 'desc',
    });
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

export const blogRepository = new BlogRepository();
