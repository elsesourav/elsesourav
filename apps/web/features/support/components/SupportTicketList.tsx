'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@elsesourav/ui';
import type { SupportTicketListItem, SupportTicketStatus } from '@elsesourav/types';
import {
  Headphones,
  MessageSquare,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SupportTicketListProps {
  tickets: readonly SupportTicketListItem[];
  onOpenCreateModal?: () => void;
}

function getStatusBadge(status: SupportTicketStatus) {
  switch (status) {
    case 'open':
      return (
        <Badge
          variant="info"
          className="text-[10px] bg-sky-950/60 text-sky-300 border border-sky-500/30"
        >
          Open
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge
          variant="warning"
          className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30"
        >
          In Progress
        </Badge>
      );
    case 'waiting_for_user':
      return (
        <Badge
          variant="warning"
          className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30"
        >
          Waiting on You
        </Badge>
      );
    case 'resolved':
      return (
        <Badge
          variant="success"
          className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
        >
          Resolved
        </Badge>
      );
    case 'closed':
      return (
        <Badge
          variant="default"
          className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700"
        >
          Closed
        </Badge>
      );
    default:
      return <Badge className="text-[10px]">{status}</Badge>;
  }
}

export function SupportTicketList({ tickets, onOpenCreateModal }: SupportTicketListProps) {
  const [filter, setFilter] = React.useState<'all' | 'open' | 'closed'>('all');

  const filteredTickets = React.useMemo(() => {
    if (filter === 'open') {
      return tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved');
    }
    if (filter === 'closed') {
      return tickets.filter((t) => t.status === 'closed' || t.status === 'resolved');
    }
    return tickets;
  }, [tickets, filter]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'open'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active ({tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length}
            )
          </button>
          <button
            type="button"
            onClick={() => setFilter('closed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'closed'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Resolved (
            {tickets.filter((t) => t.status === 'closed' || t.status === 'resolved').length})
          </button>
        </div>

        {onOpenCreateModal && (
          <Button
            onClick={onOpenCreateModal}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </Button>
        )}
      </div>

      {/* Ticket List or Empty State */}
      {filteredTickets.length === 0 ? (
        <Card className="card-obsidian-glass py-14 px-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-zinc-100">No support tickets</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {filter === 'all'
                ? "You haven't opened any support tickets yet. Need technical assistance? Submit a ticket below."
                : `No ${filter} tickets found.`}
            </p>
          </div>
          <div className="pt-2">
            {onOpenCreateModal ? (
              <Button
                onClick={onOpenCreateModal}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 rounded-xl px-4 py-2 font-semibold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Ticket</span>
              </Button>
            ) : (
              <Link href="/support">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 rounded-xl px-4 py-2 font-semibold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Open New Ticket</span>
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const updatedDate = new Date(ticket.lastMessageAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Link key={ticket.id} href={`/support/tickets/${ticket.id}`} className="block group">
                <Card className="card-obsidian-glass p-5 hover:border-indigo-500/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-indigo-400 font-semibold">
                          {ticket.ticketNumber}
                        </span>
                        {getStatusBadge(ticket.status)}
                        <Badge variant="default" className="text-[10px] bg-zinc-800 text-zinc-400">
                          {ticket.category}
                        </Badge>
                      </div>

                      <h4 className="font-semibold text-zinc-100 text-sm sm:text-base group-hover:text-indigo-300 transition-colors truncate">
                        {ticket.subject}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs text-zinc-400">
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Active {updatedDate}</span>
                      </div>

                      <div className="flex items-center gap-1 text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
