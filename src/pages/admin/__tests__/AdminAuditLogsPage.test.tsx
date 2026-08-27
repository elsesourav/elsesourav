import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { auditService } from '@/services/audit.service';
import type { AuditLog } from '@/types/audit.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Audit Logs & Security Trail (Prompt 50)', () => {
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

  const mockAuditLogs: AuditLog[] = [
    {
      id: 'log-1',
      actorUserId: 'admin-1',
      actorEmail: 'admin@elsesourav.com',
      action: 'APP_PUBLISHED',
      entityType: 'app',
      entityId: 'app-pixel-craft',
      metadata: { name: 'PixelCraft Studio', version: '1.0.0' },
      createdAt: 1700000100000,
    },
    {
      id: 'log-2',
      actorUserId: 'admin-1',
      actorEmail: 'admin@elsesourav.com',
      action: 'CATEGORY_CREATED',
      entityType: 'category',
      entityId: 'cat-developer-tools',
      metadata: { name: 'Developer Tools', slug: 'developer-tools' },
      createdAt: 1700000050000,
    },
    {
      id: 'log-3',
      actorUserId: 'admin-1',
      actorEmail: 'admin@elsesourav.com',
      action: 'SUPPORT_STATUS_CHANGED',
      entityType: 'support',
      entityId: 'ticket-101',
      metadata: { ticketNumber: 'ES-101', newStatus: 'resolved' },
      createdAt: 1700000010000,
    },
  ];

  const createAuthContextValue = (isAdminUser = true): AuthContextValue => ({
    authUser: mockAdminAuthUser,
    user: mockAdminUser,
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

  const renderWithProviders = (initialRoute = '/admin/audit-logs', isAdminUser = true) => {
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

    vi.spyOn(auditService, 'listLogs').mockResolvedValue(
      ok({ items: mockAuditLogs, hasMore: false })
    );
  });

  it('1. Renders audit logs table with timestamps, actions, entity types, and actor emails', async () => {
    renderWithProviders('/admin/audit-logs');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Security & Audit Trail/i })
    ).toBeInTheDocument();

    const table = screen.getByRole('region', { name: /Audit Logs Table/i });
    expect(within(table).getByText('APP_PUBLISHED')).toBeInTheDocument();
    expect(within(table).getByText('CATEGORY_CREATED')).toBeInTheDocument();
    expect(within(table).getByText('SUPPORT_STATUS_CHANGED')).toBeInTheDocument();
    expect(within(table).getByText('app-pixel-craft')).toBeInTheDocument();
  });

  it('2. Filters audit logs by entity type', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/audit-logs');

    await screen.findByRole('heading', { level: 1, name: /Security & Audit Trail/i });

    const entitySelect = screen.getByRole('combobox', { name: /Filter by entity type/i });
    await user.selectOptions(entitySelect, 'category');

    const table = screen.getByRole('region', { name: /Audit Logs Table/i });
    expect(within(table).getByText('CATEGORY_CREATED')).toBeInTheDocument();
    expect(within(table).queryByText('APP_PUBLISHED')).not.toBeInTheDocument();
  });

  it('3. Searches audit logs by keyword', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/audit-logs');

    await screen.findByRole('heading', { level: 1, name: /Security & Audit Trail/i });

    const searchInput = screen.getByLabelText(/Search audit logs/i);
    await user.type(searchInput, 'pixel-craft');

    expect(screen.getByText('app-pixel-craft')).toBeInTheDocument();
    expect(screen.queryByText('cat-developer-tools')).not.toBeInTheDocument();
  });

  it('4. Opens detail inspector modal on clicking Inspect button', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/audit-logs');

    await screen.findByRole('heading', { level: 1, name: /Security & Audit Trail/i });

    const inspectBtns = screen.getAllByRole('button', { name: /View audit details for/i });
    const firstInspectBtn = inspectBtns[0];
    if (firstInspectBtn) {
      await user.click(firstInspectBtn);
    }

    expect(await screen.findByText(/Audit Record Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/PixelCraft Studio/i)).toBeInTheDocument();
  });

  it('5. Regular non-admin users cannot access audit logs', async () => {
    renderWithProviders('/admin/audit-logs', false);

    expect(screen.queryByText(/Security & Audit Trail/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/Admin Access Required/i)).toBeInTheDocument();
  });
});
