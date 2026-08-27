import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { healthCheckService } from '@/services/health-check.service';
import type { SystemHealthReport } from '@/types/observability.types';
import './AdminHealthCard.css';

export const AdminHealthCard: React.FC = () => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);
    try {
      const res = await healthCheckService.runDiagnostics();
      setReport(res);
    } finally {
      setIsRunning(false);
    }
  }, []);

  useEffect(() => {
    void runDiagnostics();
  }, [runDiagnostics]);

  const getStatusBadge = (status: 'healthy' | 'degraded' | 'unhealthy' | undefined) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 size={12} aria-hidden="true" style={{ marginRight: 4 }} />
            Operational
          </Badge>
        );
      case 'degraded':
        return (
          <Badge variant="warning" size="sm">
            <AlertTriangle size={12} aria-hidden="true" style={{ marginRight: 4 }} />
            Degraded
          </Badge>
        );
      case 'unhealthy':
        return (
          <Badge variant="error" size="sm">
            <XCircle size={12} aria-hidden="true" style={{ marginRight: 4 }} />
            Issues Detected
          </Badge>
        );
      default:
        return (
          <Badge variant="mono" size="sm">
            Unknown
          </Badge>
        );
    }
  };

  const getCheckBadge = (status: 'pass' | 'fail' | 'warn') => {
    switch (status) {
      case 'pass':
        return (
          <Badge variant="success" size="sm">
            Pass
          </Badge>
        );
      case 'warn':
        return (
          <Badge variant="warning" size="sm">
            Warning
          </Badge>
        );
      case 'fail':
        return (
          <Badge variant="error" size="sm">
            Fail
          </Badge>
        );
    }
  };

  return (
    <div className="admin-health-card" aria-label="System Health & Diagnostics">
      <div className="admin-health-card__header">
        <div className="admin-health-card__title-group">
          <Activity size={18} aria-hidden="true" />
          <h3 className="admin-health-card__title">System Diagnostics</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void runDiagnostics()}
          disabled={isRunning}
          leftIcon={<RefreshCw size={13} className={isRunning ? 'animate-spin' : undefined} />}
        >
          {isRunning ? 'Checking...' : 'Run Diagnostics'}
        </Button>
      </div>

      <div className="admin-health-card__summary">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Server size={18} className="text-secondary" aria-hidden="true" />
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Core Infrastructure
            </span>
            <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)' }}>
              v{report?.appVersion || '0.1.0'} ({report?.environment || 'production'})
            </div>
          </div>
        </div>
        {getStatusBadge(report?.status)}
      </div>

      {report && (
        <div className="admin-health-card__checks-list">
          <div className="admin-health-card__check-item">
            <span className="admin-health-card__check-name">Client Configuration</span>
            <div className="admin-health-card__check-meta">
              {report.checks.configuration.durationMs !== undefined && (
                <span className="admin-health-card__duration">
                  {report.checks.configuration.durationMs}ms
                </span>
              )}
              {getCheckBadge(report.checks.configuration.status)}
            </div>
          </div>

          <div className="admin-health-card__check-item">
            <span className="admin-health-card__check-name">Firebase Web SDK</span>
            <div className="admin-health-card__check-meta">
              {report.checks.firebaseInit.durationMs !== undefined && (
                <span className="admin-health-card__duration">
                  {report.checks.firebaseInit.durationMs}ms
                </span>
              )}
              {getCheckBadge(report.checks.firebaseInit.status)}
            </div>
          </div>

          <div className="admin-health-card__check-item">
            <span className="admin-health-card__check-name">Firebase Authentication</span>
            <div className="admin-health-card__check-meta">
              {report.checks.authentication.durationMs !== undefined && (
                <span className="admin-health-card__duration">
                  {report.checks.authentication.durationMs}ms
                </span>
              )}
              {getCheckBadge(report.checks.authentication.status)}
            </div>
          </div>

          <div className="admin-health-card__check-item">
            <span className="admin-health-card__check-name">Cloud Firestore</span>
            <div className="admin-health-card__check-meta">
              {report.checks.firestore.durationMs !== undefined && (
                <span className="admin-health-card__duration">
                  {report.checks.firestore.durationMs}ms
                </span>
              )}
              {getCheckBadge(report.checks.firestore.status)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
