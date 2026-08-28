import type {
  BlogPost as PrismaBlogPost,
  BlogCategory as PrismaBlogCategory,
  BlogTag as PrismaBlogTag,
  BlogPostTag as PrismaBlogPostTag,
  User as PrismaUser,
} from '@prisma/client';
import type {
  BlogPost as DomainBlogPost,
  BlogPostListItem,
  PublicBlogPost,
  BlogCategory as DomainBlogCategory,
  BlogTag as DomainBlogTag,
  BlogAuthor,
  BlogPostStatus,
} from '@elsesourav/types';

export type PrismaBlogWithRelations = PrismaBlogPost & {
  author?: PrismaUser | null;
  category?: PrismaBlogCategory | null;
  tags?: (PrismaBlogPostTag & { tag: PrismaBlogTag })[];
};

export function mapPrismaAuthorToDomain(user?: PrismaUser | null): BlogAuthor {
  if (!user) {
    return {
      id: 'author-default',
      displayName: 'ElseSourav Editorial',
    };
  }
  return {
    id: user.id,
    displayName: user.displayName || user.username || 'ElseSourav',
    username: user.username ?? undefined,
    photoUrl: user.photoUrl ?? undefined,
    bio: user.bio ?? undefined,
  };
}

export function mapPrismaBlogCategoryToDomain(cat: PrismaBlogCategory): DomainBlogCategory {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? undefined,
    orderIndex: cat.orderIndex,
  };
}

export function mapPrismaBlogTagToDomain(tag: PrismaBlogTag): DomainBlogTag {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  };
}

export function mapPrismaBlogPostToListItem(post: PrismaBlogWithRelations): BlogPostListItem {
  const author = mapPrismaAuthorToDomain(post.author);
  const category = post.category ? mapPrismaBlogCategoryToDomain(post.category) : undefined;
  const tags = (post.tags || []).map((pt) => mapPrismaBlogTagToDomain(pt.tag));

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl ?? undefined,
    author,
    category,
    tags,
    readingTime: post.readingTime,
    viewsCount: post.viewsCount,
    publishedAt: post.publishedAt ? post.publishedAt.getTime() : undefined,
    createdAt: post.createdAt.getTime(),
  };
}

export function mapPrismaBlogPostToPublic(post: PrismaBlogWithRelations): PublicBlogPost {
  const base = mapPrismaBlogPostToListItem(post);
  return {
    ...base,
    content: post.content,
    seoTitle: post.seoTitle ?? undefined,
    seoDescription: post.seoDescription ?? undefined,
    updatedAt: post.updatedAt.getTime(),
  };
}

export function mapPrismaBlogPostToDomain(post: PrismaBlogWithRelations): DomainBlogPost {
  const author = post.author ? mapPrismaAuthorToDomain(post.author) : undefined;
  const category = post.category ? mapPrismaBlogCategoryToDomain(post.category) : undefined;
  const tags = (post.tags || []).map((pt) => mapPrismaBlogTagToDomain(pt.tag));

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? undefined,
    authorId: post.authorId ?? undefined,
    author,
    categoryId: post.categoryId ?? undefined,
    category,
    tags,
    status: post.status.toLowerCase() as BlogPostStatus,
    readingTime: post.readingTime,
    viewsCount: post.viewsCount,
    seoTitle: post.seoTitle ?? undefined,
    seoDescription: post.seoDescription ?? undefined,
    publishedAt: post.publishedAt ? post.publishedAt.getTime() : undefined,
    createdAt: post.createdAt.getTime(),
    updatedAt: post.updatedAt.getTime(),
    deletedAt: post.deletedAt ? post.deletedAt.getTime() : undefined,
  };
}
