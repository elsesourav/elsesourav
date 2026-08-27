import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelpService } from '../help.service';
import type {
  IHelpCategoryRepository,
  IHelpArticleRepository,
  IHelpArticleFeedbackRepository,
} from '@/repositories/interfaces';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { ok } from '@/lib/result';

describe('HelpService Domain Logic & QC', () => {
  let mockCategoryRepo: IHelpCategoryRepository;
  let mockArticleRepo: IHelpArticleRepository;
  let mockFeedbackRepo: IHelpArticleFeedbackRepository;
  let service: HelpService;

  const mockCategory: HelpCategory = {
    id: 'cat-general',
    name: 'General & Account',
    slug: 'general-account',
    description: 'Account settings, authentication, and basic FAQs.',
    icon: 'user',
    orderIndex: 0,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockArticle: HelpArticle = {
    id: 'art-reset-password',
    categoryId: 'cat-general',
    title: 'How to Reset Your Account Password',
    slug: 'how-to-reset-password',
    excerpt: 'Step-by-step instructions for resetting your password.',
    content: '## Resetting Password\n\n1. Go to settings\n2. Click reset\n3. Check email.',
    status: 'published',
    orderIndex: 0,
    featured: true,
    viewsCount: 200,
    helpfulCount: 45,
    unhelpfulCount: 2,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700001000000,
  };

  beforeEach(() => {
    mockCategoryRepo = {
      findById: vi.fn().mockResolvedValue(ok(mockCategory)),
      findBySlug: vi.fn().mockResolvedValue(ok(null)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [mockCategory], hasMore: false })),
      create: vi.fn().mockImplementation((dto) =>
        Promise.resolve(
          ok({
            ...dto,
            id: 'new-cat-id',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      ),
      update: vi.fn().mockImplementation((id, dto) =>
        Promise.resolve(
          ok({
            ...mockCategory,
            ...dto,
            id,
            updatedAt: Date.now(),
          })
        )
      ),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
      listActive: vi.fn().mockResolvedValue(ok({ items: [mockCategory], hasMore: false })),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
    };

    mockArticleRepo = {
      findById: vi.fn().mockResolvedValue(ok(mockArticle)),
      findBySlug: vi.fn().mockResolvedValue(ok(mockArticle)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      create: vi.fn(),
      update: vi.fn().mockImplementation((id, dto) =>
        Promise.resolve(
          ok({
            ...mockArticle,
            ...dto,
            id,
            updatedAt: Date.now(),
          })
        )
      ),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
      createDraft: vi.fn().mockImplementation((dto) =>
        Promise.resolve(
          ok({
            ...dto,
            id: 'new-art-id',
            status: 'draft',
            viewsCount: 0,
            helpfulCount: 0,
            unhelpfulCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      ),
      publish: vi.fn().mockImplementation((id) =>
        Promise.resolve(
          ok({
            ...mockArticle,
            id,
            status: 'published',
            publishedAt: Date.now(),
          })
        )
      ),
      unpublish: vi.fn().mockImplementation((id) =>
        Promise.resolve(
          ok({
            ...mockArticle,
            id,
            status: 'draft',
          })
        )
      ),
      archive: vi.fn().mockImplementation((id) =>
        Promise.resolve(
          ok({
            ...mockArticle,
            id,
            status: 'archived',
            archivedAt: Date.now(),
          })
        )
      ),
      restore: vi.fn().mockImplementation((id, targetStatus = 'draft') =>
        Promise.resolve(
          ok({
            ...mockArticle,
            id,
            status: targetStatus,
          })
        )
      ),
      listPublished: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      listByCategory: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      listFeatured: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      searchArticles: vi.fn().mockResolvedValue(ok({ items: [mockArticle], hasMore: false })),
      checkSlugUnique: vi.fn().mockResolvedValue(ok(true)),
      incrementHelpfulness: vi.fn().mockResolvedValue(ok(undefined)),
    };

    mockFeedbackRepo = {
      findById: vi.fn().mockResolvedValue(ok(null)),
      findMany: vi.fn().mockResolvedValue(ok({ items: [], hasMore: false })),
      create: vi.fn().mockImplementation((dto) =>
        Promise.resolve(
          ok({
            ...dto,
            id: 'fb-100',
            createdAt: Date.now(),
          })
        )
      ),
      update: vi.fn().mockResolvedValue(ok({})),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
      findByArticleAndUser: vi.fn().mockResolvedValue(ok(null)),
      incrementArticleHelpfulness: vi.fn().mockResolvedValue(ok(undefined)),
    };

    service = new HelpService(mockCategoryRepo, mockArticleRepo, mockFeedbackRepo);
  });

  // =========================================================================
  // Category Tests
  // =========================================================================

  describe('Category Management', () => {
    it('1. Creates a help category with validation and slug check', async () => {
      const res = await service.createCategory({
        name: 'Troubleshooting',
        slug: 'troubleshooting',
        description: 'Fixing common issues.',
        orderIndex: 1,
        isActive: true,
      });

      expect(res.success).toBe(true);
      expect(mockCategoryRepo.checkSlugUnique).toHaveBeenCalledWith('troubleshooting');
      expect(mockCategoryRepo.create).toHaveBeenCalled();
    });

    it('2. Rejects category creation with duplicate slug', async () => {
      vi.mocked(mockCategoryRepo.checkSlugUnique).mockResolvedValueOnce(ok(false));

      const res = await service.createCategory({
        name: 'Troubleshooting',
        slug: 'troubleshooting',
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('CONFLICT');
      }
    });

    it('3. Rejects invalid category input (e.g. invalid slug format)', async () => {
      const res = await service.createCategory({
        name: '',
        slug: 'Invalid Slug with Spaces',
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('4. Updates a category with optional slug verification', async () => {
      const res = await service.updateCategory('cat-general', {
        name: 'Updated General & Accounts',
        slug: 'updated-general',
      });

      expect(res.success).toBe(true);
      expect(mockCategoryRepo.checkSlugUnique).toHaveBeenCalledWith(
        'updated-general',
        'cat-general'
      );
      expect(mockCategoryRepo.update).toHaveBeenCalled();
    });

    it('5. Lists active categories and gets by slug', async () => {
      const listRes = await service.listActiveCategories();
      expect(listRes.success).toBe(true);
      if (listRes.success) {
        expect(listRes.data.items).toHaveLength(1);
      }

      const slugRes = await service.getCategoryBySlug('general-account');
      expect(slugRes.success).toBe(true);
    });
  });

  // =========================================================================
  // Article Tests
  // =========================================================================

  describe('Article Management & Publishing Lifecycle', () => {
    it('6. Creates an article draft when category exists and slug is unique', async () => {
      const res = await service.createDraft({
        categoryId: 'cat-general',
        title: 'How to Download Offline Tools',
        slug: 'how-to-download-offline-tools',
        excerpt: 'Using desktop and offline features.',
        content: '## Downloading\n\nClick the download button.',
        orderIndex: 1,
      });

      expect(res.success).toBe(true);
      expect(mockArticleRepo.createDraft).toHaveBeenCalled();
    });

    it('7. Rejects draft creation when parent category does not exist', async () => {
      vi.mocked(mockCategoryRepo.findById).mockResolvedValueOnce(ok(null));

      const res = await service.createDraft({
        categoryId: 'non-existent-category',
        title: 'Some Article',
        slug: 'some-article',
        content: 'Content here',
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('NOT_FOUND');
      }
    });

    it('8. Rejects draft creation when slug already exists', async () => {
      vi.mocked(mockArticleRepo.checkSlugUnique).mockResolvedValueOnce(ok(false));

      const res = await service.createDraft({
        categoryId: 'cat-general',
        title: 'Duplicate Slug Article',
        slug: 'how-to-reset-password',
        content: 'Content here',
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('CONFLICT');
      }
    });

    it('9. Publishes article after validating content and active parent category', async () => {
      const res = await service.publishArticle('art-reset-password');

      expect(res.success).toBe(true);
      expect(mockArticleRepo.publish).toHaveBeenCalledWith('art-reset-password');
    });

    it('10. Rejects publishing article if parent category is inactive', async () => {
      vi.mocked(mockCategoryRepo.findById).mockResolvedValueOnce(
        ok({
          ...mockCategory,
          isActive: false,
        })
      );

      const res = await service.publishArticle('art-reset-password');

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('BAD_REQUEST');
      }
    });

    it('11. Unpublishes, archives, and restores articles', async () => {
      const unpubRes = await service.unpublishArticle('art-reset-password');
      expect(unpubRes.success).toBe(true);
      expect(mockArticleRepo.unpublish).toHaveBeenCalledWith('art-reset-password');

      const archRes = await service.archiveArticle('art-reset-password');
      expect(archRes.success).toBe(true);
      expect(mockArticleRepo.archive).toHaveBeenCalledWith('art-reset-password');

      const restoreRes = await service.restoreArticle('art-reset-password', 'draft');
      expect(restoreRes.success).toBe(true);
      expect(mockArticleRepo.restore).toHaveBeenCalledWith('art-reset-password', 'draft');
    });

    it('12. Lists published articles, category articles, and featured articles', async () => {
      const pubRes = await service.listPublishedArticles();
      expect(pubRes.success).toBe(true);

      const catRes = await service.listArticlesByCategory('cat-general');
      expect(catRes.success).toBe(true);

      const featRes = await service.listFeaturedArticles(4);
      expect(featRes.success).toBe(true);
    });

    it('13. Search abstraction delegates to article search implementation', async () => {
      const searchRes = await service.searchArticles('reset');
      expect(searchRes.success).toBe(true);
      expect(mockArticleRepo.searchArticles).toHaveBeenCalledWith('reset', undefined);
    });

    it('14. Submits article helpfulness feedback and increments aggregate count', async () => {
      const result = await service.submitHelpfulness({
        articleId: 'art-reset-password',
        helpful: true,
        sessionId: 'sess_123',
      });

      expect(result.success).toBe(true);
      expect(mockFeedbackRepo.create).toHaveBeenCalledWith({
        articleId: 'art-reset-password',
        helpful: true,
        userId: undefined,
        sessionId: 'sess_123',
      });
      expect(mockArticleRepo.incrementHelpfulness).toHaveBeenCalledWith('art-reset-password', true);
    });

    it('15. Prevents duplicate votes from the same user or session', async () => {
      mockFeedbackRepo.findByArticleAndUser = vi.fn().mockResolvedValue(
        ok({
          id: 'existing-vote',
          articleId: 'art-reset-password',
          sessionId: 'sess_123',
          helpful: true,
          createdAt: 100,
        })
      );

      const result = await service.submitHelpfulness({
        articleId: 'art-reset-password',
        helpful: false,
        sessionId: 'sess_123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('16. Rejects helpfulness feedback on draft or non-existent article', async () => {
      mockArticleRepo.findById = vi.fn().mockResolvedValue(
        ok({
          ...mockArticle,
          status: 'draft',
        })
      );

      const result = await service.submitHelpfulness({
        articleId: 'art-reset-password',
        helpful: true,
        sessionId: 'sess_123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('17. Calculates article helpfulness ratio and statistics correctly', async () => {
      mockArticleRepo.findById = vi.fn().mockResolvedValue(
        ok({
          ...mockArticle,
          helpfulCount: 8,
          unhelpfulCount: 2,
        })
      );

      const statsRes = await service.getArticleHelpfulnessStats('art-reset-password');
      expect(statsRes.success).toBe(true);
      if (statsRes.success) {
        expect(statsRes.data.helpfulCount).toBe(8);
        expect(statsRes.data.notHelpfulCount).toBe(2);
        expect(statsRes.data.helpfulnessRatio).toBe(0.8);
      }
    });

    it('18. Verifies hasUserVoted query abstraction', async () => {
      mockFeedbackRepo.findByArticleAndUser = vi.fn().mockResolvedValue(ok(null));

      const hasVotedFalse = await service.hasUserVoted('art-reset-password', {
        sessionId: 'sess_new',
      });
      expect(hasVotedFalse.success).toBe(true);
      if (hasVotedFalse.success) {
        expect(hasVotedFalse.data).toBe(false);
      }
    });
  });
});
