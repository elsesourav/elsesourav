'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@elsesourav/ui';
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
  Clock,
  User,
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
        <Badge variant="info" className="text-[10px] bg-sky-950/60 text-sky-300 border border-sky-500/30">
          Open
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="warning" className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30">
          In Progress
        </Badge>
      );
    case 'waiting_for_user':
      return (
        <Badge variant="warning" className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
          Waiting on You
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="success" className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
          Resolved
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="default" className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
          Closed
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
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20">
                {ticket.ticketNumber}
              </span>
              {getStatusBadge(ticket.status)}
              <Badge variant="default" className="text-[10px] bg-zinc-800 text-zinc-400">
                {ticket.category}
              </Badge>
              <Badge variant="default" className="text-[10px] bg-zinc-800 text-zinc-400 uppercase">
                {ticket.priority} priority
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">{ticket.subject}</h1>
            <p className="text-xs text-zinc-500">Created {createdDate}</p>
          </div>

          {/* Close/Reopen Action Button */}
          <div className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
              className="text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
            >
              {isClosed ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Reopen Ticket</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Mark as Closed</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Conversation Thread */}
      <section className="space-y-5" aria-label="Ticket Conversation">
        <h2 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
          <span>Conversation History</span>
          <span className="text-xs text-zinc-500">({ticket.messages.length} messages)</span>
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
                    ? 'border-indigo-500/30 bg-indigo-950/20 ml-0 sm:ml-4'
                    : 'border-zinc-800/80 bg-zinc-900/40 mr-0 sm:mr-4'
                }`}
              >
                {/* Sender Bar */}
                <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isStaff
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {isStaff ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <span className="font-semibold text-zinc-200">
                      {msg.senderName || (isStaff ? 'ElseSourav Support Team' : 'You')}
                    </span>

                    {isStaff && (
                      <Badge variant="info" className="text-[9px] px-1.5 py-0.2 bg-indigo-900/80 text-indigo-200">
                        Staff
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-zinc-500">{msgDate}</span>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reply Composer */}
      <section className="pt-4" aria-label="Reply to Ticket">
        <Card className="p-5 sm:p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">Send a Reply</h3>
            {isClosed && (
              <span className="text-xs text-amber-400">
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500">
                {replyText.length}/2000 characters
              </span>

              <Button
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20"
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
