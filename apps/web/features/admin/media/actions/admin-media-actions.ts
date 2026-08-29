'use server';

import { MediaRepository, MediaService } from '@elsesourav/database';
import { generateSignedUploadParameters } from '@elsesourav/media';
import { requireAdmin } from '../../guards/require-admin';
import { AdminDeleteMediaSchema, MediaSignatureRequestSchema } from '@elsesourav/validation';
import type { MediaFolder, MediaType, MediaDomain, AdminMediaListResult } from '@elsesourav/types';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const mediaRepo = new MediaRepository();
const mediaService = new MediaService(mediaRepo);

export async function adminGetUploadSignatureAction(
  folder: MediaFolder,
  mediaType: MediaType,
  customPublicId?: string
) {
  await requireAdmin();

  const parsed = MediaSignatureRequestSchema.safeParse({
    folder,
    mediaType,
    customPublicId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid upload parameters',
    };
  }

  try {
    const signatureData = generateSignedUploadParameters({
      folder: parsed.data.folder,
      mediaType: parsed.data.mediaType,
      customPublicId: parsed.data.customPublicId,
    });

    return {
      success: true,
      data: signatureData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate signature',
    };
  }
}

export async function adminGetMediaListAction(
  options: {
    domain?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ success: boolean; data?: AdminMediaListResult; error?: string }> {
  try {
    const context = await requireAdmin();
    const result = await mediaService.listMediaAdmin(context.role, options);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media assets',
    };
  }
}

export async function adminUploadImageFileAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
  try {
    const context = await requireAdmin();

    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as MediaFolder) || 'general';
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

    // Check size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return { success: false, error: 'Image size exceeds 8MB limit' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const publicId = `${folder}/${timestamp}-${cleanFilename.replace(/\.[^/.]+$/, '')}`;

    let secureUrl = '';

    // Check if Cloudinary credentials exist
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret && !cloudName.includes('placeholder')) {
      try {
        const cloudinaryFormData = new FormData();
        const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;
        cloudinaryFormData.append('file', base64Data);
        cloudinaryFormData.append('folder', folder);
        cloudinaryFormData.append(
          'public_id',
          `${timestamp}-${cleanFilename.replace(/\.[^/.]+$/, '')}`
        );
        cloudinaryFormData.append('api_key', apiKey);
        cloudinaryFormData.append('timestamp', String(Math.floor(Date.now() / 1000)));

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cloudinaryFormData,
        });

        if (response.ok) {
          const cData = await response.json();
          secureUrl = cData.secure_url;
        }
      } catch (err) {
        console.warn('Direct Cloudinary upload fallback to local storage:', err);
      }
    }

    // Fallback: save to public/uploads directory or base64 data url
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
    await mediaRepo.recordUploadedAsset(context.id, {
      url: secureUrl,
      publicId,
      domain,
      title: file.name,
      bytes: file.size,
    });

    revalidatePath('/admin/media');
    revalidatePath('/admin');
    revalidatePath('/admin/settings');

    return {
      success: true,
      url: secureUrl,
      publicId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image file',
    };
  }
}

export async function adminDeleteMediaAction(publicId: string, force = false) {
  const context = await requireAdmin();

  const parsed = AdminDeleteMediaSchema.safeParse({
    publicId,
    force,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid delete request',
    };
  }

  try {
    const result = await mediaService.deleteMediaAdmin(
      context.id,
      context.role,
      parsed.data.publicId,
      parsed.data.force
    );

    revalidatePath('/admin/media');
    revalidatePath('/admin');

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete media asset',
    };
  }
}
