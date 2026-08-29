import crypto from 'crypto';
import { getCloudinaryConfig } from '../cloudinary/client';
import type { MediaUploadSignature, DirectUploadParams } from '@elsesourav/types';

/**
 * Generates an authenticated, signed upload payload for direct client-to-Cloudinary uploads.
 * Prevents transferring heavy media binaries through the Next.js application server.
 */
export function generateSignedUploadParameters(
  params: DirectUploadParams,
  configOverrides?: { cloudName?: string; apiKey?: string; apiSecret?: string }
): MediaUploadSignature {
  const config = getCloudinaryConfig(configOverrides);
  const timestamp = Math.round(Date.now() / 1000);

  // Secure folder path under root namespace
  const normalizedFolder = `elsesourav/${params.folder}`;
  
  // Predictable, collision-resistant, sanitized public ID prefix
  const sanitizedCustomId = params.customPublicId
    ? params.customPublicId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
    : undefined;

  const publicId = sanitizedCustomId
    ? `${sanitizedCustomId}_${Date.now()}`
    : undefined;

  // Build parameter dictionary for signature
  const paramsToSign: Record<string, string | number> = {
    folder: normalizedFolder,
    timestamp,
  };

  if (publicId) {
    paramsToSign.public_id = publicId;
  }

  // Sort parameter keys alphabetically as required by Cloudinary signing specification
  const sortedKeys = Object.keys(paramsToSign).sort();
  const serializedParams = sortedKeys
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  // SHA-1 signature with API secret
  const stringToSign = `${serializedParams}${config.apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  return {
    signature,
    timestamp,
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder: normalizedFolder,
    publicId,
  };
}

/**
 * Validates whether a returned Cloudinary upload response matches the expected folder namespace
 */
export function verifyUploadedAssetFolder(publicId: string, expectedFolder: string): boolean {
  if (!publicId || typeof publicId !== 'string') return false;
  const expectedPrefix = `elsesourav/${expectedFolder}/`;
  return publicId.startsWith(expectedPrefix);
}
