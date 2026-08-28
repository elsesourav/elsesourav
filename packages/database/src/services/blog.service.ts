import { BlogRepository } from '../repositories/blog.repository';
import { AppError } from '@elsesourav/types';
import {
  CreateBlogPostSchema,
  UpdateBlogPostSchema,
  BlogQuerySchema,
  generateBlogSlug,
} from '@elsesourav/validation';
import type {
  BlogPost as DomainBlogPost,
  BlogPostListItem,
  PublicBlogPost,
  BlogCategory as DomainBlogCategory,
  BlogTag as DomainBlogTag,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogQueryInput,
  BlogQueryResult,
  UserRole,
} from '@elsesourav/types';

export class BlogService {
  constructor(private readonly blogRepo: BlogRepository) {}

  private verifyAdmin(callerRole?: UserRole): void {
    if (callerRole !== 'ADMIN') {
      throw AppError.forbidden('Administrative privileges are required to perform this action');
    }
  }

  async getPublicPostBySlug(slug: string): Promise<PublicBlogPost> {
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      throw AppError.validation('A valid blog slug is required');
    }

    const post = await this.blogRepo.findBySlug(slug.trim().toLowerCase());
    if (!post) {
      throw AppError.notFound(`Blog article '${slug}'`);
    }

    // Non-blocking telemetry view counter increment
    void this.blogRepo.incrementViews(post.id);

    return post;
  }

  async listPublicPosts(options: BlogQueryInput = {}): Promise<BlogQueryResult> {
    const validated = BlogQuerySchema.safeParse(options);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid blog query parameters');
    }

    return this.blogRepo.findPublicPosts(validated.data);
  }

  async getRelatedPosts(postId: string, categoryId?: string, limit: number = 3): Promise<BlogPostListItem[]> {
    if (!postId) return [];
    return this.blogRepo.findRelatedPosts(postId, categoryId, limit);
  }

  async listCategories(): Promise<DomainBlogCategory[]> {
    return this.blogRepo.listCategories();
  }

  async listTags(): Promise<DomainBlogTag[]> {
    return this.blogRepo.listTags();
  }

  async createBlogPost(
    callerUserId: string | undefined,
    callerRole: UserRole | undefined,
    input: CreateBlogPostInput
  ): Promise<DomainBlogPost> {
    this.verifyAdmin(callerRole);

    if (!callerUserId) {
      throw AppError.unauthorized('Authenticated author required');
    }

    const validated = CreateBlogPostSchema.safeParse(input);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid blog post payload');
    }

    const slug = validated.data.slug || generateBlogSlug(validated.data.title);
    return this.blogRepo.createPost(validated.data, callerUserId, slug);
  }

  async updateBlogPost(
    callerRole: UserRole | undefined,
    id: string,
    input: UpdateBlogPostInput
  ): Promise<DomainBlogPost> {
    this.verifyAdmin(callerRole);

    if (!id || typeof id !== 'string') {
      throw AppError.validation('Valid post ID is required');
    }

    const validated = UpdateBlogPostSchema.safeParse(input);
    if (!validated.success) {
      throw AppError.validation(validated.error.issues[0]?.message || 'Invalid update payload');
    }

    return this.blogRepo.updatePost(id, validated.data);
  }

  async publishBlogPost(
    callerRole: UserRole | undefined,
    id: string
  ): Promise<DomainBlogPost> {
    this.verifyAdmin(callerRole);

    if (!id || typeof id !== 'string') {
      throw AppError.validation('Valid post ID is required');
    }

    return this.blogRepo.publishPost(id);
  }

  async archiveBlogPost(
    callerRole: UserRole | undefined,
    id: string
  ): Promise<DomainBlogPost> {
    this.verifyAdmin(callerRole);

    if (!id || typeof id !== 'string') {
      throw AppError.validation('Valid post ID is required');
    }

    return this.blogRepo.archivePost(id);
  }
}
