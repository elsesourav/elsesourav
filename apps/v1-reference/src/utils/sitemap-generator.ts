import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import { siteConfig } from '@/config/site.config';
import { isValidSlug } from './slug';

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  readonly loc: string;
  readonly lastmod?: string;
  readonly changefreq?: ChangeFreq;
  readonly priority?: number;
}

export interface BuildSitemapOptions {
  readonly origin?: string;
  readonly apps?: readonly App[];
  readonly blogPosts?: readonly BlogPost[];
  readonly helpArticles?: readonly HelpArticle[];
  readonly helpCategories?: readonly HelpCategory[];
}

export interface BuildRobotsOptions {
  readonly origin?: string;
  readonly sitemapUrl?: string;
}

/**
 * Validates whether a slug contains only safe URL characters (a-z, 0-9, hyphens).
 */
export { isValidSlug };

/**
 * Escapes characters for safe inclusion within XML tags.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats a timestamp into an ISO-8601 date string (YYYY-MM-DD or full ISO).
 * Returns undefined if timestamp is missing, invalid, or zero (prevents fabricating dates).
 */
export function formatLastMod(timestamp?: number | string | Date | null): string | undefined {
  if (!timestamp) return undefined;

  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    if (isNaN(timestamp) || timestamp <= 0) return undefined;
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (isNaN(parsed) || parsed <= 0) return undefined;
    date = new Date(parsed);
  } else {
    return undefined;
  }

  if (isNaN(date.getTime())) return undefined;

  // Format as YYYY-MM-DD
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  // Guard against irrational dates (e.g., year before 2020 or distant future)
  if (year < 2020 || year > 2100) return undefined;

  return `${year}-${month}-${day}`;
}

/**
 * Normalizes and validates the public site origin.
 */
export function getValidOrigin(customOrigin?: string): string {
  const origin = customOrigin || siteConfig.siteOrigin;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return siteConfig.siteOrigin;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return siteConfig.siteOrigin;
  }
}

/**
 * Generates the list of valid Sitemap entries from provided static and dynamic domain entities.
 */
export function buildSitemapEntries(options: BuildSitemapOptions = {}): SitemapEntry[] {
  const origin = getValidOrigin(options.origin);
  const entries: SitemapEntry[] = [];

  // =========================================================================
  // 1. Core Public Static Pages
  // =========================================================================

  // Homepage
  entries.push({
    loc: `${origin}/`,
    changefreq: 'daily',
    priority: 1.0,
  });

  // Apps Catalog
  entries.push({
    loc: `${origin}/apps`,
    changefreq: 'daily',
    priority: 0.9,
  });

  // Blog Listing
  entries.push({
    loc: `${origin}/blog`,
    changefreq: 'daily',
    priority: 0.9,
  });

  // Help Center
  entries.push({
    loc: `${origin}/help`,
    changefreq: 'weekly',
    priority: 0.8,
  });

  // About Page
  entries.push({
    loc: `${origin}/about`,
    changefreq: 'monthly',
    priority: 0.7,
  });

  // Privacy Policy
  entries.push({
    loc: `${origin}/privacy`,
    changefreq: 'monthly',
    priority: 0.5,
  });

  // Terms of Service
  entries.push({
    loc: `${origin}/terms`,
    changefreq: 'monthly',
    priority: 0.5,
  });

  // Cookie Notice
  entries.push({
    loc: `${origin}/cookies`,
    changefreq: 'monthly',
    priority: 0.5,
  });

  // Accessibility Statement
  entries.push({
    loc: `${origin}/accessibility`,
    changefreq: 'monthly',
    priority: 0.5,
  });

  // =========================================================================
  // 2. Dynamic Published Applications
  // =========================================================================
  if (options.apps && Array.isArray(options.apps)) {
    for (const app of options.apps) {
      // Strictly exclude non-published, archived, or soft-deleted apps
      if (app.status !== 'published' || app.archivedAt || app.deletedAt) {
        continue;
      }

      if (!isValidSlug(app.slug)) {
        continue;
      }

      const lastmod = formatLastMod(app.updatedAt || app.publishedAt || app.createdAt);

      entries.push({
        loc: `${origin}/apps/${app.slug}`,
        lastmod,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
  }

  // =========================================================================
  // 3. Dynamic Published Blog Posts
  // =========================================================================
  if (options.blogPosts && Array.isArray(options.blogPosts)) {
    for (const post of options.blogPosts) {
      // Strictly exclude non-published or deleted posts
      if (post.status !== 'published' || post.deletedAt) {
        continue;
      }

      if (!isValidSlug(post.slug)) {
        continue;
      }

      const lastmod = formatLastMod(post.updatedAt || post.publishedAt || post.createdAt);

      entries.push({
        loc: `${origin}/blog/${post.slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: 0.8,
      });
    }
  }

  // =========================================================================
  // 4. Dynamic Published Help Articles
  // =========================================================================
  if (options.helpArticles && Array.isArray(options.helpArticles)) {
    // Build category map if categories provided to resolve category slug safely
    const categoryMap = new Map<string, string>();
    if (options.helpCategories && Array.isArray(options.helpCategories)) {
      for (const cat of options.helpCategories) {
        if (cat.id && isValidSlug(cat.slug)) {
          categoryMap.set(cat.id, cat.slug);
        }
      }
    }

    for (const article of options.helpArticles) {
      // Strictly exclude non-published or deleted articles
      if (article.status !== 'published' || article.deletedAt) {
        continue;
      }

      if (!isValidSlug(article.slug)) {
        continue;
      }

      // Determine category segment safely
      let categorySlug = 'general';
      if (article.categoryId && categoryMap.has(article.categoryId)) {
        categorySlug = categoryMap.get(article.categoryId)!;
      } else if (article.categoryId && isValidSlug(article.categoryId)) {
        categorySlug = article.categoryId;
      }

      const lastmod = formatLastMod(article.updatedAt || article.createdAt);

      entries.push({
        loc: `${origin}/help/${categorySlug}/${article.slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}

/**
 * Serializes an array of SitemapEntry items into a valid XML sitemap string.
 */
export function generateSitemapXml(entries: readonly SitemapEntry[]): string {
  const xmlLines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of entries) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);

    if (entry.lastmod) {
      xmlLines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }

    if (entry.changefreq) {
      xmlLines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }

    if (typeof entry.priority === 'number' && !isNaN(entry.priority)) {
      const clampedPriority = Math.max(0, Math.min(1, entry.priority)).toFixed(1);
      xmlLines.push(`    <priority>${clampedPriority}</priority>`);
    }

    xmlLines.push('  </url>');
  }

  xmlLines.push('</urlset>');
  return xmlLines.join('\n');
}

/**
 * Generates standard robots.txt content adhering to security and indexing guidelines.
 */
export function generateRobotsTxt(options: BuildRobotsOptions = {}): string {
  const origin = getValidOrigin(options.origin);
  const sitemapUrl = options.sitemapUrl || `${origin}/sitemap.xml`;

  return `# ==============================================================================
# ElseSourav Robots Directives (Public Discovery)
# ==============================================================================
User-agent: *

# Allow Public Content Discovery
Allow: /
Allow: /apps
Allow: /blog
Allow: /help
Allow: /about

# Disallow Administrative Control Center
Disallow: /admin
Disallow: /admin/

# Disallow Private User Accounts, Library, and Auth Workflows
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /library
Disallow: /settings
Disallow: /settings/
Disallow: /support/tickets
Disallow: /support/tickets/

# Disallow Internal Search Query Discovery
Disallow: /search

# Canonical Sitemap Reference
Sitemap: ${sitemapUrl}
`;
}
