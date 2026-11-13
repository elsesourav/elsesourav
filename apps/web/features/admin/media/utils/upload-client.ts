import type { MediaFolder } from '@elsesourav/types';
import { optimizeImageForUpload } from './image-optimizer';
import { adminUploadImageFileAction } from '../actions/admin-media-actions';

export interface UploadAdminImageResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Universal Client-Side Admin Image Uploader
 *
 * 1. Optimizes the image in-browser (converts clipboard PNGs to lightweight WebP).
 * 2. Uses the dedicated `/api/admin/media/upload` endpoint to bypass Server Action 1MB limits.
 * 3. Gracefully falls back to Server Action if needed.
 */
export async function uploadAdminImageFile(
  file: File,
  folder: MediaFolder = 'general'
): Promise<UploadAdminImageResult> {
  try {
    // 1. Client-side optimization: downscale extreme dimensions & convert uncompressed bitmaps
    const optimizedFile = await optimizeImageForUpload(file);

    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('folder', folder);

    // 2. Primary: Dedicated API route (immune to Server Action body size limits)
    try {
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          return {
            success: true,
            url: data.url,
            publicId: data.publicId,
          };
        }
        return {
          success: false,
          error: data.error || 'Upload failed',
        };
      }

      if (response.status === 413) {
        return {
          success: false,
          error: 'Image is too large. Please select an image under 10MB.',
        };
      }

      // If route returned a specific error message, parse it
      const errData = await response.json().catch(() => null);
      if (errData?.error) {
        return { success: false, error: errData.error };
      }
    } catch {
      // API route unreachable, attempt Server Action fallback below
    }

    // 3. Fallback: Server Action
    const actionRes = await adminUploadImageFileAction(formData);
    return actionRes;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}
