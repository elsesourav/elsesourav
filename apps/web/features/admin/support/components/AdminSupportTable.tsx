'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input } from '@elsesourav/ui';
import type { SupportTicketListItem, SupportTicketStatus } from '@elsesourav/types';
import {
  LifeBuoy,
  Search,
  ExternalLink,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AdminSupportTableProps {
  initialTickets: readonly SupportTicketListItem[];
}

export function AdminSupportTable({ initialTickets }: AdminSupportTableProps) {
  const [tickets] = React.useState(initialTickets);
  const [search, setSearch] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedPriority, setSelectedPriority] = React.useState<string>('all');

  const filteredTickets = React.useMemo(() => {
    return tickets.filter((ticket) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesNumber = ticket.ticketNumber.toLowerCase().includes(q);
        const matchesSubject = ticket.subject.toLowerCase().includes(q);
        const matchesUser = ticket.userEmail?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesSubject && !matchesUser) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (ticket.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'all') {
        if (ticket.priority.toLowerCase() !== selectedPriority.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, search, selectedStatus, selectedPriority]);

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, subject, or user email..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_for_user">Waiting for User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table Card */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <LifeBuoy className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No tickets found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No support inquiries match your current filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Subject</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">User</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Priority</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Last Active</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredTickets.map((ticket) => {
                  const lastActive = new Date(ticket.lastMessageAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={ticket.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* Ticket Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        #{ticket.ticketNumber}
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/support/${ticket.id}`}
                            className="font-semibold text-zinc-100 hover:text-indigo-300 transition-colors truncate block max-w-xs sm:max-w-md"
                          >
                            {ticket.subject}
                          </Link>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-0.5">
                            <MessageSquare className="w-3 h-3" />
                            <span>{ticket.messageCount ?? 1} messages</span>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-zinc-300">
                        <div className="truncate max-w-[150px]">
                          {ticket.userName || ticket.userEmail || 'Anonymous'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-zinc-400 capitalize">
                        {ticket.category}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {ticket.status === 'open' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono">
                            Open
                          </Badge>
                        ) : ticket.status === 'in_progress' ? (
                          <Badge variant="info" className="text-[10px] uppercase font-mono">
                            In Progress
                          </Badge>
                        ) : ticket.status === 'waiting_for_user' ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono border-amber-500/40 text-amber-300"
                          >
                            Waiting
                          </Badge>
                        ) : ticket.status === 'resolved' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            Closed
                          </Badge>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 hidden lg:table-cell uppercase font-mono text-[10px]">
                        <span
                          className={
                            ticket.priority === 'urgent' || ticket.priority === 'high'
                              ? 'text-rose-400 font-bold'
                              : 'text-zinc-400'
                          }
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-500 text-[11px]">
                        {lastActive}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-indigo-600 hover:text-white text-zinc-300 transition-colors text-[11px] font-medium"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
