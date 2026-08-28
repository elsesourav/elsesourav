import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NotificationCenter } from '../NotificationCenter';
import * as useNotificationsModule from '@/hooks/useNotifications';
import type { Notification } from '@/types/notification.types';
import { AppError } from '@/lib/errors';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotificationCenter Component', () => {
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();
  const mockRefetch = vi.fn();

  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-123',
      type: 'APP_UPDATE',
      severity: 'info',
      title: 'CodeFlow IDE v1.3 Released',
      message: 'New debugging tools are now live in CodeFlow IDE.',
      link: '/apps/codeflow-ide',
      read: false,
      isRead: false,
      createdAt: Date.now() - 60000,
      updatedAt: Date.now() - 60000,
    },
    {
      id: 'notif-2',
      userId: 'user-123',
      type: 'SUPPORT_REPLY',
      severity: 'info',
      title: 'Support Ticket #ES-100 Updated',
      message: 'Sourav replied to your ticket inquiry.',
      link: '/support/tickets/ticket-100',
      read: true,
      isRead: true,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'notif-3',
      userId: 'user-123',
      type: 'SYSTEM',
      severity: 'warning',
      title: 'Suspicious External Link',
      message: 'Test notification with malicious link target.',
      link: 'https://evil-phishing.com/steal',
      read: false,
      isRead: false,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 7200000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      isLoading: false,
      error: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refetch: mockRefetch,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <NotificationCenter />
      </MemoryRouter>
    );

  it('1. Renders bell button with unread count badge', () => {
    renderComponent();

    const bellBtn = screen.getByRole('button', { name: /Notifications, 2 unread/i });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('2. Opens dropdown on bell click and renders notification items', async () => {
    const user = userEvent.setup();
    renderComponent();

    const bellBtn = screen.getByRole('button', { name: /Notifications/i });
    await user.click(bellBtn);

    expect(screen.getByRole('region', { name: /Notifications list/i })).toBeInTheDocument();
    expect(screen.getByText('CodeFlow IDE v1.3 Released')).toBeInTheDocument();
    expect(screen.getByText('Support Ticket #ES-100 Updated')).toBeInTheDocument();
    expect(screen.getByText(/2 new/i)).toBeInTheDocument();
  });

  it('3. Marks notification as read and navigates to safe internal URL', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    const notifItem = screen.getByRole('button', {
      name: /CodeFlow IDE v1.3 Released: New debugging tools are now live in CodeFlow IDE\./i,
    });
    await user.click(notifItem);

    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
    expect(mockNavigate).toHaveBeenCalledWith('/apps/codeflow-ide');
  });

  it('4. Sanitizes unsafe external destinations and prevents open redirect', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    const unsafeNotifItem = screen.getByRole('button', {
      name: /Suspicious External Link/i,
    });
    await user.click(unsafeNotifItem);

    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-3');
    // Unsafe external URL rejected by getSafeRedirectUrl, so mockNavigate is not called with external site
    expect(mockNavigate).not.toHaveBeenCalledWith('https://evil-phishing.com/steal');
  });

  it('5. Invokes markAllAsRead when Mark all read button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    const markAllBtn = screen.getByRole('button', { name: /Mark all notifications as read/i });
    await user.click(markAllBtn);

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('6. Displays empty state when notifications array is empty', async () => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
  });

  it('7. Displays loading skeletons when notifications are loading', async () => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: true,
      error: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    expect(screen.getByRole('feed', { busy: true })).toBeInTheDocument();
  });

  it('8. Displays error state with retry button when error occurs', async () => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: AppError.internal('Network timeout'),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    expect(screen.getByText(/Failed to load notifications\./i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('9. Closes dropdown when Escape key is pressed', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Notifications/i }));
    expect(screen.getByRole('region', { name: /Notifications list/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /Notifications list/i })).not.toBeInTheDocument();
    });
  });
});
