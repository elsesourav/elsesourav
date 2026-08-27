import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppService } from '../app.service';
import type { IAppRepository, CreateAppDto } from '@/repositories';
import type { App, AppLink } from '@/types/app.types';
import { ok } from '@/lib/result';
import { createAppSchema, appLinkSchema } from '@/schemas/app.schema';

describe('AppService & Core Application System', () => {
  let mockAppRepo: IAppRepository;
  let appService: AppService;

  const mockLinks: AppLink[] = [
    {
      id: 'link-web-1',
      appId: 'app-1',
      platform: 'web',
      label: 'Open Web App',
      url: 'https://calc.elsesourav.com',
      action: 'open_app',
      isPrimary: true,
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 'link-chrome-1',
      appId: 'app-1',
      platform: 'chrome',
      label: 'Add to Chrome',
      url: 'https://chromewebstore.google.com/detail/123',
      action: 'add_to_chrome',
      isPrimary: false,
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 'link-github-1',
      appId: 'app-1',
      platform: 'github',
      label: 'View Source',
      url: 'https://github.com/elsesourav/calc',
      action: 'view_on_github',
      isPrimary: false,
      displayOrder: 3,
      isActive: true,
    },
  ];

  const mockApp: App = {
    id: 'app-1',
    slug: 'scientific-calculator',
    name: 'Scientific Calculator',
    shortDescription: 'Fast, minimal scientific calculator for web and Chrome.',
    description: 'A full-featured scientific calculator with keyboard navigation and graphing.',
    iconUrl: 'https://elsesourav.com/icons/calc.png',
    featuredImageUrl: 'https://elsesourav.com/banners/calc.png',
    screenshots: [
      'https://elsesourav.com/screens/calc-1.png',
      'https://elsesourav.com/screens/calc-2.png',
    ],
    demoUrl: 'https://calc.elsesourav.com',
    primaryCategory: 'utilities',
    tags: ['calculator', 'math', 'tools'],
    status: 'published',
    platforms: ['web', 'chrome', 'github'],
    links: mockLinks,
    currentVersion: '1.2.0',
    stats: {
      views: 120,
      launches: 450,
      libraryAdds: 35,
      ratingAverage: 4.8,
      ratingCount: 12,
    },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    publishedAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    mockAppRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      publish: vi.fn(),
      unpublish: vi.fn(),
      archive: vi.fn(),
      listPublished: vi.fn(),
      listFeatured: vi.fn(),
      listLatest: vi.fn(),
      listByCategory: vi.fn(),
      listByTag: vi.fn(),
      checkSlugUnique: vi.fn(),
    } as unknown as IAppRepository;

    appService = new AppService(mockAppRepo);
  });

  describe('1. App Creation and Validation', () => {
    it('creates a valid application when slug is unique', async () => {
      const createDto: CreateAppDto = {
        slug: 'scientific-calculator',
        name: 'Scientific Calculator',
        shortDescription: 'Fast, minimal scientific calculator for web and Chrome.',
        description: 'A full-featured scientific calculator with keyboard navigation and graphing.',
        iconUrl: 'https://elsesourav.com/icons/calc.png',
        primaryCategory: 'utilities',
        tags: ['calculator', 'math', 'tools'],
        status: 'draft',
        platforms: ['web', 'chrome'],
        links: mockLinks,
        screenshots: ['https://elsesourav.com/screens/calc-1.png'],
        stats: { views: 0, launches: 0, libraryAdds: 0 },
        isFeatured: false,
        isPinned: false,
        sortOrder: 0,
      };

      vi.mocked(mockAppRepo.checkSlugUnique).mockResolvedValue(ok(true));
      vi.mocked(mockAppRepo.create).mockResolvedValue(ok({ ...mockApp, ...createDto }));

      const result = await appService.createApp(createDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe('scientific-calculator');
        expect(result.data.name).toBe('Scientific Calculator');
      }
      expect(mockAppRepo.checkSlugUnique).toHaveBeenCalledWith('scientific-calculator');
      expect(mockAppRepo.create).toHaveBeenCalledWith(createDto);
    });

    it('rejects app creation when slug already exists', async () => {
      const createDto: CreateAppDto = {
        slug: 'scientific-calculator',
        name: 'Scientific Calculator',
        shortDescription: 'Fast, minimal scientific calculator.',
        description: 'Full description.',
        iconUrl: 'https://elsesourav.com/icons/calc.png',
        primaryCategory: 'utilities',
        tags: ['calculator'],
        status: 'draft',
        platforms: ['web'],
        links: [],
        screenshots: [],
        stats: { views: 0, launches: 0, libraryAdds: 0 },
        isFeatured: false,
        isPinned: false,
        sortOrder: 0,
      };

      vi.mocked(mockAppRepo.checkSlugUnique).mockResolvedValue(ok(false));

      const result = await appService.createApp(createDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('BAD_REQUEST');
        expect(result.error.message).toContain('already exists');
      }
      expect(mockAppRepo.create).not.toHaveBeenCalled();
    });

    it('rejects invalid app schema with malformed slug or missing required fields', () => {
      const invalidApp = {
        slug: 'INVALID SLUG WITH SPACES',
        name: '',
        iconUrl: 'not-a-valid-url',
        platforms: [], // min 1 required
      };

      const parsed = createAppSchema.safeParse(invalidApp);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const errorFields = parsed.error.issues.map((e) => e.path[0]);
        expect(errorFields).toContain('slug');
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('shortDescription');
        expect(errorFields).toContain('iconUrl');
        expect(errorFields).toContain('platforms');
      }
    });
  });

  describe('2. Multi-Destination Platform Links Validation', () => {
    it('validates multi-destination platform links schema', () => {
      const validLink = {
        id: 'link-1',
        appId: 'app-1',
        platform: 'android',
        label: 'Google Play Store',
        url: 'https://play.google.com/store/apps/details?id=com.elsesourav.calc',
        action: 'get_on_play_store',
        isPrimary: true,
        displayOrder: 1,
        isActive: true,
      };

      const parsed = appLinkSchema.safeParse(validLink);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid destination URL in platform link', () => {
      const invalidLink = {
        id: 'link-1',
        appId: 'app-1',
        platform: 'android',
        label: 'Google Play',
        url: 'invalid-uri-scheme',
        displayOrder: 1,
        isActive: true,
      };

      const parsed = appLinkSchema.safeParse(invalidLink);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.path[0]).toBe('url');
      }
    });
  });

  describe('3. Retrieval by ID and Slug', () => {
    it('retrieves app by document ID', async () => {
      vi.mocked(mockAppRepo.findById).mockResolvedValue(ok(mockApp));

      const result = await appService.getAppById('app-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.id).toBe('app-1');
        expect(result.data?.name).toBe('Scientific Calculator');
      }
    });

    it('retrieves app by slug', async () => {
      vi.mocked(mockAppRepo.findBySlug).mockResolvedValue(ok(mockApp));

      const result = await appService.getAppBySlug('scientific-calculator');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.slug).toBe('scientific-calculator');
      }
      expect(mockAppRepo.findBySlug).toHaveBeenCalledWith('scientific-calculator');
    });
  });

  describe('4. Lifecycle & Publishing Transitions', () => {
    it('publishes app and updates publishedAt timestamp', async () => {
      const publishedApp: App = {
        ...mockApp,
        status: 'published',
        publishedAt: Date.now(),
      };

      vi.mocked(mockAppRepo.publish).mockResolvedValue(ok(publishedApp));

      const result = await appService.publishApp('app-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('published');
        expect(result.data.publishedAt).toBeDefined();
      }
      expect(mockAppRepo.publish).toHaveBeenCalledWith('app-1');
    });

    it('unpublishes app to draft status', async () => {
      const unpublishedApp: App = {
        ...mockApp,
        status: 'draft',
      };

      vi.mocked(mockAppRepo.unpublish).mockResolvedValue(ok(unpublishedApp));

      const result = await appService.unpublishApp('app-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft');
      }
      expect(mockAppRepo.unpublish).toHaveBeenCalledWith('app-1');
    });

    it('archives app to archived status', async () => {
      const archivedApp: App = {
        ...mockApp,
        status: 'archived',
        archivedAt: Date.now(),
      };

      vi.mocked(mockAppRepo.archive).mockResolvedValue(ok(archivedApp));

      const result = await appService.archiveApp('app-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('archived');
        expect(result.data.archivedAt).toBeDefined();
      }
      expect(mockAppRepo.archive).toHaveBeenCalledWith('app-1');
    });
  });

  describe('5. Public Listing & Cursor Pagination', () => {
    it('lists published apps with cursor-based pagination', async () => {
      const paginatedResult = {
        items: [mockApp],
        hasMore: true,
        nextCursor: 'cursor-token-abc',
      };

      vi.mocked(mockAppRepo.listPublished).mockResolvedValue(ok(paginatedResult));

      const result = await appService.listPublishedApps({ limit: 10 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.items[0]?.status).toBe('published');
        expect(result.data.hasMore).toBe(true);
        expect(result.data.nextCursor).toBe('cursor-token-abc');
      }
      expect(mockAppRepo.listPublished).toHaveBeenCalledWith({ limit: 10 });
    });

    it('lists featured published apps', async () => {
      vi.mocked(mockAppRepo.listFeatured).mockResolvedValue(
        ok({
          items: [mockApp],
          hasMore: false,
        })
      );

      const result = await appService.listFeaturedApps(6);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items[0]?.isFeatured).toBe(true);
      }
      expect(mockAppRepo.listFeatured).toHaveBeenCalledWith(6);
    });

    it('lists apps by category and tag', async () => {
      vi.mocked(mockAppRepo.listByCategory).mockResolvedValue(
        ok({
          items: [mockApp],
          hasMore: false,
        })
      );
      vi.mocked(mockAppRepo.listByTag).mockResolvedValue(
        ok({
          items: [mockApp],
          hasMore: false,
        })
      );

      const catResult = await appService.listAppsByCategory('utilities');
      expect(catResult.success).toBe(true);

      const tagResult = await appService.listAppsByTag('tools');
      expect(tagResult.success).toBe(true);
    });
  });
});
