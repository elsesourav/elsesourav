import { ROUTES } from '@/constants/routes';

/**
 * Validates and sanitizes a redirect target URL to prevent Open Redirect attacks.
 * Strictly allows only internal relative paths (e.g. "/library", "/support/tickets").
 *
 * Rejects:
 * - External absolute URLs ("https://evil.com", "http://attacker.org")
 * - Protocol-relative URLs ("//evil.com")
 * - Backslash-encoded URLs ("/\evil.com")
 * - JavaScript/Data schemes ("javascript:alert(1)", "data:text/html...")
 * - Control characters or whitespace bypasses
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  fallback: string = ROUTES.LIBRARY
): string {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Must start with a single forward slash and not a second slash or backslash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Must not contain any protocol schemes or colons prior to query params
  const pathPart = trimmed.split('?')[0]?.split('#')[0] || '';
  if (pathPart.includes(':') || pathPart.includes('\\')) {
    return fallback;
  }

  // Must not contain control characters or dangerous keywords
  const hasControlChars = [...trimmed].some((char) => {
    const code = char.charCodeAt(0);
    return code < 32 || code === 127;
  });

  if (hasControlChars || /javascript:/i.test(trimmed) || /data:/i.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
