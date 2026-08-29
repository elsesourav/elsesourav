import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateSignedUploadParameters,
  verifyUploadedAssetFolder,
  buildCloudinaryUrl,
  getAvatarUrl,
  getAppIconUrl,
  getBlogCoverUrl,
  deleteCloudinaryAsset,
  getCloudinaryConfig,
} from '@elsesourav/media';
import {
  MediaSignatureRequestSchema,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_MEDIA_SIZE_BYTES,
} from '@elsesourav/validation';
import { AppError } from '@elsesourav/types';

describe('Cloudinary Media Storage Architecture', () => {
  const mockConfig = {
    cloudName: 'test-cloud',
    apiKey: '1234567890',
    apiSecret: 'test-secret-key',
  };

  describe('Signed Upload Generation', () => {
    it('generates a valid SHA-1 signature and folder path for direct upload', () => {
      const signed = generateSignedUploadParameters(
        {
          folder: 'apps',
          mediaType: 'app_icon',
          customPublicId: 'terminal-pro',
        },
        mockConfig
      );

      expect(signed.cloudName).toBe('test-cloud');
      expect(signed.apiKey).toBe('1234567890');
      expect(signed.folder).toBe('elsesourav/apps');
      expect(signed.publicId).toContain('terminal-pro_');
      expect(signed.signature).toMatch(/^[a-f0-9]{40}$/); // SHA-1 hex
      expect(typeof signed.timestamp).toBe('number');
    });

    it('verifies uploaded asset namespace prefix accurately', () => {
      expect(verifyUploadedAssetFolder('elsesourav/users/avatar_123.jpg', 'users')).toBe(true);
      expect(verifyUploadedAssetFolder('elsesourav/apps/icon_456.png', 'apps')).toBe(true);
      expect(verifyUploadedAssetFolder('malicious_folder/file.jpg', 'users')).toBe(false);
    });
  });

  describe('URL Transformation Engine', () => {
    it('generates responsive avatar URL with face detection crop', () => {
      const avatarUrl = getAvatarUrl('avatar_123', 256);
      expect(avatarUrl).toContain('f_auto,q_auto,w_256,h_256,c_fill,g_face');
      expect(avatarUrl).toContain('/image/upload/');
    });

    it('generates app icon URL with fit crop', () => {
      const iconUrl = getAppIconUrl('icon_456', 96);
      expect(iconUrl).toContain('f_auto,q_auto,w_96,h_96,c_fit');
    });

    it('generates blog cover URL with 1200x630 dimensions', () => {
      const coverUrl = getBlogCoverUrl('cover_789');
      expect(coverUrl).toContain('w_1200,h_630,c_fill,g_center');
    });

    it('returns external non-cloudinary URLs untouched', () => {
      const externalUrl = 'https://avatars.githubusercontent.com/u/12345';
      expect(buildCloudinaryUrl(externalUrl)).toBe(externalUrl);
    });
  });

  describe('Media Validation Schemas', () => {
    it('validates allowed MIME types and max size constants', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain('image/webp');
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain('image/png');
      expect(MAX_MEDIA_SIZE_BYTES.avatar).toBe(2 * 1024 * 1024);
      expect(MAX_MEDIA_SIZE_BYTES.app_icon).toBe(1 * 1024 * 1024);
    });

    it('validates upload signature requests against schema', () => {
      const valid = {
        mediaType: 'app_icon',
        folder: 'apps',
        customPublicId: 'my-app-icon',
      };
      expect(MediaSignatureRequestSchema.safeParse(valid).success).toBe(true);

      const invalidFolder = {
        mediaType: 'app_icon',
        folder: 'unauthorized_folder',
      };
      expect(MediaSignatureRequestSchema.safeParse(invalidFolder).success).toBe(false);
    });
  });

  describe('Deletion Authorization & Security', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('rejects deletion of assets outside elsesourav workspace', async () => {
      await expect(
        deleteCloudinaryAsset(
          { publicId: 'external_workspace/image.png' },
          mockConfig
        )
      ).rejects.toThrowError(AppError);
    });

    it('executes signed destroy request for authorized assets', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'ok' }),
      } as Response);

      const result = await deleteCloudinaryAsset(
        { publicId: 'elsesourav/apps/sample_icon' },
        mockConfig
      );

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/image/destroy'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Configuration Safety', () => {
    it('throws safe developer error when environment variables are missing without leaking secrets', () => {
      expect(() =>
        getCloudinaryConfig({
          cloudName: '',
          apiKey: '',
          apiSecret: '',
        })
      ).toThrowError(AppError);
    });
  });
});
