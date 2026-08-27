import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, Search, User as UserIcon, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { Badge, Button, Input, TableSkeleton, Dialog } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { auditService } from '@/services/audit.service';
import type { AuditLog, AuditEntityType } from '@/types/audit.types';
import { formatDate } from '@/utils/format';
import './AdminAuditLogsPage.css';

type SortDirection = 'desc' | 'asc';

const ENTITY_OPTIONS: readonly { label: string; value: AuditEntityType | 'all' }[] = [
  { label: 'All Entities', value: 'all' },
  { label: 'Applications', value: 'app' },
  { label: 'Categories', value: 'category' },
  { label: 'Tags', value: 'tag' },
  { label: 'Versions & Releases', value: 'version' },
  { label: 'Blog Posts', value: 'blog' },
  { label: 'Help Articles', value: 'help' },
  { label: 'Support Tickets', value: 'support' },
  { label: 'Security & Auth', value: 'user' },
];

export const AdminAuditLogsPage: React.FC = () => {
  const { user, authUser, isAdmin } = useAuth();
  const userId = user?.id || authUser?.uid || 'admin';

  const currentUser = useMemo(
    () => ({
      id: userId,
      email: user?.email || authUser?.email || 'admin@elsesourav.com',
      name: user?.displayName || authUser?.displayName || 'Admin',
      role: 'admin' as const,
    }),
    [userId, user?.email, user?.displayName, authUser?.email, authUser?.displayName]
  );

  const [logs, setLogs] = useState<readonly AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);

    const res = await auditService.listLogs(currentUser, {
      limit: 100,
      orderBy: 'createdAt',
      orderDirection: sortDirection,
    });

    if (res.success) {
      setLogs(res.data.items);
    } else {
      setError(res.error.message);
    }

    setIsLoading(false);
  }, [isAdmin, currentUser, sortDirection]);

  useEffect(() => {
    void fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Unique actions list for filter dropdown
  const availableActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.action));
    return Array.from(set).sort();
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Entity Filter
    if (entityFilter !== 'all') {
      result = result.filter(
        (l) => l.entityType === entityFilter || l.resourceType === entityFilter
      );
    }

    // Action Filter
    if (actionFilter !== 'all') {
      result = result.filter((l) => l.action === actionFilter);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          l.actorEmail?.toLowerCase().includes(q) ||
          l.actorUserId.toLowerCase().includes(q) ||
          (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))
      );
    }

    return result;
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const getActionBadgeVariant = (
    action: string
  ): 'default' | 'success' | 'warning' | 'error' | 'accent' | 'mono' => {
    if (action.includes('PUBLISHED') || action.includes('CREATED')) return 'success';
    if (action.includes('UPDATED') || action.includes('STATUS')) return 'accent';
    if (action.includes('ARCHIVED') || action.includes('UNPUBLISHED')) return 'warning';
    if (action.includes('DELETE') || action.includes('SECURITY')) return 'error';
    return 'default';
  };

  return (
    <div className="admin-audit-page">
      {/* Header */}
      <header className="admin-audit-header">
        <div className="admin-audit-header__title-group">
          <h1 className="admin-audit-header__title">Security & Audit Trail</h1>
          <p className="admin-audit-header__subtitle">
            Immutable administrative event record tracking platform publishing, taxonomy, and system
            mutations.
          </p>
        </div>

        <div className="admin-audit-header__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void fetchAuditLogs()}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh Logs
          </Button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="admin-audit-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchAuditLogs()}>
            Retry
          </Button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="admin-audit-controls">
        <div className="admin-audit-search">
          <Input
            type="search"
            placeholder="Search audit trail by action, entity ID, actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
            aria-label="Search audit logs"
          />
        </div>

        <div className="admin-audit-filters">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value as AuditEntityType | 'all')}
            className="admin-audit-select"
            aria-label="Filter by entity type"
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="admin-audit-select"
            aria-label="Filter by action type"
          >
            <option value="all">All Action Types</option>
            {availableActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as SortDirection)}
            className="admin-audit-select"
            aria-label="Sort logs by date"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div className="admin-audit-card">
        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : filteredLogs.length === 0 ? (
          <div className="admin-audit-empty">
            <Shield size={44} aria-hidden="true" />
            <h2 className="admin-audit-empty__title">No Audit Events Found</h2>
            <p className="admin-audit-empty__desc">
              {searchQuery || entityFilter !== 'all' || actionFilter !== 'all'
                ? 'No recorded administrative actions match your filter criteria.'
                : 'Administrative actions such as publishing, creating releases, and editing taxonomy will appear here.'}
            </p>
          </div>
        ) : (
          <div className="admin-audit-table-wrapper" role="region" aria-label="Audit Logs Table">
            <table className="admin-audit-table">
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Action</th>
                  <th scope="col">Target Resource</th>
                  <th scope="col">Actor</th>
                  <th scope="col" className="admin-audit-th--right">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="admin-audit-tr">
                    <td className="admin-audit-td-time">
                      <span className="admin-audit-time-val">{formatDate(log.createdAt)}</span>
                    </td>
                    <td>
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td>
                      <div className="admin-audit-entity-cell">
                        <span className="admin-audit-entity-type">
                          {(log.entityType || log.resourceType || 'system').toUpperCase()}
                        </span>
                        <span className="admin-audit-entity-id" title={log.entityId}>
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-audit-actor-cell">
                        <UserIcon size={13} aria-hidden="true" />
                        <span className="admin-audit-actor-name">
                          {log.actorEmail || log.userEmail || log.actorUserId || 'Administrator'}
                        </span>
                      </div>
                    </td>
                    <td className="admin-audit-td--right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        aria-label={`View audit details for ${log.action}`}
                        leftIcon={<Eye size={13} />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Inspector Modal */}
      <Dialog
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Record Inspector"
        description="Immutable administrative metadata for verification and compliance."
      >
        {selectedLog && (
          <div className="admin-audit-modal-content">
            <div className="admin-audit-modal-grid">
              <div className="admin-audit-modal-field">
                <span className="admin-audit-modal-label">Event ID:</span>
                <span className="admin-audit-modal-value font-mono">{selectedLog.id}</span>
              </div>
              <div className="admin-audit-modal-field">
                <span className="admin-audit-modal-label">Action:</span>
                <Badge variant={getActionBadgeVariant(selectedLog.action)} size="sm">
                  {selectedLog.action}
                </Badge>
              </div>
              <div className="admin-audit-modal-field">
                <span className="admin-audit-modal-label">Entity Type:</span>
                <span className="admin-audit-modal-value">
                  {selectedLog.entityType || selectedLog.resourceType}
                </span>
              </div>
              <div className="admin-audit-modal-field">
                <span className="admin-audit-modal-label">Entity ID:</span>
                <span className="admin-audit-modal-value font-mono">{selectedLog.entityId}</span>
              </div>
              <div className="admin-audit-modal-field">
                <span className="admin-audit-modal-label">Actor Email:</span>
                <span className="admin-audit-modal-value">
                  {selectedLog.actorEmail || selectedLog.userEmail || 'admin'}
                </span>
              </div>
              <div className="admin-audit-modal-field">
                <span className="admin-audit-modal-label">Timestamp:</span>
                <span className="admin-audit-modal-value">{formatDate(selectedLog.createdAt)}</span>
              </div>
            </div>

            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
              <div className="admin-audit-modal-metadata">
                <span className="admin-audit-modal-label">Safe Metadata Payload:</span>
                <pre className="admin-audit-modal-json">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="admin-audit-modal-no-meta">
                <p>No additional metadata payload attached to this record.</p>
              </div>
            )}

            <div className="admin-audit-modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
