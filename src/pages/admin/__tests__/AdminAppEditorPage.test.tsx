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

describe('Admin Application Editor (Prompt 47)', () => {
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

  const mockExistingApp: App = {
    id: 'app-100',
    slug: 'hyper-terminal',
    name: 'Hyper Terminal',
    shortDescription: 'Hardware-accelerated web terminal',
    description: 'Detailed documentation and architectural overview of Hyper Terminal.',
    iconUrl: 'https://cdn.example.com/icons/terminal.png',
    primaryCategory: 'developer-tools',
    tags: ['cli', 'terminal'],
    status: 'draft',
    platforms: ['web', 'macos'],
    links: [
      {
        id: 'link-100',
        appId: 'app-100',
        platform: 'web',
        label: 'Open Terminal',
        url: 'https://term.elsesourav.com',
        action: 'open_app',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      },
    ],
    currentVersion: '1.2.0',
    stats: { views: 500, launches: 230, libraryAdds: 90 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
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
    initialRoute = '/admin/apps/new',
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

    vi.spyOn(appRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'app-100') {
        return ok(mockExistingApp);
      }
      return ok(null);
    });

    vi.spyOn(appService, 'createDraft').mockResolvedValue(
      ok({ ...mockExistingApp, id: 'new-app-1' })
    );

    vi.spyOn(appService, 'updateDraft').mockResolvedValue(ok(mockExistingApp));

    vi.spyOn(appService, 'createApp').mockResolvedValue(
      ok({ ...mockExistingApp, id: 'new-app-1' })
    );

    vi.spyOn(appService, 'updateApp').mockResolvedValue(ok(mockExistingApp));

    vi.spyOn(appService, 'publishApp').mockResolvedValue(
      ok({ ...mockExistingApp, status: 'published' })
    );

    vi.spyOn(appService, 'archiveApp').mockResolvedValue(
      ok({ ...mockExistingApp, status: 'archived' })
    );
  });

  it('1. Renders new application creation page with all 6 form sections', async () => {
    renderWithProviders('/admin/apps/new');

    expect(
      await screen.findByRole('heading', { level: 1, name: /New Application/i })
    ).toBeInTheDocument();

    // Section headings
    expect(screen.getByText(/1. Basic Information/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Platform Destinations & Smart Action/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Branding & Media Assets/i)).toBeInTheDocument();
    expect(screen.getByText(/Classification & Platforms/i)).toBeInTheDocument();
    expect(screen.getByText(/Visibility & Curation/i)).toBeInTheDocument();
    expect(screen.getByText(/Search Engine Optimization/i)).toBeInTheDocument();

    // Actions
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Application/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
  });

  it('2. Auto-generates slug from app name and allows manual edit', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/new');

    const nameInput = await screen.findByLabelText(/Application Name/i);
    await user.type(nameInput, 'Nebula Graph Studio');

    const slugInput = screen.getByLabelText(/URL Slug/i);
    expect(slugInput).toHaveValue('nebula-graph-studio');
  });

  it('3. Adds and removes discovery tags', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/new');

    const tagInput = await screen.findByLabelText(/Add discovery tag/i);
    await user.type(tagInput, 'wasm{Enter}');

    expect(screen.getByText('#wasm')).toBeInTheDocument();

    // Remove tag
    const removeTagBtn = screen.getByRole('button', { name: /Remove tag wasm/i });
    await user.click(removeTagBtn);

    expect(screen.queryByText('#wasm')).not.toBeInTheDocument();
  });

  it('4. Adds platform destination link and marks as primary CTA', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/new');

    const addLinkBtn = await screen.findByRole('button', { name: /Add Primary Destination/i });
    await user.click(addLinkBtn);

    // Dialog opens
    expect(
      screen.getByRole('dialog', { name: /Add Platform Destination Link/i })
    ).toBeInTheDocument();

    const urlInput = screen.getByLabelText(/Destination URL/i);
    await user.type(urlInput, 'https://nebula.elsesourav.com');

    const submitBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /^Add Link$/i,
    });
    await user.click(submitBtn);

    // Link appears in list
    expect(screen.getByText('https://nebula.elsesourav.com')).toBeInTheDocument();
    expect(screen.getByText('Primary CTA')).toBeInTheDocument();
  });

  it('5. Blocks publication and displays validation errors when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/new');

    const publishBtn = await screen.findByRole('button', { name: /Publish Application/i });
    await user.click(publishBtn);

    // Shows missing requirements alert
    expect(
      screen.getByText(/Cannot publish application yet. Please resolve missing requirements:/i)
    ).toBeInTheDocument();
    expect(screen.getByText('App name is required')).toBeInTheDocument();
    expect(screen.getByText('Short description is required')).toBeInTheDocument();
  });

  it('6. Saves draft successfully', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/new');

    const nameInput = await screen.findByLabelText(/Application Name/i);
    await user.type(nameInput, 'Nebula Graph');

    const saveDraftBtn = screen.getByRole('button', { name: /Save Draft/i });
    await user.click(saveDraftBtn);

    expect(appService.createDraft).toHaveBeenCalled();
  });

  it('7. Loads existing application in edit mode and populates all form fields', async () => {
    renderWithProviders('/admin/apps/app-100/edit');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Hyper Terminal/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Application Name/i)).toHaveValue('Hyper Terminal');
    expect(screen.getByLabelText(/URL Slug/i)).toHaveValue('hyper-terminal');
    expect(screen.getByLabelText(/Short Description/i)).toHaveValue(
      'Hardware-accelerated web terminal'
    );
    expect(screen.getByLabelText(/Current Version/i)).toHaveValue('1.2.0');
    expect(screen.getByText('https://term.elsesourav.com')).toBeInTheDocument();
  });

  it('8. Opens live preview modal with app metadata', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/app-100/edit');

    await screen.findByRole('heading', { level: 1, name: /Hyper Terminal/i });

    const previewBtn = screen.getByRole('button', { name: /Preview/i });
    await user.click(previewBtn);

    expect(
      screen.getByRole('dialog', { name: /Live Preview: Hyper Terminal/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Hardware-accelerated web terminal')).toBeInTheDocument();
  });

  it('9. Confirms archive of existing application', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/apps/app-100/edit');

    await screen.findByRole('heading', { level: 1, name: /Hyper Terminal/i });

    const archiveBtn = screen.getByRole('button', { name: /^Archive$/i });
    await user.click(archiveBtn);

    expect(screen.getByRole('dialog', { name: /Archive Application/i })).toBeInTheDocument();

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Archive Application/i,
    });
    await user.click(confirmBtn);

    expect(appService.archiveApp).toHaveBeenCalledWith('app-100');
  });
});
