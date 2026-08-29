'use client';

import * as React from 'react';
import { Card, Badge, Input } from '@elsesourav/ui';
import type {
  AuditLog,
  AuditListResult,
  AuditSummaryMetrics,
} from '@elsesourav/types';
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
        <Badge variant="outline" className="border-rose-500/40 text-rose-300 bg-rose-950/60 font-mono text-[10px]">
          {action}
        </Badge>
      );
    }
    if (action.includes('PUBLISHED') || action.includes('REGISTERED')) {
      return (
        <Badge variant="success" className="font-mono text-[10px]">
          {action}
        </Badge>
      );
    }
    if (action.includes('ROLE') || action.includes('STATUS') || action.includes('ARCHIVED')) {
      return (
        <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-950/60 font-mono text-[10px]">
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="info" className="font-mono text-[10px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Total Audit Logs</span>
              <span className="text-xl font-bold font-mono text-zinc-100">
                {summary.totalLogs}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Activity (Last 24h)</span>
              <span className="text-xl font-bold font-mono text-cyan-300">
                {summary.logsLast24Hours}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Security Alerts</span>
              <span className="text-xl font-bold font-mono text-rose-300">
                {summary.securityAlertsCount}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Unique Actors</span>
              <span className="text-xl font-bold font-mono text-amber-300">
                {summary.uniqueActorsCount}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, resource ID, or actor..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Actions</option>
            <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="APP_PUBLISHED">APP_PUBLISHED</option>
            <option value="APP_ARCHIVED">APP_ARCHIVED</option>
            <option value="APP_DELETED">APP_DELETED</option>
            <option value="BLOG_PUBLISHED">BLOG_PUBLISHED</option>
            <option value="HELP_PUBLISHED">HELP_PUBLISHED</option>
            <option value="SUPPORT_STATUS_CHANGED">SUPPORT_STATUS_CHANGED</option>
            <option value="MEDIA_DELETED">MEDIA_DELETED</option>
            <option value="SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT">SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT</option>
          </select>

          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Resource Types</option>
            <option value="USER">USER</option>
            <option value="APP">APP</option>
            <option value="BLOG_POST">BLOG_POST</option>
            <option value="HELP_ARTICLE">HELP_ARTICLE</option>
            <option value="SUPPORT_TICKET">SUPPORT_TICKET</option>
            <option value="MEDIA">MEDIA</option>
            <option value="SECURITY">SECURITY</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
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
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{formattedDate}</span>
                          <span className="text-zinc-600">{formattedTime}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200 uppercase shrink-0">
                            {log.actor?.displayName ? log.actor.displayName[0] : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-200">
                              {log.actor?.displayName || 'System'}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {log.actor?.email || log.userEmail || log.userId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Resource */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-zinc-300 bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-800">
                          {log.entityType}
                        </span>
                      </td>

                      {/* Entity ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                        {log.entityId ? (
                          <span className="truncate block max-w-[120px]" title={log.entityId}>
                            {log.entityId}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Details button */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono transition-colors"
                        >
                          <Code2 className="w-3 h-3 text-indigo-400" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-300">{filteredLogs.length}</strong> of{' '}
            <strong className="text-zinc-300">{initialLogs.total}</strong> records
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={initialLogs.page <= 1}
              className="p-1 rounded-lg border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-zinc-400">
              Page {initialLogs.page} of {initialLogs.totalPages}
            </span>
            <button
              disabled={initialLogs.page >= initialLogs.totalPages}
              className="p-1 rounded-lg border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Inspect Metadata Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-100">Audit Log Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 block">Action</span>
                  <span className="text-zinc-200 font-semibold">{inspectingLog.action}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 block">Resource</span>
                  <span className="text-zinc-200 font-semibold">{inspectingLog.entityType}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 block font-medium">Sanitized Audit Payload (JSON)</span>
                <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-64">
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
