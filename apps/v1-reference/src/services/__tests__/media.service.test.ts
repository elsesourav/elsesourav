import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppMediaService } from '../media.service';
import type { IAppMediaRepository, CreateAppMediaDto } from '@/repositories';
import type { AppMedia } from '@/types/media.types';
import { ok } from '@/lib/result';
import { createAppMediaSchema, reorderMediaSchema } from '@/schemas/media.schema';

describe('AppMediaService & Media Metadata System', () => {
  let mockMediaRepo: IAppMediaRepository;
  let mediaService: AppMediaService;

  const mockIcon: AppMedia = {
    id: 'media-icon-1',
    appId: 'app-calc',
    type: 'icon',
    url: 'https://cdn.elsesourav.com/apps/calc/icon.png',
    altText: 'Scientific Calculator App Icon',
    title: 'App Icon',
    width: 512,
    height: 512,
    orderIndex: 0,
    isPrimary: true,
    isDecorative: false,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockHero: AppMedia = {
    id: 'media-hero-1',
    appId: 'app-calc',
    type: 'hero',
    url: 'https://cdn.elsesourav.com/apps/calc/banner.jpg',
    altText: 'Scientific Calculator Hero Banner Preview',
    title: 'Hero Banner',
    width: 1920,
    height: 1080,
    orderIndex: 0,
    isPrimary: true,
    isDecorative: false,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockScreenshot1: AppMedia = {
    id: 'media-shot-1',
    appId: 'app-calc',
    type: 'screenshot',
    url: 'https://cdn.elsesourav.com/apps/calc/screen1.png',
    altText: 'Calculator main interface with scientific functions',
    title: 'Main Interface',
    width: 1280,
    height: 800,
    orderIndex: 0,
    isPrimary: false,
    isDecorative: false,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockScreenshot2: AppMedia = {
    id: 'media-shot-2',
    appId: 'app-calc',
    type: 'screenshot',
    url: 'https://cdn.elsesourav.com/apps/calc/screen2.png',
    altText: '2D Graphing engine visualizing sine waves',
    title: 'Graphing Mode',
    width: 1280,
    height: 800,
    orderIndex: 1,
    isPrimary: false,
    isDecorative: false,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockSocial: AppMedia = {
    id: 'media-social-1',
    appId: 'app-calc',
    type: 'social',
    url: 'https://cdn.elsesourav.com/apps/calc/og-image.png',
    altText: 'Scientific Calculator - Built by ElseSourav',
    title: 'OpenGraph Social Card',
    width: 1200,
    height: 630,
    orderIndex: 0,
    isPrimary: true,
    isDecorative: false,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    mockMediaRepo = {
      findById: vi.fn(),
      listByApp: vi.fn(),
      listByType: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
    };

    mediaService = new AppMediaService(mockMediaRepo);
  });

  describe('1. Media Creation and Accessibility Validation', () => {
    it('creates valid media metadata with required alt text', async () => {
      const createDto: CreateAppMediaDto = {
        appId: 'app-calc',
        type: 'screenshot',
        url: 'https://cdn.elsesourav.com/apps/calc/screen1.png',
        altText: 'Calculator main interface with scientific functions',
        title: 'Main Interface',
        width: 1280,
        height: 800,
        orderIndex: 0,
      };

      vi.mocked(mockMediaRepo.create).mockResolvedValue(ok(mockScreenshot1));

      const result = await mediaService.createMedia('app-calc', createDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.altText).toBe('Calculator main interface with scientific functions');
        expect(result.data.type).toBe('screenshot');
      }
      expect(mockMediaRepo.create).toHaveBeenCalledWith('app-calc', createDto);
    });

    it('rejects media creation when altText is missing or empty on non-decorative images', () => {
      const invalidMedia = {
        appId: 'app-calc',
        type: 'screenshot',
        url: 'https://cdn.elsesourav.com/apps/calc/screen1.png',
        altText: '   ', // whitespace only
        isDecorative: false,
      };

      const parsed = createAppMediaSchema.safeParse(invalidMedia);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.path[0]).toBe('altText');
        expect(parsed.error.issues[0]?.message).toContain('Alt text is required');
      }
    });

    it('allows empty altText if image is explicitly marked decorative', () => {
      const decorativeMedia = {
        appId: 'app-calc',
        type: 'hero',
        url: 'https://cdn.elsesourav.com/apps/calc/bg-pattern.png',
        altText: '',
        isDecorative: true,
      };

      const parsed = createAppMediaSchema.safeParse(decorativeMedia);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid or non-HTTP/HTTPS URLs', () => {
      const invalidUrlMedia = {
        appId: 'app-calc',
        type: 'screenshot',
        url: 'javascript:alert(1)',
        altText: 'Valid Alt Text',
      };

      const parsed = createAppMediaSchema.safeParse(invalidUrlMedia);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.path[0]).toBe('url');
      }
    });
  });

  describe('2. Media Retrieval by Type & Presentation', () => {
    it('retrieves app icon', async () => {
      vi.mocked(mockMediaRepo.listByType).mockResolvedValue(
        ok({
          items: [mockIcon],
          hasMore: false,
        })
      );

      const result = await mediaService.getAppIcon('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.type).toBe('icon');
        expect(result.data?.url).toContain('icon.png');
      }
      expect(mockMediaRepo.listByType).toHaveBeenCalledWith('app-calc', 'icon', { limit: 1 });
    });

    it('retrieves hero image and social card', async () => {
      vi.mocked(mockMediaRepo.listByType).mockImplementation((_appId, type) => {
        if (type === 'hero') {
          return Promise.resolve(ok({ items: [mockHero], hasMore: false }));
        }
        if (type === 'social') {
          return Promise.resolve(ok({ items: [mockSocial], hasMore: false }));
        }
        return Promise.resolve(ok({ items: [], hasMore: false }));
      });

      const heroResult = await mediaService.getHeroImage('app-calc');
      expect(heroResult.success).toBe(true);
      if (heroResult.success) {
        expect(heroResult.data?.type).toBe('hero');
      }

      const socialResult = await mediaService.getSocialImage('app-calc');
      expect(socialResult.success).toBe(true);
      if (socialResult.success) {
        expect(socialResult.data?.type).toBe('social');
      }
    });

    it('lists screenshots in order for gallery/carousel', async () => {
      vi.mocked(mockMediaRepo.listByType).mockResolvedValue(
        ok({
          items: [mockScreenshot1, mockScreenshot2],
          hasMore: false,
        })
      );

      const result = await mediaService.listScreenshots('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(2);
        expect(result.data.items[0]?.orderIndex).toBe(0);
        expect(result.data.items[1]?.orderIndex).toBe(1);
      }
      expect(mockMediaRepo.listByType).toHaveBeenCalledWith('app-calc', 'screenshot');
    });
  });

  describe('3. Reordering, Updating, and Deleting', () => {
    it('reorders media items in batch', async () => {
      vi.mocked(mockMediaRepo.reorder).mockResolvedValue(ok(undefined));

      const result = await mediaService.reorderMedia('app-calc', ['media-shot-2', 'media-shot-1']);

      expect(result.success).toBe(true);
      expect(mockMediaRepo.reorder).toHaveBeenCalledWith('app-calc', [
        'media-shot-2',
        'media-shot-1',
      ]);
    });

    it('rejects empty media reorder list', () => {
      const parsed = reorderMediaSchema.safeParse({ mediaIds: [] });
      expect(parsed.success).toBe(false);
    });

    it('updates media metadata', async () => {
      const updatedMedia: AppMedia = {
        ...mockScreenshot1,
        altText: 'Updated alt text for enhanced screen readers',
        updatedAt: Date.now(),
      };

      vi.mocked(mockMediaRepo.update).mockResolvedValue(ok(updatedMedia));

      const result = await mediaService.updateMedia('app-calc', 'media-shot-1', {
        altText: 'Updated alt text for enhanced screen readers',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.altText).toBe('Updated alt text for enhanced screen readers');
      }
      expect(mockMediaRepo.update).toHaveBeenCalledWith('app-calc', 'media-shot-1', {
        altText: 'Updated alt text for enhanced screen readers',
      });
    });

    it('deletes media metadata reference without physical file deletion', async () => {
      vi.mocked(mockMediaRepo.delete).mockResolvedValue(ok(undefined));

      const result = await mediaService.deleteMedia('app-calc', 'media-shot-1');

      expect(result.success).toBe(true);
      expect(mockMediaRepo.delete).toHaveBeenCalledWith('app-calc', 'media-shot-1');
    });
  });
});
