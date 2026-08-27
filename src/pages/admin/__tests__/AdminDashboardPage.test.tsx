import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { appRepository, blogRepository } from '@/repositories';
import { supportService } from '@/services/support.service';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { SupportTicket } from '@/types/support.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';

describe('Admin Dashboard Shell & Overview (Prompt 46)', () => {
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

  const mockRegularUser: User = {
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'Regular User',
    role: 'user',
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

  const mockRegularAuthUser: AuthUser = {
    uid: 'user-1',
    email: 'user@example.com',
    emailVerified: true,
    displayName: 'Regular User',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
  };

  const mockApp: App = {
    id: 'app-1',
    slug: 'pixel-craft',
    name: 'PixelCraft Studio',
    shortDescription: 'Sprite and pixel editor',
    description: 'Advanced pixel art generation engine',
    iconUrl: 'https://cdn.example.com/icon.png',
    screenshots: [],
    primaryCategory: 'graphics',
    tags: ['pixel', 'art'],
    status: 'published',
    platforms: ['web'],
    links: [],
    stats: { views: 50, launches: 20, libraryAdds: 10, ratingAverage: 4.8, ratingCount: 12 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    currentVersion: '2.1.0',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockDraftApp: App = {
    ...mockApp,
    id: 'app-draft-1',
    slug: 'secret-beta',
    name: 'Secret Beta App',
    status: 'draft',
  };

  const mockBlogPost: BlogPost = {
    id: 'post-1',
    slug: 'react-19-architecture',
    title: 'Building Resilient UIs in React 19',
    excerpt: 'Deep dive into actions and state management',
    content: 'Full post markdown content...',
    status: 'published',
    authorId: 'admin-1',
    category: 'architecture',
    tags: ['react', 'typescript'],
    readingTimeMinutes: 5,
    viewsCount: 420,
    isFeatured: true,
    publishedAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockTicket: SupportTicket = {
    id: 'ticket-1',
    ticketNumber: 'ES-101',
    userId: 'user-1',
    userEmail: 'user@example.com',
    userName: 'John Doe',
    subject: 'Cannot activate Chrome extension',
    description: 'Extension throws manifest version error',
    category: 'chrome_extension',
    priority: 'high',
    status: 'open',
    lastMessageAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockSignOut = vi.fn().mockResolvedValue(ok(undefined));

  const createAuthMock = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
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
    signOut: mockSignOut,
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderWithProviders = (initialEntry: string, authOverrides?: Partial<AuthContextValue>) => {
    const authContext = createAuthMock(authOverrides);

    return render(
      <ThemeProvider>
        <ToastProvider>
          <AuthContext.Provider value={authContext}>
            <MemoryRouter initialEntries={[initialEntry]}>
              <AppRoutes />
            </MemoryRouter>
          </AuthContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockApp, mockDraftApp], hasMore: false })
    );

    vi.spyOn(blogRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockBlogPost], hasMore: false })
    );

    vi.spyOn(supportService, 'listAdminTickets').mockResolvedValue(
      ok({ items: [mockTicket], hasMore: false })
    );
  });

  it('1. ADMIN user can access /admin and view overview metrics and recent activity', async () => {
    renderWithProviders('/admin');

    // Page title and banner
    expect(
      await screen.findByRole('heading', { level: 1, name: /Admin Dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Platform Overview/i)).toBeInTheDocument();

    // Metric Cards
    expect(screen.getByText('Published Applications')).toBeInTheDocument();
    expect(screen.getByText('Draft Software Builds')).toBeInTheDocument();
    expect(screen.getByText('Blog & Devlog Posts')).toBeInTheDocument();
    expect(screen.getByText('Open Support Tickets')).toBeInTheDocument();

    // Metrics Values
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // 1 published app, 1 draft app, 1 blog

    // Recent activity list
    expect(screen.getByText('PixelCraft Studio')).toBeInTheDocument();
    expect(screen.getByText('Building Resilient UIs in React 19')).toBeInTheDocument();
    expect(screen.getByText('Cannot activate Chrome extension')).toBeInTheDocument();
  });

  it('2. Regular authenticated USER is blocked from /admin with 403 error', async () => {
    renderWithProviders('/admin', {
      authUser: mockRegularAuthUser,
      user: mockRegularUser,
      role: 'user',
      isAdmin: false,
      isAuthenticated: true,
    });

    await waitFor(() => {
      expect(screen.getByText(/Admin Access Required/i)).toBeInTheDocument();
    });
  });

  it('3. Anonymous visitor is redirected to /login when attempting to access /admin', async () => {
    renderWithProviders('/admin', {
      authUser: null,
      user: null,
      role: 'user',
      isAdmin: false,
      isAuthenticated: false,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Sign in to ElseSourav/i })
      ).toBeInTheDocument();
    });
  });

  it('4. Protected child routes render correctly inside AdminLayout', async () => {
    renderWithProviders('/admin/categories');

    // Admin Layout header and placeholder render
    expect(await screen.findByText(/Manage Categories & Taxonomy/i)).toBeInTheDocument();
    expect(screen.getAllByText('Categories').length).toBeGreaterThan(0);
  });

  it('5. Admin sidebar renders all organized sections and navigation links', async () => {
    renderWithProviders('/admin');

    // Sidebar navigation landmarks
    const sidebar = await screen.findByRole('complementary', { name: /Admin Navigation/i });
    expect(sidebar).toBeInTheDocument();

    // Section headings in sidebar
    expect(screen.getByRole('heading', { level: 2, name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Content/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Operations/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /System/i })).toBeInTheDocument();

    // Key links in sidebar
    expect(within(sidebar).getByRole('link', { name: /^Apps$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Categories$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Tags$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Blog$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Help Center$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Support$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Analytics$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Theme$/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /^Audit Logs$/i })).toBeInTheDocument();
  });

  it('6. Mobile sidebar drawer opens and closes when mobile toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin');

    const toggleBtn = screen.getByLabelText(/Open admin navigation menu/i);
    expect(toggleBtn).toBeInTheDocument();

    await user.click(toggleBtn);

    // Modal drawer is open
    const drawer = screen.getByRole('dialog', { name: /Admin Navigation Menu/i });
    expect(drawer).toBeInTheDocument();

    // Close drawer
    const closeBtn = screen.getByLabelText(/Close admin menu/i);
    await user.click(closeBtn);

    expect(
      screen.queryByRole('dialog', { name: /Admin Navigation Menu/i })
    ).not.toBeInTheDocument();
  });

  it('7. Admin header contains public site link, notifications, and sign out in sidebar', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin');

    // Public Site Link in header
    expect(screen.getByRole('link', { name: /View public site in new tab/i })).toBeInTheDocument();

    // Quick Sign Out button in sidebar
    const signOutBtn = screen.getByRole('button', { name: /Sign out of admin session/i });
    expect(signOutBtn).toBeInTheDocument();

    await user.click(signOutBtn);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('8. Displays localized error message and retry button when fetching dashboard data fails', async () => {
    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      err(AppError.internal('Firestore query timeout'))
    );

    renderWithProviders('/admin');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Firestore query timeout')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});
