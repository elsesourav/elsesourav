import { PrismaClient, Prisma, PublishStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import {
  mapPrismaBlogPostToDomain,
  mapPrismaBlogPostToListItem,
  mapPrismaBlogPostToPublic,
  mapPrismaCategoryToDomain,
  mapPrismaBlogTagToDomain,
  PrismaBlogWithRelations,
} from '../mappers/blog.mapper';
import { AppError } from '@elsesourav/types';
import type {
  BlogPost as DomainBlogPost,
  BlogPostListItem,
  PublicBlogPost,
  Category as DomainCategory,
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
    categories: {
      include: {
        category: true,
      },
    },
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

  async findPostRecordBySlug(
    slug: string
  ): Promise<{ id: string; slug: string; title: string } | null> {
    try {
      return await this.prisma.blogPost.findUnique({
        where: { slug },
        select: { id: true, slug: true, title: true },
      });
    } catch {
      return null;
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
        const rawSlugs = options.categorySlug
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (rawSlugs.length > 0) {
          const catFilter: Prisma.BlogPostWhereInput = {
            OR: [
              { category: { slug: { in: rawSlugs } } },
              { categories: { some: { category: { slug: { in: rawSlugs } } } } },
            ],
          };
          where.AND = Array.isArray(where.AND) ? [...where.AND, catFilter] : [catFilter];
        }
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
      const items = records.map((r) =>
        mapPrismaBlogPostToListItem(r as unknown as PrismaBlogWithRelations)
      );

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

  async findRelatedPosts(
    postId: string,
    categoryId?: string,
    limit: number = 3
  ): Promise<BlogPostListItem[]> {
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

      return records.map((r) =>
        mapPrismaBlogPostToListItem(r as unknown as PrismaBlogWithRelations)
      );
    } catch (error) {
      throw AppError.database('Failed to fetch related blog posts', error);
    }
  }

  private async resolveValidCategoryIds(rawIds: string[]): Promise<string[]> {
    if (!this.prisma.category?.findUnique) {
      return [...new Set(rawIds.filter(Boolean))];
    }
    const validIds: string[] = [];
    for (const catId of rawIds) {
      if (!catId) continue;
      const cat = await this.prisma.category.findUnique({
        where: { id: catId },
        select: { id: true },
      });
      if (cat) {
        validIds.push(cat.id);
      }
    }
    return [...new Set(validIds)];
  }

  async createPost(
    data: CreateBlogPostInput,
    authorId: string,
    slug: string
  ): Promise<DomainBlogPost> {
    try {
      // Resolve valid database User.id if authorId is a Supabase Auth ID or User UUID
      let resolvedAuthorId: string | null = authorId;
      if (authorId && this.prisma.user?.findFirst) {
        const user = await this.prisma.user.findFirst({
          where: {
            OR: [{ id: authorId }, { supabaseAuthId: authorId }],
          },
          select: { id: true },
        });
        resolvedAuthorId = user ? user.id : null;
      }

      const inputCategoryId =
        data.categoryId ||
        (data.categoryIds && data.categoryIds.length > 0 ? data.categoryIds[0] : null);
      const rawCategoryIds =
        data.categoryIds && data.categoryIds.length > 0
          ? [...new Set(data.categoryIds)]
          : inputCategoryId
            ? [inputCategoryId]
            : [];

      const validCategoryIds = await this.resolveValidCategoryIds(rawCategoryIds);
      const resolvedCategoryId =
        (inputCategoryId && validCategoryIds.includes(inputCategoryId))
          ? inputCategoryId
          : validCategoryIds[0] || null;

      const record = await this.prisma.blogPost.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImageUrl || null,
          authorName: data.authorName || null,
          authorImageUrl: data.authorImageUrl || null,
          authorUrl: data.authorUrl || null,
          authorRole: data.authorRole || null,
          authorId: resolvedAuthorId,
          categoryId: resolvedCategoryId,
          categories:
            validCategoryIds.length > 0
              ? {
                  create: validCategoryIds.map((categoryId) => ({ categoryId })),
                }
              : undefined,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          readingTime:
            data.readingTime || Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200)),
          status: PublishStatus.DRAFT,
          tags:
            data.tagIds && data.tagIds.length > 0
              ? {
                  create: data.tagIds.map((tagId) => ({ tagId })),
                }
              : undefined,
        },
        include: this.postInclude,
      });

      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.validation(
          `An update post with slug '${slug}' already exists. Please choose a different slug or title.`
        );
      }
      const detail = error instanceof Error ? error.message : String(error);
      console.error('BlogRepository.createPost error:', error);
      throw AppError.database(`Failed to create blog post: ${detail}`, error);
    }
  }

  async updatePost(id: string, data: UpdateBlogPostInput): Promise<DomainBlogPost> {
    try {
      const uniqueCategoryIds =
        data.categoryIds !== undefined ? [...new Set(data.categoryIds)] : undefined;

      let validCategoryIds: string[] | undefined = undefined;
      let resolvedCategoryId: string | null | undefined = undefined;

      if (uniqueCategoryIds !== undefined) {
        validCategoryIds = await this.resolveValidCategoryIds(uniqueCategoryIds);
      }

      if (data.categoryId !== undefined || validCategoryIds !== undefined) {
        const targetId =
          data.categoryId ??
          (validCategoryIds && validCategoryIds.length > 0 ? validCategoryIds[0] : null);
        if (!targetId) {
          resolvedCategoryId = null;
        } else if (this.prisma.category?.findUnique) {
          const cat = await this.prisma.category.findUnique({
            where: { id: targetId },
            select: { id: true },
          });
          resolvedCategoryId = cat ? cat.id : null;
        } else {
          resolvedCategoryId = targetId;
        }
      }

      const record = await this.prisma.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImageUrl,
          authorName: data.authorName,
          authorImageUrl: data.authorImageUrl,
          authorUrl: data.authorUrl,
          authorRole: data.authorRole,
          categoryId: resolvedCategoryId !== undefined ? resolvedCategoryId : undefined,
          categories:
            validCategoryIds !== undefined
              ? {
                  deleteMany: {},
                  create: validCategoryIds.map((categoryId) => ({ categoryId })),
                }
              : undefined,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          readingTime: data.readingTime,
          status: data.status ? (data.status.toUpperCase() as PublishStatus) : undefined,
        },
        include: this.postInclude,
      });

      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.validation(
          `An update post with slug '${data.slug}' already exists. Please choose a different slug.`
        );
      }
      const detail = error instanceof Error ? error.message : String(error);
      console.error('BlogRepository.updatePost error:', error);
      throw AppError.database(`Failed to update blog post ${id}: ${detail}`, error);
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

  async findById(id: string): Promise<DomainBlogPost | null> {
    try {
      const record = await this.prisma.blogPost.findUnique({
        where: { id },
        include: this.postInclude,
      });
      if (!record || record.deletedAt) return null;
      return mapPrismaBlogPostToDomain(record as unknown as PrismaBlogWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to find blog post by id: ${id}`, error);
    }
  }

  async listAdminPosts(
    options: {
      status?: PublishStatus;
      categorySlug?: string;
      search?: string;
      limit?: number;
    } = {}
  ): Promise<DomainBlogPost[]> {
    try {
      const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
      const where: Prisma.BlogPostWhereInput = { deletedAt: null };

      if (options.status) {
        where.status = options.status;
      }
      if (options.categorySlug && options.categorySlug !== 'all') {
        const rawSlugs = options.categorySlug
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (rawSlugs.length > 0) {
          const catFilter: Prisma.BlogPostWhereInput = {
            OR: [
              { category: { slug: { in: rawSlugs } } },
              { categories: { some: { category: { slug: { in: rawSlugs } } } } },
            ],
          };
          where.AND = Array.isArray(where.AND) ? [...where.AND, catFilter] : [catFilter];
        }
      }
      if (options.search && options.search.trim().length > 0) {
        const term = options.search.trim();
        where.OR = [
          { title: { contains: term, mode: 'insensitive' } },
          { excerpt: { contains: term, mode: 'insensitive' } },
        ];
      }

      const records = await this.prisma.blogPost.findMany({
        where,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: this.postInclude,
      });

      return records.map((r) => mapPrismaBlogPostToDomain(r as unknown as PrismaBlogWithRelations));
    } catch (error) {
      throw AppError.database('Failed to query admin blog posts', error);
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await this.prisma.blogPost.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: PublishStatus.ARCHIVED,
        },
      });
    } catch (error) {
      throw AppError.database(`Failed to delete blog post: ${id}`, error);
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

  async listCategories(): Promise<DomainCategory[]> {
    try {
      const records = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
        include: {
          _count: {
            select: {
              postCategories: {
                where: {
                  post: { status: PublishStatus.PUBLISHED, deletedAt: null },
                },
              },
            },
          },
        },
      });

      return records.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        icon: c.icon ?? undefined,
        orderIndex: c.orderIndex,
        isActive: c.isActive,
        postCount: c._count.postCategories,
      }));
    } catch (error) {
      throw AppError.database('Failed to fetch categories', error);
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
