'use server';

import { MediaRepository, MediaService } from '@elsesourav/database';
import { generateSignedUploadParameters } from '@elsesourav/media';
import { requireAdmin } from '../../guards/require-admin';
import { AdminDeleteMediaSchema, MediaSignatureRequestSchema } from '@elsesourav/validation';
import type { MediaFolder, MediaType, MediaDomain, AdminMediaListResult } from '@elsesourav/types';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import crypto from 'node:crypto';

import { processAdminImageUpload } from '../services/admin-image-upload';

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

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'No image file provided' };
    }

    return await processAdminImageUpload({
      file,
      folder,
      userId: context.id,
    });
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
