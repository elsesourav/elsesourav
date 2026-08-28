import crypto from 'crypto';
import { getCloudinaryConfig } from '../cloudinary/client';
import { AppError } from '@elsesourav/types';

export interface DeleteAssetOptions {
  readonly publicId: string;
  readonly requestingUserId?: string;
  readonly allowedPrefix?: string;
}

/**
 * Executes a verified asset deletion request on Cloudinary.
 */
export async function deleteCloudinaryAsset(
  options: DeleteAssetOptions,
  configOverrides?: { cloudName?: string; apiKey?: string; apiSecret?: string }
): Promise<boolean> {
  const { publicId, allowedPrefix } = options;

  if (!publicId || typeof publicId !== 'string') {
    throw AppError.validation('A valid publicId is required for deletion');
  }

  // Safety check: ensure public ID belongs to elsesourav workspace
  if (!publicId.startsWith('elsesourav/')) {
    throw AppError.forbidden('Cannot delete media outside the elsesourav repository');
  }

  if (allowedPrefix && !publicId.startsWith(`elsesourav/${allowedPrefix}`)) {
    throw AppError.forbidden(`Unauthorized deletion target outside 'elsesourav/${allowedPrefix}'`);
  }

  const config = getCloudinaryConfig(configOverrides);
  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary destroy parameter signature
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new URLSearchParams({
    public_id: publicId,
    api_key: config.apiKey,
    timestamp: timestamp.toString(),
    signature,
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary API responded with status ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as { result: string };
    return data.result === 'ok' || data.result === 'not found';
  } catch (error) {
    throw AppError.external('Cloudinary', 'Failed to delete asset from Cloudinary storage', error);
  }
}
