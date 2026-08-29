/**
 * Security & Sanitization Utilities
 * Protects against XSS, script injection, and unsafe HTML payloads.
 */

const DANGEROUS_TAGS_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const DANGEROUS_ATTRIBUTES_REGEX =
  /\s*(on\w+|javascript:|data:text\/html)\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const IFRAME_OBJECT_REGEX =
  /<(iframe|object|embed|applet|meta|link|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi;
const SELF_CLOSING_DANGEROUS = /<(meta|link|base)[^>]*\/?>/gi;

/**
 * Sanitizes HTML strings by stripping dangerous executable script tags, event handlers, and unsafe protocols.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  let clean = dirtyHtml;

  // 1. Strip <script>...</script>
  clean = clean.replace(DANGEROUS_TAGS_REGEX, '');

  // 2. Strip dangerous embeds: iframe, object, embed, applet, meta, link, style
  clean = clean.replace(IFRAME_OBJECT_REGEX, '');
  clean = clean.replace(SELF_CLOSING_DANGEROUS, '');

  // 3. Strip inline event handlers (onclick, onload, onerror, etc.) and javascript: protocols
  clean = clean.replace(DANGEROUS_ATTRIBUTES_REGEX, '');

  // 4. Strip href="javascript:..." or src="javascript:..."
  clean = clean.replace(/(href|src)\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, '');

  return clean;
}

/**
 * Sanitizes plain text input by stripping all HTML tags, script/style contents, and normalizing whitespace.
 */
export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // 1. Remove dangerous executable script and style content entirely
  let clean = text
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Remove all remaining HTML tags
  clean = clean.replace(/<[^>]*>/g, '');

  // 3. Trim and normalize excessive spaces
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}
