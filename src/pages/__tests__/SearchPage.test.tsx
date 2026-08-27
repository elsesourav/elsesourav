import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { globalSearchService } from '@/services/global-search.service';
import type { GlobalSearchResult } from '@/types/search.types';
import type { AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Global Search Page & Discovery (Prompt 51)', () => {
  const mockSearchResult: GlobalSearchResult = {
    query: 'terminal',
    apps: [
      {
        id: 'app-terminal',
        type: 'app',
        title: 'Cloud Terminal Pro',
        description: 'Advanced web-based SSH terminal for developers',
        destination: '/apps/cloud-terminal',
        category: 'developer-tools',
        badges: ['2.1.0', 'ssh'],
        publishedAt: 1700000000000,
      },
    ],
    blogPosts: [
      {
        id: 'post-1',
        type: 'blog_post',
        title: 'Building a Fast Cloud Terminal with WebSockets',
        description: 'Deep dive into low-latency terminal rendering with React and WebSockets.',
        destination: '/blog/building-cloud-terminal',
        category: 'Engineering',
        badges: ['6 min read', 'react'],
        publishedAt: 1700000000000,
      },
    ],
    helpArticles: [
      {
        id: 'help-1',
        type: 'help_article',
        title: 'Keyboard Shortcuts for Cloud Terminal',
        description: 'Master cloud terminal productivity with custom keybindings.',
        destination: '/help/troubleshooting/terminal-shortcuts',
        category: 'troubleshooting',
        badges: ['shortcuts'],
        publishedAt: 1700000000000,
      },
    ],
    totalCount: 3,
  };

  const createAuthContextValue = (): AuthContextValue => ({
    authUser: null,
    user: null,
    role: 'user',
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(ok(null)),
    signUp: vi.fn().mockResolvedValue(ok(null)),
    signInWithGoogle: vi.fn().mockResolvedValue(ok(null)),
    signOut: vi.fn().mockResolvedValue(ok(undefined)),
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
  });

  const renderWithProviders = (initialRoute = '/search') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <AuthContext.Provider value={createAuthContextValue()}>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(globalSearchService, 'search').mockResolvedValue(ok(mockSearchResult));
    vi.spyOn(globalSearchService, 'getSuggestions').mockResolvedValue(ok(mockSearchResult.apps));
  });

  it('1. Renders initial search page with discovery prompt and suggested tags when no query is present', async () => {
    renderWithProviders('/search');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Search ElseSourav/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Discover the Entire Ecosystem/i)).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Chrome Extension')).toBeInTheDocument();
  });

  it('2. Performs search and displays prioritized apps, articles, and help guides', async () => {
    renderWithProviders('/search?q=terminal');

    expect(await screen.findByText('Cloud Terminal Pro')).toBeInTheDocument();
    expect(screen.getByText('Building a Fast Cloud Terminal with WebSockets')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts for Cloud Terminal')).toBeInTheDocument();
  });

  it('3. Filters search results by category tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders('/search?q=terminal');

    await screen.findByText('Cloud Terminal Pro');

    const blogTab = screen.getByRole('button', { name: /Articles/i });
    await user.click(blogTab);

    expect(screen.getByText('Building a Fast Cloud Terminal with WebSockets')).toBeInTheDocument();
    expect(screen.queryByText('Cloud Terminal Pro')).not.toBeInTheDocument();
  });

  it('4. Allows clicking a suggested tag to execute search', async () => {
    const user = userEvent.setup();
    renderWithProviders('/search');

    await screen.findByRole('heading', { level: 1, name: /Search ElseSourav/i });

    const tagButton = screen.getByRole('button', { name: /Developer Tools/i });
    await user.click(tagButton);

    expect(globalSearchService.search).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'Developer Tools' })
    );
  });

  it('5. Displays empty state when search returns no matches', async () => {
    vi.spyOn(globalSearchService, 'search').mockResolvedValue(
      ok({ query: 'unknownxyz', apps: [], blogPosts: [], helpArticles: [], totalCount: 0 })
    );

    renderWithProviders('/search?q=unknownxyz');

    expect(
      await screen.findByRole('heading', { name: /No results found for/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear Search Query/i })).toBeInTheDocument();
  });

  it('6. Supports URL type parameter to directly open specific content category tab', async () => {
    renderWithProviders('/search?q=terminal&type=blog');

    expect(
      await screen.findByText('Building a Fast Cloud Terminal with WebSockets')
    ).toBeInTheDocument();
    expect(screen.queryByText('Cloud Terminal Pro')).not.toBeInTheDocument();
  });

  it('7. Handles keyboard escape key in search input gracefully', async () => {
    const user = userEvent.setup();
    renderWithProviders('/search');

    const searchInput = screen.getByLabelText(
      /Search apps, engineering articles, and help guides/i
    );
    await user.type(searchInput, 'terminal');
    await user.keyboard('{Escape}');

    expect(searchInput).toHaveValue('terminal');
  });
});
