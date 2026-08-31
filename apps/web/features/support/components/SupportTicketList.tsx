'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@elsesourav/ui';
import type { SupportTicketListItem, SupportTicketStatus } from '@elsesourav/types';
import {
  Headphones,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface SupportTicketListProps {
  tickets: readonly SupportTicketListItem[];
  onOpenCreateModal?: () => void;
}

export function getStatusBadge(status: SupportTicketStatus) {
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
      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="inline-flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'open'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length}
            )
          </button>
          <button
            type="button"
            onClick={() => setFilter('closed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'closed'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
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
            className="text-xs font-semibold rounded-xl gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </Button>
        )}
      </div>

      {/* Ticket List or Empty State */}
      {filteredTickets.length === 0 ? (
        <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl py-12 px-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-sm">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground">No support tickets</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {filter === 'all'
                ? "You haven't opened any support requests yet. Need technical assistance? Submit a ticket below."
                : `No ${filter} tickets found.`}
            </p>
          </div>
          <div className="pt-2">
            {onOpenCreateModal ? (
              <Button
                onClick={onOpenCreateModal}
                size="sm"
                className="text-xs gap-1.5 rounded-xl px-4 py-2 font-semibold shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Ticket</span>
              </Button>
            ) : (
              <Link href="/support">
                <Button
                  size="sm"
                  className="text-xs gap-1.5 rounded-xl px-4 py-2 font-semibold shadow-sm cursor-pointer"
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
                <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-primary font-semibold">
                          {ticket.ticketNumber}
                        </span>
                        {getStatusBadge(ticket.status)}
                        <Badge
                          variant="default"
                          className="text-[10px] bg-muted text-muted-foreground border-border"
                        >
                          {ticket.category}
                        </Badge>
                      </div>

                      <h4 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                        {ticket.subject}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary/70" />
                        <span>Active {updatedDate}</span>
                      </div>

                      <div className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform">
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
