export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  crop?: 'fill' | 'fit' | 'thumb';
}

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicIdOrUrl) return '';
  if (publicIdOrUrl.startsWith('http')) return publicIdOrUrl;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'elsesourav';
  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  transformations.push(`q_${options.quality || 'auto'}`);
  transformations.push(`f_${options.format || 'auto'}`);

  const transformString = transformations.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicIdOrUrl}`;
}
