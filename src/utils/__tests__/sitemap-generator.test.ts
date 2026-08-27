import { describe, it, expect } from 'vitest';
import {
  buildSitemapEntries,
  generateSitemapXml,
  generateRobotsTxt,
  isValidSlug,
  formatLastMod,
  getValidOrigin,
  escapeXml,
} from '@/utils/sitemap-generator';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import { siteConfig } from '@/config/site.config';

describe('Public URL Discovery & Sitemap Architecture (Prompt 54)', () => {
  const origin = 'https://elsesourav.com';

  const mockPublishedApp: App = {
    id: 'app-terminal',
    slug: 'cloud-terminal',
    name: 'Cloud Terminal',
    shortDescription: 'Modern web SSH terminal',
    description: 'Full featured cloud terminal',
    iconUrl: 'https://example.com/icon.png',
    primaryCategory: 'developer-tools',
    tags: ['ssh', 'terminal'],
    platforms: ['web', 'macos'],
    links: [],
    screenshots: [],
    currentVersion: '1.0.0',
    stats: { views: 100, launches: 50, libraryAdds: 10 },
    status: 'published',
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1705000000000,
    publishedAt: 1700000050000,
  };

  const mockDraftApp: App = {
    ...mockPublishedApp,
    id: 'app-draft',
    slug: 'secret-unreleased-app',
    status: 'draft',
  };

  const mockArchivedApp: App = {
    ...mockPublishedApp,
    id: 'app-archived',
    slug: 'old-sunset-tool',
    status: 'archived',
    archivedAt: 1706000000000,
  };

  const mockPublishedBlogPost: BlogPost = {
    id: 'post-1',
    slug: 'zero-bloat-architecture',
    title: 'Zero Bloat Architecture in 2026',
    excerpt: 'Engineering guide on building resilient web apps without framework bloat.',
    content: 'Full article body',
    authorId: 'sourav-1',
    authorName: 'Sourav',
    category: 'Engineering',
    tags: ['performance', 'architecture'],
    status: 'published',
    readingTimeMinutes: 6,
    createdAt: 1700000000000,
    updatedAt: 1704000000000,
    publishedAt: 1700000050000,
  };

  const mockDraftBlogPost: BlogPost = {
    ...mockPublishedBlogPost,
    id: 'post-draft',
    slug: 'unreleased-internal-notes',
    status: 'draft',
  };

  const mockCategory: HelpCategory = {
    id: 'cat-dev',
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'Guides for developer CLI and cloud tools',
    icon: 'wrench',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockPublishedHelpArticle: HelpArticle = {
    id: 'art-1',
    slug: 'cli-quickstart',
    title: 'CLI Quickstart Guide',
    excerpt: 'How to install and configure ElseSourav CLI.',
    content: 'Full guide text',
    categoryId: 'cat-dev',
    orderIndex: 1,
    status: 'published',
    createdAt: 1700000000000,
    updatedAt: 1703000000000,
    publishedAt: 1700000050000,
  };

  const mockDraftHelpArticle: HelpArticle = {
    ...mockPublishedHelpArticle,
    id: 'art-draft',
    slug: 'internal-unreleased-guide',
    status: 'draft',
  };

  // ---------------------------------------------------------------------------
  // 1. Sitemap Generation
  // ---------------------------------------------------------------------------
  it('1. Generates valid XML sitemap structure with schema declaration', () => {
    const entries = buildSitemapEntries({ origin });
    const xml = generateSitemapXml(entries);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('</urlset>');
  });

  // ---------------------------------------------------------------------------
  // 2. Homepage Included
  // ---------------------------------------------------------------------------
  it('2. Includes homepage with top priority (1.0) and daily change frequency', () => {
    const entries = buildSitemapEntries({ origin });
    const home = entries.find((e) => e.loc === `${origin}/`);

    expect(home).toBeDefined();
    expect(home?.priority).toBe(1.0);
    expect(home?.changefreq).toBe('daily');
  });

  // ---------------------------------------------------------------------------
  // 3. Published Apps Included
  // ---------------------------------------------------------------------------
  it('3. Includes published apps with canonical path and formatted lastmod', () => {
    const entries = buildSitemapEntries({
      origin,
      apps: [mockPublishedApp],
    });

    const appEntry = entries.find((e) => e.loc === `${origin}/apps/cloud-terminal`);
    expect(appEntry).toBeDefined();
    expect(appEntry?.priority).toBe(0.8);
    expect(appEntry?.changefreq).toBe('weekly');
    expect(appEntry?.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ---------------------------------------------------------------------------
  // 4. Draft Apps Excluded
  // ---------------------------------------------------------------------------
  it('4. Excludes draft, unpublished, archived, or deleted apps', () => {
    const deletedApp: App = { ...mockPublishedApp, id: 'del-1', slug: 'deleted-app', deletedAt: Date.now() };
    const entries = buildSitemapEntries({
      origin,
      apps: [mockPublishedApp, mockDraftApp, mockArchivedApp, deletedApp],
    });

    const locs = entries.map((e) => e.loc);
    expect(locs).toContain(`${origin}/apps/cloud-terminal`);
    expect(locs).not.toContain(`${origin}/apps/secret-unreleased-app`);
    expect(locs).not.toContain(`${origin}/apps/old-sunset-tool`);
    expect(locs).not.toContain(`${origin}/apps/deleted-app`);
  });

  // ---------------------------------------------------------------------------
  // 5. Published Blog Posts Included
  // ---------------------------------------------------------------------------
  it('5. Includes published blog posts with lastmod date', () => {
    const entries = buildSitemapEntries({
      origin,
      blogPosts: [mockPublishedBlogPost],
    });

    const postEntry = entries.find((e) => e.loc === `${origin}/blog/zero-bloat-architecture`);
    expect(postEntry).toBeDefined();
    expect(postEntry?.priority).toBe(0.8);
    expect(postEntry?.changefreq).toBe('monthly');
    expect(postEntry?.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ---------------------------------------------------------------------------
  // 6. Draft Blog Posts Excluded
  // ---------------------------------------------------------------------------
  it('6. Excludes draft or soft-deleted blog posts', () => {
    const deletedPost: BlogPost = {
      ...mockPublishedBlogPost,
      id: 'del-post',
      slug: 'deleted-article',
      deletedAt: Date.now(),
    };
    const entries = buildSitemapEntries({
      origin,
      blogPosts: [mockPublishedBlogPost, mockDraftBlogPost, deletedPost],
    });

    const locs = entries.map((e) => e.loc);
    expect(locs).toContain(`${origin}/blog/zero-bloat-architecture`);
    expect(locs).not.toContain(`${origin}/blog/unreleased-internal-notes`);
    expect(locs).not.toContain(`${origin}/blog/deleted-article`);
  });

  // ---------------------------------------------------------------------------
  // 7. Published Help Articles Included
  // ---------------------------------------------------------------------------
  it('7. Includes published Help articles resolving category slug safely', () => {
    const entries = buildSitemapEntries({
      origin,
      helpArticles: [mockPublishedHelpArticle],
      helpCategories: [mockCategory],
    });

    const helpEntry = entries.find(
      (e) => e.loc === `${origin}/help/developer-tools/cli-quickstart`
    );
    expect(helpEntry).toBeDefined();
    expect(helpEntry?.priority).toBe(0.7);
    expect(helpEntry?.changefreq).toBe('monthly');
    expect(helpEntry?.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ---------------------------------------------------------------------------
  // 8. Draft Help Articles Excluded
  // ---------------------------------------------------------------------------
  it('8. Excludes draft or deleted help articles', () => {
    const deletedArticle: HelpArticle = {
      ...mockPublishedHelpArticle,
      id: 'del-art',
      slug: 'deleted-guide',
      deletedAt: Date.now(),
    };
    const entries = buildSitemapEntries({
      origin,
      helpArticles: [mockPublishedHelpArticle, mockDraftHelpArticle, deletedArticle],
      helpCategories: [mockCategory],
    });

    const locs = entries.map((e) => e.loc);
    expect(locs).toContain(`${origin}/help/developer-tools/cli-quickstart`);
    expect(locs).not.toContain(`${origin}/help/developer-tools/internal-unreleased-guide`);
    expect(locs).not.toContain(`${origin}/help/developer-tools/deleted-guide`);
  });

  // ---------------------------------------------------------------------------
  // 9. Private User & Auth Routes Excluded
  // ---------------------------------------------------------------------------
  it('9. Strictly excludes private auth and user routes (/login, /signup, /library, /settings)', () => {
    const entries = buildSitemapEntries({ origin });
    const locs = entries.map((e) => e.loc);

    expect(locs).not.toContain(`${origin}/login`);
    expect(locs).not.toContain(`${origin}/signup`);
    expect(locs).not.toContain(`${origin}/forgot-password`);
    expect(locs).not.toContain(`${origin}/library`);
    expect(locs).not.toContain(`${origin}/settings`);
    expect(locs).not.toContain(`${origin}/support/tickets`);
  });

  // ---------------------------------------------------------------------------
  // 10. Admin Routes Excluded
  // ---------------------------------------------------------------------------
  it('10. Strictly excludes admin routes (/admin, /admin/*)', () => {
    const entries = buildSitemapEntries({ origin });
    const locs = entries.map((e) => e.loc);

    expect(locs.some((loc) => loc.includes('/admin'))).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 11. Search URLs Excluded
  // ---------------------------------------------------------------------------
  it('11. Strictly excludes search query pages (/search)', () => {
    const entries = buildSitemapEntries({ origin });
    const locs = entries.map((e) => e.loc);

    expect(locs.some((loc) => loc.includes('/search'))).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 12. Canonical Origin Correct
  // ---------------------------------------------------------------------------
  it('12. Enforces canonical public origin from siteConfig and rejects unsafe protocols', () => {
    expect(getValidOrigin('https://elsesourav.com/')).toBe('https://elsesourav.com');
    expect(getValidOrigin('javascript:alert(1)')).toBe(siteConfig.siteOrigin);
    expect(getValidOrigin('data:text/html,abc')).toBe(siteConfig.siteOrigin);

    const entries = buildSitemapEntries({ origin: 'https://staging.elsesourav.com' });
    expect(entries[0]?.loc).toBe('https://staging.elsesourav.com/');
  });

  // ---------------------------------------------------------------------------
  // 13. robots.txt Content & Directives
  // ---------------------------------------------------------------------------
  it('13. Generates robots.txt with correct public allowances and private disallows', () => {
    const robots = generateRobotsTxt({ origin });

    // Allowed public discovery
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Allow: /apps');
    expect(robots).toContain('Allow: /blog');
    expect(robots).toContain('Allow: /help');
    expect(robots).toContain('Allow: /about');

    // Blocked administration
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /admin/');

    // Blocked private account areas
    expect(robots).toContain('Disallow: /login');
    expect(robots).toContain('Disallow: /signup');
    expect(robots).toContain('Disallow: /forgot-password');
    expect(robots).toContain('Disallow: /library');
    expect(robots).toContain('Disallow: /settings');
    expect(robots).toContain('Disallow: /support/tickets');

    // Blocked internal search discovery
    expect(robots).toContain('Disallow: /search');
  });

  // ---------------------------------------------------------------------------
  // 14. Sitemap Reference in robots.txt
  // ---------------------------------------------------------------------------
  it('14. Points to canonical sitemap reference in robots.txt', () => {
    const robots = generateRobotsTxt({ origin });
    expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  // ---------------------------------------------------------------------------
  // 15. Invalid Content URL Handling & XML Escaping
  // ---------------------------------------------------------------------------
  it('15. Validates slugs strictly and sanitizes XML entities safely', () => {
    // Slug validation rules
    expect(isValidSlug('valid-slug-123')).toBe(true);
    expect(isValidSlug('cloud-terminal-pro')).toBe(true);
    expect(isValidSlug('../path-traversal')).toBe(false);
    expect(isValidSlug('slug<script>alert(1)</script>')).toBe(false);
    expect(isValidSlug('slug with spaces')).toBe(false);
    expect(isValidSlug('')).toBe(false);

    // XML escaping
    expect(escapeXml('<script>&"\'</script>')).toBe('&lt;script&gt;&amp;&quot;&apos;&lt;/script&gt;');

    // Safe lastmod handling without date fabrication
    expect(formatLastMod(undefined)).toBeUndefined();
    expect(formatLastMod(null)).toBeUndefined();
    expect(formatLastMod(0)).toBeUndefined();
    expect(formatLastMod(-1)).toBeUndefined();
    expect(formatLastMod('invalid-date')).toBeUndefined();
    expect(formatLastMod(1705000000000)).toBe('2024-01-11');

    // App with malicious/invalid slug is excluded
    const maliciousApp: App = {
      ...mockPublishedApp,
      id: 'bad-1',
      slug: '../admin/inject<script>',
    };
    const entries = buildSitemapEntries({ origin, apps: [maliciousApp] });
    const xml = generateSitemapXml(entries);
    expect(xml).not.toContain('../admin');
    expect(xml).not.toContain('<script>');
  });

  // ---------------------------------------------------------------------------
  // 16. XML Well-Formedness Validation
  // ---------------------------------------------------------------------------
  it('16. Validates generated XML against DOMParser without syntax or schema errors', () => {
    const entries = buildSitemapEntries({
      origin,
      apps: [mockPublishedApp],
      blogPosts: [mockPublishedBlogPost],
      helpArticles: [mockPublishedHelpArticle],
      helpCategories: [mockCategory],
    });

    const xml = generateSitemapXml(entries);
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const parserError = doc.querySelector('parsererror');
    expect(parserError).toBeNull();

    const urls = doc.querySelectorAll('url');
    expect(urls.length).toBe(entries.length);

    const firstUrl = urls[0];
    expect(firstUrl?.querySelector('loc')?.textContent).toBe(`${origin}/`);
    expect(firstUrl?.querySelector('priority')?.textContent).toBe('1.0');
    expect(firstUrl?.querySelector('changefreq')?.textContent).toBe('daily');
  });
});
