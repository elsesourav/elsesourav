import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import type {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
} from '@/types/support.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import './AdminSupportPage.css';

const FILTER_TABS: readonly { label: string; value: SupportTicketStatus | 'all' }[] = [
  { label: 'All Tickets', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Waiting for User', value: 'waiting_for_user' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export const AdminSupportPage: React.FC = () => {
  const { user, authUser, isAdmin } = useAuth();
  const userId = user?.id || authUser?.uid || '';

  const [tickets, setTickets] = useState<readonly SupportTicket[]>([]);
  const [activeFilter, setActiveFilter] = useState<SupportTicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<SupportTicketPriority | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(
    () => ({
      id: userId,
      email: user?.email || authUser?.email || '',
      name: user?.displayName || authUser?.displayName || '',
      role: user?.role,
    }),
    [userId, user?.email, user?.displayName, user?.role, authUser?.email, authUser?.displayName]
  );

  const loadTickets = useCallback(async () => {
    if (!isAdmin || !userId) return;

    setIsLoading(true);
    setError(null);

    const res = await supportService.listAdminTickets(currentUser, { limit: 50 });

    setIsLoading(false);

    if (!res.success) {
      setError(res.error.message);
      return;
    }

    setTickets(res.data.items);
  }, [isAdmin, userId, currentUser]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicketStatus) => {
    const res = await supportService.updateTicketStatus(ticketId, newStatus, currentUser);
    if (res.success) {
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
    }
  };

  const handlePriorityChange = async (ticketId: string, newPriority: SupportTicketPriority) => {
    const res = await supportService.updateTicketPriority(ticketId, newPriority, currentUser);
    if (res.success) {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, priority: newPriority } : t))
      );
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = activeFilter === 'all' || ticket.status === activeFilter;
    const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting: tickets.filter((t) => t.status === 'waiting_for_user').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="admin-support-page">
      {/* Header */}
      <div className="admin-support-header">
        <div>
          <h1 className="admin-support-header__title">Support Tickets Management</h1>
          <p className="admin-support-header__desc">
            Review user inquiries, respond to tickets, and track resolutions.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={loadTickets}
          isLoading={isLoading}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Stats Row */}
      <div className="admin-support-stats">
        <div className="admin-support-stat-card">
          <p className="admin-support-stat-card__label">Total Inquiries</p>
          <p className="admin-support-stat-card__value">{counts.total}</p>
        </div>
        <div className="admin-support-stat-card">
          <p className="admin-support-stat-card__label">Open / New</p>
          <p className="admin-support-stat-card__value text-info-400">{counts.open}</p>
        </div>
        <div className="admin-support-stat-card">
          <p className="admin-support-stat-card__label">In Progress</p>
          <p className="admin-support-stat-card__value text-warning-400">{counts.inProgress}</p>
        </div>
        <div className="admin-support-stat-card">
          <p className="admin-support-stat-card__label">Waiting on User</p>
          <p className="admin-support-stat-card__value text-primary-400">{counts.waiting}</p>
        </div>
        <div className="admin-support-stat-card">
          <p className="admin-support-stat-card__label">Resolved / Closed</p>
          <p className="admin-support-stat-card__value text-success-400">{counts.resolved}</p>
        </div>
      </div>

      {/* Filter Tabs & Priority Controls */}
      <div
        className="support-tickets-filters"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div role="tablist" style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeFilter === tab.value}
              className={`support-filter-tab ${
                activeFilter === tab.value ? 'support-filter-tab--active' : ''
              }`}
              onClick={() => setActiveFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label
            htmlFor="admin-priority-filter"
            style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
          >
            Priority:
          </label>
          <select
            id="admin-priority-filter"
            aria-label="Filter tickets by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as SupportTicketPriority | 'all')}
            className="admin-support-table__select"
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority Only</option>
            <option value="normal">Normal Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="admin-support-table-container p-6" aria-busy="true">
          <Skeleton variant="text" width="100%" height="40px" className="mb-3" />
          <Skeleton variant="text" width="100%" height="40px" className="mb-3" />
          <Skeleton variant="text" width="100%" height="40px" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="support-error-alert" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={loadTickets}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTickets.length === 0 && (
        <div className="text-center p-12 bg-surface-glass border border-border rounded-xl">
          <Inbox size={40} className="text-secondary mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary mb-1">Queue is Empty</h3>
          <p className="text-sm text-secondary">
            {activeFilter === 'all'
              ? 'No support tickets have been submitted.'
              : `No support tickets currently have the "${activeFilter}" status.`}
          </p>
        </div>
      )}

      {/* Tickets Table */}
      {!isLoading && !error && filteredTickets.length > 0 && (
        <div className="admin-support-table-container">
          <table className="admin-support-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Subject</th>
                <th>Author</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <span className="support-ticket-number">{ticket.ticketNumber}</span>
                  </td>
                  <td>
                    <Link
                      to={`${ROUTES.SUPPORT_TICKETS}/${ticket.id}`}
                      className="admin-ticket-link"
                    >
                      {ticket.subject}
                    </Link>
                  </td>
                  <td>
                    <div className="text-xs">
                      <div className="font-semibold text-primary">
                        {ticket.userName || 'Anonymous User'}
                      </div>
                      <div className="text-tertiary">{ticket.userEmail || '—'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="support-category-badge">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <select
                      className="support-form__select text-xs py-1 px-2"
                      value={ticket.priority}
                      onChange={(e) =>
                        handlePriorityChange(ticket.id, e.target.value as SupportTicketPriority)
                      }
                      style={{ width: 'auto' }}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="support-form__select text-xs py-1 px-2"
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket.id, e.target.value as SupportTicketStatus)
                      }
                      style={{ width: 'auto' }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_for_user">Waiting for User</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <span className="text-xs text-tertiary">
                      {formatDate(ticket.lastMessageAt || ticket.updatedAt)}
                    </span>
                  </td>
                  <td>
                    <Link to={`${ROUTES.SUPPORT_TICKETS}/${ticket.id}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
                        Reply
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
