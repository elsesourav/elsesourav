import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  User,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
} from '@/types/support.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import './SupportTicketDetailPage.css';

export const SupportTicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user, authUser, isAdmin } = useAuth();
  const userId = user?.id || authUser?.uid || '';

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<readonly SupportTicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUser = useMemo(
    () => ({
      id: userId,
      email: user?.email || authUser?.email || '',
      name: user?.displayName || authUser?.displayName || '',
      role: user?.role,
    }),
    [userId, user?.email, user?.displayName, user?.role, authUser?.email, authUser?.displayName]
  );

  const loadData = useCallback(async () => {
    if (!ticketId || !userId) return;

    setIsLoading(true);
    setError(null);

    const [ticketRes, messagesRes] = await Promise.all([
      supportService.getTicket(ticketId, currentUser),
      supportService.listMessages(ticketId, currentUser),
    ]);

    setIsLoading(false);

    if (!ticketRes.success) {
      setError(ticketRes.error.message);
      return;
    }

    if (!ticketRes.data) {
      setError('Ticket not found');
      return;
    }

    setTicket(ticketRes.data);

    if (messagesRes.success) {
      setMessages(messagesRes.data.items);
    }
  }, [ticketId, userId, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !replyText.trim() || isSending) return;

    setIsSending(true);
    setActionError(null);

    const res = await supportService.addMessage(
      {
        ticketId,
        message: replyText.trim(),
      },
      currentUser
    );

    setIsSending(false);

    if (!res.success) {
      setActionError(res.error.message);
      return;
    }

    setReplyText('');
    // Refresh thread and status
    loadData();
  };

  const handleStatusChange = async (newStatus: SupportTicketStatus) => {
    if (!ticketId) return;
    setActionError(null);

    const res = await supportService.updateTicketStatus(ticketId, newStatus, currentUser);
    if (!res.success) {
      setActionError(res.error.message);
      return;
    }

    setTicket(res.data);
  };

  const handlePriorityChange = async (newPriority: SupportTicketPriority) => {
    if (!ticketId || !isAdmin) return;
    setActionError(null);

    const res = await supportService.updateTicketPriority(ticketId, newPriority, currentUser);
    if (!res.success) {
      setActionError(res.error.message);
      return;
    }

    setTicket(res.data);
  };

  const handleReopen = async () => {
    if (!ticketId || !isAdmin) return;
    setActionError(null);

    const res = await supportService.reopenTicket(ticketId, currentUser);
    if (!res.success) {
      setActionError(res.error.message);
      return;
    }

    setTicket(res.data);
  };

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

  if (isLoading) {
    return (
      <div className="ticket-detail-page" aria-busy="true">
        <Skeleton variant="text" width="120px" height="18px" className="mb-6" />
        <div className="ticket-header-card">
          <Skeleton variant="text" width="30%" height="24px" className="mb-3" />
          <Skeleton variant="text" width="80%" height="32px" className="mb-4" />
          <Skeleton variant="text" width="50%" height="16px" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="support-error-alert" role="alert">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-bold">Unable to load ticket</h3>
            <p className="text-sm">{error || 'Ticket not found'}</p>
          </div>
          <Link to={ROUTES.SUPPORT_TICKETS}>
            <Button variant="secondary" size="sm">
              Back to My Tickets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      {/* Navigation */}
      <nav className="ticket-detail-nav">
        <Link to={ROUTES.SUPPORT_TICKETS} className="ticket-detail-back">
          <ArrowLeft size={15} />
          <span>Back to My Tickets</span>
        </Link>
      </nav>

      {/* Ticket Header Card */}
      <header className="ticket-header-card">
        <div className="ticket-header-card__top">
          <div className="ticket-header-card__badges">
            <span className="support-ticket-number">{ticket.ticketNumber}</span>
            {getStatusBadge(ticket.status)}
            <span className="support-category-badge">{ticket.category.replace('_', ' ')}</span>
            {ticket.priority === 'high' && (
              <span className="support-status-badge support-status-badge--in_progress">
                High Priority
              </span>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-tertiary">Priority:</span>
              <select
                className="support-form__select text-xs py-1 px-2"
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as SupportTicketPriority)}
                style={{ width: 'auto' }}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>

        <h1 className="ticket-header-card__title">{ticket.subject}</h1>

        <div className="ticket-header-card__meta">
          <span>Created: {formatDate(ticket.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Last updated: {formatDate(ticket.lastMessageAt || ticket.updatedAt)}
          </span>
          {ticket.userName && <span>Author: {ticket.userName}</span>}
        </div>

        {/* Action Buttons */}
        <div className="ticket-header-card__actions">
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle size={14} />}
              onClick={() => handleStatusChange('resolved')}
            >
              Mark as Resolved
            </Button>
          )}

          {ticket.status !== 'closed' && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<XCircle size={14} />}
              onClick={() => handleStatusChange('closed')}
            >
              Close Ticket
            </Button>
          )}

          {ticket.status === 'closed' && isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={handleReopen}
            >
              Reopen Ticket
            </Button>
          )}
        </div>

        {actionError && (
          <div className="support-error-alert mt-4" role="alert">
            <AlertCircle size={15} />
            <span>{actionError}</span>
          </div>
        )}
      </header>

      {/* Message Thread */}
      <section className="ticket-thread" aria-label="Conversation Thread">
        <h2 className="ticket-thread-heading">Conversation Thread</h2>

        {messages.length === 0 ? (
          <div className="ticket-message-card">
            <div className="ticket-message-card__body">{ticket.description}</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMsgAdmin = msg.senderRole === 'admin';
            return (
              <article
                key={msg.id}
                className={`ticket-message-card ${isMsgAdmin ? 'ticket-message-card--admin' : ''}`}
              >
                <div className="ticket-message-card__header">
                  <div className="ticket-message-card__author">
                    {isMsgAdmin ? (
                      <Shield size={16} className="text-primary-400" />
                    ) : (
                      <User size={16} className="text-secondary" />
                    )}
                    <span className="ticket-message-card__name">
                      {msg.senderName || (isMsgAdmin ? 'ElseSourav Support' : 'Author')}
                    </span>
                    <span
                      className={`ticket-role-badge ${
                        isMsgAdmin ? 'ticket-role-badge--admin' : 'ticket-role-badge--user'
                      }`}
                    >
                      {isMsgAdmin ? 'Support Team' : 'User'}
                    </span>
                  </div>
                  <time
                    className="ticket-message-card__time"
                    dateTime={new Date(msg.createdAt).toISOString()}
                  >
                    {formatDate(msg.createdAt)}
                  </time>
                </div>
                <div className="ticket-message-card__body">{msg.message}</div>
              </article>
            );
          })
        )}
      </section>

      {/* Message Composer */}
      {ticket.status === 'closed' ? (
        <div className="ticket-closed-banner">
          <p className="ticket-closed-banner__text">
            This ticket is closed. If you have any new issues, please open a new request.
          </p>
          <Link to={ROUTES.SUPPORT}>
            <Button variant="secondary" size="sm">
              New Ticket
            </Button>
          </Link>
        </div>
      ) : (
        <section className="ticket-composer-card">
          <h3 className="ticket-composer-card__title">Reply to this Ticket</h3>
          <form onSubmit={handleSendMessage} className="ticket-composer-form">
            <textarea
              className="ticket-composer-textarea"
              placeholder={
                isAdmin
                  ? 'Type your response to the user...'
                  : 'Add a reply or more information to this conversation...'
              }
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              required
              maxLength={2000}
            />

            <div className="ticket-composer-actions">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSending}
                disabled={isSending || !replyText.trim()}
                leftIcon={<Send size={14} />}
              >
                Send Reply
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};
