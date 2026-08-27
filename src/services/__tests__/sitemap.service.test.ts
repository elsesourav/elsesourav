import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sitemapService } from '@/services/sitemap.service';
import { appRepository } from '@/repositories/app.repository';
import { blogRepository } from '@/repositories/blog.repository';
import { helpRepository } from '@/repositories/help.repository';
import { ok } from '@/lib/result';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';

describe('SitemapService Integration & Fallback Handling', () => {
  const mockApp: App = {
    id: 'app-1',
    slug: 'codeflow-ide',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern IDE',
    description: 'Code editor',
    iconUrl: 'https://example.com/icon.png',
    primaryCategory: 'developer-tools',
    tags: ['ide', 'editor'],
    platforms: ['web', 'macos'],
    links: [],
    screenshots: [],
    currentVersion: '1.0.0',
    stats: { views: 10, launches: 5, libraryAdds: 2 },
    status: 'published',
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1705000000000,
    publishedAt: 1700000050000,
  };

  const mockPost: BlogPost = {
    id: 'post-1',
    slug: 'fast-web-apps',
    title: 'Fast Web Apps',
    excerpt: 'Performance tips',
    content: 'Article text',
    authorId: 'sourav',
    authorName: 'Sourav',
    category: 'Engineering',
    tags: ['performance'],
    status: 'published',
    readingTimeMinutes: 3,
    createdAt: 1700000000000,
    updatedAt: 1704000000000,
    publishedAt: 1700000050000,
  };

  const mockCategory: HelpCategory = {
    id: 'cat-general',
    slug: 'general',
    name: 'General',
    description: 'General help',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockArticle: HelpArticle = {
    id: 'art-1',
    slug: 'getting-started',
    title: 'Getting Started',
    excerpt: 'Guide to getting started',
    content: 'Guide text',
    categoryId: 'cat-general',
    orderIndex: 1,
    status: 'published',
    createdAt: 1700000000000,
    updatedAt: 1703000000000,
    publishedAt: 1700000050000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Fetches dynamic content from repositories and generates sitemap + robots.txt', async () => {
    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockApp], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockPost], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpRepository, 'listPublishedArticles').mockResolvedValue(
      ok({ items: [mockArticle], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpRepository, 'listCategories').mockResolvedValue(
      ok({ items: [mockCategory], totalCount: 1, hasMore: false })
    );

    const result = await sitemapService.generateProductionSitemap();

    expect(result.success).toBe(true);
    expect(result.sitemapXml).toContain('https://elsesourav.com/apps/codeflow-ide');
    expect(result.sitemapXml).toContain('https://elsesourav.com/blog/fast-web-apps');
    expect(result.sitemapXml).toContain('https://elsesourav.com/help/general/getting-started');
    expect(result.robotsTxt).toContain('Sitemap: https://elsesourav.com/sitemap.xml');
    expect(result.entryCount).toBe(8); // 5 static + 1 app + 1 post + 1 article
  });

  it('2. Gracefully handles repository query errors with fallback baseline entries', async () => {
    vi.spyOn(appRepository, 'findMany').mockRejectedValue(new Error('Network disconnected'));
    vi.spyOn(blogRepository, 'findMany').mockRejectedValue(new Error('Firestore unavailable'));
    vi.spyOn(helpRepository, 'listPublishedArticles').mockRejectedValue(
      new Error('Firestore unavailable')
    );
    vi.spyOn(helpRepository, 'listCategories').mockRejectedValue(
      new Error('Firestore unavailable')
    );

    const result = await sitemapService.generateProductionSitemap();

    expect(result.success).toBe(true);
    expect(result.entryCount).toBe(5); // 5 core public static pages
    expect(result.sitemapXml).toContain('https://elsesourav.com/');
    expect(result.sitemapXml).toContain('https://elsesourav.com/apps');
    expect(result.sitemapXml).toContain('https://elsesourav.com/blog');
    expect(result.sitemapXml).toContain('https://elsesourav.com/help');
    expect(result.sitemapXml).toContain('https://elsesourav.com/about');
    expect(result.robotsTxt).toContain('Sitemap: https://elsesourav.com/sitemap.xml');
  });
});
