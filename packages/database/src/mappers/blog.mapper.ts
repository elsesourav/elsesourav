import type { BlogPost as PrismaBlogPost, BlogCategory } from '@prisma/client';
import type { BlogPost as DomainBlogPost, BlogPostStatus } from '@elsesourav/types';

export type PrismaBlogWithCategory = PrismaBlogPost & {
  category?: BlogCategory | null;
};

export function mapPrismaBlogPostToDomain(post: PrismaBlogWithCategory): DomainBlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? undefined,
    authorId: 'admin-author',
    category: post.category?.slug ?? 'general',
    tags: [],
    status: post.status.toLowerCase() as BlogPostStatus,
    readingTimeMinutes: post.readingTime,
    viewsCount: post.viewsCount,
    publishedAt: post.publishedAt ? post.publishedAt.getTime() : undefined,
    createdAt: post.createdAt.getTime(),
    updatedAt: post.updatedAt.getTime(),
    deletedAt: post.deletedAt ? post.deletedAt.getTime() : undefined,
  };
}
