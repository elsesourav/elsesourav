const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
// eslint-disable-next-line no-control-regex
const DANGEROUS_PROTOCOL_REGEX =
  /^[\u0000-\u001F\u007F-\u009F\s]*(javascript|data|vbscript|blob):/i;

export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Block dangerous schemes even if encoded or with control characters
  if (DANGEROUS_PROTOCOL_REGEX.test(trimmed)) {
    return false;
  }

  // Handle relative paths: must start with single '/' and not '//' or '/\'
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.includes('\\')) {
      return false;
    }
    return true;
  }

  // Handle fragment/anchor links
  if (trimmed.startsWith('#')) {
    return true;
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(trimmed);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string | null | undefined, fallback = '#'): string {
  return isSafeUrl(url) ? (url as string).trim() : fallback;
}

/**
 * Validates internal redirect target to prevent open redirect attacks.
 * Only allows root-relative paths and rejects protocol-relative or external URLs.
 */
export function getSafeRedirectUrl(url: string | null | undefined, fallback = '/'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes('\\')
  ) {
    return trimmed;
  }
  return fallback;
}
