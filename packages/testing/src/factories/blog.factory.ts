import type {
  BlogPost,
  BlogPostListItem,
  BlogCategory,
  BlogTag,
  BlogAuthor,
} from '@elsesourav/types';

let blogCounter = 1;

export function resetBlogFactoryCounter(): void {
  blogCounter = 1;
}

export function createBlogCategory(overrides?: Partial<BlogCategory>): BlogCategory {
  const index = overrides?.orderIndex ?? 1;
  return {
    id: overrides?.id || `blog-cat-${index}`,
    name: overrides?.name || 'Architecture & Engineering',
    slug: overrides?.slug || 'architecture',
    orderIndex: index,
  };
}

export function createBlogTag(overrides?: Partial<BlogTag>): BlogTag {
  return {
    id: overrides?.id || 'blog-tag-1',
    name: overrides?.name || 'Next.js',
    slug: overrides?.slug || 'nextjs',
  };
}

export const defaultBlogAuthor: BlogAuthor = {
  id: 'usr-admin-1',
  displayName: 'Sourav',
  username: 'elsesourav',
  photoUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/avatars/admin.png',
};

export function createBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  const index = blogCounter++;
  const id = overrides?.id || `post-test-${index}`;
  const slug = overrides?.slug || `engineering-insights-${index}`;
  const title = overrides?.title || `Deep Dive: Architecture & System Design #${index}`;

  return {
    id,
    slug,
    title,
    excerpt:
      overrides?.excerpt ||
      `An engineering examination of low-latency caching, zero-trust RBAC, and modern React 19 server architectures.`,
    content:
      overrides?.content ||
      `# ${title}\n\nComprehensive exploration of core design tokens, state management, and high-performance server components.\n\n## Key Takeaways\n\n- Sub-100ms response times\n- Resilient fallback architectures\n- Clean domain separation.`,
    authorId: overrides?.authorId || 'usr-admin-1',
    author: overrides?.author || defaultBlogAuthor,
    category: overrides?.category || createBlogCategory(),
    tags: overrides?.tags || [
      createBlogTag({ name: 'Turborepo', slug: 'turborepo' }),
      createBlogTag(),
    ],
    coverImageUrl: overrides?.coverImageUrl,
    status: overrides?.status || 'published',
    readingTime: overrides?.readingTime ?? 5,
    viewsCount: overrides?.viewsCount ?? 350,
    publishedAt: overrides?.publishedAt ?? 1704067200000,
    createdAt: overrides?.createdAt ?? 1704067200000,
    updatedAt: overrides?.updatedAt ?? 1704067200000,
  };
}

export function createBlogPostListItem(post: BlogPost): BlogPostListItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    author: post.author || defaultBlogAuthor,
    category: post.category,
    tags: post.tags,
    readingTime: post.readingTime,
    viewsCount: post.viewsCount,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
  };
}
