import { describe, it, expect, vi } from 'vitest';
import { MediaService, MediaRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type { AdminMediaReference } from '@elsesourav/types';

vi.mock('@elsesourav/media', () => ({
  deleteCloudinaryAsset: vi.fn().mockResolvedValue(true),
  generateSignedUploadParameters: vi.fn().mockReturnValue({
    signature: 'mock-sig',
    timestamp: 1234567890,
    cloudName: 'test-cloud',
    apiKey: 'test-key',
    folder: 'elsesourav/general',
  }),
}));

describe('Admin Media Library & Reference Protection Security', () => {
  const mockReference: AdminMediaReference = {
    resourceType: 'App',
    resourceId: 'app-1',
    resourceName: 'Terminal Pro',
    fieldName: 'iconUrl',
  };

  describe('listMediaAdmin', () => {
    it('allows ADMIN to list aggregated media with reference metadata', async () => {
      const mockRepo = {
        listAdminMedia: vi.fn().mockResolvedValue({
          items: [
            {
              id: 'elsesourav/apps/terminal_icon',
              publicId: 'elsesourav/apps/terminal_icon',
              secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/elsesourav/apps/terminal_icon.png',
              domain: 'apps',
              createdAt: Date.now(),
              isReferenced: true,
              references: [mockReference],
            },
          ],
          total: 1,
          totalReferenced: 1,
          totalOrphans: 0,
        }),
      } as unknown as MediaRepository;

      const service = new MediaService(mockRepo);

      const result = await service.listMediaAdmin('ADMIN', { domain: 'all' });
      expect(result.items.length).toBe(1);
      expect(result.totalReferenced).toBe(1);
      expect(result.items[0]?.isReferenced).toBe(true);
      expect(result.items[0]?.references[0]?.resourceName).toBe('Terminal Pro');
    });

    it('strictly forbids normal USER from viewing admin media library', async () => {
      const mockRepo = {
        listAdminMedia: vi.fn(),
      } as unknown as MediaRepository;

      const service = new MediaService(mockRepo);

      await expect(service.listMediaAdmin('USER')).rejects.toThrowError(AppError);
      expect(mockRepo.listAdminMedia).not.toHaveBeenCalled();
    });
  });

  describe('deleteMediaAdmin & Reference Protection', () => {
    it('prevents accidental deletion of actively referenced media assets', async () => {
      const mockRepo = {
        checkAssetReferences: vi.fn().mockResolvedValue([mockReference]),
        logMediaAudit: vi.fn(),
      } as unknown as MediaRepository;

      const service = new MediaService(mockRepo);

      await expect(
        service.deleteMediaAdmin(
          'admin-1',
          'ADMIN',
          'elsesourav/apps/terminal_icon',
          false // force = false
        )
      ).rejects.toThrowError(/Cannot safely delete media asset because it is actively referenced/);

      expect(mockRepo.logMediaAudit).not.toHaveBeenCalled();
    });

    it('allows deleting an unreferenced orphan asset with audit log', async () => {
      const mockRepo = {
        checkAssetReferences: vi.fn().mockResolvedValue([]), // No references
        logMediaAudit: vi.fn().mockResolvedValue(undefined),
      } as unknown as MediaRepository;

      const service = new MediaService(mockRepo);

      const res = await service.deleteMediaAdmin(
        'admin-1',
        'ADMIN',
        'elsesourav/general/old_banner',
        false
      );

      expect(res.success).toBe(true);
      expect(res.referencesCount).toBe(0);
      expect(mockRepo.logMediaAudit).toHaveBeenCalledWith(
        'admin-1',
        'MEDIA_ASSET_DELETED',
        'elsesourav/general/old_banner',
        expect.objectContaining({ referencesCount: 0, force: false })
      );
    });

    it('allows force deletion of a referenced asset when explicitly requested by Super Admin', async () => {
      const mockRepo = {
        checkAssetReferences: vi.fn().mockResolvedValue([mockReference]),
        logMediaAudit: vi.fn().mockResolvedValue(undefined),
      } as unknown as MediaRepository;

      const service = new MediaService(mockRepo);

      const res = await service.deleteMediaAdmin(
        'admin-1',
        'ADMIN',
        'elsesourav/apps/terminal_icon',
        true // force = true
      );

      expect(res.success).toBe(true);
      expect(res.referencesCount).toBe(1);
      expect(mockRepo.logMediaAudit).toHaveBeenCalledWith(
        'admin-1',
        'MEDIA_ASSET_DELETED',
        'elsesourav/apps/terminal_icon',
        expect.objectContaining({ referencesCount: 1, force: true })
      );
    });

    it('strictly forbids STAFF and normal USER from deleting media assets', async () => {
      const mockRepo = {
        checkAssetReferences: vi.fn(),
        logMediaAudit: vi.fn(),
      } as unknown as MediaRepository;

      const service = new MediaService(mockRepo);

      await expect(
        service.deleteMediaAdmin('staff-1', 'STAFF', 'elsesourav/general/test')
      ).rejects.toThrowError(AppError);

      await expect(
        service.deleteMediaAdmin('user-1', 'USER', 'elsesourav/general/test')
      ).rejects.toThrowError(AppError);
    });
  });
});
