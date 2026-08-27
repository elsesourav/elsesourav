import type { BlogPost, BlogPostStatus } from '@/types/blog.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  blogRepository,
  type IBlogRepository,
  type CreateBlogPostDto,
  type UpdateBlogPostDto,
} from '@/repositories';
import { ok, err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  publishBlogPostSchema,
} from '@/schemas/blog.schema';

export type { CreateBlogPostDto, UpdateBlogPostDto };

/**
 * Calculates estimated reading time in minutes (standard ~200 words per minute)
 */
export function calculateReadingTime(content: string): number {
  if (!content || !content.trim()) {
    return 1;
  }
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export interface IBlogService {
  getPostById(id: string): Promise<Result<BlogPost | null, AppError>>;
  getPostBySlug(slug: string): Promise<Result<BlogPost | null, AppError>>;
  createDraft(data: CreateBlogPostDto): Promise<Result<BlogPost, AppError>>;
  updatePost(id: string, data: UpdateBlogPostDto): Promise<Result<BlogPost, AppError>>;
  validateForPublish(post: BlogPost): Result<void, AppError>;
  publishPost(id: string): Promise<Result<BlogPost, AppError>>;
  unpublishPost(id: string): Promise<Result<BlogPost, AppError>>;
  archivePost(id: string): Promise<Result<BlogPost, AppError>>;
  restorePost(id: string, targetStatus?: BlogPostStatus): Promise<Result<BlogPost, AppError>>;
  listPublishedPosts(options?: QueryOptions): Promise<Result<PaginatedResult<BlogPost>, AppError>>;
  listLatestPosts(limit?: number): Promise<Result<PaginatedResult<BlogPost>, AppError>>;
  listPostsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>>;
  listPostsByTag(
    tag: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>>;
}

export class BlogService implements IBlogService {
  constructor(private readonly blogRepo: IBlogRepository = blogRepository) {}

  public async getPostById(id: string): Promise<Result<BlogPost | null, AppError>> {
    return this.blogRepo.findById(id);
  }

  public async getPostBySlug(slug: string): Promise<Result<BlogPost | null, AppError>> {
    return this.blogRepo.findBySlug(slug);
  }

  public async createDraft(data: CreateBlogPostDto): Promise<Result<BlogPost, AppError>> {
    const parseResult = createBlogPostSchema.safeParse(data);
    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Invalid blog post data', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    const isUnique = await this.blogRepo.checkSlugUnique(data.slug);
    if (!isUnique.success) {
      return isUnique;
    }
    if (!isUnique.data) {
      return err(
        ErrorFactory.conflict(`Blog post with slug '${data.slug}' already exists`, 'SLUG_TAKEN')
      );
    }

    const readingTime = data.readingTime || calculateReadingTime(data.content);

    return this.blogRepo.createDraft({
      ...data,
      readingTime,
      readingTimeMinutes: readingTime,
    });
  }

  public async updatePost(
    id: string,
    data: UpdateBlogPostDto
  ): Promise<Result<BlogPost, AppError>> {
    const parseResult = updateBlogPostSchema.safeParse(data);
    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Invalid blog post update data', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    if (data.slug) {
      const isUnique = await this.blogRepo.checkSlugUnique(data.slug, id);
      if (!isUnique.success) {
        return isUnique;
      }
      if (!isUnique.data) {
        return err(
          ErrorFactory.conflict(`Blog post with slug '${data.slug}' already exists`, 'SLUG_TAKEN')
        );
      }
    }

    let payload = { ...data };
    if (data.content) {
      const readingTime = calculateReadingTime(data.content);
      payload = {
        ...payload,
        readingTime,
        readingTimeMinutes: readingTime,
      };
    }

    return this.blogRepo.update(id, payload);
  }

  public validateForPublish(post: BlogPost): Result<void, AppError> {
    const parseResult = publishBlogPostSchema.safeParse({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
    });

    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Cannot publish incomplete blog post', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    return ok(undefined);
  }

  public async publishPost(id: string): Promise<Result<BlogPost, AppError>> {
    const existing = await this.blogRepo.findById(id);
    if (!existing.success) {
      return existing;
    }
    if (!existing.data) {
      return err(ErrorFactory.notFound('Blog post not found'));
    }

    const validation = this.validateForPublish(existing.data);
    if (!validation.success) {
      return validation;
    }

    return this.blogRepo.publish(id);
  }

  public async unpublishPost(id: string): Promise<Result<BlogPost, AppError>> {
    return this.blogRepo.unpublish(id);
  }

  public async archivePost(id: string): Promise<Result<BlogPost, AppError>> {
    return this.blogRepo.archive(id);
  }

  public async restorePost(
    id: string,
    targetStatus?: BlogPostStatus
  ): Promise<Result<BlogPost, AppError>> {
    return this.blogRepo.restore(id, targetStatus);
  }

  public async listPublishedPosts(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>> {
    return this.blogRepo.listPublished(options);
  }

  public async listLatestPosts(limit = 10): Promise<Result<PaginatedResult<BlogPost>, AppError>> {
    return this.blogRepo.listLatest(limit);
  }

  public async listPostsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>> {
    return this.blogRepo.listByCategory(category, options);
  }

  public async listPostsByTag(
    tag: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>> {
    return this.blogRepo.listByTag(tag, options);
  }
}

export const blogService = new BlogService();
