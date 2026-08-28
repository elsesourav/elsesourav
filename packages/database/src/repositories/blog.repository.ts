import { PrismaClient, Prisma, PublishStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import {
  mapPrismaBlogPostToDomain,
  mapPrismaBlogPostToListItem,
  mapPrismaBlogPostToPublic,
  mapPrismaBlogCategoryToDomain,
  mapPrismaBlogTagToDomain,
  PrismaBlogWithRelations,
} from '../mappers/blog.mapper';
import { AppError } from '@elsesourav/types';
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
} from '@elsesourav/types';

export class BlogRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private readonly postInclude = {
    author: true,
    category: true,
    tags: {
      include: {
        tag: true,
      },
    },
  };

  async findBySlug(slug: string): Promise<PublicBlogPost | null> {
    try {
      const record = await this.prisma.blogPost.findUnique({
        where: { slug },
        include: this.postInclude,
      });

      if (!record || record.deletedAt || record.status !== PublishStatus.PUBLISHED) {
        return null;
      }

      return mapPrismaBlogPostToPublic(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to find blog post by slug: ${slug}`, error);
    }
  }

  async findPublicPosts(options: BlogQueryInput = {}): Promise<BlogQueryResult> {
    try {
      const page = Math.max(options.page ?? 1, 1);
      const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
      const skip = (page - 1) * limit;

      const where: Prisma.BlogPostWhereInput = {
        status: PublishStatus.PUBLISHED,
        deletedAt: null,
      };

      if (options.categorySlug) {
        where.category = { slug: options.categorySlug };
      }

      if (options.tagSlug) {
        where.tags = {
          some: {
            tag: { slug: options.tagSlug },
          },
        };
      }

      if (options.query && options.query.trim().length > 0) {
        const term = options.query.trim();
        where.OR = [
          { title: { contains: term, mode: 'insensitive' } },
          { excerpt: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
        ];
      }

      const [totalCount, records] = await Promise.all([
        this.prisma.blogPost.count({ where }),
        this.prisma.blogPost.findMany({
          where,
          take: limit,
          skip,
          orderBy: { publishedAt: 'desc' },
          include: this.postInclude,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const items = records.map((r) => mapPrismaBlogPostToListItem(r as unknown as PrismaBlogWithRelations));

      return {
        items,
        totalCount,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      throw AppError.database('Failed to query public blog posts', error);
    }
  }

  async findRelatedPosts(postId: string, categoryId?: string, limit: number = 3): Promise<BlogPostListItem[]> {
    try {
      const records = await this.prisma.blogPost.findMany({
        where: {
          id: { not: postId },
          categoryId: categoryId || undefined,
          status: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: this.postInclude,
      });

      return records.map((r) => mapPrismaBlogPostToListItem(r as unknown as PrismaBlogWithRelations));
    } catch (error) {
      throw AppError.database('Failed to fetch related blog posts', error);
    }
  }

  async createPost(data: CreateBlogPostInput, authorId: string, slug: string): Promise<DomainBlogPost> {
    try {
      const record = await this.prisma.blogPost.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImageUrl || null,
          authorId,
          categoryId: data.categoryId || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          readingTime: data.readingTime || Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200)),
          status: PublishStatus.DRAFT,
          tags: data.tagIds && data.tagIds.length > 0
            ? {
                create: data.tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
        },
        include: this.postInclude,
      });

      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      throw AppError.database('Failed to create blog post', error);
    }
  }

  async updatePost(id: string, data: UpdateBlogPostInput): Promise<DomainBlogPost> {
    try {
      const record = await this.prisma.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImageUrl,
          categoryId: data.categoryId,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          readingTime: data.readingTime,
          status: data.status ? (data.status.toUpperCase() as PublishStatus) : undefined,
        },
        include: this.postInclude,
      });

      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to update blog post: ${id}`, error);
    }
  }

  async publishPost(id: string): Promise<DomainBlogPost> {
    try {
      const record = await this.prisma.blogPost.update({
        where: { id },
        data: {
          status: PublishStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        include: this.postInclude,
      });

      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to publish blog post: ${id}`, error);
    }
  }

  async archivePost(id: string): Promise<DomainBlogPost> {
    try {
      const record = await this.prisma.blogPost.update({
        where: { id },
        data: {
          status: PublishStatus.ARCHIVED,
        },
        include: this.postInclude,
      });

      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to archive blog post: ${id}`, error);
    }
  }

  async listCategories(): Promise<DomainBlogCategory[]> {
    try {
      const records = await this.prisma.blogCategory.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          _count: {
            select: {
              posts: {
                where: { status: PublishStatus.PUBLISHED, deletedAt: null },
              },
            },
          },
        },
      });

      return records.map((c) => ({
        ...mapPrismaBlogCategoryToDomain(c),
        postCount: c._count.posts,
      }));
    } catch (error) {
      throw AppError.database('Failed to fetch blog categories', error);
    }
  }

  async listTags(): Promise<DomainBlogTag[]> {
    try {
      const records = await this.prisma.blogTag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              posts: {
                where: { post: { status: PublishStatus.PUBLISHED, deletedAt: null } },
              },
            },
          },
        },
      });

      return records.map((t) => ({
        ...mapPrismaBlogTagToDomain(t),
        postCount: t._count.posts,
      }));
    } catch (error) {
      throw AppError.database('Failed to fetch blog tags', error);
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await this.prisma.blogPost.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });
    } catch {
      // Non-blocking telemetry failure
    }
  }
}
