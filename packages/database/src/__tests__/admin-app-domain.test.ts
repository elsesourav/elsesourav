import { describe, it, expect, vi } from 'vitest';
import { AppService, AppRepository } from '../index';
import { AppError } from '@elsesourav/types';
import type { App } from '@elsesourav/types';

describe('Admin Applications Domain & Security Boundary', () => {
  const mockApp: App = {
    id: 'app-terminal',
    name: 'Developer Terminal Pro',
    slug: 'developer-terminal-pro',
    shortDescription: 'High performance web terminal with zsh support.',
    description: 'Comprehensive documentation and terminal features.',
    iconUrl: 'https://res.cloudinary.com/demo/image/upload/terminal.png',
    primaryCategory: 'Developer Tools',
    categoryId: 'cat-dev-tools',
    tags: ['terminal', 'cli'],
    status: 'draft',
    platforms: ['web', 'macos', 'linux'],
    links: [],
    screenshots: [],
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    stats: {
      views: 0,
      launches: 0,
      libraryAdds: 0,
    },
    createdAt: 1704067000000,
    updatedAt: 1704067000000,
  };

  // ==========================================
  // Admin Operations (ADMIN / STAFF role)
  // ==========================================

  it('allows ADMIN to create a new application', async () => {
    const mockRepo = {
      create: vi.fn().mockResolvedValue(mockApp),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);
    const created = await service.createApp('ADMIN', {
      name: 'Developer Terminal Pro',
      slug: 'Developer-Terminal-Pro',
      shortDescription: 'High performance web terminal with zsh support.',
      description: 'Comprehensive documentation and terminal features.',
      iconUrl: 'https://res.cloudinary.com/demo/image/upload/terminal.png',
      categoryId: 'cat-dev-tools',
    });

    expect(created.id).toBe('app-terminal');
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Developer Terminal Pro',
        slug: 'developer-terminal-pro', // verified normalized lowercase
      })
    );
  });

  it('allows STAFF to update an application', async () => {
    const mockRepo = {
      update: vi.fn().mockResolvedValue({ ...mockApp, name: 'Updated Name' }),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);
    const updated = await service.updateApp('STAFF', 'app-terminal', {
      name: 'Updated Name',
    });

    expect(updated.name).toBe('Updated Name');
    expect(mockRepo.update).toHaveBeenCalledWith('app-terminal', { name: 'Updated Name' });
  });

  it('allows ADMIN to publish an application with release version', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockApp),
      publishWithVersionTransaction: vi.fn().mockResolvedValue({
        ...mockApp,
        status: 'published',
        currentVersion: '1.0.0',
      }),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);
    const published = await service.publishApp('ADMIN', 'app-terminal', {
      version: '1.0.0',
      changelog: 'Initial public release.',
    });

    expect(published.status).toBe('published');
    expect(published.currentVersion).toBe('1.0.0');
    expect(mockRepo.publishWithVersionTransaction).toHaveBeenCalledWith('app-terminal', {
      version: '1.0.0',
      changelog: 'Initial public release.',
    });
  });

  it('allows ADMIN to archive an application', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockApp),
      updateStatus: vi.fn().mockResolvedValue({ ...mockApp, status: 'archived' }),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);
    const archived = await service.archiveApp('ADMIN', 'app-terminal');

    expect(archived.status).toBe('archived');
  });

  it('allows ADMIN to delete an application', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockApp),
      softDelete: vi.fn().mockResolvedValue(undefined),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);
    await service.deleteApp('ADMIN', 'app-terminal');

    expect(mockRepo.softDelete).toHaveBeenCalledWith('app-terminal');
  });

  // ==========================================
  // Security Boundaries: Normal USER Rejection
  // ==========================================

  it('strictly blocks normal USER from creating an application (Throws 403 Forbidden)', async () => {
    const mockRepo = { create: vi.fn() } as unknown as AppRepository;
    const service = new AppService(mockRepo);

    await expect(
      service.createApp('USER', {
        name: 'Hacked App',
        slug: 'hacked-app',
        shortDescription: 'Short desc',
        description: 'Long description here',
        iconUrl: 'https://example.com/icon.png',
        categoryId: 'cat-1',
      })
    ).rejects.toThrowError(AppError);

    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('strictly blocks normal USER from publishing an application', async () => {
    const mockRepo = {
      findById: vi.fn(),
      publishWithVersionTransaction: vi.fn(),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);

    await expect(
      service.publishApp('USER', 'app-terminal', {
        version: '1.0.0',
        changelog: 'Unauthorized release',
      })
    ).rejects.toThrowError(AppError);
  });

  it('strictly blocks normal USER from deleting an application', async () => {
    const mockRepo = {
      findById: vi.fn(),
      softDelete: vi.fn(),
    } as unknown as AppRepository;

    const service = new AppService(mockRepo);

    await expect(
      service.deleteApp('USER', 'app-terminal')
    ).rejects.toThrowError(AppError);
  });
});
