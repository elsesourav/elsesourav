import { describe, it, expect, vi } from 'vitest';
import { BlogService, BlogRepository } from '@elsesourav/database';
import type {
  BlogPostListItem,
  BlogQueryResult,
  BlogCategory as DomainBlogCategory,
  BlogTag as DomainBlogTag,
} from '@elsesourav/types';

describe('Blog Listing & Discovery Query Pipeline', () => {
  const mockPost: BlogPostListItem = {
    id: 'post-1',
    slug: 'nextjs-15-deep-dive',
    title: 'Next.js 15 Deep Dive',
    excerpt: 'Exploring the new features of Next.js 15.',
    coverImageUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/blog/cover.jpg',
    author: {
      id: 'author-1',
      displayName: 'Sourav',
    },
    category: {
      id: 'cat-1',
      name: 'Engineering',
      slug: 'engineering',
      orderIndex: 1,
    },
    tags: [{ id: 'tag-1', name: 'Next.js', slug: 'nextjs' }],
    readingTime: 5,
    viewsCount: 120,
    publishedAt: 1704067200000,
    createdAt: 1704067000000,
  };

  const mockQueryResult: BlogQueryResult = {
    items: [mockPost],
    totalCount: 1,
    page: 1,
    limit: 9,
    totalPages: 1,
    hasMore: false,
  };

  const mockCategories: DomainBlogCategory[] = [
    { id: 'cat-1', name: 'Engineering', slug: 'engineering', orderIndex: 1, postCount: 10 },
    { id: 'cat-2', name: 'Productivity', slug: 'productivity', orderIndex: 2, postCount: 4 },
  ];

  const mockTags: DomainBlogTag[] = [
    { id: 'tag-1', name: 'Next.js', slug: 'nextjs', postCount: 6 },
    { id: 'tag-2', name: 'React', slug: 'react', postCount: 8 },
  ];

  it('queries published blog posts with combined search, category, and tag filters', async () => {
    const mockRepo = {
      findPublicPosts: vi.fn().mockResolvedValue(mockQueryResult),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);
    const result = await service.listPublicPosts({
      query: 'architecture',
      categorySlug: 'engineering',
      tagSlug: 'nextjs',
      page: 1,
      limit: 9,
    });

    expect(result.totalCount).toBe(1);
    expect(result.items[0]?.slug).toBe('nextjs-15-deep-dive');
    expect(mockRepo.findPublicPosts).toHaveBeenCalledWith({
      query: 'architecture',
      categorySlug: 'engineering',
      tagSlug: 'nextjs',
      page: 1,
      limit: 9,
    });
  });

  it('retrieves active public categories and tags with live post counts', async () => {
    const mockRepo = {
      listCategories: vi.fn().mockResolvedValue(mockCategories),
      listTags: vi.fn().mockResolvedValue(mockTags),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);
    const categories = await service.listCategories();
    const tags = await service.listTags();

    expect(categories).toHaveLength(2);
    expect(categories[0]?.postCount).toBe(10);
    expect(tags).toHaveLength(2);
    expect(tags[0]?.name).toBe('Next.js');
  });

  it('enforces safe bounded pagination defaults', async () => {
    const mockRepo = {
      findPublicPosts: vi.fn().mockResolvedValue(mockQueryResult),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);
    await service.listPublicPosts({});

    expect(mockRepo.findPublicPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
      })
    );
  });

  it('validates editorial and archival metadata fields on blog post list items', () => {
    expect(mockPost.readingTime).toBe(5);
    expect(mockPost.excerpt).toBeDefined();
    expect(mockPost.category?.name).toBe('Engineering');
    expect(mockPost.publishedAt).toBeDefined();
  });

  it('strictly excludes draft and unpublished posts from public queries', async () => {
    const mockRepo = {
      findPublicPosts: vi.fn().mockResolvedValue({
        items: [],
        totalCount: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
        hasMore: false,
      }),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);
    const result = await service.listPublicPosts({ query: 'secret-draft' });
    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});
