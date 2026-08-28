import { describe, it, expect, vi } from 'vitest';
import { BlogService, BlogRepository } from '../index';
import { AppError } from '@elsesourav/types';
import { generateBlogSlug } from '@elsesourav/validation';
import type {
  BlogPost as DomainBlogPost,
  PublicBlogPost,
  BlogQueryResult,
} from '@elsesourav/types';

describe('Blog Domain Service, Lifecycle & Security', () => {
  const mockPublicPost: PublicBlogPost = {
    id: 'post-1',
    slug: 'nextjs-15-deep-dive',
    title: 'Next.js 15 Deep Dive',
    excerpt: 'Exploring the new features of Next.js 15 and React 19.',
    content: '## Comprehensive guide to server actions and partial prerendering in Next.js 15.',
    coverImageUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/blog/cover.jpg',
    author: {
      id: 'author-1',
      displayName: 'Sourav',
      username: 'elsesourav',
    },
    category: {
      id: 'cat-1',
      name: 'Engineering',
      slug: 'engineering',
      orderIndex: 1,
    },
    tags: [
      { id: 'tag-1', name: 'Next.js', slug: 'nextjs' },
      { id: 'tag-2', name: 'React', slug: 'react' },
    ],
    readingTime: 4,
    viewsCount: 150,
    seoTitle: 'Next.js 15 Architectural Guide',
    seoDescription: 'Learn everything about Next.js 15.',
    publishedAt: 1704067200000,
    createdAt: 1704067000000,
    updatedAt: 1704067200000,
  };

  const mockDraftPost: DomainBlogPost = {
    id: 'post-2',
    slug: 'draft-announcement',
    title: 'Draft Announcement',
    excerpt: 'This is a draft announcement post.',
    content: 'Draft content undergoing editorial review.',
    status: 'draft',
    readingTime: 2,
    viewsCount: 0,
    tags: [],
    createdAt: 1704067000000,
    updatedAt: 1704067000000,
  };

  const mockQueryResult: BlogQueryResult = {
    items: [mockPublicPost],
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasMore: false,
  };

  describe('Security & Admin Authorization Gate', () => {
    it('rejects regular USER role from creating blog posts', async () => {
      const mockRepo = {
        createPost: vi.fn(),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);

      await expect(
        service.createBlogPost('user-1', 'USER', {
          title: 'Unauthorized Post Title',
          excerpt: 'Short excerpt describing post',
          content: 'This content should not be allowed to be created by regular users.',
        })
      ).rejects.toThrowError(AppError);
    });

    it('rejects anonymous visitor from publishing a blog post', async () => {
      const mockRepo = {
        publishPost: vi.fn(),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);

      await expect(service.publishBlogPost(undefined, 'post-1')).rejects.toThrowError(AppError);
    });

    it('allows ADMIN role to create draft blog post with generated slug', async () => {
      const mockRepo = {
        createPost: vi.fn().mockResolvedValue(mockDraftPost),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);
      const post = await service.createBlogPost('admin-1', 'ADMIN', {
        title: 'Draft Announcement',
        excerpt: 'This is a draft announcement post.',
        content: 'Draft content undergoing editorial review with more than 50 characters.',
      });

      expect(post.status).toBe('draft');
      expect(mockRepo.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Draft Announcement' }),
        'admin-1',
        'draft-announcement'
      );
    });
  });

  describe('Public Read & Slug Discovery', () => {
    it('fetches published blog post by slug and increments views', async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockPublicPost),
        incrementViews: vi.fn().mockResolvedValue(undefined),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);
      const post = await service.getPublicPostBySlug('nextjs-15-deep-dive');

      expect(post.slug).toBe('nextjs-15-deep-dive');
      expect(mockRepo.findBySlug).toHaveBeenCalledWith('nextjs-15-deep-dive');
      expect(mockRepo.incrementViews).toHaveBeenCalledWith('post-1');
    });

    it('throws notFound for non-existent or unpublished post', async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);

      await expect(service.getPublicPostBySlug('non-existent-slug')).rejects.toThrowError(AppError);
    });

    it('lists published posts with filters and pagination metadata', async () => {
      const mockRepo = {
        findPublicPosts: vi.fn().mockResolvedValue(mockQueryResult),
      } as unknown as BlogRepository;

      const service = new BlogService(mockRepo);
      const result = await service.listPublicPosts({ categorySlug: 'engineering', page: 1, limit: 10 });

      expect(result.totalCount).toBe(1);
      expect(result.items[0]?.title).toBe('Next.js 15 Deep Dive');
      expect(mockRepo.findPublicPosts).toHaveBeenCalledWith({
        categorySlug: 'engineering',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('Slug Normalization Utility', () => {
    it('normalizes arbitrary titles into clean, predictable URL slugs', () => {
      expect(generateBlogSlug('   Introducing ElseSourav V2: The Next Evolution!   ')).toBe(
        'introducing-elsesourav-v2-the-next-evolution'
      );
      expect(generateBlogSlug('AI & Machine Learning (2026 Edition) -- Best Practices')).toBe(
        'ai-machine-learning-2026-edition-best-practices'
      );
    });
  });
});
