import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { appRepository } from '@/repositories';
import { appService } from '@/services/app.service';
import type { App } from '@/types/app.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Applications Management (Prompt 47)', () => {
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

  const mockPublishedApp: App = {
    id: 'app-1',
    slug: 'codeflow-ide',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern cloud-native developer environment',
    description: 'Full markdown documentation for CodeFlow IDE',
    iconUrl: 'https://example.com/icons/codeflow.png',
    primaryCategory: 'developer-tools',
    tags: ['coding', 'ide', 'web'],
    status: 'published',
    platforms: ['web', 'macos', 'windows'],
    links: [
      {
        id: 'link-1',
        appId: 'app-1',
        platform: 'web',
        label: 'Launch Cloud IDE',
        url: 'https://codeflow.elsesourav.com',
        action: 'open_app',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      },
    ],
    currentVersion: '2.1.0',
    stats: { views: 1200, launches: 840, libraryAdds: 350 },
    isFeatured: true,
    isPinned: true,
    sortOrder: 1,
    publishedAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    screenshots: [],
  };

  const mockDraftApp: App = {
    id: 'app-2',
    slug: 'pixelcraft-studio',
    name: 'PixelCraft Studio',
    shortDescription: 'Vector graphic design suite in the browser',
    description: 'PixelCraft description',
    iconUrl: 'https://example.com/icons/pixelcraft.png',
    primaryCategory: 'graphics',
    tags: ['design', 'vector'],
    status: 'draft',
    platforms: ['web'],
    links: [],
    currentVersion: '0.9.0',
    stats: { views: 40, launches: 12, libraryAdds: 5 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 2,
    createdAt: 1700000500000,
    updatedAt: 1700000500000,
    screenshots: [],
  };

  const mockArchivedApp: App = {
    id: 'app-3',
    slug: 'legacy-terminal',
    name: 'Legacy Terminal',
    shortDescription: 'Deprecated terminal utility',
    description: 'Old terminal',
    iconUrl: 'https://example.com/icons/terminal.png',
    primaryCategory: 'utilities',
    tags: ['terminal'],
    status: 'archived',
    platforms: ['linux'],
    links: [],
    currentVersion: '0.1.0',
    stats: { views: 10, launches: 2, libraryAdds: 1 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 3,
    createdAt: 1690000000000,
    updatedAt: 1690000000000,
    screenshots: [],
  };

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

  const renderWithProviders = (
    initialRoute = '/admin/apps',
    authOverrides?: Partial<AuthContextValue>
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <AuthContext.Provider value={createAuthContextValue(authOverrides)}>
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

    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockPublishedApp, mockDraftApp, mockArchivedApp], hasMore: false })
    );
  });

  it('1. Renders admin apps catalog table with apps, badges, and action buttons', async () => {
    renderWithProviders('/admin/apps');

    expect(
      await screen.findByRole('heading', { level: 1, name: /^Applications$/i })
    ).toBeInTheDocument();
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.getByText('PixelCraft Studio')).toBeInTheDocument();
    expect(screen.getByText('Legacy Terminal')).toBeInTheDocument();

    // Versions
    expect(screen.getByText('v2.1.0')).toBeInTheDocument();
    expect(screen.getByText('v0.9.0')).toBeInTheDocument();

    // Create CTA
    expect(screen.getByRole('button', { name: /Create Application/i })).toBeInTheDocument();
  });

  it('2. Filters applications by status tabs (All, Published, Draft, Archived)', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps');

    await screen.findByText('CodeFlow IDE');

    // Click Draft tab
    const draftTab = screen.getByRole('tab', { name: /Draft/i });
    await user.click(draftTab);

    expect(screen.getByText('PixelCraft Studio')).toBeInTheDocument();
    expect(screen.queryByText('CodeFlow IDE')).not.toBeInTheDocument();
    expect(screen.queryByText('Legacy Terminal')).not.toBeInTheDocument();

    // Click Published tab
    const pubTab = screen.getByRole('tab', { name: /Published/i });
    await user.click(pubTab);

    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.queryByText('PixelCraft Studio')).not.toBeInTheDocument();
  });

  it('3. Searches applications by name, slug, or category', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps');

    await screen.findByText('CodeFlow IDE');

    const searchInput = screen.getByRole('searchbox', { name: /Search applications/i });
    await user.type(searchInput, 'PixelCraft');

    expect(screen.getByText('PixelCraft Studio')).toBeInTheDocument();
    expect(screen.queryByText('CodeFlow IDE')).not.toBeInTheDocument();
  });

  it('4. Toggles publishing and unpublishing an application', async () => {
    const user = userEvent.setup();
    const unpublishSpy = vi
      .spyOn(appService, 'unpublishApp')
      .mockResolvedValue(ok({ ...mockPublishedApp, status: 'draft' }));

    renderWithProviders('/admin/apps');

    await screen.findByText('CodeFlow IDE');

    const unpublishBtn = screen.getByRole('button', { name: /Unpublish CodeFlow IDE/i });
    await user.click(unpublishBtn);

    expect(unpublishSpy).toHaveBeenCalledWith('app-1');
  });

  it('5. Archives an application after confirmation in dialog', async () => {
    const user = userEvent.setup();
    const archiveSpy = vi
      .spyOn(appService, 'archiveApp')
      .mockResolvedValue(ok({ ...mockPublishedApp, status: 'archived' }));

    renderWithProviders('/admin/apps');

    await screen.findByText('CodeFlow IDE');

    const archiveBtn = screen.getByRole('button', { name: /Archive CodeFlow IDE/i });
    await user.click(archiveBtn);

    // Dialog appears
    expect(screen.getByRole('dialog', { name: /Archive Application/i })).toBeInTheDocument();

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Archive Application/i,
    });
    await user.click(confirmBtn);

    expect(archiveSpy).toHaveBeenCalledWith('app-1');
  });

  it('6. Restores an archived application back to draft status', async () => {
    const user = userEvent.setup();
    const restoreSpy = vi
      .spyOn(appService, 'restoreApp')
      .mockResolvedValue(ok({ ...mockArchivedApp, status: 'draft' }));

    renderWithProviders('/admin/apps');

    await screen.findByText('Legacy Terminal');

    const restoreBtn = screen.getByRole('button', { name: /Restore Legacy Terminal/i });
    await user.click(restoreBtn);

    expect(restoreSpy).toHaveBeenCalledWith('app-3', 'draft');
  });

  it('7. Opens app preview dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps');

    await screen.findByText('CodeFlow IDE');

    const previewBtn = screen.getByRole('button', { name: /Preview CodeFlow IDE/i });
    await user.click(previewBtn);

    expect(screen.getByRole('dialog', { name: /Preview: CodeFlow IDE/i })).toBeInTheDocument();
    expect(screen.getByText('Modern cloud-native developer environment')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Preview/i });
    await user.click(closeBtn);

    expect(
      screen.queryByRole('dialog', { name: /Preview: CodeFlow IDE/i })
    ).not.toBeInTheDocument();
  });
});
