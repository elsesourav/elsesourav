import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelpPage } from '@/pages/HelpPage';
import { HelpArticlePage } from '@/pages/HelpArticlePage';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';

const mockCategories: HelpCategory[] = [
  {
    id: 'help-cat-getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Platform overview and first-time walkthroughs.',
    icon: 'Sparkles',
    orderIndex: 1,
    isActive: true,
    createdAt: 1724580000000,
    updatedAt: 1724580000000,
  },
  {
    id: 'help-cat-apps-discovery',
    name: 'Apps & Discovery',
    slug: 'apps-discovery',
    description: 'Finding apps and release notes.',
    icon: 'Grid',
    orderIndex: 2,
    isActive: true,
    createdAt: 1724580000000,
    updatedAt: 1724580000000,
  },
];

const mockArticles: HelpArticle[] = [
  {
    id: 'help-art-platform-overview',
    title: 'Welcome to ElseSourav: Platform Overview',
    slug: 'welcome-platform-overview',
    categoryId: 'help-cat-getting-started',
    excerpt: 'An introduction to ElseSourav software catalog.',
    content: '# Welcome to ElseSourav\n\nDiscover and download software.',
    status: 'published',
    orderIndex: 1,
    helpfulCount: 15,
    unhelpfulCount: 1,
    createdAt: 1724580000000,
    updatedAt: 1724580000000,
  },
  {
    id: 'help-art-draft-guide',
    title: 'Unpublished Internal Draft Guide',
    slug: 'unpublished-draft-guide',
    categoryId: 'help-cat-getting-started',
    excerpt: 'Internal draft not for public viewing.',
    content: '# Draft content',
    status: 'draft',
    orderIndex: 2,
    helpfulCount: 0,
    unhelpfulCount: 0,
    createdAt: 1724580000000,
    updatedAt: 1724580000000,
  },
];

describe('User-Facing Documentation & Help Center (Prompt 89)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(helpService, 'listActiveCategories').mockResolvedValue({
      success: true,
      data: {
        items: mockCategories,
        hasMore: false,
      },
    });

    vi.spyOn(helpService, 'listFeaturedArticles').mockResolvedValue({
      success: true,
      data: {
        items: [mockArticles[0]!],
        hasMore: false,
      },
    });

    vi.spyOn(helpService, 'listPublishedArticles').mockResolvedValue({
      success: true,
      data: {
        items: [mockArticles[0]!],
        hasMore: false,
      },
    });

    vi.spyOn(helpService, 'getArticleBySlug').mockImplementation(async (slug: string) => {
      const art = mockArticles.find((a) => a.slug === slug);
      if (!art) {
        return { success: true, data: null };
      }
      return { success: true, data: art };
    });

    vi.spyOn(helpService, 'getCategoryById').mockImplementation(async (id: string) => {
      const cat = mockCategories.find((c) => c.id === id);
      return { success: true, data: cat || null };
    });

    vi.spyOn(helpService, 'listArticlesByCategory').mockResolvedValue({
      success: true,
      data: {
        items: [mockArticles[0]!],
        hasMore: false,
      },
    });
  });

  it('renders Help Center home with categories and popular articles', async () => {
    render(
      <MemoryRouter initialEntries={['/help']}>
        <HelpPage />
      </MemoryRouter>
    );

    const catEls = await screen.findAllByText(/Getting Started/i);
    expect(catEls[0]).toBeInTheDocument();
    expect(screen.getByText('Apps & Discovery')).toBeInTheDocument();
    expect(screen.getByText('Welcome to ElseSourav: Platform Overview')).toBeInTheDocument();
  });

  it('renders a published help article with content and helpfulness feedback', async () => {
    render(
      <MemoryRouter initialEntries={['/help/article/welcome-platform-overview']}>
        <Routes>
          <Route path="/help/article/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    const titleEls = await screen.findAllByText('Welcome to ElseSourav: Platform Overview');
    expect(titleEls[0]).toBeInTheDocument();
    expect(screen.getByText(/Discover and download software/i)).toBeInTheDocument();
    expect(screen.getByText(/Was this article helpful\?/i)).toBeInTheDocument();
  });

  it('blocks draft articles from public view and displays article not found state', async () => {
    render(
      <MemoryRouter initialEntries={['/help/article/unpublished-draft-guide']}>
        <Routes>
          <Route path="/help/article/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Article Not Found/i)).toBeInTheDocument();
    expect(screen.queryByText('Unpublished Internal Draft Guide')).not.toBeInTheDocument();
  });

  it('submits helpfulness vote on feedback button click', async () => {
    const user = userEvent.setup();
    const voteSpy = vi.spyOn(helpService, 'submitHelpfulness').mockResolvedValue({
      success: true,
      data: {
        id: 'fb-1',
        articleId: 'help-art-platform-overview',
        sessionId: 'sess-123',
        helpful: true,
        createdAt: 1724580000000,
        updatedAt: 1724580000000,
      },
    });

    render(
      <MemoryRouter initialEntries={['/help/article/welcome-platform-overview']}>
        <Routes>
          <Route path="/help/article/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    const yesBtn = await screen.findByRole('button', { name: /Yes, this article was helpful/i });
    await user.click(yesBtn);

    await waitFor(() => {
      expect(voteSpy).toHaveBeenCalledWith(expect.objectContaining({
        articleId: 'help-art-platform-overview',
        helpful: true,
      }));
    });
  });
});
