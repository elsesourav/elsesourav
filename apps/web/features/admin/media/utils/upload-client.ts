import type { MediaFolder } from '@elsesourav/types';
import { optimizeImageForUpload } from './image-optimizer';
import { adminUploadImageFileAction } from '../actions/admin-media-actions';
import { inspectFileDimensions, type ImageDimensionInfo } from './image-dimensions';

export interface UploadAdminImageResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  dimensions?: ImageDimensionInfo;
}

export interface UploadBatchItemResult {
  file: File;
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  dimensions?: ImageDimensionInfo;
}

export interface UploadMultipleAdminImagesResult {
  success: boolean;
  urls: string[];
  results: UploadBatchItemResult[];
  uploaded: UploadBatchItemResult[];
  failed: UploadBatchItemResult[];
  successCount: number;
  failureCount: number;
}

/**
 * Universal Client-Side Admin Image Uploader for Single Image
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
    // 1. Inspect dimensions before/during upload
    const dimensions = await inspectFileDimensions(file);

    // 2. Client-side optimization: downscale extreme dimensions & convert uncompressed bitmaps
    const optimizedFile = await optimizeImageForUpload(file);

    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('folder', folder);

    // 3. Primary: Dedicated API route (immune to Server Action body size limits)
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
            dimensions,
          };
        }
        return {
          success: false,
          error: data.error || 'Upload failed',
          dimensions,
        };
      }

      if (response.status === 413) {
        return {
          success: false,
          error: 'Image is too large. Please select an image under 10MB.',
          dimensions,
        };
      }

      const errData = await response.json().catch(() => null);
      if (errData?.error) {
        return { success: false, error: errData.error, dimensions };
      }
    } catch {
      // Fall through to Server Action fallback
    }

    // 4. Fallback: Server Action
    const actionRes = await adminUploadImageFileAction(formData);
    return {
      ...actionRes,
      dimensions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Batch Image Uploader for Multiple Images
 *
 * Uploads an array of files sequentially or in limited concurrency,
 * reporting incremental progress callback on each item.
 */
export async function uploadMultipleAdminImageFiles(
  files: File[],
  folder: MediaFolder = 'general',
  onProgress?: (completed: number, total: number, latestResult?: UploadBatchItemResult) => void
): Promise<UploadMultipleAdminImagesResult> {
  const results: UploadBatchItemResult[] = [];
  const urls: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  const total = files.length;
  if (total === 0) {
    return { success: true, urls: [], results: [], uploaded: [], failed: [], successCount: 0, failureCount: 0 };
  }

  for (let i = 0; i < total; i++) {
    const file = files[i]!;
    const res = await uploadAdminImageFile(file, folder);

    const itemResult: UploadBatchItemResult = {
      file,
      success: res.success,
      url: res.url,
      publicId: res.publicId,
      error: res.error,
      dimensions: res.dimensions,
    };

    results.push(itemResult);

    if (res.success && res.url) {
      urls.push(res.url);
      successCount++;
    } else {
      failureCount++;
    }

    onProgress?.(i + 1, total, itemResult);
  }

  const uploaded = results.filter((r) => r.success && Boolean(r.url));
  const failed = results.filter((r) => !r.success);

  return {
    success: successCount > 0,
    urls,
    results,
    uploaded,
    failed,
    successCount,
    failureCount,
  };
}
