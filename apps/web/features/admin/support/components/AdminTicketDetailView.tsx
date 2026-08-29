'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Button, Input, Badge } from '@elsesourav/ui';
import type { SupportTicketDetail, SupportTicketStatus } from '@elsesourav/types';
import {
  adminReplyTicketAction,
  adminUpdateTicketStatusAction,
} from '../actions/admin-support-actions';
import {
  LifeBuoy,
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  User,
  Shield,
} from 'lucide-react';

interface AdminTicketDetailViewProps {
  ticket: SupportTicketDetail;
}

export function AdminTicketDetailView({ ticket: initialTicket }: AdminTicketDetailViewProps) {
  const [ticket, setTicket] = React.useState(initialTicket);
  const [status, setStatus] = React.useState<SupportTicketStatus>(initialTicket.status);
  const [replyMessage, setReplyMessage] = React.useState('');
  const [isInternalNote, setIsInternalNote] = React.useState(false);
  const [attachmentUrl, setAttachmentUrl] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleStatusChange = async (newStatus: SupportTicketStatus) => {
    setIsUpdatingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminUpdateTicketStatusAction(ticket.id, newStatus);
      if (res.success) {
        setStatus(newStatus);
        setSuccess(`Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        setError(res.error || 'Failed to update status');
      }
    } catch {
      setError('An error occurred updating ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const attachments = attachmentUrl.trim() ? [attachmentUrl.trim()] : [];

    try {
      const res = await adminReplyTicketAction(
        ticket.id,
        replyMessage.trim(),
        attachments,
        isInternalNote
      );

      if (res.success && res.message) {
        setTicket((prev) => ({
          ...prev,
          messages: [...prev.messages, res.message],
        }));
        setReplyMessage('');
        setAttachmentUrl('');
        setIsInternalNote(false);
        setSuccess(
          isInternalNote
            ? 'Internal staff note logged.'
            : 'Reply sent to user and notification queued.'
        );
      } else {
        setError(res.error || 'Failed to post message');
      }
    } catch {
      setError('An error occurred posting reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/support"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400">
                #{ticket.ticketNumber}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 capitalize">{ticket.category}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-400">Status:</label>
          <select
            value={status}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
            className="bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none uppercase"
          >
            <option value="open">OPEN</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="waiting_for_user">WAITING FOR USER</option>
            <option value="resolved">RESOLVED</option>
            <option value="closed">CLOSED</option>
          </select>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* User Context & Ticket Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Conversation Stream */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Conversation Thread</span>
            </h3>

            {ticket.messages.map((msg) => {
              const isStaff = msg.senderRole === 'ADMIN' || msg.senderRole === 'STAFF';
              const isNote = msg.isInternalNote;
              const dateStr = new Date(msg.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isNote
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : isStaff
                        ? 'bg-indigo-950/20 border-indigo-500/30 ml-4'
                        : 'bg-zinc-900/50 border-zinc-800 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                          isNote
                            ? 'bg-amber-500/20 text-amber-300'
                            : isStaff
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isNote ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : isStaff ? (
                          <Shield className="w-3.5 h-3.5" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">
                        {isNote
                          ? 'Internal Staff Note'
                          : isStaff
                            ? 'ElseSourav Team'
                            : ticket.userName || ticket.userEmail || 'User'}
                      </span>
                      {isStaff && !isNote && (
                        <Badge variant="info" className="text-[10px] py-0 px-1.5 font-mono">
                          Staff
                        </Badge>
                      )}
                      {isNote && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 border-amber-500/50 text-amber-300 font-mono"
                        >
                          Private Note
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500">{dateStr}</span>
                  </div>

                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2">
                      {msg.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px]"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Attachment {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Response Form */}
          <Card className="p-6 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>Post Staff Response / Internal Note</span>
            </h4>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the user, or check the internal note box below for team-only notes..."
                required
                rows={5}
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none leading-relaxed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Optional Attachment URL */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-400">
                    Attachment URL (optional)
                  </label>
                  <Input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
                  />
                </div>

                {/* Internal Note Toggle */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Post as Internal Note (hidden from user)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className={`${
                    isInternalNote
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  } text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-lg`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInternalNote ? 'Log Internal Note' : 'Send User Reply'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* User Details */}
          <Card className="p-5 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Submitter Information
            </h4>
            <div className="space-y-2 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 block text-[11px]">Display Name:</span>
                <span className="font-semibold">{ticket.userName || 'Anonymous'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Email:</span>
                <span className="font-mono text-zinc-300">{ticket.userEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Priority:</span>
                <span className="font-mono uppercase font-bold text-indigo-400">
                  {ticket.priority}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Created Date:</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
