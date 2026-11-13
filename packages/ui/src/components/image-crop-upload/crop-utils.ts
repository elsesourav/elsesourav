import { CropArea } from './types';

/**
 * Loads an image from a data URL or blob URL.
 */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If anonymous load failed (e.g., browser cached without CORS header), retry with cache-buster
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const retryImg = new Image();
        retryImg.crossOrigin = 'anonymous';
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = (err2) => reject(err2);
        const sep = url.includes('?') ? '&' : '?';
        retryImg.src = `${url}${sep}_cb=${Date.now()}`;
      } else {
        reject(new Error('Failed to load image for cropping'));
      }
    };
    img.src = url;
  });
}

/**
 * Crops and automatically resizes an HTML image to the specified target dimensions.
 */
export function getCroppedCanvas(
  image: HTMLImageElement,
  crop: CropArea,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context');
  }

  const outWidth = targetWidth || crop.width;
  const outHeight = targetHeight || crop.height;

  canvas.width = outWidth;
  canvas.height = outHeight;

  // Use highest quality image smoothing for crisp downsizing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outWidth,
    outHeight
  );

  return canvas;
}

/**
 * Converts an HTML Canvas element into a standard File object.
 */
export function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string = 'image.webp',
  mimeType: string = 'image/webp',
  quality: number = 0.92
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'));
          return;
        }
        const file = new File([blob], fileName, { type: mimeType, lastModified: Date.now() });
        resolve(file);
      },
      mimeType,
      quality
    );
  });
}
