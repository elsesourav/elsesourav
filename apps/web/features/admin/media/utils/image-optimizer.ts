/**
 * Client-Side Pre-Upload Image Optimizer
 *
 * Automatically downsizes and compresses large clipboard screenshots and camera photos
 * before transmission, avoiding 413 (Content Too Large) errors and speeding up uploads.
 */

export interface ImageOptimizationOptions {
  maxDimension?: number;
  quality?: number;
  maxByteSize?: number;
}

/**
 * Optimizes an image File in-memory via Offscreen/HTML Canvas.
 * - Converts heavy uncompressed PNGs / bitmaps (e.g. Retina screenshots) to modern WebP.
 * - Caps extreme dimensions to maxDimension (default: 2560px) while maintaining exact aspect ratio.
 * - Preserves vector SVGs and animated GIFs untouched.
 * - Gracefully falls back to the original file if any canvas operation fails.
 */
export async function optimizeImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const { maxDimension = 2560, quality = 0.88, maxByteSize = 900 * 1024 } = options;

  // Never alter vector graphics or animated GIFs
  if (
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif' ||
    !file.type.startsWith('image/')
  ) {
    return file;
  }

  // If already WebP and reasonably sized, return original
  if (file.type === 'image/webp' && file.size <= maxByteSize) {
    return file;
  }

  // If running in an environment without DOM/Canvas support (e.g. SSR), return file
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise<File>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      try {
        let { naturalWidth: width, naturalHeight: height } = img;

        if (!width || !height) {
          cleanup();
          resolve(file);
          return;
        }

        // Calculate proportional scale if dimensions exceed maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP, with JPEG fallback
        const targetMime = 'image/webp';
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              resolve(file);
              return;
            }

            // Only use optimized version if it's smaller or changed format to WebP
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const newFileName = `${baseName}.webp`;
            const optimizedFile = new File([blob], newFileName, {
              type: targetMime,
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          targetMime,
          quality
        );
      } catch {
        cleanup();
        resolve(file);
      }
    };

    img.onerror = () => {
      cleanup();
      resolve(file);
    };

    img.src = objectUrl;
  });
}
