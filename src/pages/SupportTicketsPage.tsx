import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Clock, ChevronRight, Inbox, AlertCircle } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import type { SupportTicket, SupportTicketStatus } from '@/types/support.types';
import type { DocumentSnapshot } from 'firebase/firestore';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import './SupportTicketsPage.css';

const FILTER_TABS: readonly { label: string; value: SupportTicketStatus | 'all' }[] = [
  { label: 'All Tickets', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Waiting for You', value: 'waiting_for_user' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export const SupportTicketsPage: React.FC = () => {
  const { user, authUser } = useAuth();
  const userId = user?.id || authUser?.uid || '';

  const [tickets, setTickets] = useState<readonly SupportTicket[]>([]);
  const [activeFilter, setActiveFilter] = useState<SupportTicketStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const currentUser = useMemo(
    () => ({
      id: userId,
      email: user?.email || authUser?.email || '',
      name: user?.displayName || authUser?.displayName || '',
      role: user?.role,
    }),
    [userId, user?.email, user?.displayName, user?.role, authUser?.email, authUser?.displayName]
  );

  const fetchTickets = useCallback(
    async (isInitial = true) => {
      if (!userId) return;

      if (isInitial) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const res = await supportService.listUserTickets(userId, currentUser, {
        limit: 15,
        startAfterDoc: isInitial ? undefined : lastDoc,
      });

      setIsLoading(false);
      setIsLoadingMore(false);

      if (!res.success) {
        setError(res.error.message);
        return;
      }

      if (isInitial) {
        setTickets(res.data.items);
      } else {
        setTickets((prev) => [...prev, ...res.data.items]);
      }

      setHasMore(res.data.hasMore);
      setLastDoc(res.data.lastDoc);
    },
    [userId, currentUser, lastDoc]
  );

  useEffect(() => {
    fetchTickets(true);
  }, [fetchTickets]);

  const filteredTickets = tickets.filter((ticket) => {
    if (activeFilter === 'all') return true;
    return ticket.status === activeFilter;
  });

  const getStatusBadge = (status: SupportTicketStatus) => {
    const labels: Record<SupportTicketStatus, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      waiting_for_user: 'Action Needed',
      resolved: 'Resolved',
      closed: 'Closed',
    };

    return (
      <span className={`support-status-badge support-status-badge--${status}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="support-tickets-page">
      {/* Header */}
      <div className="support-tickets-header">
        <div>
          <h1 className="support-tickets-header__title">My Support Requests</h1>
          <p className="support-tickets-header__desc">
            Track conversations, follow up on questions, and view resolution history.
          </p>
        </div>
        <Link to={ROUTES.SUPPORT}>
          <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="support-tickets-filters" role="tablist" aria-label="Ticket status filters">
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="support-tickets-list" aria-busy="true" aria-label="Loading support tickets">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="support-ticket-item" style={{ padding: 'var(--space-6)' }}>
              <div style={{ width: '100%' }}>
                <Skeleton variant="text" width="25%" height="16px" className="mb-2" />
                <Skeleton variant="text" width="60%" height="20px" className="mb-2" />
                <Skeleton variant="text" width="40%" height="14px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="support-error-alert" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => fetchTickets(true)}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTickets.length === 0 && (
        <div className="support-empty-card text-center p-12 bg-surface-glass border border-border rounded-xl">
          <Inbox size={40} className="text-secondary mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary mb-1">
            {activeFilter === 'all' ? 'No Support Tickets Yet' : `No ${activeFilter} tickets found`}
          </h3>
          <p className="text-sm text-secondary max-w-md mx-auto mb-6">
            {activeFilter === 'all'
              ? "You haven't submitted any support requests. If you need help with an app or have questions, feel free to open a ticket."
              : `There are currently no tickets matching the "${activeFilter}" status filter.`}
          </p>
          <Link to={ROUTES.SUPPORT}>
            <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
              Create a Support Request
            </Button>
          </Link>
        </div>
      )}

      {/* Tickets List */}
      {!isLoading && !error && filteredTickets.length > 0 && (
        <div className="support-tickets-list">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`${ROUTES.SUPPORT_TICKETS}/${ticket.id}`}
              className="support-ticket-item"
              aria-label={`Ticket ${ticket.ticketNumber}: ${ticket.subject}`}
            >
              <div className="support-ticket-item__main">
                <div className="support-ticket-item__top">
                  <span className="support-ticket-number">{ticket.ticketNumber}</span>
                  {getStatusBadge(ticket.status)}
                  <span className="support-category-badge">
                    {ticket.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="support-ticket-subject">{ticket.subject}</h3>
                <div className="support-ticket-item__meta">
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    Last activity: {formatDate(ticket.lastMessageAt || ticket.updatedAt)}
                  </span>
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                </div>
              </div>

              <div className="support-ticket-item__actions">
                <MessageSquare size={16} className="text-secondary" />
                <ChevronRight size={18} className="text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Pagination */}
      {!isLoading && hasMore && (
        <div className="support-tickets-pagination">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchTickets(false)}
            isLoading={isLoadingMore}
            disabled={isLoadingMore}
          >
            Load More Tickets
          </Button>
        </div>
      )}
    </div>
  );
};
