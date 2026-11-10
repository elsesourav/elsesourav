'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { SupportTicketListItem } from '@elsesourav/types';
import { LifeBuoy, Search, ExternalLink, MessageSquare } from 'lucide-react';

interface AdminSupportTableProps {
  initialTickets: readonly SupportTicketListItem[];
}

export function AdminSupportTable({ initialTickets }: AdminSupportTableProps) {
  const [tickets] = React.useState(initialTickets);
  const [search, setSearch] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedPriority, setSelectedPriority] = React.useState<string>('all');

  const statusItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'waiting_for_user', label: 'Waiting for User' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' },
    ],
    []
  );

  const priorityItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Priorities' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
    []
  );

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
    <div className="space-y-5 sm:space-y-6 w-full max-w-full">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, subject, or email..."
              className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-xs pl-9 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 w-full shadow-sm"
            />
          </div>

          {/* Filter Dropdowns Grid on mobile, inline on tablet/desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
            <Dropdown
              items={statusItems}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-full sm:w-40"
            />

            <Dropdown
              items={priorityItems}
              value={selectedPriority}
              onChange={(val) => setSelectedPriority(val)}
              className="w-full sm:w-36"
            />
          </div>
        </div>
      </div>

      {/* Tickets Table Card */}
      <Card className="rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl overflow-hidden w-full shadow-sm">
        {filteredTickets.length === 0 ? (
          <div className="py-12 sm:py-16 px-4 text-center space-y-3">
            <LifeBuoy className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No tickets found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              No support inquiries match your current filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300 border-collapse table-fixed">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 font-medium">
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-24 sm:w-28 whitespace-nowrap">Reference</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold">Subject</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden md:table-cell w-40 whitespace-nowrap">User</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-28 whitespace-nowrap">Category</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-28 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden lg:table-cell w-20 whitespace-nowrap">Priority</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden xl:table-cell w-32 whitespace-nowrap">Last Active</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold text-right w-20 sm:w-24 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/50">
                {filteredTickets.map((ticket) => {
                  const lastActive = new Date(ticket.lastMessageAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      {/* Ticket Number (desktop/tablet) */}
                      <td className="py-3 px-3.5 sm:px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 hidden sm:table-cell whitespace-nowrap">
                        #{ticket.ticketNumber}
                      </td>

                      {/* Subject + mobile metadata */}
                      <td className="py-3 px-3.5 sm:px-4">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/support/${ticket.id}`}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors truncate block text-xs sm:text-sm"
                          >
                            {ticket.subject}
                          </Link>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-0.5">
                            {/* Mobile ticket reference */}
                            <span className="sm:hidden font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                              #{ticket.ticketNumber}
                            </span>
                            <span className="sm:hidden text-zinc-400 dark:text-zinc-600">•</span>
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span>{ticket.messageCount ?? 1} msg</span>
                            {/* Mobile-only inline status */}
                            <span className="sm:hidden ml-1">
                              {ticket.status === 'open' ? (
                                <Badge variant="warning" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  Open
                                </Badge>
                              ) : ticket.status === 'in_progress' ? (
                                <Badge variant="info" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  In Prog
                                </Badge>
                              ) : ticket.status === 'waiting_for_user' ? (
                                <Badge variant="outline" className="text-[9px] uppercase font-mono border-amber-500/40 text-amber-600 dark:text-amber-300 px-1 py-0 leading-tight">
                                  Waiting
                                </Badge>
                              ) : ticket.status === 'resolved' ? (
                                <Badge variant="success" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  Resolved
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  Closed
                                </Badge>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-3.5 sm:px-4 hidden md:table-cell text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        <div className="truncate max-w-[150px]">
                          {ticket.userName || ticket.userEmail || 'Anonymous'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell capitalize whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-300 text-[11px]">
                          {ticket.category}
                        </span>
                      </td>

                      {/* Status Badge (desktop/tablet) */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                        {ticket.status === 'open' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Open
                          </Badge>
                        ) : ticket.status === 'in_progress' ? (
                          <Badge variant="info" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            In Progress
                          </Badge>
                        ) : ticket.status === 'waiting_for_user' ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono border-amber-500/40 text-amber-600 dark:text-amber-300 px-1.5 py-0.5"
                          >
                            Waiting
                          </Badge>
                        ) : ticket.status === 'resolved' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Closed
                          </Badge>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3.5 sm:px-4 hidden lg:table-cell uppercase font-mono text-[10px] whitespace-nowrap">
                        <span
                          className={
                            ticket.priority === 'urgent' || ticket.priority === 'high'
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-3.5 sm:px-4 hidden xl:table-cell text-zinc-500 text-[11px] whitespace-nowrap">
                        {lastActive}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition-colors text-[11px] font-medium"
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
