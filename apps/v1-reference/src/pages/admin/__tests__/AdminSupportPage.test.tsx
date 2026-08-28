import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import { supportService } from '@/services/support.service';
import { appRepository } from '@/repositories/app.repository';
import type { SupportTicket, SupportTicketMessage } from '@/types/support.types';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Support Management (Prompt 49)', () => {
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

  const mockTickets: SupportTicket[] = [
    {
      id: 'ticket-1',
      ticketNumber: 'ES-101',
      userId: 'user-1',
      userEmail: 'user1@example.com',
      userName: 'Alice Dev',
      subject: 'Cannot launch web terminal in Chrome',
      description: 'Web terminal fails with WebSocket timeout on Chrome v120.',
      category: 'chrome_extension',
      priority: 'high',
      status: 'open',
      relatedAppId: 'app-1',
      lastMessageAt: 1700000000000,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'ticket-2',
      ticketNumber: 'ES-102',
      userId: 'user-2',
      userEmail: 'user2@example.com',
      userName: 'Bob User',
      subject: 'Feature request for offline export',
      description: 'Please add JSON export option for sprites.',
      category: 'general',
      priority: 'normal',
      status: 'resolved',
      lastMessageAt: 1690000000000,
      createdAt: 1690000000000,
      updatedAt: 1690000000000,
    },
  ];

  const mockMessages: SupportTicketMessage[] = [
    {
      id: 'msg-1',
      ticketId: 'ticket-1',
      senderUserId: 'admin-1',
      senderRole: 'admin',
      senderName: 'ElseSourav Support',
      message: 'Hello Alice, we are investigating the WebSocket timeout issue.',
      createdAt: 1700000050000,
      updatedAt: 1700000050000,
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

  const renderWithProviders = (initialRoute = '/admin/support') => {
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

    vi.spyOn(supportService, 'listAdminTickets').mockResolvedValue(
      ok({ items: mockTickets, hasMore: false })
    );

    vi.spyOn(supportService, 'listMessages').mockResolvedValue(
      ok({ items: mockMessages, hasMore: false })
    );

    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({
        items: [
          {
            id: 'app-1',
            slug: 'hyper-term',
            name: 'Hyper Terminal',
            shortDescription: 'Web Terminal',
            description: 'Terminal',
            iconUrl: '',
            primaryCategory: 'developer-tools',
            tags: [],
            status: 'published',
            platforms: ['web'],
            links: [],
            currentVersion: '1.0.0',
            stats: { views: 100, launches: 50, libraryAdds: 20 },
            isFeatured: false,
            isPinned: false,
            sortOrder: 0,
            screenshots: [],
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(supportService, 'addMessage').mockImplementation(async (input) =>
      ok({
        id: 'new-msg-1',
        ticketId: input.ticketId,
        senderUserId: 'admin-1',
        senderRole: 'admin',
        senderName: 'ElseSourav Support',
        message: input.message,
        createdAt: 1700000100000,
        updatedAt: 1700000100000,
      })
    );

    vi.spyOn(supportService, 'updateTicketStatus').mockImplementation(async (ticketId, status) => {
      const match = mockTickets.find((t) => t.id === ticketId) || mockTickets[0];
      return ok({
        ...match!,
        status,
        updatedAt: 1700000100000,
      });
    });

    vi.spyOn(supportService, 'updateTicketPriority').mockImplementation(
      async (ticketId, priority) => {
        const match = mockTickets.find((t) => t.id === ticketId) || mockTickets[0];
        return ok({
          ...match!,
          priority,
          updatedAt: 1700000100000,
        });
      }
    );
  });

  it('1. Renders support queue with ticket subject, user, priority, and status badges', async () => {
    renderWithProviders('/admin/support');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Support Ticket Central/i })
    ).toBeInTheDocument();
    const es101Elements = await screen.findAllByText('ES-101');
    expect(es101Elements.length).toBeGreaterThan(0);
    const queue = screen.getByRole('region', { name: /Support Tickets List/i });
    expect(within(queue).getByText(/Cannot launch web terminal in Chrome/i)).toBeInTheDocument();
    expect(within(queue).getByText('Alice Dev')).toBeInTheDocument();
    expect(within(queue).getByText('ES-102')).toBeInTheDocument();
  });

  it('2. Filters tickets by status', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/support');

    await screen.findByRole('heading', { level: 1, name: /Support Ticket Central/i });
    await screen.findAllByText('ES-101');

    const statusFilter = screen.getByRole('combobox', { name: /Filter by ticket status/i });
    await user.selectOptions(statusFilter, 'resolved');

    const queue = screen.getByRole('region', { name: /Support Tickets List/i });
    expect(within(queue).getByText('ES-102')).toBeInTheDocument();
    expect(within(queue).queryByText(/Cannot launch web terminal/i)).not.toBeInTheDocument();
  });

  it('3. Selects ticket and displays message thread and description', async () => {
    renderWithProviders('/admin/support');

    await screen.findByRole('heading', { level: 1, name: /Support Ticket Central/i });
    await screen.findAllByText('ES-101');

    expect(
      await screen.findByText(/Web terminal fails with WebSocket timeout on Chrome v120/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hello Alice, we are investigating the WebSocket timeout issue./i)
    ).toBeInTheDocument();
  });

  it('4. Admin sends reply message to ticket conversation', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/support');

    await screen.findByRole('heading', { level: 1, name: /Support Ticket Central/i });
    await screen.findAllByText('ES-101');

    const replyInput = screen.getByLabelText(/Admin reply message/i);
    await user.type(replyInput, 'Fix has been deployed in v1.0.1. Please test again.');

    const sendBtn = screen.getByRole('button', { name: /Send Reply/i });
    await user.click(sendBtn);

    expect(supportService.addMessage).toHaveBeenCalled();
  });

  it('5. Changes ticket status to resolved', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/support');

    await screen.findByRole('heading', { level: 1, name: /Support Ticket Central/i });
    await screen.findAllByText('ES-101');

    const resolveBtn = screen.getByRole('button', { name: /^Resolve$/i });
    await user.click(resolveBtn);

    expect(supportService.updateTicketStatus).toHaveBeenCalledWith(
      'ticket-1',
      'resolved',
      expect.any(Object)
    );
  });

  it('6. Changes ticket priority via dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/support');

    await screen.findByRole('heading', { level: 1, name: /Support Ticket Central/i });
    await screen.findAllByText('ES-101');

    const prioritySelect = screen.getByLabelText(/Change ticket priority/i);
    await user.selectOptions(prioritySelect, 'low');

    expect(supportService.updateTicketPriority).toHaveBeenCalledWith(
      'ticket-1',
      'low',
      expect.any(Object)
    );
  });
});
