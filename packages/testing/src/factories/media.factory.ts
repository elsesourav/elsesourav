import type { MediaAsset, MediaType } from '@elsesourav/types';

let mediaCounter = 1;

export function resetMediaFactoryCounter(): void {
  mediaCounter = 1;
}

export function createMediaAsset(overrides?: Partial<MediaAsset>): MediaAsset {
  const index = mediaCounter++;
  return {
    id: overrides?.id || `media-test-${index}`,
    publicId: overrides?.publicId || `v2/icons/tool-${index}`,
    secureUrl:
      overrides?.secureUrl ||
      `https://res.cloudinary.com/elsesourav/image/upload/v2/icons/tool-${index}.png`,
    mediaType: (overrides?.mediaType as MediaType) || 'app_icon',
    format: overrides?.format || 'png',
    width: overrides?.width ?? 512,
    height: overrides?.height ?? 512,
    bytes: overrides?.bytes ?? 65536,
    folder: overrides?.folder || 'apps',
    createdAt: overrides?.createdAt ?? 1704067200000,
    ownerUserId: overrides?.ownerUserId,
  };
}
