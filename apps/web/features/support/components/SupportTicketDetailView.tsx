'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button, UserAvatar } from '@elsesourav/ui';
import type { SupportTicketDetail, SupportTicketStatus } from '@elsesourav/types';
import {
  replyToSupportTicketAction,
  closeSupportTicketAction,
  reopenSupportTicketAction,
} from '../actions/support-actions';
import {
  ArrowLeft,
  Send,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock3,
  HelpCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface SupportTicketDetailViewProps {
  ticket: SupportTicketDetail;
}

function getStatusBadge(status: SupportTicketStatus) {
  switch (status) {
    case 'open':
      return (
        <Badge
          variant="info"
          className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 gap-1 font-medium"
        >
          <Clock3 className="w-2.5 h-2.5" />
          <span>Open</span>
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge
          variant="warning"
          className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1 font-medium"
        >
          <AlertCircle className="w-2.5 h-2.5" />
          <span>In Progress</span>
        </Badge>
      );
    case 'waiting_for_user':
      return (
        <Badge
          variant="warning"
          className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 gap-1 font-medium"
        >
          <HelpCircle className="w-2.5 h-2.5" />
          <span>Waiting on You</span>
        </Badge>
      );
    case 'resolved':
      return (
        <Badge
          variant="success"
          className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1 font-medium"
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>Resolved</span>
        </Badge>
      );
    case 'closed':
      return (
        <Badge
          variant="default"
          className="text-[10px] bg-muted text-muted-foreground border border-border gap-1 font-medium"
        >
          <Lock className="w-2.5 h-2.5" />
          <span>Closed</span>
        </Badge>
      );
    default:
      return <Badge className="text-[10px]">{status}</Badge>;
  }
}

export function SupportTicketDetailView({ ticket }: SupportTicketDetailViewProps) {
  const [replyText, setReplyText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const res = await replyToSupportTicketAction({
        ticketId: ticket.id,
        message: replyText.trim(),
      });

      if (res.success) {
        setReplyText('');
      } else {
        setError(res.error || 'Failed to send reply');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true);
    setError(null);

    try {
      if (isClosed) {
        await reopenSupportTicketAction(ticket.id);
      } else {
        await closeSupportTicketAction(ticket.id);
      }
    } catch {
      setError('Failed to update ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const createdDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                {ticket.ticketNumber}
              </span>
              {getStatusBadge(ticket.status)}
              <Badge
                variant="default"
                className="text-[10px] bg-muted text-muted-foreground border-border"
              >
                {ticket.category}
              </Badge>
              <Badge
                variant="default"
                className="text-[10px] bg-muted text-muted-foreground uppercase border-border"
              >
                {ticket.priority} priority
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{ticket.subject}</h1>
            <p className="text-xs text-muted-foreground">Created {createdDate}</p>
          </div>

          {/* Close/Reopen Action Button */}
          <div className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
              className="text-xs border-border hover:bg-accent text-foreground gap-1.5 rounded-xl cursor-pointer"
            >
              {isClosed ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                  <span>Reopen Ticket</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Mark as Closed</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Conversation Thread */}
      <section className="space-y-5" aria-label="Ticket Conversation">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span>Conversation History</span>
          <span className="text-xs text-muted-foreground font-normal">
            ({ticket.messages.length} messages)
          </span>
        </h2>

        <div className="space-y-4">
          {ticket.messages.map((msg) => {
            const isStaff = msg.senderRole === 'ADMIN' || msg.senderRole === 'STAFF';
            const msgDate = new Date(msg.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isStaff
                    ? 'border-primary/30 bg-primary/5 ml-0 sm:ml-4'
                    : 'border-border bg-card text-card-foreground shadow-sm mr-0 sm:mr-4'
                }`}
              >
                {/* Sender Bar */}
                <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-border/80 text-xs">
                  <div className="flex items-center gap-2">
                    {isStaff ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <UserAvatar
                        src={msg.senderPhotoUrl || null}
                        name={msg.senderName || 'You'}
                        identifier={msg.senderUserId}
                        size="xs"
                        className="w-6 h-6 text-[9px]"
                      />
                    )}

                    <span className="font-semibold text-foreground">
                      {msg.senderName || (isStaff ? 'ElseSourav Support Team' : 'You')}
                    </span>

                    {isStaff && (
                      <Badge
                        variant="info"
                        className="text-[9px] px-1.5 py-0.2 bg-primary/10 text-primary border-primary/20"
                      >
                        Staff
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground">{msgDate}</span>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reply Composer */}
      <section className="pt-4" aria-label="Reply to Ticket">
        <Card className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-border bg-card text-card-foreground shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Send a Reply</h3>
            {isClosed && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Ticket is currently closed. Replying will reopen it.
              </span>
            )}
          </div>

          <form onSubmit={handleSendReply} className="space-y-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply or additional information here..."
              rows={4}
              required
              maxLength={2000}
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">
                {replyText.length}/2000 characters
              </span>

              <Button
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-sm cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Reply...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
