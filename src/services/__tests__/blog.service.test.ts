import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogService, calculateReadingTime } from '../blog.service';
import type {
  IBlogRepository,
  IBlogCategoryRepository,
  IBlogTagRepository,
  CreateBlogPostDto,
  CreateBlogCategoryDto,
  CreateBlogTagDto,
} from '@/repositories';
import type { BlogPost, BlogCategory, BlogTag } from '@/types/blog.types';
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
  isFeatured: false,
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
  isFeatured: true,
  publishedAt: 1700001000000,
};

const mockCategory: BlogCategory = {
  id: 'cat-eng',
  name: 'Engineering',
  slug: 'engineering',
  description: 'Deep technical deep dives and architecture decisions.',
  orderIndex: 0,
  isActive: true,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const mockTag: BlogTag = {
  id: 'tag-perf',
  name: 'Performance',
  slug: 'performance',
  description: 'Optimization techniques for sub-second page loads.',
  isActive: true,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe('BlogService & Blog Data Foundation', () => {
  let mockBlogRepo: IBlogRepository;
  let mockBlogCategoryRepo: IBlogCategoryRepository;
  let mockBlogTagRepo: IBlogTagRepository;
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
      listFeatured: vi.fn().mockResolvedValue(
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

    mockBlogCategoryRepo = {
      findById: vi.fn().mockResolvedValue(ok(mockCategory)),
      findBySlug: vi.fn().mockResolvedValue(ok(mockCategory)),
      create: vi.fn().mockImplementation((data) => ok({ ...mockCategory, ...data, id: 'cat-new' })),
      update: vi.fn().mockImplementation((id, data) => ok({ ...mockCategory, id, ...data })),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
      findMany: vi.fn(),
      findActive: vi.fn().mockResolvedValue(ok({ items: [mockCategory], hasMore: false })),
      deactivate: vi.fn().mockImplementation((id) => ok({ ...mockCategory, id, isActive: false })),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
    };

    mockBlogTagRepo = {
      findById: vi.fn().mockResolvedValue(ok(mockTag)),
      findBySlug: vi.fn().mockResolvedValue(ok(mockTag)),
      create: vi.fn().mockImplementation((data) => ok({ ...mockTag, ...data, id: 'tag-new' })),
      update: vi.fn().mockImplementation((id, data) => ok({ ...mockTag, id, ...data })),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
      findMany: vi.fn(),
      findActive: vi.fn().mockResolvedValue(ok({ items: [mockTag], hasMore: false })),
      deactivate: vi.fn().mockImplementation((id) => ok({ ...mockTag, id, isActive: false })),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
    };

    blogService = new BlogService(mockBlogRepo, mockBlogCategoryRepo, mockBlogTagRepo);
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
      const result = await blogService.restorePost('blog-1', 'draft');
      expect(result.success).toBe(true);
      expect(mockBlogRepo.restore).toHaveBeenCalledWith('blog-1', 'draft');
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

    it('lists featured blog posts', async () => {
      const result = await blogService.listFeaturedPosts(3);
      expect(result.success).toBe(true);
      expect(mockBlogRepo.listFeatured).toHaveBeenCalledWith(3);
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

  describe('6. Blog Categories Taxonomy Management', () => {
    it('creates a new blog category', async () => {
      const input: CreateBlogCategoryDto = {
        name: 'Devlogs & Releases',
        slug: 'devlogs-releases',
        description: 'Changelogs and development progress updates.',
        orderIndex: 1,
        isActive: true,
      };

      const result = await blogService.createCategory(input);
      expect(result.success).toBe(true);
      expect(mockBlogCategoryRepo.create).toHaveBeenCalledWith(input);
    });

    it('rejects duplicate blog category slug', async () => {
      vi.spyOn(mockBlogCategoryRepo, 'checkSlugUnique').mockResolvedValue(ok(false));

      const result = await blogService.createCategory({
        name: 'Engineering',
        slug: 'engineering',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('updates and deactivates blog category', async () => {
      const updateResult = await blogService.updateCategory('cat-eng', {
        name: 'Core Engineering',
      });
      expect(updateResult.success).toBe(true);
      expect(mockBlogCategoryRepo.update).toHaveBeenCalledWith('cat-eng', {
        name: 'Core Engineering',
      });

      const deactResult = await blogService.deactivateCategory('cat-eng');
      expect(deactResult.success).toBe(true);
      expect(mockBlogCategoryRepo.deactivate).toHaveBeenCalledWith('cat-eng');
    });

    it('lists active blog categories', async () => {
      const result = await blogService.listActiveCategories();
      expect(result.success).toBe(true);
      expect(mockBlogCategoryRepo.findActive).toHaveBeenCalled();
    });
  });

  describe('7. Blog Tags Taxonomy Management', () => {
    it('creates a new blog tag', async () => {
      const input: CreateBlogTagDto = {
        name: 'TypeScript',
        slug: 'typescript',
        description: 'Type-safe JavaScript development.',
        isActive: true,
      };

      const result = await blogService.createTag(input);
      expect(result.success).toBe(true);
      expect(mockBlogTagRepo.create).toHaveBeenCalledWith(input);
    });

    it('rejects duplicate blog tag slug', async () => {
      vi.spyOn(mockBlogTagRepo, 'checkSlugUnique').mockResolvedValue(ok(false));

      const result = await blogService.createTag({
        name: 'Performance',
        slug: 'performance',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('updates and deactivates blog tag', async () => {
      const updateResult = await blogService.updateTag('tag-perf', {
        name: 'Web Performance',
      });
      expect(updateResult.success).toBe(true);
      expect(mockBlogTagRepo.update).toHaveBeenCalledWith('tag-perf', {
        name: 'Web Performance',
      });

      const deactResult = await blogService.deactivateTag('tag-perf');
      expect(deactResult.success).toBe(true);
      expect(mockBlogTagRepo.deactivate).toHaveBeenCalledWith('tag-perf');
    });

    it('lists active blog tags', async () => {
      const result = await blogService.listActiveTags();
      expect(result.success).toBe(true);
      expect(mockBlogTagRepo.findActive).toHaveBeenCalled();
    });
  });
});
