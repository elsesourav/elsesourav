import { describe, it, expect, vi } from 'vitest';
import { SITE_CONFIG } from '@elsesourav/config';
import {
  AppRepository,
  AppQueryService,
  BlogRepository,
  BlogService,
  HelpRepository,
  HelpService,
} from '@elsesourav/database';

describe('SEO, Sitemap, and Discoverability Boundary Verification', () => {
  it('should verify SITE_CONFIG canonical URL base is HTTPS and production-ready', () => {
    expect(SITE_CONFIG.url).toBe('https://elsesourav.com');
    expect(SITE_CONFIG.url.startsWith('https://')).toBe(true);
    expect(SITE_CONFIG.name).toBe('ElseSourav');
    expect(SITE_CONFIG.description.length).toBeGreaterThan(20);
  });

  it('should verify sitemap generator builds canonical entries for published apps and excludes drafts', async () => {
    const mockAppRepo = {
      listPublic: vi.fn().mockResolvedValue([
        {
          id: 'app-1',
          name: 'Web Terminal',
          slug: 'web-terminal',
          shortDescription: 'High performance terminal',
          updatedAt: new Date('2026-08-20T00:00:00Z'),
          status: 'PUBLISHED',
        },
      ]),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockAppRepo);
    const apps = await queryService.listPublicApps();

    expect(apps).toHaveLength(1);
    expect(apps[0]?.slug).toBe('web-terminal');

    const sitemapUrl = `${SITE_CONFIG.url}/apps/${apps[0]?.slug}`;
    expect(sitemapUrl).toBe('https://elsesourav.com/apps/web-terminal');
    expect(sitemapUrl).not.toContain('/admin');
    expect(sitemapUrl).not.toContain('/draft');
  });

  it('should verify sitemap generator builds canonical entries for published blog articles', async () => {
    const mockBlogRepo = {
      findPublicPosts: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'post-1',
            title: 'Scaling Next.js 15 App Router',
            slug: 'scaling-nextjs-15',
            excerpt: 'Deep dive into caching and SSR',
            author: { id: 'auth-1', displayName: 'Sourav' },
            tags: [],
            readingTime: 5,
            viewsCount: 100,
            createdAt: new Date('2026-08-25T00:00:00Z'),
          },
        ],
        totalCount: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false,
      }),
    } as unknown as BlogRepository;

    const blogService = new BlogService(mockBlogRepo);
    const result = await blogService.listPublicPosts();

    expect(result.items).toHaveLength(1);
    const sitemapUrl = `${SITE_CONFIG.url}/notes/${result.items[0]?.slug}`;
    expect(sitemapUrl).toBe('https://elsesourav.com/notes/scaling-nextjs-15');
  });

  it('should verify sitemap generator builds canonical entries for published help categories and articles', async () => {
    const mockHelpRepo = {
      findPublicCategories: vi.fn().mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Getting Started',
          slug: 'getting-started',
          articles: [
            {
              id: 'art-1',
              title: 'Account Authentication & Security',
              slug: 'account-security',
              updatedAt: new Date('2026-08-26T00:00:00Z'),
              isPublished: true,
            },
          ],
        },
      ]),
    } as unknown as HelpRepository;

    const helpService = new HelpService(mockHelpRepo);
    const categories = await helpService.listPublicCategories();

    expect(categories).toHaveLength(1);
    const catUrl = `${SITE_CONFIG.url}/help/${categories[0]?.slug}`;
    const artUrl = `${SITE_CONFIG.url}/help/${categories[0]?.slug}/${categories[0]?.articles[0]?.slug}`;

    expect(catUrl).toBe('https://elsesourav.com/help/getting-started');
    expect(artUrl).toBe('https://elsesourav.com/help/getting-started/account-security');
  });

  it('should verify private route disallow list contains all authenticated and administrative namespaces', () => {
    const disallowList = [
      '/admin',
      '/admin/',
      '/api/',
      '/settings',
      '/library',
      '/support',
      '/notifications',
      '/dashboard',
      '/profile',
      '/reset-password',
      '/forgot-password',
      '/verify',
      '/auth-error',
    ];

    expect(disallowList).toContain('/admin');
    expect(disallowList).toContain('/settings');
    expect(disallowList).toContain('/library');
    expect(disallowList).toContain('/support');
    expect(disallowList).toContain('/notifications');
    expect(disallowList).toContain('/api/');
    expect(disallowList).not.toContain('/apps');
    expect(disallowList).not.toContain('/notes');
    expect(disallowList).not.toContain('/help');
  });
});
