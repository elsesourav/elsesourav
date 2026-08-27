import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogService, calculateReadingTime } from '../blog.service';
import type { IBlogRepository, CreateBlogPostDto } from '@/repositories';
import type { BlogPost } from '@/types/blog.types';
import { ok } from '@/lib/result';

const mockDraftPost: BlogPost = {
  id: 'blog-1',
  slug: 'crafting-fast-web-apps',
  title: 'Crafting Fast Web Applications in 2026',
  excerpt:
    'A deep dive into building lean, performant web applications without unnecessary dependencies.',
  content:
    'Here is the complete blog post content with extensive discussion on web performance, zero-bloat architecture, and modern JavaScript engines.',
  authorId: 'user-admin-1',
  authorName: 'Sourav',
  category: 'engineering',
  tags: ['performance', 'web', 'architecture'],
  status: 'draft',
  readingTime: 1,
  readingTimeMinutes: 1,
  viewsCount: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const mockPublishedPost: BlogPost = {
  ...mockDraftPost,
  id: 'blog-2',
  slug: 'state-of-elsesourav-v2',
  title: 'State of ElseSourav v2 Release',
  status: 'published',
  publishedAt: 1700001000000,
};

describe('BlogService & Blog Data Foundation', () => {
  let mockBlogRepo: IBlogRepository;
  let blogService: BlogService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBlogRepo = {
      findById: vi.fn().mockResolvedValue(ok(mockDraftPost)),
      findBySlug: vi.fn().mockResolvedValue(ok(mockDraftPost)),
      create: vi.fn(),
      update: vi.fn().mockImplementation((id, data) => ok({ ...mockDraftPost, id, ...data })),
      delete: vi.fn(),
      findMany: vi.fn(),
      createDraft: vi.fn().mockImplementation((data) =>
        ok({
          ...mockDraftPost,
          ...data,
          id: 'new-blog-id',
          status: 'draft',
        })
      ),
      publish: vi.fn().mockImplementation((id) =>
        ok({
          ...mockDraftPost,
          id,
          status: 'published',
          publishedAt: Date.now(),
        })
      ),
      unpublish: vi.fn().mockImplementation((id) =>
        ok({
          ...mockDraftPost,
          id,
          status: 'draft',
        })
      ),
      archive: vi.fn().mockImplementation((id) =>
        ok({
          ...mockDraftPost,
          id,
          status: 'archived',
          archivedAt: Date.now(),
        })
      ),
      restore: vi.fn().mockImplementation((id, targetStatus = 'draft') =>
        ok({
          ...mockDraftPost,
          id,
          status: targetStatus,
          archivedAt: undefined,
        })
      ),
      listPublished: vi.fn().mockResolvedValue(
        ok({
          items: [mockPublishedPost],
          hasMore: false,
        })
      ),
      listLatest: vi.fn().mockResolvedValue(
        ok({
          items: [mockPublishedPost],
          hasMore: false,
        })
      ),
      listByCategory: vi.fn().mockResolvedValue(
        ok({
          items: [mockPublishedPost],
          hasMore: false,
        })
      ),
      listByTag: vi.fn().mockResolvedValue(
        ok({
          items: [mockPublishedPost],
          hasMore: false,
        })
      ),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
    };

    blogService = new BlogService(mockBlogRepo);
  });

  describe('Reading Time Estimation', () => {
    it('calculates 1 minute for short content', () => {
      expect(calculateReadingTime('Hello world')).toBe(1);
      expect(calculateReadingTime('')).toBe(1);
    });

    it('calculates proportional reading time for longer text (~200 wpm)', () => {
      const words600 = new Array(600).fill('word').join(' ');
      expect(calculateReadingTime(words600)).toBe(3);
    });
  });

  describe('1. Valid Draft Creation', () => {
    it('creates a new blog draft with automatic reading time calculation', async () => {
      const input: CreateBlogPostDto = {
        title: 'Building Modern Web Applications',
        slug: 'building-modern-web-apps',
        excerpt: 'A comprehensive guide on modern web architectures without bloat.',
        content: new Array(400).fill('content').join(' '),
        category: 'engineering',
        tags: ['web', 'architecture'],
        authorId: 'admin-1',
        authorName: 'Sourav',
      };

      const result = await blogService.createDraft(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockBlogRepo.checkSlugUnique).toHaveBeenCalledWith('building-modern-web-apps');
        expect(mockBlogRepo.createDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            title: input.title,
            slug: input.slug,
            readingTime: 2, // 400 words = 2 mins
          })
        );
      }
    });
  });

  describe('2. Invalid Blog Data Rejection', () => {
    it('rejects post with invalid slug format', async () => {
      const input: CreateBlogPostDto = {
        title: 'Valid Title Here',
        slug: 'INVALID SLUG with spaces!',
        excerpt: 'Valid excerpt description that exceeds ten chars.',
        content: 'Valid content that has enough text to pass validation.',
        category: 'engineering',
      };

      const result = await blogService.createDraft(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('rejects post with title that is too short', async () => {
      const input: CreateBlogPostDto = {
        title: 'Hi',
        slug: 'short-title',
        excerpt: 'Valid excerpt description that exceeds ten chars.',
        content: 'Valid content that has enough text to pass validation.',
        category: 'engineering',
      };

      const result = await blogService.createDraft(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('3. Slug Uniqueness & Stability', () => {
    it('rejects creation if slug is already taken', async () => {
      vi.spyOn(mockBlogRepo, 'checkSlugUnique').mockResolvedValue(ok(false));

      const input: CreateBlogPostDto = {
        title: 'Duplicate Slug Post',
        slug: 'existing-slug',
        excerpt: 'Valid excerpt description that exceeds ten chars.',
        content: 'Valid content that has enough text to pass validation.',
        category: 'engineering',
      };

      const result = await blogService.createDraft(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('allows updating post with same slug for itself', async () => {
      vi.spyOn(mockBlogRepo, 'checkSlugUnique').mockResolvedValue(ok(true));

      const result = await blogService.updatePost('blog-1', {
        slug: 'crafting-fast-web-apps',
        title: 'Updated Title',
      });

      expect(result.success).toBe(true);
      expect(mockBlogRepo.checkSlugUnique).toHaveBeenCalledWith('crafting-fast-web-apps', 'blog-1');
    });
  });

  describe('4. Publishing Lifecycle (Draft -> Published -> Archived -> Restore)', () => {
    it('publishes draft and validates required fields', async () => {
      vi.spyOn(mockBlogRepo, 'findById').mockResolvedValue(ok(mockDraftPost));

      const result = await blogService.publishPost('blog-1');

      expect(result.success).toBe(true);
      expect(mockBlogRepo.publish).toHaveBeenCalledWith('blog-1');
    });

    it('fails publishing if post is missing required fields', async () => {
      const incompletePost: BlogPost = {
        ...mockDraftPost,
        title: '', // invalid
      };
      vi.spyOn(mockBlogRepo, 'findById').mockResolvedValue(ok(incompletePost));

      const result = await blogService.publishPost('blog-1');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('unpublishes a published post back to draft', async () => {
      const result = await blogService.unpublishPost('blog-2');
      expect(result.success).toBe(true);
      expect(mockBlogRepo.unpublish).toHaveBeenCalledWith('blog-2');
    });

    it('archives a post', async () => {
      const result = await blogService.archivePost('blog-1');
      expect(result.success).toBe(true);
      expect(mockBlogRepo.archive).toHaveBeenCalledWith('blog-1');
    });

    it('restores an archived post to draft or published', async () => {
      const result = await blogService.restorePost('blog-3', 'draft');
      expect(result.success).toBe(true);
      expect(mockBlogRepo.restore).toHaveBeenCalledWith('blog-3', 'draft');
    });
  });

  describe('5. Public Discovery & Cursor Pagination', () => {
    it('lists published posts with cursor-based pagination options', async () => {
      const result = await blogService.listPublishedPosts({
        limit: 5,
        startAfterCursor: 'doc-cursor-123',
      });

      expect(result.success).toBe(true);
      expect(mockBlogRepo.listPublished).toHaveBeenCalledWith({
        limit: 5,
        startAfterCursor: 'doc-cursor-123',
      });
    });

    it('retrieves blog post by slug', async () => {
      const result = await blogService.getPostBySlug('crafting-fast-web-apps');
      expect(result.success).toBe(true);
      expect(mockBlogRepo.findBySlug).toHaveBeenCalledWith('crafting-fast-web-apps');
    });

    it('filters posts by category and by tag', async () => {
      await blogService.listPostsByCategory('engineering');
      expect(mockBlogRepo.listByCategory).toHaveBeenCalledWith('engineering', undefined);

      await blogService.listPostsByTag('architecture');
      expect(mockBlogRepo.listByTag).toHaveBeenCalledWith('architecture', undefined);
    });
  });
});
