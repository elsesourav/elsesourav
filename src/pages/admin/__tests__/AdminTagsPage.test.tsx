import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { tagRepository } from '@/repositories';
import { classificationService } from '@/services/classification.service';
import type { Tag } from '@/types/tag.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Tags Management (Prompt 48)', () => {
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

  const mockTags: Tag[] = [
    {
      id: 'tag-1',
      name: 'react',
      slug: 'react',
      description: 'React web applications',
      isActive: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'tag-2',
      name: 'typescript',
      slug: 'typescript',
      description: 'TypeScript codebase',
      isActive: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'tag-3',
      name: 'legacy',
      slug: 'legacy',
      description: 'Old projects',
      isActive: false,
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

  const renderWithProviders = (initialRoute = '/admin/tags') => {
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

    vi.spyOn(tagRepository, 'findMany').mockResolvedValue(ok({ items: mockTags, hasMore: false }));

    vi.spyOn(classificationService, 'createTag').mockImplementation(async (dto) =>
      ok({
        id: 'new-tag-1',
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isActive: dto.isActive,
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    );

    vi.spyOn(classificationService, 'updateTag').mockImplementation(async (id, dto) => {
      const match = mockTags.find((t) => t.id === id) || mockTags[0];
      return ok({
        ...match!,
        ...dto,
        updatedAt: 1700000000000,
      });
    });
  });

  it('1. Renders discovery tags table with tag name, slug, description, and status', async () => {
    renderWithProviders('/admin/tags');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Discovery Tags/i })
    ).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('/react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('#legacy')).toBeInTheDocument();
  });

  it('2. Creates a normalized lowercase tag via modal', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/tags');

    const addBtn = await screen.findByRole('button', { name: /Add Tag/i });
    await user.click(addBtn);

    expect(screen.getByRole('dialog', { name: /Add Discovery Tag/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Tag Name/i);
    await user.type(nameInput, 'WebAssembly');

    const slugInput = screen.getByLabelText(/URL Slug/i);
    expect(slugInput).toHaveValue('webassembly');

    const submitBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Create Tag/i,
    });
    await user.click(submitBtn);

    expect(classificationService.createTag).toHaveBeenCalled();
  });

  it('3. Prevents duplicate tag creation with clear error message', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/tags');

    const addBtn = await screen.findByRole('button', { name: /Add Tag/i });
    await user.click(addBtn);

    const nameInput = screen.getByLabelText(/Tag Name/i);
    await user.type(nameInput, 'React'); // Duplicate of #react

    const submitBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Create Tag/i,
    });
    await user.click(submitBtn);

    expect(
      screen.getByText(/A tag with name "react" or slug "react" already exists./i)
    ).toBeInTheDocument();
    expect(classificationService.createTag).not.toHaveBeenCalled();
  });

  it('4. Deactivates a tag with confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/tags');

    await screen.findByText('#react');

    const deactivateBtn = screen.getByRole('button', { name: /Deactivate react/i });
    await user.click(deactivateBtn);

    expect(screen.getByRole('dialog', { name: /Deactivate Tag/i })).toBeInTheDocument();

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Deactivate Tag/i,
    });
    await user.click(confirmBtn);

    expect(classificationService.updateTag).toHaveBeenCalledWith('tag-1', {
      isActive: false,
    });
  });
});
