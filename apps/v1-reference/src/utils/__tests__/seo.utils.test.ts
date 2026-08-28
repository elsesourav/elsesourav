import { describe, it, expect } from 'vitest';
import {
  formatPageTitle,
  normalizeCanonicalUrl,
  serializeJsonLd,
  buildAppSEO,
  buildBlogPostSEO,
  buildHelpArticleSEO,
  SITE_ORIGIN,
} from '@/utils/seo.utils';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle } from '@/types/help.types';

describe('SEO Utilities (Prompt 53)', () => {
  describe('formatPageTitle', () => {
    it('1. Formats page title with brand suffix', () => {
      expect(formatPageTitle('Explore Applications')).toBe('Explore Applications | ElseSourav');
    });

    it('2. Preserves exact title or existing brand suffix', () => {
      expect(formatPageTitle('ElseSourav — Developer Platform', true)).toBe(
        'ElseSourav — Developer Platform'
      );
      expect(formatPageTitle('Apps | ElseSourav')).toBe('Apps | ElseSourav');
    });

    it('3. Returns default fallback title when title is empty', () => {
      expect(formatPageTitle('')).toBe('ElseSourav — Developer & Software Platform');
    });
  });

  describe('normalizeCanonicalUrl', () => {
    it('4. Converts relative paths to absolute canonical URLs', () => {
      expect(normalizeCanonicalUrl('/apps/cloud-terminal')).toBe(
        `${SITE_ORIGIN}/apps/cloud-terminal`
      );
    });

    it('5. Strips query parameters, search tokens, and tracking tags', () => {
      expect(
        normalizeCanonicalUrl('/search?q=ssh&type=apps&utm_source=twitter#filters')
      ).toBe(`${SITE_ORIGIN}/search`);
      expect(normalizeCanonicalUrl('https://elsesourav.com/blog/my-post?ref=feed')).toBe(
        `${SITE_ORIGIN}/blog/my-post`
      );
    });

    it('6. Rejects unsafe protocols (javascript:, data:)', () => {
      expect(normalizeCanonicalUrl('javascript:alert(1)')).toBe(SITE_ORIGIN);
      expect(normalizeCanonicalUrl('data:text/html,<script>')).toBe(SITE_ORIGIN);
    });
  });

  describe('serializeJsonLd & Security', () => {
    it('7. Safely serializes objects into valid JSON', () => {
      const data = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ElseSourav' };
      const serialized = serializeJsonLd(data);
      expect(JSON.parse(serialized)).toEqual(data);
    });

    it('8. Escapes HTML and script tags to prevent script injection breakouts', () => {
      const malicious = {
        title: '</script><script>alert("hack")</script>',
        html: '<img src="x" onerror="alert(1)">',
      };
      const serialized = serializeJsonLd(malicious);
      expect(serialized).not.toContain('</script>');
      expect(serialized).toContain('\\u003c/script\\u003e');
      expect(serialized).not.toContain('<script>');
    });
  });

  describe('Domain SEO Builders', () => {
    const mockApp: App = {
      id: 'app-terminal',
      slug: 'cloud-terminal',
      name: 'Cloud Terminal Pro',
      shortDescription: 'Advanced web SSH terminal',
      description: 'Full featured cloud terminal',
      iconUrl: 'https://example.com/icon.png',
      primaryCategory: 'developer-tools',
      tags: ['ssh', 'terminal'],
      platforms: ['web', 'macos'],
      links: [],
      screenshots: [],
      currentVersion: '2.1.0',
      stats: { views: 100, launches: 50, libraryAdds: 10 },
      status: 'published',
      isFeatured: true,
      isPinned: false,
      sortOrder: 1,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      publishedAt: 1700000050000,
    };

    const mockBlogPost: BlogPost = {
      id: 'post-1',
      slug: 'cloud-architecture',
      title: 'Building Cloud Architecture',
      excerpt: 'Deep dive into zero-bloat web apps.',
      content: 'Full article body',
      authorId: 'sourav-1',
      authorName: 'Sourav',
      category: 'Engineering',
      tags: ['cloud', 'architecture'],
      status: 'published',
      readingTimeMinutes: 5,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      publishedAt: 1700000050000,
    };

    const mockHelpArticle: HelpArticle = {
      id: 'help-1',
      slug: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts Guide',
      excerpt: 'Productivity shortcuts guide',
      content: 'Guide content',
      categoryId: 'troubleshooting',
      orderIndex: 1,
      status: 'published',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      publishedAt: 1700000050000,
    };

    it('9. buildAppSEO generates valid SoftwareApplication structured data for published apps', () => {
      const config = buildAppSEO(mockApp);
      expect(config.title).toBe('Cloud Terminal Pro');
      expect(config.noIndex).toBe(false);
      expect(config.canonicalPath).toBe('/apps/cloud-terminal');
      expect(config.structuredData).toBeDefined();
      expect((config.structuredData as Record<string, unknown>)['@type']).toBe(
        'SoftwareApplication'
      );
    });

    it('10. buildAppSEO enforces noIndex for draft or unpublished apps', () => {
      const draftApp: App = { ...mockApp, status: 'draft' };
      const config = buildAppSEO(draftApp);
      expect(config.noIndex).toBe(true);
      expect(config.structuredData).toBeUndefined();
    });

    it('11. buildBlogPostSEO generates valid Article structured data for published articles', () => {
      const config = buildBlogPostSEO(mockBlogPost);
      expect(config.title).toBe('Building Cloud Architecture');
      expect(config.noIndex).toBe(false);
      expect(config.canonicalPath).toBe('/blog/cloud-architecture');
      expect((config.structuredData as Record<string, unknown>)['@type']).toBe('Article');
    });

    it('12. buildBlogPostSEO enforces noIndex for draft blog posts', () => {
      const draftPost: BlogPost = { ...mockBlogPost, status: 'draft' };
      const config = buildBlogPostSEO(draftPost);
      expect(config.noIndex).toBe(true);
      expect(config.structuredData).toBeUndefined();
    });

    it('13. buildHelpArticleSEO constructs canonical URL and openGraph data', () => {
      const config = buildHelpArticleSEO(mockHelpArticle);
      expect(config.title).toBe('Keyboard Shortcuts Guide');
      expect(config.canonicalPath).toBe('/help/troubleshooting/keyboard-shortcuts');
      expect(config.noIndex).toBe(false);
    });
  });
});
