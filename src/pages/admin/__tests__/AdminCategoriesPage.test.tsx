import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { categoryRepository } from '@/repositories';
import { classificationService } from '@/services/classification.service';
import type { Category } from '@/types/category.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Categories Management (Prompt 48)', () => {
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

  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Developer Tools',
      slug: 'developer-tools',
      description: 'IDEs, compilers, and debuggers',
      orderIndex: 0,
      isActive: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'cat-2',
      name: 'Utilities',
      slug: 'utilities',
      description: 'Productivity helpers and scripts',
      orderIndex: 1,
      isActive: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'cat-3',
      name: 'Deprecated',
      slug: 'deprecated',
      description: 'Sunset software',
      orderIndex: 2,
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

  const renderWithProviders = (initialRoute = '/admin/categories') => {
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

    vi.spyOn(categoryRepository, 'findMany').mockResolvedValue(
      ok({ items: mockCategories, hasMore: false })
    );

    vi.spyOn(classificationService, 'createCategory').mockImplementation(async (dto) =>
      ok({
        id: 'new-cat-1',
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        orderIndex: dto.orderIndex,
        isActive: dto.isActive,
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    );

    vi.spyOn(classificationService, 'updateCategory').mockImplementation(async (id, dto) => {
      const match = mockCategories.find((c) => c.id === id) || mockCategories[0];
      return ok({
        ...match!,
        ...dto,
        updatedAt: 1700000000000,
      });
    });
  });

  it('1. Renders software categories table with order, name, slug, description, and status', async () => {
    renderWithProviders('/admin/categories');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Software Categories/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('/developer-tools')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
    expect(screen.getByText('Deprecated')).toBeInTheDocument();
  });

  it('2. Filters categories by active and inactive status', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/categories');

    await screen.findByText('Developer Tools');

    const filterSelect = screen.getByRole('combobox', { name: /Filter by active status/i });
    await user.selectOptions(filterSelect, 'active');

    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.queryByText('Deprecated')).not.toBeInTheDocument();

    await user.selectOptions(filterSelect, 'inactive');
    expect(screen.getByText('Deprecated')).toBeInTheDocument();
    expect(screen.queryByText('Developer Tools')).not.toBeInTheDocument();
  });

  it('3. Searches categories by name and slug query', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/categories');

    await screen.findByText('Developer Tools');

    const searchInput = screen.getByRole('searchbox', { name: /Search categories/i });
    await user.type(searchInput, 'util');

    expect(screen.getByText('Utilities')).toBeInTheDocument();
    expect(screen.queryByText('Developer Tools')).not.toBeInTheDocument();
  });

  it('4. Creates a new category via modal with auto slug suggestion', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/categories');

    const addBtn = await screen.findByRole('button', { name: /Add Category/i });
    await user.click(addBtn);

    expect(screen.getByRole('dialog', { name: /Add Category/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Category Name/i);
    await user.type(nameInput, 'Machine Learning');

    const slugInput = screen.getByLabelText(/URL Slug/i);
    expect(slugInput).toHaveValue('machine-learning');

    const submitBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Create Category/i,
    });
    await user.click(submitBtn);

    expect(classificationService.createCategory).toHaveBeenCalled();
  });

  it('5. Deactivates a category with confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/categories');

    await screen.findByText('Developer Tools');

    const deactivateBtn = screen.getByRole('button', { name: /Deactivate Developer Tools/i });
    await user.click(deactivateBtn);

    expect(screen.getByRole('dialog', { name: /Deactivate Category/i })).toBeInTheDocument();

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: /Deactivate Category/i,
    });
    await user.click(confirmBtn);

    expect(classificationService.updateCategory).toHaveBeenCalledWith('cat-1', {
      isActive: false,
    });
  });
});
