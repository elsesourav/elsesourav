import { describe, it, expect, vi } from 'vitest';
import { AppQueryService, AppRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type { AppListItem, PublicApp } from '@elsesourav/types';

describe('App Read/Query Layer & Public Projections', () => {
  const mockAppListItems: AppListItem[] = [
    {
      id: 'app-1',
      slug: 'terminal-pro',
      name: 'Terminal Pro',
      shortDescription: 'Hardware accelerated terminal',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
      primaryCategory: 'Developer Tools',
      categorySlug: 'dev-tools',
      platforms: ['web', 'macos'],
      isFeatured: true,
      isPinned: false,
      currentVersion: '2.0.0',
      sortOrder: 1,
    },
  ];

  const mockPublicDetail: PublicApp = {
    id: 'app-1',
    slug: 'terminal-pro',
    name: 'Terminal Pro',
    shortDescription: 'Hardware accelerated terminal',
    description: 'Detailed description of the application.',
    iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
    screenshots: [],
    primaryCategory: 'Developer Tools',
    categorySlug: 'dev-tools',
    tags: ['cli', 'terminal'],
    platforms: ['web', 'macos'],
    links: [
      {
        id: 'link-1',
        appId: 'app-1',
        platform: 'web',
        label: 'Open Web App',
        url: 'https://terminal.elsesourav.com',
        displayOrder: 1,
        isActive: true,
      },
    ],
    versions: [
      {
        id: 'v-1',
        appId: 'app-1',
        version: '2.0.0',
        releaseDate: 1704067200000,
        changelog: 'Major update with GPU acceleration',
      },
    ],
    currentVersion: '2.0.0',
    isFeatured: true,
    isPinned: false,
    stats: { views: 500, launches: 200, libraryAdds: 45 },
    updatedAt: 1704067200000,
  };

  describe('Public Listing Queries', () => {
    it('returns public list item projection without internal fields', async () => {
      const mockRepo = {
        listPublic: vi.fn().mockResolvedValue(mockAppListItems),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);
      const items = await queryService.listPublicApps({ limit: 20 });

      expect(items).toHaveLength(1);
      expect(items[0]?.id).toBe('app-1');
      expect(items[0]?.name).toBe('Terminal Pro');
      expect((items[0] as unknown as Record<string, unknown>)['deletedAt']).toBeUndefined();
    });

    it('rejects abusive query limit sizes exceeding max allowable limit', async () => {
      const mockRepo = {
        listPublic: vi.fn(),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);

      await expect(queryService.listPublicApps({ limit: 999999 })).rejects.toThrowError(AppError);
    });

    it('rejects invalid category slugs with path traversal attempts', async () => {
      const mockRepo = {
        listPublic: vi.fn(),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);

      await expect(
        queryService.listPublicApps({ categorySlug: '../../etc/passwd' })
      ).rejects.toThrowError(AppError);
    });
  });

  describe('Public Detail Queries', () => {
    it('returns full public application details by valid slug', async () => {
      const mockRepo = {
        getPublicDetailBySlug: vi.fn().mockResolvedValue(mockPublicDetail),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);
      const app = await queryService.getPublicAppDetail('terminal-pro');

      expect(app.slug).toBe('terminal-pro');
      expect(app.versions).toHaveLength(1);
      expect(app.links).toHaveLength(1);
    });

    it('throws notFound for non-existent or unpublished slugs', async () => {
      const mockRepo = {
        getPublicDetailBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);

      await expect(queryService.getPublicAppDetail('non-existent-slug')).rejects.toThrowError(
        AppError
      );
    });

    it('rejects invalid slug formats before querying database', async () => {
      const mockRepo = {
        getPublicDetailBySlug: vi.fn(),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);

      await expect(queryService.getPublicAppDetail('Invalid_Slug!@#')).rejects.toThrowError(
        AppError
      );
    });
  });

  describe('Search & Discovery Queries', () => {
    it('executes bounded search with query validation', async () => {
      const mockRepo = {
        searchPublic: vi.fn().mockResolvedValue({
          items: mockAppListItems,
          totalCount: 1,
        }),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);
      const result = await queryService.searchPublicApps({
        query: 'terminal',
        sort: 'popularity',
      });

      expect(result.totalCount).toBe(1);
      expect(result.items[0]?.name).toBe('Terminal Pro');
      expect(mockRepo.searchPublic).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'terminal' })
      );
    });

    it('rejects search queries exceeding maximum character length', async () => {
      const mockRepo = {
        searchPublic: vi.fn(),
      } as unknown as AppRepository;

      const queryService = new AppQueryService(mockRepo);

      await expect(
        queryService.searchPublicApps({
          query: 'a'.repeat(100),
        })
      ).rejects.toThrowError(AppError);
    });
  });
});
