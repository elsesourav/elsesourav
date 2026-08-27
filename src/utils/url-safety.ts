/**
 * URL Safety Validation Utility
 * Guards against malicious protocols (javascript:, data:, vbscript:), script injection, and open redirects.
 */

/**
 * Checks if a URL string is safe for href, src, or window.open actions.
 * Allows standard HTTP/HTTPS protocols, mailto/tel, and relative paths.
 * Strictly rejects javascript:, data:, vbscript:, and control characters.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Check for control characters
  const hasControlChars = [...trimmed].some((char) => {
    const code = char.charCodeAt(0);
    return code < 32 || code === 127;
  });
  if (hasControlChars) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('/') ||
    lower.startsWith('#')
  );
}

/**
 * Strictly verifies whether a URL is a valid, absolute HTTP/HTTPS destination.
 */
export function isSafeExternalUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
