import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalSearchService } from '@/services/global-search.service';
import { appRepository } from '@/repositories/app.repository';
import { blogRepository } from '@/repositories/blog.repository';
import { helpArticleRepository } from '@/repositories/help.repository';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle } from '@/types/help.types';
import { ok } from '@/lib/result';

describe('Global Search Service (Prompt 51)', () => {
  const mockPublishedApp: App = {
    id: 'app-terminal',
    slug: 'cloud-terminal',
    name: 'Cloud Terminal Pro',
    shortDescription: 'Advanced web-based SSH terminal for developers',
    description: 'Full featured cloud terminal with syntax highlighting.',
    iconUrl: 'https://example.com/icon.png',
    primaryCategory: 'developer-tools',
    tags: ['ssh', 'terminal', 'cloud'],
    platforms: ['web', 'macos'],
    links: [],
    screenshots: [],
    currentVersion: '2.1.0',
    stats: { views: 1000, launches: 500, libraryAdds: 200 },
    status: 'published',
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700000050000,
  };

  const mockDraftApp: App = {
    id: 'app-secret',
    slug: 'secret-unreleased-tool',
    name: 'Secret Cloud Terminal Alpha',
    shortDescription: 'Unpublished internal tool',
    description: 'Internal preview only.',
    iconUrl: '',
    primaryCategory: 'utilities',
    tags: ['internal'],
    platforms: ['web'],
    links: [],
    screenshots: [],
    currentVersion: '0.1.0',
    stats: { views: 0, launches: 0, libraryAdds: 0 },
    status: 'draft',
    isFeatured: false,
    isPinned: false,
    sortOrder: 0,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockBlogPost: BlogPost = {
    id: 'post-1',
    slug: 'building-cloud-terminal',
    title: 'Building a Fast Cloud Terminal with WebSockets',
    excerpt: 'Deep dive into low-latency terminal rendering with React and WebSockets.',
    content: 'Full article body about terminal architecture.',
    authorId: 'user-sourav',
    authorName: 'Sourav',
    category: 'Engineering',
    tags: ['websockets', 'react', 'terminal'],
    status: 'published',
    readingTimeMinutes: 6,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700000050000,
  };

  const mockHelpArticle: HelpArticle = {
    id: 'help-1',
    slug: 'terminal-shortcuts',
    title: 'Keyboard Shortcuts for Cloud Terminal',
    excerpt: 'Master cloud terminal productivity with custom keybindings.',
    content: 'Full help article on shortcut keys.',
    categoryId: 'troubleshooting',
    orderIndex: 1,
    status: 'published',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    publishedAt: 1700000050000,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockPublishedApp, mockDraftApp], hasMore: false })
    );

    vi.spyOn(blogRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockBlogPost], hasMore: false })
    );

    vi.spyOn(helpArticleRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockHelpArticle], hasMore: false })
    );
  });

  it('1. Searches across apps, blog posts, and help articles simultaneously', async () => {
    const res = await globalSearchService.search({ query: 'terminal' });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.query).toBe('terminal');
      expect(res.data.apps.length).toBe(1);
      expect(res.data.apps[0]?.title).toBe('Cloud Terminal Pro');
      expect(res.data.blogPosts.length).toBe(1);
      expect(res.data.blogPosts[0]?.title).toBe('Building a Fast Cloud Terminal with WebSockets');
      expect(res.data.helpArticles.length).toBe(1);
      expect(res.data.helpArticles[0]?.title).toBe('Keyboard Shortcuts for Cloud Terminal');
      expect(res.data.totalCount).toBe(3);
    }
  });

  it('2. Excludes private or draft content strictly from search results', async () => {
    const res = await globalSearchService.search({ query: 'Secret' });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.apps.length).toBe(0);
      expect(res.data.totalCount).toBe(0);
    }
  });

  it('3. Filters results by specific content type', async () => {
    const res = await globalSearchService.search({ query: 'terminal', type: 'app' });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.apps.length).toBe(1);
      expect(res.data.blogPosts.length).toBe(0);
      expect(res.data.helpArticles.length).toBe(0);
    }
  });

  it('4. Provides fast lightweight suggestions for search autocompletion', async () => {
    const res = await globalSearchService.getSuggestions('terminal', 3);

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.length).toBe(3);
      expect(res.data[0]?.type).toBe('app'); // Apps prioritized first
    }
  });

  it('5. Returns empty result cleanly when query is whitespace or empty', async () => {
    const res = await globalSearchService.search({ query: '   ' });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.totalCount).toBe(0);
      expect(res.data.apps.length).toBe(0);
    }
  });
});
