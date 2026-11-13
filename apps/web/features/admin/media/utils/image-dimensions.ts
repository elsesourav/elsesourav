export interface ImageDimensionInfo {
  width: number;
  height: number;
  ratio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  isPortrait: boolean;
  label: string;
}

const urlDimensionCache = new Map<string, ImageDimensionInfo>();

export function calculateOrientation(width: number, height: number): {
  ratio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  isPortrait: boolean;
  label: string;
} {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const ratio = safeWidth / safeHeight;

  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';
  let isPortrait = false;
  let label = '16:9 (Desktop)';

  if (ratio < 0.92) {
    orientation = 'portrait';
    isPortrait = true;
    if (ratio <= 0.62) {
      label = '9:16 (Mobile)';
    } else if (ratio <= 0.8) {
      label = '3:4 (Portrait)';
    } else {
      label = 'Portrait';
    }
  } else if (ratio <= 1.08) {
    orientation = 'square';
    isPortrait = false;
    label = '1:1 (Square)';
  } else {
    orientation = 'landscape';
    isPortrait = false;
    if (ratio >= 2.1) {
      label = '21:9 (Ultrawide)';
    } else if (ratio >= 1.7) {
      label = '16:9 (Desktop)';
    } else if (ratio >= 1.5) {
      label = '16:10 (Laptop)';
    } else {
      label = '4:3 (Desktop)';
    }
  }

  return { ratio, orientation, isPortrait, label };
}

/**
 * Inspects dimensions and orientation of a File object in the browser
 */
export async function inspectFileDimensions(file: File): Promise<ImageDimensionInfo> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve({
        width: 1920,
        height: 1080,
        ratio: 16 / 9,
        orientation: 'landscape',
        isPortrait: false,
        label: '16:9 (Desktop)',
      });
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || 1920;
      const height = img.naturalHeight || 1080;
      const calc = calculateOrientation(width, height);
      resolve({ width, height, ...calc });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: 1920,
        height: 1080,
        ratio: 16 / 9,
        orientation: 'landscape',
        isPortrait: false,
        label: '16:9 (Desktop)',
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Inspects dimensions and orientation of an image URL with in-memory caching
 */
export async function inspectUrlDimensions(url: string): Promise<ImageDimensionInfo> {
  if (!url || typeof window === 'undefined') {
    return {
      width: 1920,
      height: 1080,
      ratio: 16 / 9,
      orientation: 'landscape',
      isPortrait: false,
      label: '16:9 (Desktop)',
    };
  }

  const cached = urlDimensionCache.get(url);
  if (cached) return cached;

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || 1920;
      const height = img.naturalHeight || 1080;
      const calc = calculateOrientation(width, height);
      const result: ImageDimensionInfo = { width, height, ...calc };
      urlDimensionCache.set(url, result);
      resolve(result);
    };

    img.onerror = () => {
      const fallback: ImageDimensionInfo = {
        width: 1920,
        height: 1080,
        ratio: 16 / 9,
        orientation: 'landscape',
        isPortrait: false,
        label: '16:9 (Desktop)',
      };
      urlDimensionCache.set(url, fallback);
      resolve(fallback);
    };

    img.src = url;
  });
}
