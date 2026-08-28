import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { supportService } from '@/services/support.service';
import { auditService } from '@/services/audit.service';
import { auditLogRepository } from '@/repositories/audit.repository';
import { appRepository } from '@/repositories/app.repository';
import { blogRepository } from '@/repositories/blog.repository';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin End-to-End Operational Workflow (Prompt 50)', () => {
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

  const adminContext = {
    id: 'admin-1',
    email: 'admin@elsesourav.com',
    name: 'Sourav Admin',
    role: 'admin' as const,
  };

  const createAuthContextValue = (isAdminUser = true): AuthContextValue => ({
    authUser: isAdminUser ? mockAdminAuthUser : { ...mockAdminAuthUser, uid: 'user-2' },
    user: isAdminUser ? mockAdminUser : { ...mockAdminUser, id: 'user-2', role: 'user' },
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

  const renderWithProviders = (initialRoute = '/admin', isAdminUser = true) => {
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

    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({
        items: [
          {
            id: 'app-1',
            slug: 'code-sync',
            name: 'CodeSync Studio',
            shortDescription: 'Developer IDE',
            description: 'Full description',
            iconUrl: '',
            primaryCategory: 'developer-tools',
            tags: [],
            status: 'published',
            platforms: ['web'],
            links: [],
            screenshots: [],
            currentVersion: '1.0.0',
            stats: { views: 500, launches: 200, libraryAdds: 100 },
            isFeatured: true,
            isPinned: false,
            sortOrder: 0,
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(blogRepository, 'findMany').mockResolvedValue(
      ok({
        items: [],
        hasMore: false,
      })
    );

    vi.spyOn(supportService, 'listAdminTickets').mockResolvedValue(
      ok({
        items: [],
        hasMore: false,
      })
    );

    vi.spyOn(auditLogRepository, 'createLog').mockImplementation(async (dto) =>
      Promise.resolve(
        ok({
          id: 'log-1',
          actorUserId: dto.actorUserId,
          actorEmail: dto.actorEmail,
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId,
          metadata: dto.metadata,
          createdAt: 1700000100000,
        })
      )
    );

    vi.spyOn(auditService, 'listLogs').mockResolvedValue(
      ok({
        items: [
          {
            id: 'log-1',
            actorUserId: 'admin-1',
            actorEmail: 'admin@elsesourav.com',
            action: 'APP_PUBLISHED',
            entityType: 'app',
            entityId: 'app-1',
            metadata: { name: 'CodeSync Studio' },
            createdAt: 1700000100000,
          },
        ],
        hasMore: false,
      })
    );
  });

  it('1. Admin accesses dashboard and views real platform metrics', async () => {
    renderWithProviders('/admin');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Admin Dashboard/i }, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(await screen.findByText('CodeSync Studio', {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('2. Records administrative mutations through domain services with audit logs', async () => {
    // Record App Publication Audit
    const auditRes = await auditService.recordAction(
      {
        actorUserId: 'admin-1',
        actorEmail: 'admin@elsesourav.com',
        action: 'APP_PUBLISHED',
        entityType: 'app',
        entityId: 'app-1',
        metadata: { name: 'CodeSync Studio', version: '1.0.0' },
      },
      adminContext
    );

    expect(auditRes.success).toBe(true);
    if (auditRes.success) {
      expect(auditRes.data.action).toBe('APP_PUBLISHED');
      expect(auditRes.data.entityType).toBe('app');
    }
  });

  it('3. Prevents regular non-admin users from creating audit logs or accessing admin portal', async () => {
    const nonAdminUser = { id: 'user-2', role: 'user' as const };
    const forbiddenRes = await auditService.recordAction(
      {
        actorUserId: 'user-2',
        action: 'APP_PUBLISHED',
        entityType: 'app',
        entityId: 'app-1',
      },
      nonAdminUser
    );

    expect(forbiddenRes.success).toBe(false);

    renderWithProviders('/admin', false);
    expect(await screen.findByText(/Admin Access Required/i)).toBeInTheDocument();
  });
});
