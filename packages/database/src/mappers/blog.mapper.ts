import type {
  BlogPost as PrismaBlogPost,
  BlogTag as PrismaBlogTag,
  BlogPostTag as PrismaBlogPostTag,
  User as PrismaUser,
  Category as PrismaCategory,
} from '@prisma/client';
import type {
  BlogPost as DomainBlogPost,
  BlogPostListItem,
  PublicBlogPost,
  Category as DomainCategory,
  BlogTag as DomainBlogTag,
  BlogAuthor,
  BlogPostStatus,
} from '@elsesourav/types';

export type PrismaBlogWithRelations = PrismaBlogPost & {
  author?: PrismaUser | null;
  category?: PrismaCategory | null;
  categories?: { category: PrismaCategory }[];
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

export function mapPrismaCategoryToDomain(cat: PrismaCategory): DomainCategory {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? undefined,
    icon: cat.icon ?? undefined,
    orderIndex: cat.orderIndex,
    isActive: cat.isActive,
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
  const category = post.category ? mapPrismaCategoryToDomain(post.category) : undefined;
  const tags = (post.tags || []).map((pt) => mapPrismaBlogTagToDomain(pt.tag));

  const categories: DomainCategory[] =
    post.categories && post.categories.length > 0
      ? post.categories.map((c) => ({
          id: c.category.id,
          name: c.category.name,
          slug: c.category.slug,
          description: c.category.description ?? undefined,
          icon: c.category.icon ?? undefined,
          orderIndex: c.category.orderIndex,
          isActive: c.category.isActive,
        }))
      : category
        ? [category]
        : [];
  const categorySlugs = categories.map((c) => c.slug);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl ?? undefined,
    author,
    authorName: post.authorName ?? undefined,
    authorImageUrl: post.authorImageUrl ?? undefined,
    authorUrl: post.authorUrl ?? undefined,
    authorRole: post.authorRole ?? undefined,
    category,
    categories,
    categorySlugs,
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
  const category = post.category ? mapPrismaCategoryToDomain(post.category) : undefined;
  const tags = (post.tags || []).map((pt) => mapPrismaBlogTagToDomain(pt.tag));

  const categories: DomainCategory[] =
    post.categories && post.categories.length > 0
      ? post.categories.map((c) => ({
          id: c.category.id,
          name: c.category.name,
          slug: c.category.slug,
          description: c.category.description ?? undefined,
          icon: c.category.icon ?? undefined,
          orderIndex: c.category.orderIndex,
          isActive: c.category.isActive,
        }))
      : category
        ? [category]
        : [];
  const categorySlugs = categories.map((c) => c.slug);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? undefined,
    authorId: post.authorId ?? undefined,
    author,
    authorName: post.authorName ?? undefined,
    authorImageUrl: post.authorImageUrl ?? undefined,
    authorUrl: post.authorUrl ?? undefined,
    authorRole: post.authorRole ?? undefined,
    categoryId: post.categoryId ?? undefined,
    category,
    categories,
    categorySlugs,
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
