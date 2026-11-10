'use client';

import * as React from 'react';
import { Card, Badge, Input, Button, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { AuditLog, AuditListResult, AuditSummaryMetrics } from '@elsesourav/types';
import {
  ShieldAlert,
  History,
  Activity,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Code2,
  X,
  Lock,
  Calendar,
} from 'lucide-react';

interface AdminAuditTableProps {
  initialLogs: AuditListResult;
  summary: AuditSummaryMetrics;
}

export function AdminAuditTable({ initialLogs, summary }: AdminAuditTableProps) {
  const [logs] = React.useState<readonly AuditLog[]>(initialLogs.logs);
  const [search, setSearch] = React.useState('');
  const [selectedAction, setSelectedAction] = React.useState<string>('all');
  const [selectedResource, setSelectedResource] = React.useState<string>('all');

  const actionItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Actions' },
      { value: 'USER_ROLE_CHANGED', label: 'USER_ROLE_CHANGED' },
      { value: 'USER_DELETED', label: 'USER_DELETED' },
      { value: 'APP_PUBLISHED', label: 'APP_PUBLISHED' },
      { value: 'APP_ARCHIVED', label: 'APP_ARCHIVED' },
      { value: 'APP_DELETED', label: 'APP_DELETED' },
      { value: 'BLOG_PUBLISHED', label: 'BLOG_PUBLISHED' },
      { value: 'HELP_PUBLISHED', label: 'HELP_PUBLISHED' },
      { value: 'SUPPORT_STATUS_CHANGED', label: 'SUPPORT_STATUS_CHANGED' },
      { value: 'MEDIA_DELETED', label: 'MEDIA_DELETED' },
      {
        value: 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
        label: 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
      },
    ],
    []
  );

  const resourceItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Resource Types' },
      { value: 'USER', label: 'USER' },
      { value: 'APP', label: 'APP' },
      { value: 'BLOG_POST', label: 'BLOG_POST' },
      { value: 'HELP_ARTICLE', label: 'HELP_ARTICLE' },
      { value: 'SUPPORT_TICKET', label: 'SUPPORT_TICKET' },
      { value: 'MEDIA', label: 'MEDIA' },
      { value: 'SECURITY', label: 'SECURITY' },
      { value: 'SYSTEM', label: 'SYSTEM' },
    ],
    []
  );

  // Metadata inspector modal
  const [inspectingLog, setInspectingLog] = React.useState<AuditLog | null>(null);

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesEntity = log.entityType.toLowerCase().includes(q);
        const matchesEntityId = log.entityId?.toLowerCase().includes(q) ?? false;
        const matchesActor =
          (log.actor?.displayName?.toLowerCase().includes(q) ?? false) ||
          (log.actor?.email?.toLowerCase().includes(q) ?? false) ||
          (log.userEmail?.toLowerCase().includes(q) ?? false);
        if (!matchesAction && !matchesEntity && !matchesEntityId && !matchesActor) return false;
      }

      if (selectedAction !== 'all') {
        if (log.action !== selectedAction) return false;
      }

      if (selectedResource !== 'all') {
        if (log.entityType !== selectedResource) return false;
      }

      return true;
    });
  }, [logs, search, selectedAction, selectedResource]);

  const getActionBadge = (action: string) => {
    if (action.startsWith('SECURITY_') || action.includes('DELETED')) {
      return (
        <Badge
          variant="outline"
          className="border-rose-500/40 text-rose-300 bg-rose-950/60 font-mono text-[10px] truncate block"
        >
          {action}
        </Badge>
      );
    }
    if (action.includes('PUBLISHED') || action.includes('REGISTERED')) {
      return (
        <Badge variant="success" className="font-mono text-[10px] truncate block">
          {action}
        </Badge>
      );
    }
    if (action.includes('ROLE') || action.includes('STATUS') || action.includes('ARCHIVED')) {
      return (
        <Badge
          variant="outline"
          className="border-amber-500/40 text-amber-300 bg-amber-950/60 font-mono text-[10px] truncate block"
        >
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="info" className="font-mono text-[10px] truncate block">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metric Tiles: 2x2 grid on mobile, 4-col on tablet and desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 block font-medium truncate">
                Total Logs
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {summary.totalLogs}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 block font-medium truncate">
                Last 24h
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-cyan-700 dark:text-cyan-300">
                {summary.logsLast24Hours}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 block font-medium truncate">
                Alerts
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
                {summary.securityAlertsCount}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 block font-medium truncate">
                Unique Actors
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
                {summary.uniqueActorsCount}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
        {/* Search Input */}
        <div className="relative sm:col-span-6 lg:col-span-6">
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, resource ID, or actor..."
            className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-xs pl-9 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 h-9"
          />
        </div>

        {/* Action & Resource Filters: 2-column grid on mobile */}
        <div className="grid grid-cols-2 sm:col-span-6 lg:col-span-6 gap-2">
          <Dropdown
            items={actionItems}
            value={selectedAction}
            onChange={(val) => setSelectedAction(val)}
            className="w-full"
          />

          <Dropdown
            items={resourceItems}
            value={selectedResource}
            onChange={(val) => setSelectedResource(val)}
            className="w-full"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300 min-w-[640px] table-fixed">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3.5 w-32">Timestamp</th>
                <th className="py-3 px-3.5 w-36">Actor</th>
                <th className="py-3 px-3.5 w-40">Action</th>
                <th className="py-3 px-3.5 w-24">Resource</th>
                <th className="py-3 px-3.5 w-28">Entity ID</th>
                <th className="py-3 px-3.5 w-20 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString();
                  const formattedTime = dateObj.toLocaleTimeString();

                  return (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>{formattedDate}</span>
                          <span className="text-zinc-400 dark:text-zinc-600">{formattedTime}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-800 dark:text-zinc-200 uppercase shrink-0">
                            {log.actor?.displayName ? log.actor.displayName[0] : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                              {log.actor?.displayName || 'System'}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono truncate">
                              {log.actor?.email || log.userEmail || log.userId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Resource */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 inline-block truncate max-w-full">
                          {log.entityType}
                        </span>
                      </td>

                      {/* Entity ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {log.entityId ? (
                          <span className="truncate block max-w-[120px]" title={log.entityId}>
                            {log.entityId}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Details button */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setInspectingLog(log)}
                          leftIcon={<Code2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                          className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-900 dark:text-zinc-300">{filteredLogs.length}</strong> of{' '}
            <strong className="text-zinc-900 dark:text-zinc-300">{initialLogs.total}</strong> records
          </span>
          <div className="flex items-center gap-2">
            <IconButton
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={initialLogs.page <= 1}
              aria-label="Previous page"
              icon={<ChevronLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
              className="rounded-lg border-zinc-200 dark:border-zinc-800"
            />
            <span className="font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
              Page {initialLogs.page} of {initialLogs.totalPages}
            </span>
            <IconButton
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={initialLogs.page >= initialLogs.totalPages}
              aria-label="Next page"
              icon={<ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
              className="rounded-lg border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>
      </Card>

      {/* Inspect Metadata Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Audit Log Details</h3>
              </div>
              <IconButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setInspectingLog(null)}
                aria-label="Close details"
                icon={<X className="w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200" />}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-zinc-500 block">Action</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-semibold truncate block">
                    {inspectingLog.action}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80">
                  <span className="text-zinc-500 block">Resource</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-semibold truncate block">
                    {inspectingLog.entityType}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-600 dark:text-zinc-400 block font-medium">
                  Sanitized Audit Payload (JSON)
                </span>
                <pre className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-300 overflow-x-auto max-h-64">
                  {JSON.stringify(inspectingLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
