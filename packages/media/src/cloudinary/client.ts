import { AppError } from '@elsesourav/types';

export interface CloudinaryConfig {
  readonly cloudName: string;
  readonly apiKey: string;
  readonly apiSecret: string;
}

export function getCloudinaryConfig(overrides?: Partial<CloudinaryConfig>): CloudinaryConfig {
  const cloudName =
    overrides?.cloudName ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = overrides?.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = overrides?.apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    throw AppError.external('Cloudinary', 'CLOUDINARY_CLOUD_NAME environment variable is missing');
  }

  if (!apiKey || !apiSecret) {
    throw AppError.external(
      'Cloudinary',
      'Cloudinary API credentials (API key or API secret) are missing on the server'
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}
