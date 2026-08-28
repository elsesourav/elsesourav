import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { appRepository } from '@/repositories/app.repository';
import { analyticsRepository } from '@/repositories/analytics.repository';
import { feedbackRepository } from '@/repositories/feedback.repository';
import type { App } from '@/types/app.types';
import type { AnalyticsEvent } from '@/types/analytics.types';
import type { AppFeedback } from '@/types/feedback.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Analytics & Engagement Dashboard (Prompt 49)', () => {
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
    id: 'user-2',
    email: 'visitor@example.com',
    displayName: 'Regular Visitor',
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

  const mockApps: App[] = [
    {
      id: 'app-1',
      slug: 'pixel-craft',
      name: 'PixelCraft Studio',
      shortDescription: 'Sprite creator',
      description: 'Pixel editor',
      iconUrl: '',
      primaryCategory: 'graphics',
      tags: [],
      status: 'published',
      platforms: ['web'],
      links: [],
      screenshots: [],
      currentVersion: '1.0.0',
      stats: { views: 1500, launches: 920, libraryAdds: 400 },
      isFeatured: true,
      isPinned: false,
      sortOrder: 0,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'app-2',
      slug: 'code-sync',
      name: 'CodeSync CLI',
      shortDescription: 'Cloud CLI',
      description: 'CLI tool',
      iconUrl: '',
      primaryCategory: 'developer-tools',
      tags: [],
      status: 'published',
      platforms: ['macos'],
      links: [],
      screenshots: [],
      currentVersion: '2.0.0',
      stats: { views: 800, launches: 350, libraryAdds: 120 },
      isFeatured: false,
      isPinned: false,
      sortOrder: 1,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
  ];

  const mockEvents: AnalyticsEvent[] = [
    {
      id: 'ev-1',
      appId: 'app-1',
      eventType: 'primary_action',
      createdAt: 1700000050000,
    },
    {
      id: 'ev-2',
      appId: 'app-2',
      eventType: 'view',
      createdAt: 1700000020000,
    },
  ];

  const mockFeedbacks: AppFeedback[] = [
    {
      id: 'fb-1',
      appId: 'app-1',
      userId: 'user-1',
      userDisplayName: 'User 1',
      rating: 5,
      message: 'Exceptional tool!',
      status: 'approved',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
  ];

  const createAuthContextValue = (isAdminUser = true): AuthContextValue => ({
    authUser: isAdminUser ? mockAdminAuthUser : { ...mockAdminAuthUser, uid: 'user-2' },
    user: isAdminUser ? mockAdminUser : mockRegularUser,
    role: isAdminUser ? 'admin' : 'user',
    isAuthenticated: true,
    isAdmin: isAdminUser,
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
  });

  const renderWithProviders = (initialRoute = '/admin/analytics', isAdminUser = true) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <AuthContext.Provider value={createAuthContextValue(isAdminUser)}>
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

    vi.spyOn(appRepository, 'findMany').mockResolvedValue(ok({ items: mockApps, hasMore: false }));

    vi.spyOn(analyticsRepository, 'listEvents').mockResolvedValue(
      ok({ items: mockEvents, hasMore: false })
    );

    vi.spyOn(feedbackRepository, 'listAllForModeration').mockResolvedValue(
      ok({ items: mockFeedbacks, hasMore: false })
    );
  });

  it('1. Renders analytics metric cards for views, launches, bookmarks, and user satisfaction', async () => {
    renderWithProviders('/admin/analytics');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Platform Analytics & Engagement/i })
    ).toBeInTheDocument();

    expect(await screen.findByText('2,300')).toBeInTheDocument(); // Total views: 1500 + 800
    expect(screen.getByText('1,270')).toBeInTheDocument(); // Total launches: 920 + 350
    expect(screen.getByText('520')).toBeInTheDocument(); // Total saves: 400 + 120
    expect(screen.getByText(/5.0 \/ 5.0/i)).toBeInTheDocument();
  });

  it('2. Switches time range filter tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/analytics');

    const tab7d = await screen.findByRole('tab', { name: /Last 7 Days/i });
    await user.click(tab7d);
    expect(tab7d).toHaveAttribute('aria-selected', 'true');

    const tabAll = screen.getByRole('tab', { name: /All Time/i });
    await user.click(tabAll);
    expect(tabAll).toHaveAttribute('aria-selected', 'true');
  });

  it('3. Renders software ranking leaderboards and allows switching ranking metric', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/analytics');

    expect(await screen.findByText('PixelCraft Studio')).toBeInTheDocument();
    expect(screen.getByText(/1,500 views/i)).toBeInTheDocument();

    const launchesTab = screen.getByRole('tab', { name: /Launches/i });
    await user.click(launchesTab);

    expect(screen.getByText(/920 launches/i)).toBeInTheDocument();
  });

  it('4. Renders live telemetry interaction event stream', async () => {
    renderWithProviders('/admin/analytics');

    expect(await screen.findByText('PRIMARY ACTION')).toBeInTheDocument();
    expect(screen.getByText('VIEW')).toBeInTheDocument();
  });

  it('5. Regular non-admin users cannot access admin analytics', async () => {
    renderWithProviders('/admin/analytics', false);

    expect(screen.queryByText(/Platform Analytics & Engagement/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/Admin Access Required/i)).toBeInTheDocument();
  });
});
