import { DEFAULT_LOGO_PIXELS_B64 } from './defaultLogoPixels';

export type LogoPixelTuple = readonly [
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
];

/**
 * Decodes a packed base64 string into an array of 6-tuples [x, y, r, g, b, a].
 * Format: 6 bytes per pixel (x: 0..63, y: 0..63, r: 0..255, g: 0..255, b: 0..255, a: 0..255).
 */
export function decodeBase64Pixels(b64: string): LogoPixelTuple[] {
  if (!b64 || typeof b64 !== 'string') return [];

  try {
    const binary = typeof atob !== 'undefined'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('binary');
    const len = binary.length;
    const pixels: LogoPixelTuple[] = [];

    for (let i = 0; i < len; i += 6) {
      if (i + 5 >= len) break;
      const x = binary.charCodeAt(i);
      const y = binary.charCodeAt(i + 1);
      const r = binary.charCodeAt(i + 2);
      const g = binary.charCodeAt(i + 3);
      const b = binary.charCodeAt(i + 4);
      const alphaByte = binary.charCodeAt(i + 5);
      const a = Math.round((alphaByte / 255) * 100) / 100;

      pixels.push([x, y, r, g, b, a]);
    }

    return pixels;
  } catch {
    return [];
  }
}

/**
 * Encodes an array of pixel tuples into a compact packed base64 string.
 */
export function encodePixelsToBase64(pixels: readonly LogoPixelTuple[]): string {
  const bytes = new Uint8Array(pixels.length * 6);
  let offset = 0;

  for (let i = 0; i < pixels.length; i++) {
    const p = pixels[i];
    if (!p) continue;
    bytes[offset++] = Math.min(63, Math.max(0, Math.round(p[0])));
    bytes[offset++] = Math.min(63, Math.max(0, Math.round(p[1])));
    bytes[offset++] = Math.min(255, Math.max(0, Math.round(p[2])));
    bytes[offset++] = Math.min(255, Math.max(0, Math.round(p[3])));
    bytes[offset++] = Math.min(255, Math.max(0, Math.round(p[4])));
    bytes[offset++] = Math.min(255, Math.max(0, Math.round(p[5] * 255)));
  }

  if (typeof btoa !== 'undefined') {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  }

  return Buffer.from(bytes).toString('base64');
}

let cachedDefaultPixels: LogoPixelTuple[] | null = null;

/**
 * Returns the default 4x high-density (64x64 grid, 2,433 particles) brand monogram pixel matrix.
 */
export function getHighDensityLogoPixels(): LogoPixelTuple[] {
  if (!cachedDefaultPixels) {
    cachedDefaultPixels = decodeBase64Pixels(DEFAULT_LOGO_PIXELS_B64);
  }
  return cachedDefaultPixels;
}

/**
 * Authoritative fallback parser: supports base64 string, JSON array, or fallback default.
 */
export function parseLogoPixels(raw?: string | null): LogoPixelTuple[] {
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return getHighDensityLogoPixels();
  }

  const trimmed = raw.trim();

  // 1. Try base64 packed format
  if (!trimmed.startsWith('[')) {
    const decoded = decodeBase64Pixels(trimmed);
    if (decoded.length > 50) return decoded;
  }

  // 2. Try JSON array format
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(
        (p): p is LogoPixelTuple =>
          Array.isArray(p) && p.length >= 6 && typeof p[0] === 'number'
      );
    }
  } catch {
    // Fall back to default
  }

  return getHighDensityLogoPixels();
}

/** Default 4x high-density pixel matrix exported for standard components */
export const LOGO_PIXEL_DATA: readonly LogoPixelTuple[] = getHighDensityLogoPixels();
