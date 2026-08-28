/**
 * Validates and sanitizes a requested redirect URL to prevent open redirect vulnerabilities.
 * Only relative application paths (starting with '/' and not '//') are permitted.
 */
export function sanitizeRedirectUrl(
  candidateUrl?: string | null,
  fallbackUrl = '/'
): string {
  if (!candidateUrl || typeof candidateUrl !== 'string') {
    return fallbackUrl;
  }

  const trimmed = candidateUrl.trim();

  // Reject empty string or dangerous protocols (javascript:, data:, vbscript:)
  if (!trimmed || trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return fallbackUrl;
  }

  // Allow only paths that begin with '/' and not protocol-relative '//'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Reject external domains, arbitrary origins, or unparseable URLs
  return fallbackUrl;
}
