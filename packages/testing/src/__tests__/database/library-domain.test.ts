import { describe, it, expect, vi } from 'vitest';
import { LibraryService, LibraryRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type { LibraryItem, UserLibraryResult } from '@elsesourav/types';

describe('User Library Domain Service & Security', () => {
  const mockLibraryItem: LibraryItem = {
    id: 'lib-1',
    userId: 'user-123',
    appId: 'app-1',
    isFavorite: false,
    isPinned: false,
    addedAt: 1704067200000,
    app: {
      id: 'app-1',
      slug: 'terminal-pro',
      name: 'Terminal Pro',
      shortDescription: 'Hardware accelerated terminal',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
      primaryCategory: 'Developer Tools',
      categorySlug: 'dev-tools',
      platforms: ['web'],
      isFeatured: true,
      isPinned: false,
      sortOrder: 1,
    },
  };

  const mockLibraryResult: UserLibraryResult = {
    items: [mockLibraryItem],
    totalCount: 1,
  };

  describe('Authentication & Authorization Boundaries', () => {
    it('rejects anonymous save attempts with unauthorized error', async () => {
      const mockRepo = {
        saveApp: vi.fn(),
      } as unknown as LibraryRepository;

      const service = new LibraryService(mockRepo);

      await expect(service.saveApp(undefined, { appId: 'app-1' })).rejects.toThrowError(AppError);
    });

    it('rejects anonymous library query with unauthorized error', async () => {
      const mockRepo = {
        getUserLibrary: vi.fn(),
      } as unknown as LibraryRepository;

      const service = new LibraryService(mockRepo);

      await expect(service.getUserLibrary('')).rejects.toThrowError(AppError);
    });

    it('returns false for isAppSaved when caller is anonymous', async () => {
      const mockRepo = {
        isAppSaved: vi.fn(),
      } as unknown as LibraryRepository;

      const service = new LibraryService(mockRepo);
      const isSaved = await service.isAppSaved(undefined, 'app-1');

      expect(isSaved).toBe(false);
      expect(mockRepo.isAppSaved).not.toHaveBeenCalled();
    });
  });

  describe('Library Mutations & Ownership', () => {
    it('saves app successfully for authenticated user', async () => {
      const mockRepo = {
        saveApp: vi.fn().mockResolvedValue(mockLibraryItem),
      } as unknown as LibraryRepository;

      const service = new LibraryService(mockRepo);
      const result = await service.saveApp('user-123', { appId: 'app-1' });

      expect(result.isSaved).toBe(true);
      expect(result.appId).toBe('app-1');
      expect(mockRepo.saveApp).toHaveBeenCalledWith('user-123', { appId: 'app-1' });
    });

    it('unsaves app successfully for authenticated user', async () => {
      const mockRepo = {
        unsaveApp: vi.fn().mockResolvedValue(true),
      } as unknown as LibraryRepository;

      const service = new LibraryService(mockRepo);
      const result = await service.unsaveApp('user-123', 'app-1');

      expect(result.isSaved).toBe(false);
      expect(result.appId).toBe('app-1');
      expect(mockRepo.unsaveApp).toHaveBeenCalledWith('user-123', 'app-1');
    });

    it('retrieves personal user library scoped exclusively to caller user id', async () => {
      const mockRepo = {
        getUserLibrary: vi.fn().mockResolvedValue(mockLibraryResult),
      } as unknown as LibraryRepository;

      const service = new LibraryService(mockRepo);
      const library = await service.getUserLibrary('user-123', { limit: 20 });

      expect(library.totalCount).toBe(1);
      expect(library.items[0]?.userId).toBe('user-123');
      expect(mockRepo.getUserLibrary).toHaveBeenCalledWith('user-123', { limit: 20 });
    });
  });
});
