import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '@/app/auth-context';
import type { AuthContextValue } from '@/types/auth.types';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AppsPage } from '@/pages/AppsPage';
import { AppDetailPage } from '@/pages/AppDetailPage';
import { BlogPage } from '@/pages/BlogPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { HelpPage } from '@/pages/HelpPage';
import { HelpArticlePage } from '@/pages/HelpArticlePage';
import { SupportPage } from '@/pages/SupportPage';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { globalSearchService } from '@/services/global-search.service';
import { appService } from '@/services/app.service';
import { blogService } from '@/services/blog.service';
import { helpService } from '@/services/help.service';
import { analyticsService } from '@/services/analytics.service';
import { buildSitemapEntries, generateSitemapXml, generateRobotsTxt } from '@/utils/sitemap-generator';
import { getSafeRedirectUrl } from '@/utils/redirect';
import { isSafeUrl } from '@/utils/url-safety';
import { ok } from '@/lib/result';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import { ROUTES } from '@/constants/routes';

// =============================================================================
// Mock Domain Data
// =============================================================================

const mockPublishedApp: App = {
  id: 'app-cloud-term',
  slug: 'cloud-terminal',
  name: 'Cloud Terminal Pro',
  shortDescription: 'Modern web SSH terminal',
  description: 'Full-featured secure cloud terminal and shell environment.',
  iconUrl: 'https://example.com/icon.png',
  primaryCategory: 'developer-tools',
  tags: ['terminal', 'ssh', 'cloud'],
  platforms: ['web', 'macos'],
  links: [
    {
      id: 'link-1',
      appId: 'app-cloud-term',
      label: 'Launch Web App',
      url: 'https://term.elsesourav.com',
      platform: 'web',
      displayOrder: 1,
      isActive: true,
    },
  ],
  screenshots: [],
  currentVersion: '2.1.0',
  stats: { views: 500, launches: 250, libraryAdds: 40 },
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
  id: 'app-secret-draft',
  slug: 'secret-unreleased-tool',
  name: 'Secret Tool',
  status: 'draft',
};

const mockPublishedPost: BlogPost = {
  id: 'post-zero-bloat',
  slug: 'zero-bloat-architecture',
  title: 'Zero Bloat Architecture',
  excerpt: 'Building high performance web platforms with native browser primitives.',
  content: '# Zero Bloat Architecture\nDeep dive into minimalist engineering.',
  authorId: 'sourav-1',
  authorName: 'ElseSourav',
  category: 'Engineering',
  tags: ['architecture', 'performance'],
  status: 'published',
  readingTimeMinutes: 5,
  createdAt: 1700000000000,
  updatedAt: 1704000000000,
  publishedAt: 1700000050000,
};

const mockDraftPost: BlogPost = {
  ...mockPublishedPost,
  id: 'post-draft-notes',
  slug: 'unreleased-internal-notes',
  title: 'Unreleased Draft Post',
  status: 'draft',
};

const mockHelpCategory: HelpCategory = {
  id: 'cat-dev',
  slug: 'developer-tools',
  name: 'Developer Tools',
  description: 'Guides for developer utilities',
  icon: 'wrench',
  orderIndex: 1,
  isActive: true,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const mockHelpArticle: HelpArticle = {
  id: 'art-cli-guide',
  slug: 'cli-quickstart',
  title: 'CLI Quickstart Guide',
  excerpt: 'How to install and authenticate with the ElseSourav CLI.',
  content: '# CLI Quickstart\nRun `npx elsesourav login` to get started.',
  categoryId: 'cat-dev',
  orderIndex: 1,
  status: 'published',
  createdAt: 1700000000000,
  updatedAt: 1703000000000,
  publishedAt: 1700000050000,
};

const mockDraftHelpArticle: HelpArticle = {
  ...mockHelpArticle,
  id: 'art-draft-guide',
  slug: 'internal-unreleased-guide',
  title: 'Draft Guide',
  status: 'draft',
};

const unauthenticatedAuthContext: AuthContextValue = {
  user: null,
  authUser: null,
  role: 'user',
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  sendPasswordReset: vi.fn(),
  sendVerificationEmail: vi.fn(),
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
  clearError: vi.fn(),
};

describe('End-to-End Public Discovery Journey (Task 14 Quality Control)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(analyticsService, 'trackView').mockResolvedValue(undefined);
    vi.spyOn(analyticsService, 'trackPrimaryAction').mockResolvedValue(undefined);

    // Default mock service responses
    vi.spyOn(appService, 'getAppBySlug').mockImplementation(async (slug) => {
      if (slug === mockPublishedApp.slug) return ok(mockPublishedApp);
      if (slug === mockDraftApp.slug) return ok(mockDraftApp);
      return ok(null);
    });

    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(
      ok({ items: [mockPublishedApp], totalCount: 1, hasMore: false })
    );

    vi.spyOn(blogService, 'getPostBySlug').mockImplementation(async (slug) => {
      if (slug === mockPublishedPost.slug) return ok(mockPublishedPost);
      if (slug === mockDraftPost.slug) return ok(mockDraftPost);
      return ok(null);
    });

    vi.spyOn(blogService, 'listPublishedPosts').mockResolvedValue(
      ok({ items: [mockPublishedPost], totalCount: 1, hasMore: false })
    );

    vi.spyOn(blogService, 'listPostsByCategory').mockResolvedValue(
      ok({ items: [mockPublishedPost], totalCount: 1, hasMore: false })
    );

    vi.spyOn(helpService, 'getArticleBySlug').mockImplementation(async (slug) => {
      if (slug === mockHelpArticle.slug) return ok(mockHelpArticle);
      if (slug === mockDraftHelpArticle.slug) return ok(mockDraftHelpArticle);
      return ok(null);
    });

    vi.spyOn(helpService, 'getCategoryById').mockResolvedValue(ok(mockHelpCategory));

    vi.spyOn(helpService, 'listActiveCategories').mockResolvedValue(
      ok({ items: [mockHelpCategory], totalCount: 1, hasMore: false })
    );

    vi.spyOn(helpService, 'listPublishedArticles').mockResolvedValue(
      ok({ items: [mockHelpArticle], totalCount: 1, hasMore: false })
    );

    vi.spyOn(helpService, 'listArticlesByCategory').mockResolvedValue(
      ok({ items: [mockHelpArticle], totalCount: 1, hasMore: false })
    );

    vi.spyOn(globalSearchService, 'search').mockResolvedValue(
      ok({
        query: 'terminal',
        apps: [
          {
            id: mockPublishedApp.id,
            type: 'app',
            title: mockPublishedApp.name,
            description: mockPublishedApp.shortDescription,
            destination: `/apps/${mockPublishedApp.slug}`,
            category: mockPublishedApp.primaryCategory,
            relevanceScore: 100,
            matchReason: 'exact_title',
          },
        ],
        blogPosts: [
          {
            id: mockPublishedPost.id,
            type: 'blog_post',
            title: mockPublishedPost.title,
            description: mockPublishedPost.excerpt,
            destination: `/blog/${mockPublishedPost.slug}`,
            category: mockPublishedPost.category,
            relevanceScore: 70,
            matchReason: 'tag_match',
          },
        ],
        helpArticles: [
          {
            id: mockHelpArticle.id,
            type: 'help_article',
            title: mockHelpArticle.title,
            description: mockHelpArticle.excerpt || '',
            destination: `/help/developer-tools/${mockHelpArticle.slug}`,
            category: 'developer-tools',
            relevanceScore: 60,
            matchReason: 'content_match',
          },
        ],
        totalCount: 3,
      })
    );
  });

  it('Executes the complete 16-step discovery, privacy, SEO, and navigation flow', async () => {
    // -------------------------------------------------------------------------
    // 1. Visitor opens homepage
    // -------------------------------------------------------------------------
    const { unmount } = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/apps/:slug" element={<AppDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <div data-testid="admin-panel">Admin Dashboard</div>
                </AdminRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Verify Homepage elements
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(document.title).toContain('ElseSourav');

    unmount();

    // -------------------------------------------------------------------------
    // 2. Visitor searches for an app via /search?q=terminal
    // 3. App appears in search
    // -------------------------------------------------------------------------
    const searchRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/search?q=terminal']}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/apps/:slug" element={<AppDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud Terminal Pro')).toBeInTheDocument();
    });

    expect(screen.getByText('Zero Bloat Architecture')).toBeInTheDocument();
    expect(screen.getByText('CLI Quickstart Guide')).toBeInTheDocument();

    searchRender.unmount();

    // -------------------------------------------------------------------------
    // 4. Visitor opens app detail (/apps/cloud-terminal)
    // 5. Visitor sees correct metadata
    // -------------------------------------------------------------------------
    const appDetailRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/apps/cloud-terminal']}>
          <Routes>
            <Route path="/apps/:slug" element={<AppDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Cloud Terminal Pro' })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Full-featured secure cloud terminal and shell environment.')
    ).toBeInTheDocument();
    expect(document.title).toContain('Cloud Terminal Pro');

    appDetailRender.unmount();

    // -------------------------------------------------------------------------
    // 6. Visitor searches for blog content
    // 7. Visitor opens blog article (/blog/zero-bloat-architecture)
    // 8. Visitor sees correct article metadata
    // -------------------------------------------------------------------------
    const blogRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/blog/zero-bloat-architecture']}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { level: 1, name: 'Zero Bloat Architecture' });
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });

    expect(document.title).toContain('Zero Bloat Architecture');

    blogRender.unmount();

    // -------------------------------------------------------------------------
    // 9. Visitor searches Help
    // 10. Visitor opens Help article (/help/developer-tools/cli-quickstart)
    // -------------------------------------------------------------------------
    const helpRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/help/developer-tools/cli-quickstart']}>
          <Routes>
            <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'CLI Quickstart Guide' })
      ).toBeInTheDocument();
    });

    expect(document.title).toContain('CLI Quickstart Guide');
    expect(screen.getByText('Was this article helpful?')).toBeInTheDocument();

    helpRender.unmount();

    // -------------------------------------------------------------------------
    // 11. Visitor contacts Support via /support?ref=help_article&title=CLI+Quickstart
    // -------------------------------------------------------------------------
    const supportRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/support?ref=help_article&title=CLI+Quickstart+Guide']}>
          <Routes>
            <Route path="/support" element={<SupportPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByDisplayValue('Help with: CLI Quickstart Guide')).toBeInTheDocument();

    supportRender.unmount();

    // -------------------------------------------------------------------------
    // 12. Draft content NEVER appears to public visitors
    // -------------------------------------------------------------------------
    const draftAppRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/apps/secret-unreleased-tool']}>
          <Routes>
            <Route path="/apps/:slug" element={<AppDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Application Not Found')).toBeInTheDocument();
    });

    draftAppRender.unmount();

    const draftBlogRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/blog/unreleased-internal-notes']}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
    });

    draftBlogRender.unmount();

    const draftHelpRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/help/developer-tools/internal-unreleased-guide']}>
          <Routes>
            <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
    });

    draftHelpRender.unmount();

    // -------------------------------------------------------------------------
    // 13. Admin/private routes remain strictly protected
    // -------------------------------------------------------------------------
    const adminRender = render(
      <AuthContext.Provider value={unauthenticatedAuthContext}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <div data-testid="admin-panel">Admin Dashboard</div>
                </AdminRoute>
              }
            />
            <Route path="/login" element={<div>Sign In Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
    expect(screen.getByText('Sign In Screen')).toBeInTheDocument();

    adminRender.unmount();

    // -------------------------------------------------------------------------
    // 14. Sitemap contains all public content and excludes drafts
    // -------------------------------------------------------------------------
    const sitemapEntries = buildSitemapEntries({
      origin: 'https://elsesourav.com',
      apps: [mockPublishedApp, mockDraftApp],
      blogPosts: [mockPublishedPost, mockDraftPost],
      helpArticles: [mockHelpArticle, mockDraftHelpArticle],
      helpCategories: [mockHelpCategory],
    });

    const sitemapXml = generateSitemapXml(sitemapEntries);
    expect(sitemapXml).toContain('https://elsesourav.com/');
    expect(sitemapXml).toContain('https://elsesourav.com/apps');
    expect(sitemapXml).toContain('https://elsesourav.com/apps/cloud-terminal');
    expect(sitemapXml).toContain('https://elsesourav.com/blog');
    expect(sitemapXml).toContain('https://elsesourav.com/blog/zero-bloat-architecture');
    expect(sitemapXml).toContain('https://elsesourav.com/help');
    expect(sitemapXml).toContain('https://elsesourav.com/help/developer-tools/cli-quickstart');
    expect(sitemapXml).toContain('https://elsesourav.com/about');

    // Draft exclusion in sitemap
    expect(sitemapXml).not.toContain('secret-unreleased-tool');
    expect(sitemapXml).not.toContain('unreleased-internal-notes');
    expect(sitemapXml).not.toContain('internal-unreleased-guide');
    expect(sitemapXml).not.toContain('/admin');
    expect(sitemapXml).not.toContain('/login');
    expect(sitemapXml).not.toContain('/library');

    // -------------------------------------------------------------------------
    // 15. robots.txt permits public crawl and blocks private areas
    // -------------------------------------------------------------------------
    const robotsTxt = generateRobotsTxt({ origin: 'https://elsesourav.com' });
    expect(robotsTxt).toContain('Allow: /');
    expect(robotsTxt).toContain('Allow: /apps');
    expect(robotsTxt).toContain('Allow: /blog');
    expect(robotsTxt).toContain('Allow: /help');
    expect(robotsTxt).toContain('Allow: /about');
    expect(robotsTxt).toContain('Disallow: /admin');
    expect(robotsTxt).toContain('Disallow: /library');
    expect(robotsTxt).toContain('Disallow: /settings');
    expect(robotsTxt).toContain('Disallow: /search');
    expect(robotsTxt).toContain('Sitemap: https://elsesourav.com/sitemap.xml');

    // -------------------------------------------------------------------------
    // 16. No unsafe redirects occur
    // -------------------------------------------------------------------------
    expect(getSafeRedirectUrl('https://malicious.com')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('//evil.com')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('javascript:alert(1)')).toBe(ROUTES.LIBRARY);
    expect(getSafeRedirectUrl('/library')).toBe('/library');
    expect(getSafeRedirectUrl('/support/tickets')).toBe('/support/tickets');

    expect(isSafeUrl('https://elsesourav.com')).toBe(true);
    expect(isSafeUrl('javascript:void(0)')).toBe(false);
  });
});
