import type { LogoPixelTuple } from './logoPixelData';
import { encodePixelsToBase64, toLightweightPixels } from './logoPixelData';

export interface ExtractedLogoPixelsResult {
  pixels: LogoPixelTuple[];
  base64: string;
  count: number;
  width: number;
  height: number;
}

/**
 * Samples an image or SVG (from URL, data URL, or Blob) into a lightweight (~146 particles)
 * high-performance RGBA pixel matrix.
 * Executes on an offscreen HTML5 canvas directly in the browser during admin upload/configuration time.
 */
export async function extractLogoPixelsFromUrl(
  imageUrl: string,
  gridSize = 64
): Promise<ExtractedLogoPixelsResult> {
  if (typeof window === 'undefined') {
    throw new Error('extractLogoPixelsFromUrl must be executed in a browser environment');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        ctx.clearRect(0, 0, gridSize, gridSize);

        // Aspect-ratio preserving fit into gridSize x gridSize
        const scale = Math.min(
          (gridSize * 0.88) / img.naturalWidth,
          (gridSize * 0.88) / img.naturalHeight
        );
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const offsetX = (gridSize - w) / 2;
        const offsetY = (gridSize - h) / 2;

        ctx.drawImage(img, offsetX, offsetY, w, h);

        const imgData = ctx.getImageData(0, 0, gridSize, gridSize);
        const data = imgData.data;
        const rawPixels: LogoPixelTuple[] = [];

        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const idx = (y * gridSize + x) * 4;
            const r = data[idx] ?? 0;
            const g = data[idx + 1] ?? 0;
            const b = data[idx + 2] ?? 0;
            const alpha = data[idx + 3] ?? 0;

            if (alpha > 45) {
              const a = Math.round((alpha / 255) * 100) / 100;
              rawPixels.push([x, y, r, g, b, a]);
            }
          }
        }

        // Standardize to the uniform lightweight matrix (~146 particles)
        const lightweight = toLightweightPixels(rawPixels);
        const base64 = encodePixelsToBase64(lightweight);

        resolve({
          pixels: lightweight,
          base64,
          count: lightweight.length,
          width: gridSize,
          height: gridSize,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image from URL: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}
