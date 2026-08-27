import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SupportTicketsPage } from '../SupportTicketsPage';
import * as useAuthModule from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import { ok } from '@/lib/result';
import type { SupportTicket } from '@/types/support.types';

const mockTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    ticketNumber: '#ES-1001',
    userId: 'user-123',
    subject: 'Cannot login to web app',
    description: 'Login fails with network error.',
    category: 'account',
    priority: 'normal',
    status: 'open',
    lastMessageAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'ticket-2',
    ticketNumber: '#ES-1002',
    userId: 'user-123',
    subject: 'Feature request for dark mode',
    description: 'Please add high-contrast dark mode.',
    category: 'general',
    priority: 'low',
    status: 'resolved',
    lastMessageAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

describe('SupportTicketsPage Component (Prompt 39)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
        status: 'active',
        preferences: {
          theme: 'dark',
          emailNotifications: true,
          reduceMotion: false,
          compactView: false,
        },
        createdAt: 100,
        updatedAt: 100,
      },
      authUser: {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        displayName: 'Test User',
        photoURL: null,
        isAnonymous: false,
        providerId: 'password',
        createdAt: 100,
        lastLoginAt: 100,
      },
      role: 'user',
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      sendVerificationEmail: vi.fn(),
      clearError: vi.fn(),
      error: null,
    });

    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      ok({
        items: mockTickets,
        hasMore: false,
      })
    );
  });

  it('1. Renders user tickets list with numbers and status badges', async () => {
    render(
      <MemoryRouter initialEntries={['/support/tickets']}>
        <Routes>
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Support Requests')).toBeInTheDocument();
      expect(screen.getByText('#ES-1001')).toBeInTheDocument();
      expect(screen.getByText('Cannot login to web app')).toBeInTheDocument();
      expect(screen.getByText('#ES-1002')).toBeInTheDocument();
      expect(screen.getByText('Feature request for dark mode')).toBeInTheDocument();
    });
  });

  it('2. Filters tickets by status when clicking status tabs', async () => {
    render(
      <MemoryRouter initialEntries={['/support/tickets']}>
        <Routes>
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('#ES-1001')).toBeInTheDocument();
    });

    const resolvedTab = screen.getByRole('tab', { name: /resolved/i });
    fireEvent.click(resolvedTab);

    expect(screen.getByText('#ES-1002')).toBeInTheDocument();
    expect(screen.queryByText('#ES-1001')).toBeNull();
  });

  it('3. Renders empty state when user has no tickets', async () => {
    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      ok({
        items: [],
        hasMore: false,
      })
    );

    render(
      <MemoryRouter initialEntries={['/support/tickets']}>
        <Routes>
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Support Tickets Yet')).toBeInTheDocument();
    });
  });
});
