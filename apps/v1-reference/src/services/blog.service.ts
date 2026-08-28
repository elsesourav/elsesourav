import type { BlogPost, BlogPostStatus, BlogCategory, BlogTag } from '@/types/blog.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  blogRepository,
  blogCategoryRepository,
  blogTagRepository,
  type IBlogRepository,
  type IBlogCategoryRepository,
  type IBlogTagRepository,
  type CreateBlogPostDto,
  type UpdateBlogPostDto,
  type CreateBlogCategoryDto,
  type UpdateBlogCategoryDto,
  type CreateBlogTagDto,
  type UpdateBlogTagDto,
} from '@/repositories';
import { ok, err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  publishBlogPostSchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
  createBlogTagSchema,
  updateBlogTagSchema,
} from '@/schemas/blog.schema';

export type {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateBlogTagDto,
  UpdateBlogTagDto,
};

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
  // Post Operations
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
  listFeaturedPosts(limit?: number): Promise<Result<PaginatedResult<BlogPost>, AppError>>;
  listPostsByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>>;
  listPostsByTag(
    tag: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogPost>, AppError>>;

  // Category Operations
  createCategory(data: CreateBlogCategoryDto): Promise<Result<BlogCategory, AppError>>;
  updateCategory(id: string, data: UpdateBlogCategoryDto): Promise<Result<BlogCategory, AppError>>;
  deactivateCategory(id: string): Promise<Result<BlogCategory, AppError>>;
  listActiveCategories(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogCategory>, AppError>>;
  getCategoryBySlug(slug: string): Promise<Result<BlogCategory | null, AppError>>;

  // Tag Operations
  createTag(data: CreateBlogTagDto): Promise<Result<BlogTag, AppError>>;
  updateTag(id: string, data: UpdateBlogTagDto): Promise<Result<BlogTag, AppError>>;
  deactivateTag(id: string): Promise<Result<BlogTag, AppError>>;
  listActiveTags(options?: QueryOptions): Promise<Result<PaginatedResult<BlogTag>, AppError>>;
  getTagBySlug(slug: string): Promise<Result<BlogTag | null, AppError>>;
}

export class BlogService implements IBlogService {
  constructor(
    private readonly blogRepo: IBlogRepository = blogRepository,
    private readonly blogCategoryRepo: IBlogCategoryRepository = blogCategoryRepository,
    private readonly blogTagRepo: IBlogTagRepository = blogTagRepository
  ) {}

  // ===========================================================================
  // BLOG POST OPERATIONS
  // ===========================================================================

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

  public async listFeaturedPosts(limit = 6): Promise<Result<PaginatedResult<BlogPost>, AppError>> {
    return this.blogRepo.listFeatured(limit);
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

  // ===========================================================================
  // BLOG CATEGORY OPERATIONS
  // ===========================================================================

  public async createCategory(
    data: CreateBlogCategoryDto
  ): Promise<Result<BlogCategory, AppError>> {
    const parseResult = createBlogCategorySchema.safeParse(data);
    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Invalid blog category data', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    const isUnique = await this.blogCategoryRepo.checkSlugUnique(data.slug);
    if (!isUnique.success) {
      return isUnique;
    }
    if (!isUnique.data) {
      return err(
        ErrorFactory.conflict(`Blog category with slug '${data.slug}' already exists`, 'SLUG_TAKEN')
      );
    }

    return this.blogCategoryRepo.create(data);
  }

  public async updateCategory(
    id: string,
    data: UpdateBlogCategoryDto
  ): Promise<Result<BlogCategory, AppError>> {
    const parseResult = updateBlogCategorySchema.safeParse(data);
    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Invalid blog category update data', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    if (data.slug) {
      const isUnique = await this.blogCategoryRepo.checkSlugUnique(data.slug, id);
      if (!isUnique.success) {
        return isUnique;
      }
      if (!isUnique.data) {
        return err(
          ErrorFactory.conflict(
            `Blog category with slug '${data.slug}' already exists`,
            'SLUG_TAKEN'
          )
        );
      }
    }

    return this.blogCategoryRepo.update(id, data);
  }

  public async deactivateCategory(id: string): Promise<Result<BlogCategory, AppError>> {
    return this.blogCategoryRepo.deactivate(id);
  }

  public async listActiveCategories(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogCategory>, AppError>> {
    return this.blogCategoryRepo.findActive(options);
  }

  public async getCategoryBySlug(slug: string): Promise<Result<BlogCategory | null, AppError>> {
    return this.blogCategoryRepo.findBySlug(slug);
  }

  // ===========================================================================
  // BLOG TAG OPERATIONS
  // ===========================================================================

  public async createTag(data: CreateBlogTagDto): Promise<Result<BlogTag, AppError>> {
    const parseResult = createBlogTagSchema.safeParse(data);
    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Invalid blog tag data', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    const isUnique = await this.blogTagRepo.checkSlugUnique(data.slug);
    if (!isUnique.success) {
      return isUnique;
    }
    if (!isUnique.data) {
      return err(
        ErrorFactory.conflict(`Blog tag with slug '${data.slug}' already exists`, 'SLUG_TAKEN')
      );
    }

    return this.blogTagRepo.create(data);
  }

  public async updateTag(id: string, data: UpdateBlogTagDto): Promise<Result<BlogTag, AppError>> {
    const parseResult = updateBlogTagSchema.safeParse(data);
    if (!parseResult.success) {
      return err(
        ErrorFactory.validation('Invalid blog tag update data', undefined, {
          issues: parseResult.error.issues,
        })
      );
    }

    if (data.slug) {
      const isUnique = await this.blogTagRepo.checkSlugUnique(data.slug, id);
      if (!isUnique.success) {
        return isUnique;
      }
      if (!isUnique.data) {
        return err(
          ErrorFactory.conflict(`Blog tag with slug '${data.slug}' already exists`, 'SLUG_TAKEN')
        );
      }
    }

    return this.blogTagRepo.update(id, data);
  }

  public async deactivateTag(id: string): Promise<Result<BlogTag, AppError>> {
    return this.blogTagRepo.deactivate(id);
  }

  public async listActiveTags(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<BlogTag>, AppError>> {
    return this.blogTagRepo.findActive(options);
  }

  public async getTagBySlug(slug: string): Promise<Result<BlogTag | null, AppError>> {
    return this.blogTagRepo.findBySlug(slug);
  }
}

export const blogService = new BlogService();
