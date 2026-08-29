'use server';

import { MediaRepository, MediaService } from '@elsesourav/database';
import { generateSignedUploadParameters } from '@elsesourav/media';
import { requireAdmin } from '../../guards/require-admin';
import {
  AdminDeleteMediaSchema,
  MediaSignatureRequestSchema,
} from '@elsesourav/validation';
import type { MediaFolder, MediaType } from '@elsesourav/types';
import { revalidatePath } from 'next/cache';

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
