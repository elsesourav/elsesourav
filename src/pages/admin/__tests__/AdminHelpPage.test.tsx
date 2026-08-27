import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { helpArticleRepository, helpCategoryRepository } from '@/repositories/help.repository';
import { helpService } from '@/services/help.service';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Help Management (Prompt 48)', () => {
  const mockAdminUser: User = {
    id: 'admin-1',
    email: 'admin@elsesourav.com',
    displayName: 'Sourav Admin',
    role: 'admin',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockAdminAuthUser: AuthUser = {
    uid: 'admin-1',
    email: 'admin@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Admin',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
  };

  const mockCategories: HelpCategory[] = [
    {
      id: 'cat-help-1',
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Initial setup and installation guides',
      orderIndex: 0,
      isActive: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'cat-help-2',
      name: 'Troubleshooting',
      slug: 'troubleshooting',
      description: 'Common errors and fixes',
      orderIndex: 1,
      isActive: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
  ];

  const mockArticles: HelpArticle[] = [
    {
      id: 'art-1',
      categoryId: 'cat-help-1',
      title: 'How to install Chrome Extension',
      slug: 'install-chrome-extension',
      excerpt: 'Quick installation guide from the Chrome Web Store.',
      content: '## Installation\n1. Open Chrome Web Store\n2. Click Add to Chrome',
      status: 'published',
      orderIndex: 0,
      featured: true,
      helpfulCount: 42,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      publishedAt: 1700000000000,
    },
    {
      id: 'art-2',
      categoryId: 'cat-help-2',
      title: 'Resolving WebAssembly Crash on Linux',
      slug: 'wasm-crash-linux',
      excerpt: 'Workaround for missing libssl dependencies.',
      content: 'Run `sudo apt install libssl-dev`',
      status: 'draft',
      orderIndex: 1,
      helpfulCount: 0,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
  ];

  const createAuthContextValue = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: mockAdminAuthUser,
    user: mockAdminUser,
    role: 'admin',
    isAuthenticated: true,
    isAdmin: true,
    isLoading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signUp: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signInWithGoogle: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signOut: vi.fn().mockResolvedValue(ok(undefined)),
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderWithProviders = (initialRoute = '/admin/help') => {
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

    vi.spyOn(helpArticleRepository, 'findMany').mockResolvedValue(
      ok({ items: mockArticles, hasMore: false })
    );

    vi.spyOn(helpCategoryRepository, 'findMany').mockResolvedValue(
      ok({ items: mockCategories, hasMore: false })
    );

    vi.spyOn(helpService, 'publishArticle').mockImplementation(async (id) => {
      const match = mockArticles.find((a) => a.id === id) || mockArticles[0];
      return ok({
        ...match!,
        status: 'published',
      });
    });

    vi.spyOn(helpService, 'unpublishArticle').mockImplementation(async (id) => {
      const match = mockArticles.find((a) => a.id === id) || mockArticles[0];
      return ok({
        ...match!,
        status: 'draft',
      });
    });

    vi.spyOn(helpService, 'archiveArticle').mockImplementation(async (id) => {
      const match = mockArticles.find((a) => a.id === id) || mockArticles[0];
      return ok({
        ...match!,
        status: 'archived',
      });
    });

    vi.spyOn(helpService, 'restoreArticle').mockImplementation(async (id, targetStatus) => {
      const match = mockArticles.find((a) => a.id === id) || mockArticles[0];
      return ok({
        ...match!,
        status: targetStatus || 'draft',
      });
    });
  });

  it('1. Renders Help Center articles table with title, category, status, and feedback stats', async () => {
    renderWithProviders('/admin/help');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Help Center Management/i })
    ).toBeInTheDocument();
    expect(screen.getByText('How to install Chrome Extension')).toBeInTheDocument();
    expect(screen.getByText('/install-chrome-extension')).toBeInTheDocument();
    expect(screen.getByText('Resolving WebAssembly Crash on Linux')).toBeInTheDocument();
    expect(screen.getByText(/42 helpful/i)).toBeInTheDocument();
  });

  it('2. Switches to FAQ Categories tab and displays categories', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/help');

    await screen.findByText('How to install Chrome Extension');

    const catTab = screen.getByRole('tab', { name: /FAQ Categories/i });
    await user.click(catTab);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('/getting-started')).toBeInTheDocument();
    expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
  });

  it('3. Previews article content in dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/help');

    await screen.findByText('How to install Chrome Extension');

    const previewBtn = screen.getByRole('button', {
      name: /Preview How to install Chrome Extension/i,
    });
    await user.click(previewBtn);

    expect(
      screen.getByRole('dialog', { name: /Preview: How to install Chrome Extension/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Open Chrome Web Store/i)).toBeInTheDocument();
  });

  it('4. Toggles publish status of an article', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/help');

    await screen.findByText('Resolving WebAssembly Crash on Linux');

    const publishBtn = screen.getByRole('button', {
      name: /Publish Resolving WebAssembly Crash on Linux/i,
    });
    await user.click(publishBtn);

    expect(helpService.publishArticle).toHaveBeenCalledWith('art-2');
  });

  it('5. Archives an article with confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/help');

    await screen.findByText('How to install Chrome Extension');

    const archiveBtn = screen.getByRole('button', {
      name: /Archive How to install Chrome Extension/i,
    });
    await user.click(archiveBtn);

    expect(screen.getByRole('dialog', { name: /Archive Help Article/i })).toBeInTheDocument();

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Archive Article/i,
    });
    await user.click(confirmBtn);

    expect(helpService.archiveArticle).toHaveBeenCalledWith('art-1');
  });
});
