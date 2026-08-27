import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelpSearch } from '../HelpSearch';
import { helpService } from '@/services/help.service';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import { ok } from '@/lib/result';

const mockCategories: HelpCategory[] = [
  {
    id: 'cat-1',
    name: 'General & Account',
    slug: 'general',
    orderIndex: 0,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
];

const mockArticles: HelpArticle[] = [
  {
    id: 'art-1',
    categoryId: 'cat-1',
    title: 'How to Reset Your Account Password',
    slug: 'reset-password',
    excerpt: 'Step-by-step instructions for resetting passwords.',
    content: 'Content here',
    status: 'published',
    orderIndex: 0,
    createdAt: 100,
    updatedAt: 100,
  },
];

describe('HelpSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Searches on debounced input and displays matching results', async () => {
    vi.spyOn(helpService, 'searchArticles').mockResolvedValue(
      ok({
        items: mockArticles,
        hasMore: false,
      })
    );

    render(
      <BrowserRouter>
        <HelpSearch categories={mockCategories} />
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'password' } });

    await waitFor(() => {
      expect(helpService.searchArticles).toHaveBeenCalledWith('password', { limit: 6 });
      expect(screen.getByText('How to Reset Your Account Password')).toBeInTheDocument();
      expect(screen.getByText('General & Account')).toBeInTheDocument();
    });
  });

  it('2. Displays empty state when search returns no matching results', async () => {
    vi.spyOn(helpService, 'searchArticles').mockResolvedValue(
      ok({
        items: [],
        hasMore: false,
      })
    );

    render(
      <BrowserRouter>
        <HelpSearch categories={mockCategories} />
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });
  });

  it('3. Clear button resets query and closes results', async () => {
    vi.spyOn(helpService, 'searchArticles').mockResolvedValue(
      ok({
        items: mockArticles,
        hasMore: false,
      })
    );

    render(
      <BrowserRouter>
        <HelpSearch categories={mockCategories} />
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'password' } });

    await waitFor(() => {
      expect(screen.getByText('How to Reset Your Account Password')).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole('button', { name: /clear search query/i });
    fireEvent.click(clearBtn);

    expect(searchInput).toHaveValue('');
    expect(screen.queryByText('How to Reset Your Account Password')).toBeNull();
  });

  it('4. Pressing Escape key closes results dropdown', async () => {
    vi.spyOn(helpService, 'searchArticles').mockResolvedValue(
      ok({
        items: mockArticles,
        hasMore: false,
      })
    );

    render(
      <BrowserRouter>
        <HelpSearch categories={mockCategories} />
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'password' } });

    await waitFor(() => {
      expect(screen.getByText('How to Reset Your Account Password')).toBeInTheDocument();
    });

    fireEvent.keyDown(searchInput, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('How to Reset Your Account Password')).toBeNull();
    });
  });
});
