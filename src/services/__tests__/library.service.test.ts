import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserLibraryService } from '../library.service';
import type { IUserRepository, IAppRepository } from '@/repositories';
import type { UserLibraryItem } from '@/types/user.types';
import type { App } from '@/types/app.types';
import { ok } from '@/lib/result';
import { analyticsService } from '@/services/analytics.service';

vi.mock('@/services/analytics.service', () => ({
  analyticsService: {
    trackLibraryAdd: vi.fn().mockResolvedValue(undefined),
    trackLibraryRemove: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('UserLibraryService & User App Library System', () => {
  let mockUserRepo: IUserRepository;
  let mockAppRepo: IAppRepository;
  let libraryService: UserLibraryService;

  const mockLibraryItem: UserLibraryItem = {
    id: 'app-calc',
    userId: 'user-123',
    appId: 'app-calc',
    isFavorite: true,
    isPinned: false,
    customNotes: 'Essential graphing calculator',
    addedAt: 1700000000000,
    lastOpenedAt: 1700000000000,
  };

  const mockPublishedApp: App = {
    id: 'app-calc',
    slug: 'scientific-calculator',
    name: 'Scientific Calculator',
    shortDescription: 'Calculator app.',
    description: 'Full description.',
    iconUrl: 'https://cdn.elsesourav.com/apps/calc/icon.png',
    screenshots: [],
    primaryCategory: 'utilities',
    tags: ['calculator'],
    status: 'published',
    platforms: ['web'],
    links: [],
    stats: { views: 0, launches: 0, libraryAdds: 0 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 0,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockArchivedApp: App = {
    ...mockPublishedApp,
    id: 'app-legacy',
    status: 'archived',
  };

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      ensureProfile: vi.fn(),
      updateProfile: vi.fn(),
      updatePreferences: vi.fn(),
      softDelete: vi.fn(),
      getUserLibrary: vi.fn().mockResolvedValue(
        ok({
          items: [mockLibraryItem],
          hasMore: false,
        })
      ),
      getLibrary: vi.fn().mockResolvedValue(
        ok({
          items: [mockLibraryItem],
          hasMore: false,
        })
      ),
      addToLibrary: vi.fn().mockResolvedValue(ok(mockLibraryItem)),
      removeFromLibrary: vi.fn().mockResolvedValue(ok(undefined)),
      isInLibrary: vi.fn().mockResolvedValue(ok(true)),
      getLibraryCount: vi.fn().mockResolvedValue(ok(1)),
      toggleFavorite: vi.fn().mockResolvedValue(ok(true)),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockAppRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'app-calc') return Promise.resolve(ok(mockPublishedApp));
        if (id === 'app-legacy') return Promise.resolve(ok(mockArchivedApp));
        return Promise.resolve(ok(null));
      }),
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

    libraryService = new UserLibraryService(mockUserRepo, mockAppRepo);
  });

  describe('1. Authenticated Saving & Unauthenticated Rejection', () => {
    it('allows authenticated user to save an app and triggers analytics', async () => {
      const result = await libraryService.saveApp('user-123', 'app-calc', {
        isFavorite: true,
        customNotes: 'Essential graphing calculator',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.appId).toBe('app-calc');
        expect(result.data.userId).toBe('user-123');
      }

      expect(mockUserRepo.addToLibrary).toHaveBeenCalledWith('user-123', {
        appId: 'app-calc',
        isFavorite: true,
        isPinned: false,
        customNotes: 'Essential graphing calculator',
      });

      expect(analyticsService.trackLibraryAdd).toHaveBeenCalledWith('app-calc', 'user-123');
    });

    it('rejects anonymous or unauthenticated users from saving apps', async () => {
      const result = await libraryService.saveApp('', 'app-calc');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
      expect(mockUserRepo.addToLibrary).not.toHaveBeenCalled();
    });

    it('prevents duplicate saves via deterministic doc ID mapping in repository', async () => {
      // Calling saveApp twice with same appId overwrites/updates the deterministic doc ID without duplicate items
      await libraryService.saveApp('user-123', 'app-calc');
      await libraryService.saveApp('user-123', 'app-calc');

      expect(mockUserRepo.addToLibrary).toHaveBeenCalledTimes(2);
      expect(mockUserRepo.addToLibrary).toHaveBeenLastCalledWith(
        'user-123',
        expect.objectContaining({ appId: 'app-calc' })
      );
    });
  });

  describe('2. Removal & Saved State Verification', () => {
    it('allows user to remove saved app and triggers analytics', async () => {
      const result = await libraryService.removeApp('user-123', 'app-calc');

      expect(result.success).toBe(true);
      expect(mockUserRepo.removeFromLibrary).toHaveBeenCalledWith('user-123', 'app-calc');
      expect(analyticsService.trackLibraryRemove).toHaveBeenCalledWith('app-calc', 'user-123');
    });

    it('verifies whether an app is already saved in library', async () => {
      const result = await libraryService.isAppSaved('user-123', 'app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
      expect(mockUserRepo.isInLibrary).toHaveBeenCalledWith('user-123', 'app-calc');
    });

    it('toggles save status from saved to removed', async () => {
      vi.mocked(mockUserRepo.isInLibrary).mockResolvedValue(ok(true));

      const result = await libraryService.toggleSave('user-123', 'app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isSaved).toBe(false);
      }
      expect(mockUserRepo.removeFromLibrary).toHaveBeenCalledWith('user-123', 'app-calc');
    });
  });

  describe('3. Cursor-based Pagination & Enriched Resolution', () => {
    it('returns paginated library items with cursor information', async () => {
      vi.mocked(mockUserRepo.getUserLibrary).mockResolvedValue(
        ok({
          items: [mockLibraryItem],
          hasMore: true,
          nextCursor: 'app-calc',
        })
      );

      const result = await libraryService.getUserLibrary('user-123', { limit: 1 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.hasMore).toBe(true);
        expect(result.data.nextCursor).toBe('app-calc');
      }
    });

    it('preserves archived/unpublished apps in enriched library and marks them unavailable', async () => {
      const archivedItem: UserLibraryItem = {
        ...mockLibraryItem,
        id: 'app-legacy',
        appId: 'app-legacy',
      };

      vi.mocked(mockUserRepo.getUserLibrary).mockResolvedValue(
        ok({
          items: [mockLibraryItem, archivedItem],
          hasMore: false,
        })
      );

      const result = await libraryService.getEnrichedLibrary('user-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(2);
        // First item is published app -> available
        expect(result.data.items[0]?.isUnavailable).toBe(false);
        expect(result.data.items[0]?.app?.status).toBe('published');

        // Second item is archived app -> preserved but unavailable
        expect(result.data.items[1]?.isUnavailable).toBe(true);
        expect(result.data.items[1]?.app?.status).toBe('archived');
      }
    });
  });
});
