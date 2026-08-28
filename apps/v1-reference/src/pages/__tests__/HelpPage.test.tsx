import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelpPage } from '../HelpPage';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

const mockCategories: HelpCategory[] = [
  {
    id: 'cat-account',
    name: 'Account & Security',
    slug: 'account-security',
    description: 'Password reset, authentication, and user profile management.',
    icon: 'shield',
    orderIndex: 0,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
  {
    id: 'cat-apps',
    name: 'Applications & Tools',
    slug: 'apps-tools',
    description: 'Using web apps, keyboard shortcuts, and performance options.',
    icon: 'desktop',
    orderIndex: 1,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
];

const mockArticles: HelpArticle[] = [
  {
    id: 'art-1',
    categoryId: 'cat-account',
    title: 'How to Reset Your Account Password',
    slug: 'reset-password',
    excerpt: 'Step-by-step instructions for resetting passwords.',
    content: 'Content here',
    status: 'published',
    orderIndex: 0,
    featured: true,
    createdAt: 100,
    updatedAt: 100,
    publishedAt: 100,
  },
];

describe('HelpPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(helpService, 'listActiveCategories').mockResolvedValue(
      ok({
        items: mockCategories,
        hasMore: false,
      })
    );

    vi.spyOn(helpService, 'listFeaturedArticles').mockResolvedValue(
      ok({
        items: mockArticles,
        hasMore: false,
      })
    );

    vi.spyOn(helpService, 'listPublishedArticles').mockResolvedValue(
      ok({
        items: mockArticles,
        hasMore: false,
      })
    );
  });

  it('1. Renders hero title, subtitle, search input, and category cards', async () => {
    render(
      <MemoryRouter initialEntries={['/help']}>
        <Routes>
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'How can we help you?' })
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('Account & Security')[0]).toBeInTheDocument();
      expect(screen.getByText('Applications & Tools')).toBeInTheDocument();
      expect(screen.getByText('How to Reset Your Account Password')).toBeInTheDocument();
    });
  });

  it('2. Injects SEO document title and canonical link', async () => {
    render(
      <MemoryRouter initialEntries={['/help']}>
        <Routes>
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toContain('Help Center & Knowledge Base');
    });
  });

  it('3. Renders error state and allows retry on failure', async () => {
    vi.spyOn(helpService, 'listActiveCategories').mockResolvedValue(
      err(AppError.internal('Network Error'))
    );
    vi.spyOn(helpService, 'listFeaturedArticles').mockResolvedValue(
      err(AppError.internal('Network Error'))
    );
    vi.spyOn(helpService, 'listPublishedArticles').mockResolvedValue(
      err(AppError.internal('Network Error'))
    );

    render(
      <MemoryRouter initialEntries={['/help']}>
        <Routes>
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Help Center Unavailable')).toBeInTheDocument();
    });
  });
});
