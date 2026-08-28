import { describe, it, expect, vi } from 'vitest';
import { AppService, AppRepository } from '../index';
import { AppError } from '@elsesourav/types';
import type { App } from '@elsesourav/types';

describe('Apps Domain Foundation & Authorization Security', () => {
  const mockPublishedApp: App = {
    id: 'app-1',
    slug: 'terminal-pro',
    name: 'Terminal Pro',
    shortDescription: 'Hardware accelerated terminal',
    description: 'A full-featured terminal emulator.',
    iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
    screenshots: [],
    primaryCategory: 'dev-tools',
    tags: ['cli', 'terminal'],
    status: 'published',
    platforms: ['web', 'macos'],
    links: [],
    stats: { views: 100, launches: 50, libraryAdds: 10 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  };

  const mockDraftApp: App = {
    ...mockPublishedApp,
    id: 'app-2',
    slug: 'secret-beta',
    name: 'Secret Beta App',
    status: 'draft',
  };

  describe('Public Visibility Controls', () => {
    it('allows anonymous users to fetch published apps by slug', async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockPublishedApp),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);
      const app = await service.getAppBySlug('terminal-pro');

      expect(app.id).toBe('app-1');
      expect(app.status).toBe('published');
    });

    it('hides draft applications from unauthenticated or regular users', async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockDraftApp),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);

      // Unauthenticated caller
      await expect(service.getAppBySlug('secret-beta')).rejects.toThrowError(AppError);

      // Regular USER caller
      await expect(service.getAppBySlug('secret-beta', 'USER')).rejects.toThrowError(AppError);
    });

    it('allows ADMIN or STAFF to preview draft applications', async () => {
      const mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockDraftApp),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);
      const app = await service.getAppBySlug('secret-beta', 'ADMIN');

      expect(app.id).toBe('app-2');
      expect(app.status).toBe('draft');
    });
  });

  describe('Administrative Operation Security', () => {
    it('rejects app creation by non-admin users', async () => {
      const mockRepo = {
        create: vi.fn(),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);

      await expect(
        service.createApp('USER', {
          name: 'Hacked App',
          slug: 'hacked-app',
          shortDescription: 'Malicious attempt',
          description: 'Should fail immediately',
          iconUrl: 'https://example.com/icon.png',
          categoryId: 'cat-1',
        })
      ).rejects.toThrowError(AppError);
    });

    it('rejects invalid slugs with uppercase or special characters', async () => {
      const mockRepo = {
        create: vi.fn(),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);

      await expect(
        service.createApp('ADMIN', {
          name: 'My App',
          slug: 'My_Invalid Slug!',
          shortDescription: 'Test',
          description: 'Test',
          iconUrl: 'https://example.com/icon.png',
          categoryId: 'cat-1',
        })
      ).rejects.toThrowError(AppError);
    });

    it('allows ADMIN to create valid app', async () => {
      const mockRepo = {
        create: vi.fn().mockResolvedValue(mockPublishedApp),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);
      const app = await service.createApp('ADMIN', {
        name: 'Terminal Pro',
        slug: 'terminal-pro',
        shortDescription: 'Hardware accelerated terminal',
        description: 'A full-featured terminal emulator.',
        iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
        categoryId: 'dev-tools',
      });

      expect(app.slug).toBe('terminal-pro');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('validates required fields and version metadata before publishing', async () => {
      const mockRepo = {
        findById: vi.fn().mockResolvedValue(mockDraftApp),
        publishWithVersionTransaction: vi.fn().mockResolvedValue({
          ...mockDraftApp,
          status: 'published',
          currentVersion: '1.0.0',
        }),
      } as unknown as AppRepository;

      const service = new AppService(mockRepo);

      // Missing version info
      await expect(
        service.publishApp('ADMIN', 'app-2', { version: '', changelog: '' })
      ).rejects.toThrowError(AppError);

      // Valid publication
      const published = await service.publishApp('ADMIN', 'app-2', {
        version: '1.0.0',
        changelog: 'Initial public launch',
      });

      expect(published.status).toBe('published');
      expect(published.currentVersion).toBe('1.0.0');
    });
  });
});
