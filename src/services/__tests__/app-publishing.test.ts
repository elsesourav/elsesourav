import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppService } from '../app.service';
import type { IAppRepository, CreateAppDto } from '@/repositories';
import type { App, AppLink } from '@/types/app.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { publishAppValidationSchema } from '@/schemas/app.schema';

describe('App Publishing Workflow & Lifecycle State Machine', () => {
  let mockAppRepo: IAppRepository;
  let appService: AppService;

  const mockLinks: AppLink[] = [
    {
      id: 'link-1',
      appId: 'app-calc',
      platform: 'web',
      label: 'Launch Web App',
      url: 'https://calc.elsesourav.com',
      action: 'open_app',
      isPrimary: true,
      displayOrder: 1,
      isActive: true,
    },
  ];

  const mockDraftApp: App = {
    id: 'app-calc',
    slug: 'scientific-calculator',
    name: 'Scientific Calculator',
    shortDescription: 'Minimal scientific calculator.',
    description: 'A full-featured scientific calculator with graphing capabilities.',
    iconUrl: 'https://cdn.elsesourav.com/apps/calc/icon.png',
    screenshots: ['https://cdn.elsesourav.com/apps/calc/screen1.png'],
    primaryCategory: 'utilities',
    tags: ['calculator', 'math'],
    status: 'draft',
    platforms: ['web'],
    links: mockLinks,
    stats: { views: 0, launches: 0, libraryAdds: 0 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 0,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockPublishedApp: App = {
    ...mockDraftApp,
    status: 'published',
    publishedAt: 1700050000000,
    updatedAt: 1700050000000,
  };

  const mockArchivedApp: App = {
    ...mockDraftApp,
    status: 'archived',
    archivedAt: 1700090000000,
    updatedAt: 1700090000000,
  };

  beforeEach(() => {
    mockAppRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      createDraft: vi.fn(),
      update: vi.fn(),
      updateDraft: vi.fn(),
      validateForPublish: vi.fn(),
      publish: vi.fn(),
      unpublish: vi.fn(),
      archive: vi.fn(),
      restore: vi.fn(),
      listPublished: vi.fn(),
      listFeatured: vi.fn(),
      listLatest: vi.fn(),
      listByCategory: vi.fn(),
      listByTag: vi.fn(),
      checkSlugUnique: vi.fn(),
      delete: vi.fn(),
    };

    appService = new AppService(mockAppRepo);
  });

  describe('1. Draft Creation & Private Retrieval', () => {
    it('creates draft app with status set to draft', async () => {
      const createDto: CreateAppDto = {
        slug: 'scientific-calculator',
        name: 'Scientific Calculator',
        shortDescription: 'Minimal scientific calculator.',
        description: 'Full description.',
        iconUrl: 'https://cdn.elsesourav.com/apps/calc/icon.png',
        primaryCategory: 'utilities',
        platforms: ['web'],
        tags: ['calculator'],
        links: mockLinks,
        screenshots: [],
        status: 'draft',
        stats: { views: 0, launches: 0, libraryAdds: 0 },
        isFeatured: false,
        isPinned: false,
        sortOrder: 0,
      };

      vi.mocked(mockAppRepo.checkSlugUnique).mockResolvedValue(ok(true));
      vi.mocked(mockAppRepo.createDraft).mockResolvedValue(ok(mockDraftApp));

      const result = await appService.createDraft(createDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft');
        expect(result.data.publishedAt).toBeUndefined();
      }
      expect(mockAppRepo.createDraft).toHaveBeenCalled();
    });

    it('retrieves draft app by ID for administration', async () => {
      vi.mocked(mockAppRepo.findById).mockResolvedValue(ok(mockDraftApp));

      const result = await appService.getAppById('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.status).toBe('draft');
      }
    });

    it('excludes draft apps from public listPublished query', async () => {
      vi.mocked(mockAppRepo.listPublished).mockResolvedValue(
        ok({
          items: [mockPublishedApp],
          hasMore: false,
        })
      );

      const result = await appService.listPublishedApps();

      expect(result.success).toBe(true);
      if (result.success) {
        const statuses = result.data.items.map((i) => i.status);
        expect(statuses).not.toContain('draft');
        expect(statuses).not.toContain('archived');
      }
    });
  });

  describe('2. Publication Validation Requirements', () => {
    it('validates a complete and publishable app', () => {
      const parsed = publishAppValidationSchema.safeParse(mockDraftApp);
      expect(parsed.success).toBe(true);
    });

    it('rejects publication when required information is missing', () => {
      const invalidApp = {
        ...mockDraftApp,
        name: '',
        iconUrl: 'not-a-valid-url',
        links: [], // No platform links
      };

      const parsed = publishAppValidationSchema.safeParse(invalidApp);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => i.path[0]);
        expect(issues).toContain('name');
        expect(issues).toContain('iconUrl');
        expect(issues).toContain('links');
      }
    });

    it('rejects publication when all platform links are inactive', () => {
      const appWithInactiveLinks = {
        ...mockDraftApp,
        links: [
          {
            ...mockLinks[0]!,
            isActive: false,
          },
        ],
      };

      const parsed = publishAppValidationSchema.safeParse(appWithInactiveLinks);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toContain('active platform link');
      }
    });
  });

  describe('3. Publishing & Unpublishing Transitions', () => {
    it('publishes app, setting publishedAt and status to published', async () => {
      vi.mocked(mockAppRepo.publish).mockResolvedValue(ok(mockPublishedApp));

      const result = await appService.publishApp('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('published');
        expect(result.data.publishedAt).toBeDefined();
      }
      expect(mockAppRepo.publish).toHaveBeenCalledWith('app-calc');
    });

    it('returns validation error if publication validation fails', async () => {
      vi.mocked(mockAppRepo.publish).mockResolvedValue(
        err(AppError.badRequest('Publication validation failed: iconUrl is missing', 'iconUrl'))
      );

      const result = await appService.publishApp('app-calc');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('BAD_REQUEST');
        expect(result.error.message).toContain('Publication validation failed');
      }
    });

    it('unpublishes app to draft state while preserving history and links', async () => {
      const unpublishedApp: App = {
        ...mockPublishedApp,
        status: 'draft',
        updatedAt: Date.now(),
      };

      vi.mocked(mockAppRepo.unpublish).mockResolvedValue(ok(unpublishedApp));

      const result = await appService.unpublishApp('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft');
        // Published timestamp preserved for historical release auditing
        expect(result.data.publishedAt).toBe(1700050000000);
        expect(result.data.links).toHaveLength(1);
      }
      expect(mockAppRepo.unpublish).toHaveBeenCalledWith('app-calc');
    });
  });

  describe('4. Archiving & Restoring Workflows', () => {
    it('archives an app and sets archivedAt timestamp', async () => {
      vi.mocked(mockAppRepo.archive).mockResolvedValue(ok(mockArchivedApp));

      const result = await appService.archiveApp('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('archived');
        expect(result.data.archivedAt).toBeDefined();
      }
      expect(mockAppRepo.archive).toHaveBeenCalledWith('app-calc');
    });

    it('restores an archived app back to draft state', async () => {
      const restoredDraft: App = {
        ...mockArchivedApp,
        status: 'draft',
        archivedAt: undefined,
        updatedAt: Date.now(),
      };

      vi.mocked(mockAppRepo.restore).mockResolvedValue(ok(restoredDraft));

      const result = await appService.restoreApp('app-calc', 'draft');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft');
        expect(result.data.archivedAt).toBeUndefined();
      }
      expect(mockAppRepo.restore).toHaveBeenCalledWith('app-calc', 'draft');
    });

    it('restores an archived app directly to published state after validation', async () => {
      const restoredPublished: App = {
        ...mockArchivedApp,
        status: 'published',
        archivedAt: undefined,
        updatedAt: Date.now(),
      };

      vi.mocked(mockAppRepo.restore).mockResolvedValue(ok(restoredPublished));

      const result = await appService.restoreApp('app-calc', 'published');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('published');
      }
      expect(mockAppRepo.restore).toHaveBeenCalledWith('app-calc', 'published');
    });
  });
});
