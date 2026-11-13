import { MediaRepository } from '@elsesourav/database';
import type { MediaFolder, MediaDomain } from '@elsesourav/types';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import crypto from 'node:crypto';

const mediaRepo = new MediaRepository();

export interface ProcessAdminImageUploadOptions {
  file: File;
  folder: MediaFolder;
  userId: string;
}

export interface ProcessAdminImageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Shared backend processor for Admin image uploads.
 * Handles Cloudinary authenticated direct upload with local filesystem fallback,
 * and records the asset in the central Media Library repository.
 */
export async function processAdminImageUpload({
  file,
  folder,
  userId,
}: ProcessAdminImageUploadOptions): Promise<ProcessAdminImageUploadResult> {
  const domain = (
    folder === 'users'
      ? 'users'
      : folder === 'apps'
        ? 'apps'
        : folder === 'blog'
          ? 'blog'
          : 'general'
  ) as MediaDomain;

  if (!file || !(file instanceof File)) {
    return { success: false, error: 'No image file provided' };
  }

  // Check size (max 12MB)
  if (file.size > 12 * 1024 * 1024) {
    return { success: false, error: 'Image size exceeds 12MB limit' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const timestamp = Date.now();
  const publicId = `${folder}/${timestamp}-${cleanFilename.replace(/\.[^/.]+$/, '')}`;

  let secureUrl = '';

  // Authenticated Cloudinary direct server-side upload
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret && !cloudName.includes('placeholder')) {
    try {
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;
      const timestampSec = Math.floor(Date.now() / 1000);
      const targetFolder = `elsesourav/${folder}`;
      const publicIdName = `${Date.now()}-${cleanFilename.replace(/\.[^/.]+$/, '')}`;

      const paramsToSign: Record<string, string | number> = {
        folder: targetFolder,
        public_id: publicIdName,
        timestamp: timestampSec,
      };

      const sortedKeys = Object.keys(paramsToSign).sort();
      const serialized = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
      const signature = crypto.createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', base64Data);
      cloudinaryFormData.append('folder', targetFolder);
      cloudinaryFormData.append('public_id', publicIdName);
      cloudinaryFormData.append('timestamp', String(timestampSec));
      cloudinaryFormData.append('api_key', apiKey);
      cloudinaryFormData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      if (response.ok) {
        const cData = await response.json();
        secureUrl = cData.secure_url;
      } else {
        const errText = await response.text();
        console.warn('Cloudinary upload error response:', response.status, errText);
      }
    } catch (err) {
      console.warn('Direct Cloudinary upload exception:', err);
    }
  }

  // Fallback: save to public/uploads directory or base64 data url if Cloudinary is offline
  if (!secureUrl) {
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
      await mkdir(uploadsDir, { recursive: true });
      const savedFilename = `${timestamp}-${cleanFilename}`;
      const filePath = join(uploadsDir, savedFilename);
      await writeFile(filePath, buffer);
      secureUrl = `/uploads/${folder}/${savedFilename}`;
    } catch {
      // Safe in-memory data URL fallback
      secureUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }
  }

  // Record asset in Media Library
  await mediaRepo.recordUploadedAsset(userId, {
    url: secureUrl,
    publicId,
    domain,
    title: file.name,
    bytes: file.size,
  });

  try {
    revalidatePath('/admin/media');
    revalidatePath('/admin');
    revalidatePath('/admin/settings');
  } catch {
    // Non-fatal if revalidation context is unavailable
  }

  return {
    success: true,
    url: secureUrl,
    publicId,
  };
}
