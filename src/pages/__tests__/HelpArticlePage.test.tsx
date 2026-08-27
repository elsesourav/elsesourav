import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelpArticlePage } from '../HelpArticlePage';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { ok } from '@/lib/result';

const mockCategory: HelpCategory = {
  id: 'cat-developer',
  name: 'Developer Tools',
  slug: 'developer-tools',
  description: 'IDEs, CLI utilities, and API documentation.',
  icon: 'code',
  orderIndex: 0,
  isActive: true,
  createdAt: 100,
  updatedAt: 100,
};

const mockPublishedArticle: HelpArticle = {
  id: 'art-cli-install',
  categoryId: 'cat-developer',
  title: 'How to Install ElseSourav CLI',
  slug: 'install-elsesourav-cli',
  excerpt: 'Complete installation instructions for macOS, Linux, and Windows.',
  content:
    '# Installation Guide\n\nRun the following shell command:\n\n```bash\ncurl -fsSL https://get.elsesourav.com | sh\n```',
  status: 'published',
  orderIndex: 0,
  createdAt: 1700000000000,
  updatedAt: 1700005000000,
  publishedAt: 1700001000000,
};

const mockRelatedArticle: HelpArticle = {
  id: 'art-cli-auth',
  categoryId: 'cat-developer',
  title: 'Authenticating with ElseSourav CLI',
  slug: 'authenticating-elsesourav-cli',
  excerpt: 'Signing in using API tokens.',
  content: 'Auth guide content.',
  status: 'published',
  orderIndex: 1,
  createdAt: 1700000000000,
  updatedAt: 1700005000000,
  publishedAt: 1700002000000,
};

const mockDraftArticle: HelpArticle = {
  ...mockPublishedArticle,
  id: 'art-draft',
  slug: 'secret-unreleased-guide',
  status: 'draft',
};

describe('HelpArticlePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(helpService, 'getArticleBySlug').mockImplementation((slug) => {
      if (slug === 'install-elsesourav-cli') {
        return Promise.resolve(ok(mockPublishedArticle));
      }
      if (slug === 'secret-unreleased-guide') {
        return Promise.resolve(ok(mockDraftArticle));
      }
      return Promise.resolve(ok(null));
    });

    vi.spyOn(helpService, 'getCategoryById').mockResolvedValue(ok(mockCategory));

    vi.spyOn(helpService, 'listArticlesByCategory').mockResolvedValue(
      ok({
        items: [mockPublishedArticle, mockRelatedArticle],
        hasMore: false,
      })
    );

    vi.spyOn(helpService, 'submitHelpfulness').mockResolvedValue(
      ok({
        id: 'fb-test',
        articleId: mockPublishedArticle.id,
        sessionId: 'sess_test',
        helpful: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
  });

  it('1. Renders article title, breadcrumbs, markdown content, and category badge', async () => {
    render(
      <MemoryRouter initialEntries={['/help/developer-tools/install-elsesourav-cli']}>
        <Routes>
          <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'How to Install ElseSourav CLI' })
      ).toBeInTheDocument();
      expect(screen.getByText('Installation Guide')).toBeInTheDocument();
      expect(screen.getAllByText('Developer Tools')[0]).toBeInTheDocument();
      expect(screen.getByText(/Last updated on/i)).toBeInTheDocument();
    });
  });

  it('2. Copies code snippet to clipboard when copy button is clicked', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeMock,
      },
    });

    render(
      <MemoryRouter initialEntries={['/help/developer-tools/install-elsesourav-cli']}>
        <Routes>
          <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /copy code to clipboard/i });
    fireEvent.click(copyBtn);

    expect(writeMock).toHaveBeenCalledWith('curl -fsSL https://get.elsesourav.com | sh');
  });

  it('3. Helpfulness feedback widget displays confirmation on click', async () => {
    render(
      <MemoryRouter initialEntries={['/help/developer-tools/install-elsesourav-cli']}>
        <Routes>
          <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Was this article helpful?')).toBeInTheDocument();
    });

    const yesBtn = screen.getByRole('button', { name: /yes, this article was helpful/i });
    fireEvent.click(yesBtn);

    await waitFor(() => {
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });
  });

  it('4. Renders related articles from the same category', async () => {
    render(
      <MemoryRouter initialEntries={['/help/developer-tools/install-elsesourav-cli']}>
        <Routes>
          <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'Related Help Articles' })
      ).toBeInTheDocument();
      expect(screen.getByText('Authenticating with ElseSourav CLI')).toBeInTheDocument();
    });
  });

  it('5. Injects Schema.org TechArticle JSON-LD structured data', async () => {
    render(
      <MemoryRouter initialEntries={['/help/developer-tools/install-elsesourav-cli']}>
        <Routes>
          <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const jsonLd = document.getElementById('help-article-jsonld');
      expect(jsonLd).not.toBeNull();
      expect(jsonLd?.textContent).toContain('TechArticle');
      expect(jsonLd?.textContent).toContain('How to Install ElseSourav CLI');
    });
  });

  it('6. Renders 404 Not Found for non-existent or draft article slug', async () => {
    render(
      <MemoryRouter initialEntries={['/help/developer-tools/secret-unreleased-guide']}>
        <Routes>
          <Route path="/help/:categorySlug/:articleSlug" element={<HelpArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('help-article-not-found')).toBeInTheDocument();
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
    });
  });
});
