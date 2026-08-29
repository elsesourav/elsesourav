// eslint-disable-next-line no-control-regex
const DANGEROUS_PREFIX_REGEX = /^[\u0000-\u001F\u007F-\u009F\s]*(javascript|data|vbscript|blob):/i;

/**
 * Validates and sanitizes a requested redirect URL to prevent open redirect vulnerabilities.
 * Only relative application paths (starting with '/' and not '//') are permitted.
 */
export function sanitizeRedirectUrl(candidateUrl?: string | null, fallbackUrl = '/'): string {
  if (!candidateUrl || typeof candidateUrl !== 'string') {
    return fallbackUrl;
  }

  const trimmed = candidateUrl.trim();

  // Reject empty string or dangerous schemes
  if (!trimmed || DANGEROUS_PREFIX_REGEX.test(trimmed)) {
    return fallbackUrl;
  }

  // Allow only paths that begin with '/' and NOT '//', '/\', or containing backslashes / CR/LF
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes('\\') &&
    !trimmed.includes('\r') &&
    !trimmed.includes('\n')
  ) {
    return trimmed;
  }

  // Reject external domains, arbitrary origins, or unparseable URLs
  return fallbackUrl;
}
