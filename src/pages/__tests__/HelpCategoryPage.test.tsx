import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelpCategoryPage } from '../HelpCategoryPage';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { ok } from '@/lib/result';

const mockCategory: HelpCategory = {
  id: 'cat-troubleshooting',
  name: 'Troubleshooting & Bugs',
  slug: 'troubleshooting',
  description: 'Solutions for common errors, offline sync, and compatibility.',
  icon: 'alert',
  orderIndex: 0,
  isActive: true,
  createdAt: 100,
  updatedAt: 100,
};

const mockArticles: HelpArticle[] = [
  {
    id: 'art-offline',
    categoryId: 'cat-troubleshooting',
    title: 'Troubleshooting Offline Sync',
    slug: 'troubleshooting-offline-sync',
    excerpt: 'What to do when offline changes do not sync automatically.',
    content: 'Full offline guide content here.',
    status: 'published',
    orderIndex: 0,
    createdAt: 100,
    updatedAt: 100,
    publishedAt: 100,
  },
  {
    id: 'art-clear-cache',
    categoryId: 'cat-troubleshooting',
    title: 'How to Clear Local Browser Cache',
    slug: 'clear-local-browser-cache',
    excerpt: 'Clearing local storage without losing saved bookmarks.',
    content: 'Cache guide content.',
    status: 'published',
    orderIndex: 1,
    createdAt: 100,
    updatedAt: 100,
    publishedAt: 100,
  },
];

describe('HelpCategoryPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(helpService, 'getCategoryBySlug').mockImplementation((slug) => {
      if (slug === 'troubleshooting') {
        return Promise.resolve(ok(mockCategory));
      }
      return Promise.resolve(ok(null));
    });

    vi.spyOn(helpService, 'listArticlesByCategory').mockResolvedValue(
      ok({
        items: mockArticles,
        hasMore: false,
      })
    );
  });

  it('1. Renders category header, breadcrumbs, and articles list', async () => {
    render(
      <MemoryRouter initialEntries={['/help/troubleshooting']}>
        <Routes>
          <Route path="/help/:categorySlug" element={<HelpCategoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Troubleshooting & Bugs' })
      ).toBeInTheDocument();
      expect(screen.getByText('Troubleshooting Offline Sync')).toBeInTheDocument();
      expect(screen.getByText('How to Clear Local Browser Cache')).toBeInTheDocument();
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
    });
  });

  it('2. In-category quick search filters displayed articles', async () => {
    render(
      <MemoryRouter initialEntries={['/help/troubleshooting']}>
        <Routes>
          <Route path="/help/:categorySlug" element={<HelpCategoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Troubleshooting Offline Sync')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search within troubleshooting & bugs/i);
    fireEvent.change(searchInput, { target: { value: 'Offline' } });

    expect(screen.getByText('Troubleshooting Offline Sync')).toBeInTheDocument();
    expect(screen.queryByText('How to Clear Local Browser Cache')).toBeNull();
  });

  it('3. Renders 404 Not Found for non-existent category slug', async () => {
    render(
      <MemoryRouter initialEntries={['/help/unknown-cat']}>
        <Routes>
          <Route path="/help/:categorySlug" element={<HelpCategoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('help-category-not-found')).toBeInTheDocument();
      expect(screen.getByText('Category Not Found')).toBeInTheDocument();
    });
  });
});
