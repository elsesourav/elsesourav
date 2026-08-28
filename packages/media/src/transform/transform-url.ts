import type { MediaTransformationOptions } from '@elsesourav/types';

export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  options: MediaTransformationOptions = {},
  cloudNameOverride?: string
): string {
  if (!publicIdOrUrl) return '';

  // Return clean URL if already full external URL and not a cloudinary URL
  if (publicIdOrUrl.startsWith('http://') || (publicIdOrUrl.startsWith('https://') && !publicIdOrUrl.includes('res.cloudinary.com'))) {
    return publicIdOrUrl;
  }

  const cloudName =
    cloudNameOverride ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    'elsesourav';

  // Extract public ID if full cloudinary URL was passed
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    const uploadIndex = publicIdOrUrl.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const remainder = publicIdOrUrl.substring(uploadIndex + 8);
      // Strip any existing transformations (e.g. v123/ or w_100/v123/)
      const parts = remainder.split('/');
      const versionIndex = parts.findIndex((part) => part.startsWith('v') && /^\d+$/.test(part.substring(1)));
      if (versionIndex !== -1) {
        publicId = parts.slice(versionIndex + 1).join('/');
      } else {
        publicId = parts[parts.length - 1] || publicIdOrUrl;
      }
    }
  }

  // Build transformation segments
  const transforms: string[] = ['f_auto', 'q_auto'];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  if (options.dpr && options.dpr !== 1) transforms.push(`dpr_${options.dpr}`);

  const transformString = transforms.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

export function getAvatarUrl(publicIdOrUrl: string, size = 128): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
  });
}

export function getAppIconUrl(publicIdOrUrl: string, size = 96): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width: size,
    height: size,
    crop: 'fit',
  });
}

export function getAppScreenshotUrl(publicIdOrUrl: string, width = 1280, height = 720): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width,
    height,
    crop: 'fill',
  });
}

export function getBlogCoverUrl(publicIdOrUrl: string, width = 1200, height = 630): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width,
    height,
    crop: 'fill',
    gravity: 'center',
  });
}
