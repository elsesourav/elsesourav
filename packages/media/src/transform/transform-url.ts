import type { MediaTransformationOptions } from '@elsesourav/types';

export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  options: MediaTransformationOptions = {},
  cloudNameOverride?: string
): string {
  if (!publicIdOrUrl) return '';

  // Return clean URL if already full external URL and not a cloudinary URL
  if (
    publicIdOrUrl.startsWith('http://') ||
    (publicIdOrUrl.startsWith('https://') && !publicIdOrUrl.includes('res.cloudinary.com'))
  ) {
    return publicIdOrUrl;
  }

  // Extract cloud name: prioritize override, then URL, then env vars, then fallback
  let cloudName = cloudNameOverride;
  if (!cloudName && publicIdOrUrl.includes('res.cloudinary.com')) {
    const match = publicIdOrUrl.match(/res\.cloudinary\.com\/([^/]+)\//);
    if (match && match[1]) {
      cloudName = match[1];
    }
  }
  if (!cloudName) {
    cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      'diqw2sjl8';
  }

  // Extract public ID / asset path if full cloudinary URL was passed
  let assetPath = publicIdOrUrl;
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    const uploadIndex = publicIdOrUrl.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const remainder = publicIdOrUrl.substring(uploadIndex + 8);
      const parts = remainder.split('/');
      const versionIndex = parts.findIndex(
        (part) => part.startsWith('v') && /^\d+$/.test(part.substring(1))
      );
      if (versionIndex !== -1) {
        // Retain the version and path so Cloudinary finds the asset reliably
        assetPath = parts.slice(versionIndex).join('/');
      } else {
        const firstPart = parts[0] || '';
        const isTransformSegment = /^(f_|q_|w_|h_|c_|g_|dpr_|b_|e_|,)/.test(firstPart);
        if (isTransformSegment && parts.length > 1) {
          assetPath = parts.slice(1).join('/');
        } else {
          assetPath = remainder;
        }
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
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${assetPath}`;
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

export function getAppScreenshotUrl(
  publicIdOrUrl: string,
  width = 1280,
  height = 720,
  crop: 'fill' | 'fit' | 'limit' = 'fill'
): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width,
    height,
    crop,
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

export function getAppBannerDesktopUrl(
  publicIdOrUrl: string,
  width = 2100,
  height = 900
): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width,
    height,
    crop: 'fill',
  });
}

export function getAppBannerMobileUrl(
  publicIdOrUrl: string,
  width = 1200,
  height = 1600
): string {
  return buildCloudinaryUrl(publicIdOrUrl, {
    width,
    height,
    crop: 'fill',
  });
}

export interface BrandLogoVariantOptions {
  width?: number;
  height?: number;
  format?: 'svg' | 'webp' | 'png' | 'auto';
  size?: number;
}

/**
 * Returns an optimized brand logo image URL for the requested dimensions and format.
 * - Leaves SVGs intact as resolution-independent vector graphics.
 * - Generates high-efficiency Cloudinary transformations for cloud-hosted assets.
 * - Formats width/height query parameters for local or custom image links.
 */
export function getBrandLogoVariant(
  publicIdOrUrl: string,
  options: BrandLogoVariantOptions = {}
): string {
  if (!publicIdOrUrl) return '';

  const clean = publicIdOrUrl.trim();

  // SVGs are infinite-resolution vectors
  if (clean.endsWith('.svg') || clean.includes('data:image/svg+xml')) {
    return clean;
  }

  const width = options.width || options.size || 128;
  const height = options.height || options.size || 128;

  if (clean.includes('res.cloudinary.com')) {
    return buildCloudinaryUrl(clean, {
      width,
      height,
      crop: 'fit',
    });
  }

  if (clean.startsWith('/') || clean.startsWith('http')) {
    const separator = clean.includes('?') ? '&' : '?';
    return `${clean}${separator}w=${width}&h=${height}`;
  }

  return clean;
}
