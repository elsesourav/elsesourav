import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SupportPage } from '../SupportPage';
import * as useAuthModule from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import { ok } from '@/lib/result';
import type { SupportTicket } from '@/types/support.types';

const mockCreatedTicket: SupportTicket = {
  id: 'ticket-999',
  ticketNumber: '#ES-TEST-999',
  userId: 'user-123',
  userEmail: 'user@example.com',
  userName: 'Test User',
  subject: 'Issue installing extension',
  description: 'The extension installation fails on Chrome v125.',
  category: 'chrome_extension',
  priority: 'normal',
  status: 'open',
  lastMessageAt: 1700000000000,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe('SupportPage Component (Prompt 39)', () => {
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

    vi.spyOn(supportService, 'createTicket').mockResolvedValue(ok(mockCreatedTicket));
  });

  it('1. Renders support form and ticket creation elements', () => {
    render(
      <MemoryRouter initialEntries={['/support']}>
        <Routes>
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('How can we help you?')).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit support ticket/i })).toBeInTheDocument();
  });

  it('2. Pre-fills form fields from Help Center escalation query parameters', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/support?ref=help_article&article=install-cli&title=Installing+ElseSourav+CLI',
        ]}
      >
        <Routes>
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </MemoryRouter>
    );

    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    expect(subjectInput.value).toBe('Help with: Installing ElseSourav CLI');
  });

  it('3. Submits ticket successfully and displays confirmation view', async () => {
    render(
      <MemoryRouter initialEntries={['/support']}>
        <Routes>
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: 'Need help with account export' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'I would like to export my personal bookmarks and ratings.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit support ticket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supportService.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Need help with account export',
          description: 'I would like to export my personal bookmarks and ratings.',
        }),
        expect.objectContaining({ id: 'user-123' })
      );
      expect(screen.getByText('Support Ticket Created!')).toBeInTheDocument();
      expect(screen.getByText('#ES-TEST-999')).toBeInTheDocument();
    });
  });

  it('4. Shows sign-in prompt and disables submit when unauthenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      authUser: null,
      role: 'user',
      isLoading: false,
      isAuthenticated: false,
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

    render(
      <MemoryRouter initialEntries={['/support']}>
        <Routes>
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit support ticket/i })).toBeDisabled();
  });
});
