import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LifeBuoy,
  Search,
  Send,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Clock,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import { Badge, Button, Input, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import { appRepository } from '@/repositories/app.repository';
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
} from '@/types/support.types';
import type { App } from '@/types/app.types';
import { formatDate } from '@/utils/format';
import './AdminSupportPage.css';

type SortOption = 'recently_updated' | 'newest' | 'oldest' | 'priority';

const STATUS_OPTIONS: readonly { label: string; value: SupportTicketStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Waiting for User', value: 'waiting_for_user' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const PRIORITY_OPTIONS: readonly { label: string; value: SupportTicketPriority | 'all' }[] = [
  { label: 'All Priorities', value: 'all' },
  { label: 'High Priority', value: 'high' },
  { label: 'Normal', value: 'normal' },
  { label: 'Low', value: 'low' },
];

const CATEGORY_OPTIONS: readonly { label: string; value: SupportTicketCategory | 'all' }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'App Issue', value: 'app_issue' },
  { label: 'Chrome Extension', value: 'chrome_extension' },
  { label: 'Android App', value: 'android_app' },
  { label: 'Download Help', value: 'download' },
  { label: 'Bug Report', value: 'bug_report' },
  { label: 'Account & Profile', value: 'account' },
  { label: 'General Inquiry', value: 'general' },
];

export const AdminSupportPage: React.FC = () => {
  const { user, authUser, isAdmin } = useAuth();
  const userId = user?.id || authUser?.uid || 'admin';

  const currentUser = useMemo(
    () => ({
      id: userId,
      email: user?.email || authUser?.email || 'admin@elsesourav.com',
      name: user?.displayName || authUser?.displayName || 'ElseSourav Support',
      role: 'admin' as const,
    }),
    [userId, user?.email, user?.displayName, authUser?.email, authUser?.displayName]
  );

  // Tickets List State
  const [tickets, setTickets] = useState<readonly SupportTicket[]>([]);
  const [apps, setApps] = useState<readonly App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<SupportTicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recently_updated');

  // Selected Ticket Detail State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<readonly SupportTicketMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTicketsAndApps = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);

    const [ticketsRes, appsRes] = await Promise.all([
      supportService.listAdminTickets(currentUser, { limit: 100 }),
      appRepository.findMany({ limit: 100 }),
    ]);

    if (ticketsRes.success) {
      setTickets(ticketsRes.data.items);
      setSelectedTicket((prev) => prev ?? ticketsRes.data.items[0] ?? null);
    } else {
      setError(ticketsRes.error.message);
    }

    if (appsRes.success) {
      setApps(appsRes.data.items);
    }

    setIsLoading(false);
  }, [isAdmin, currentUser]);

  useEffect(() => {
    void fetchTicketsAndApps();
  }, [fetchTicketsAndApps]);

  // Load Messages when a ticket is selected
  const loadTicketMessages = useCallback(
    async (ticketId: string) => {
      setIsLoadingMessages(true);
      setActionError(null);

      const res = await supportService.listMessages(ticketId, currentUser, {
        limit: 100,
        orderBy: 'createdAt',
        orderDirection: 'asc',
      });

      if (res.success) {
        setMessages(res.data.items);
      } else {
        setActionError(res.error.message);
      }

      setIsLoadingMessages(false);
    },
    [currentUser]
  );

  const selectedTicketId = selectedTicket?.id;
  useEffect(() => {
    if (selectedTicketId) {
      void loadTicketMessages(selectedTicketId);
    } else {
      setMessages([]);
    }
  }, [selectedTicketId, loadTicketMessages]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyMessage('');
    setActionError(null);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSendingReply(true);
    setActionError(null);

    const res = await supportService.addMessage(
      {
        ticketId: selectedTicket.id,
        message: replyMessage.trim(),
      },
      currentUser
    );

    setIsSendingReply(false);

    if (res.success) {
      setMessages((prev) => [...prev, res.data]);
      setReplyMessage('');

      // Auto-update local ticket timestamp and status if waiting for user
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, lastMessageAt: res.data.createdAt, status: 'waiting_for_user' }
            : t
        )
      );
      setSelectedTicket((prev) =>
        prev ? { ...prev, lastMessageAt: res.data.createdAt, status: 'waiting_for_user' } : null
      );
    } else {
      setActionError(res.error.message);
    }
  };

  const handleStatusChange = async (newStatus: SupportTicketStatus) => {
    if (!selectedTicket) return;

    setActionError(null);
    const res = await supportService.updateTicketStatus(selectedTicket.id, newStatus, currentUser);

    if (res.success) {
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? res.data : t)));
      setSelectedTicket(res.data);
    } else {
      setActionError(res.error.message);
    }
  };

  const handlePriorityChange = async (newPriority: SupportTicketPriority) => {
    if (!selectedTicket) return;

    setActionError(null);
    const res = await supportService.updateTicketPriority(
      selectedTicket.id,
      newPriority,
      currentUser
    );

    if (res.success) {
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? res.data : t)));
      setSelectedTicket(res.data);
    } else {
      setActionError(res.error.message);
    }
  };

  // Filter & Sort
  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority Filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Search Query (ticketNumber, subject, user, email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.userName?.toLowerCase().includes(q) ||
          t.userEmail?.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recently_updated') {
        return (b.lastMessageAt || b.updatedAt) - (a.lastMessageAt || a.updatedAt);
      }
      if (sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === 'oldest') {
        return a.createdAt - b.createdAt;
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, normal: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return 0;
    });

    return result;
  }, [tickets, statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  const getAppName = (appId?: string) => {
    if (!appId) return null;
    const match = apps.find((a) => a.id === appId);
    return match ? match.name : 'Unknown Application';
  };

  return (
    <div className="admin-support-page">
      {/* Header */}
      <header className="admin-support-header">
        <div className="admin-support-header__title-group">
          <h1 className="admin-support-header__title">Support Ticket Central</h1>
          <p className="admin-support-header__subtitle">
            Manage user inquiries, technical bug reports, and customer conversations.
          </p>
        </div>

        <div className="admin-support-header__stats">
          <div className="admin-support-stat-pill">
            <span>Open:</span>
            <strong>{tickets.filter((t) => t.status === 'open').length}</strong>
          </div>
          <div className="admin-support-stat-pill">
            <span>In Progress:</span>
            <strong>{tickets.filter((t) => t.status === 'in_progress').length}</strong>
          </div>
          <div className="admin-support-stat-pill">
            <span>Total:</span>
            <strong>{tickets.length}</strong>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="admin-support-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchTicketsAndApps()}>
            Retry
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="admin-support-controls">
        <div className="admin-support-search">
          <Input
            type="search"
            placeholder="Search tickets by #ES-101, subject, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
            aria-label="Search support tickets"
          />
        </div>

        <div className="admin-support-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SupportTicketStatus | 'all')}
            className="admin-support-select"
            aria-label="Filter by ticket status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as SupportTicketPriority | 'all')}
            className="admin-support-select"
            aria-label="Filter by priority"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as SupportTicketCategory | 'all')}
            className="admin-support-select"
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="admin-support-select"
            aria-label="Sort tickets"
          >
            <option value="recently_updated">Recently Updated</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Main Support Workspace (Master-Detail Split) */}
      <div className="admin-support-workspace">
        {/* Left Column: Tickets Queue */}
        <div className="admin-support-queue" role="region" aria-label="Support Tickets List">
          {isLoading ? (
            <div className="admin-support-loading" aria-busy="true">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="admin-support-ticket-skeleton">
                  <Skeleton variant="text" width="60%" height="20px" />
                  <Skeleton variant="text" width="40%" height="16px" />
                  <Skeleton variant="rectangular" width="80px" height="24px" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedTickets.length === 0 ? (
            <div className="admin-support-empty">
              <LifeBuoy size={40} aria-hidden="true" />
              <h2 className="admin-support-empty__title">No Tickets in Queue</h2>
              <p className="admin-support-empty__desc">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No support tickets match your filter criteria.'
                  : 'All customer tickets have been handled.'}
              </p>
            </div>
          ) : (
            <div className="admin-support-list">
              {filteredAndSortedTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`admin-support-ticket-card ${
                      isSelected ? 'admin-support-ticket-card--selected' : ''
                    }`}
                    onClick={() => handleSelectTicket(t)}
                    aria-selected={isSelected}
                  >
                    <div className="admin-support-ticket-card__header">
                      <span className="admin-support-ticket-number">{t.ticketNumber}</span>
                      <div className="admin-support-ticket-badges">
                        <Badge
                          variant={
                            t.priority === 'high'
                              ? 'error'
                              : t.priority === 'normal'
                                ? 'default'
                                : 'mono'
                          }
                          size="sm"
                        >
                          {t.priority.toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            t.status === 'open'
                              ? 'accent'
                              : t.status === 'resolved' || t.status === 'closed'
                                ? 'success'
                                : 'default'
                          }
                          size="sm"
                        >
                          {t.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="admin-support-ticket-subject">{t.subject}</h3>

                    <div className="admin-support-ticket-meta">
                      <span className="admin-support-ticket-user">
                        <UserIcon size={12} aria-hidden="true" />
                        {t.userName || t.userEmail || 'Anonymous User'}
                      </span>
                      <span className="admin-support-ticket-time">
                        <Clock size={12} aria-hidden="true" />
                        {formatDate(t.lastMessageAt || t.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Ticket Conversation & Controls */}
        <div className="admin-support-detail" role="region" aria-label="Ticket Conversation">
          {selectedTicket ? (
            <div className="admin-support-detail-content">
              {/* Ticket Top Action Bar */}
              <div className="admin-support-detail-header">
                <div className="admin-support-detail-title-group">
                  <div className="admin-support-detail-number-row">
                    <span className="admin-support-detail-number">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="admin-support-detail-category">
                      {selectedTicket.category.replace(/_/g, ' ')}
                    </span>
                    {selectedTicket.relatedAppId && (
                      <span className="admin-support-detail-app">
                        App: {getAppName(selectedTicket.relatedAppId)}
                      </span>
                    )}
                  </div>
                  <h2 className="admin-support-detail-subject">{selectedTicket.subject}</h2>
                  <div className="admin-support-detail-author">
                    Submitted by <strong>{selectedTicket.userName || 'User'}</strong> (
                    {selectedTicket.userEmail || 'No email provided'}) on{' '}
                    {formatDate(selectedTicket.createdAt)}
                  </div>
                </div>

                {/* Status & Priority Controls */}
                <div className="admin-support-detail-controls">
                  <div className="admin-support-control-group">
                    <label htmlFor="ticket-status-select">Status:</label>
                    <select
                      id="ticket-status-select"
                      aria-label="Change ticket status"
                      value={selectedTicket.status}
                      onChange={(e) =>
                        void handleStatusChange(e.target.value as SupportTicketStatus)
                      }
                      className="admin-support-select admin-support-select--sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_for_user">Waiting for User</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="admin-support-control-group">
                    <label htmlFor="ticket-priority-select">Priority:</label>
                    <select
                      id="ticket-priority-select"
                      aria-label="Change ticket priority"
                      value={selectedTicket.priority}
                      onChange={(e) =>
                        void handlePriorityChange(e.target.value as SupportTicketPriority)
                      }
                      className="admin-support-select admin-support-select--sm"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleStatusChange('resolved')}
                      leftIcon={<CheckCircle2 size={14} />}
                    >
                      Resolve
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleStatusChange('open')}
                      leftIcon={<RotateCcw size={14} />}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Error Alert */}
              {actionError && (
                <div className="admin-support-error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Thread Messages */}
              <div className="admin-support-thread">
                {/* Initial Ticket Description Message */}
                <div className="admin-support-message admin-support-message--user">
                  <div className="admin-support-message-header">
                    <span className="admin-support-message-sender">
                      {selectedTicket.userName || 'User'} (Ticket Description)
                    </span>
                    <span className="admin-support-message-time">
                      {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                  <div className="admin-support-message-body">{selectedTicket.description}</div>
                </div>

                {isLoadingMessages ? (
                  <div className="admin-support-messages-loading" aria-busy="true">
                    <Skeleton variant="text" width="80%" height="20px" />
                    <Skeleton variant="text" width="60%" height="20px" />
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdminMsg = m.senderRole === 'admin';
                    return (
                      <div
                        key={m.id}
                        className={`admin-support-message ${
                          isAdminMsg
                            ? 'admin-support-message--admin'
                            : 'admin-support-message--user'
                        }`}
                      >
                        <div className="admin-support-message-header">
                          <span className="admin-support-message-sender">
                            {isAdminMsg ? 'ElseSourav Support (Admin)' : m.senderName || 'User'}
                          </span>
                          <span className="admin-support-message-time">
                            {formatDate(m.createdAt)}
                          </span>
                        </div>
                        <div className="admin-support-message-body">{m.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Admin Reply Box */}
              <div className="admin-support-reply-box">
                <textarea
                  className="admin-support-reply-textarea"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type an official admin response to this customer ticket..."
                  rows={3}
                  aria-label="Admin reply message"
                />
                <div className="admin-support-reply-actions">
                  <span className="admin-support-reply-hint">
                    Replying will automatically mark ticket as "Waiting for User".
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void handleSendReply()}
                    isLoading={isSendingReply}
                    disabled={!replyMessage.trim()}
                    leftIcon={<Send size={14} />}
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-support-no-selection">
              <MessageSquare size={48} aria-hidden="true" />
              <h3>Select a support ticket</h3>
              <p>Choose an inquiry from the queue on the left to read messages and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
