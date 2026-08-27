/**
 * URL Slug generation and validation utility
 */

/**
 * Transforms any title or string into a URL-safe lowercase kebab-case slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Separate base characters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritic accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except space and hyphens
    .replace(/\s+/g, '-') // Replace spaces with a single hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, ''); // Trim hyphens from end
}

/**
 * Validates whether a given string is a valid lowercase kebab-case slug
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
