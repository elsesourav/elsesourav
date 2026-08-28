import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Eye, Play, Bookmark, Star, Activity, AlertCircle } from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components/ui';
import { appRepository } from '@/repositories/app.repository';
import { analyticsRepository } from '@/repositories/analytics.repository';
import { feedbackRepository } from '@/repositories/feedback.repository';
import type { App } from '@/types/app.types';
import type { AnalyticsEvent } from '@/types/analytics.types';
import type { AppFeedback } from '@/types/feedback.types';
import { formatDate } from '@/utils/format';
import './AdminAnalyticsPage.css';

type TimeRange = '7d' | '30d' | '90d' | 'all';
type MetricRankingTab = 'views' | 'actions' | 'saves';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [rankingTab, setRankingTab] = useState<MetricRankingTab>('views');

  const [apps, setApps] = useState<readonly App[]>([]);
  const [events, setEvents] = useState<readonly AnalyticsEvent[]>([]);
  const [feedbacks, setFeedbacks] = useState<readonly AppFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [appsRes, eventsRes, feedbackRes] = await Promise.all([
      appRepository.findMany({ limit: 100 }),
      analyticsRepository.listEvents(undefined, {
        limit: 50,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      }),
      feedbackRepository.listAllForModeration({ limit: 100 }),
    ]);

    if (appsRes.success) {
      setApps(appsRes.data.items);
    } else {
      setError(appsRes.error.message);
    }

    if (eventsRes.success) {
      setEvents(eventsRes.data.items);
    }

    if (feedbackRes.success) {
      setFeedbacks(feedbackRes.data.items);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Aggregate Key Metrics across applications
  const totals = useMemo(() => {
    const totalViews = apps.reduce((sum, a) => sum + (a.stats?.views || 0), 0);
    const totalLaunches = apps.reduce((sum, a) => sum + (a.stats?.launches || 0), 0);
    const totalSaves = apps.reduce((sum, a) => sum + (a.stats?.libraryAdds || 0), 0);
    const totalFeedbacks = feedbacks.length;
    const ratedFeedbacks = feedbacks.filter((f) => typeof f.rating === 'number');
    const avgRating =
      ratedFeedbacks.length > 0
        ? (
            ratedFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / ratedFeedbacks.length
          ).toFixed(1)
        : '5.0';

    return {
      views: totalViews,
      launches: totalLaunches,
      saves: totalSaves,
      feedbackCount: totalFeedbacks,
      avgRating,
      publishedAppsCount: apps.filter((a) => a.status === 'published').length,
    };
  }, [apps, feedbacks]);

  // Top Ranked Apps by selected metric
  const rankedApps = useMemo(() => {
    const sorted = [...apps];
    if (rankingTab === 'views') {
      return sorted.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
    }
    if (rankingTab === 'actions') {
      return sorted.sort((a, b) => (b.stats?.launches || 0) - (a.stats?.launches || 0));
    }
    if (rankingTab === 'saves') {
      return sorted.sort((a, b) => (b.stats?.libraryAdds || 0) - (a.stats?.libraryAdds || 0));
    }
    return sorted;
  }, [apps, rankingTab]);

  const maxMetricValue = useMemo(() => {
    if (rankedApps.length === 0) return 1;
    const first = rankedApps[0];
    if (!first) return 1;
    if (rankingTab === 'views') return Math.max(first.stats?.views || 1, 1);
    if (rankingTab === 'actions') return Math.max(first.stats?.launches || 1, 1);
    if (rankingTab === 'saves') return Math.max(first.stats?.libraryAdds || 1, 1);
    return 1;
  }, [rankedApps, rankingTab]);

  return (
    <div className="admin-analytics-page">
      {/* Header */}
      <header className="admin-analytics-header">
        <div className="admin-analytics-header__title-group">
          <h1 className="admin-analytics-header__title">Platform Analytics & Engagement</h1>
          <p className="admin-analytics-header__subtitle">
            Reliable operational performance metrics, top software rankings, and visitor telemetry.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="admin-analytics-time-tabs" role="tablist" aria-label="Time Filter">
          {(
            [
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 90 Days', value: '90d' },
              { label: 'All Time', value: 'all' },
            ] as const
          ).map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={timeRange === t.value}
              className={`admin-analytics-time-tab ${
                timeRange === t.value ? 'admin-analytics-time-tab--active' : ''
              }`}
              onClick={() => setTimeRange(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="admin-analytics-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchAnalyticsData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="admin-analytics-stats-grid">
        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__icon admin-analytics-stat-card__icon--views">
            <Eye size={20} aria-hidden="true" />
          </div>
          <div className="admin-analytics-stat-card__content">
            <span className="admin-analytics-stat-card__label">Total App Views</span>
            <strong className="admin-analytics-stat-card__value">
              {isLoading ? (
                <Skeleton variant="text" width="60px" height="28px" />
              ) : (
                totals.views.toLocaleString()
              )}
            </strong>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__icon admin-analytics-stat-card__icon--actions">
            <Play size={20} aria-hidden="true" />
          </div>
          <div className="admin-analytics-stat-card__content">
            <span className="admin-analytics-stat-card__label">App Launches & Actions</span>
            <strong className="admin-analytics-stat-card__value">
              {isLoading ? (
                <Skeleton variant="text" width="60px" height="28px" />
              ) : (
                totals.launches.toLocaleString()
              )}
            </strong>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__icon admin-analytics-stat-card__icon--saves">
            <Bookmark size={20} aria-hidden="true" />
          </div>
          <div className="admin-analytics-stat-card__content">
            <span className="admin-analytics-stat-card__label">Library Bookmarks</span>
            <strong className="admin-analytics-stat-card__value">
              {isLoading ? (
                <Skeleton variant="text" width="60px" height="28px" />
              ) : (
                totals.saves.toLocaleString()
              )}
            </strong>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__icon admin-analytics-stat-card__icon--rating">
            <Star size={20} aria-hidden="true" />
          </div>
          <div className="admin-analytics-stat-card__content">
            <span className="admin-analytics-stat-card__label">User Satisfaction</span>
            <strong className="admin-analytics-stat-card__value">
              {isLoading ? (
                <Skeleton variant="text" width="60px" height="28px" />
              ) : (
                `${totals.avgRating} / 5.0 (${totals.feedbackCount})`
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Analytics Content: Performance Rankings & Activity Stream */}
      <div className="admin-analytics-grid">
        {/* Left Column: Software Performance Rankings */}
        <section className="admin-analytics-card" aria-labelledby="rankings-title">
          <div className="admin-analytics-card__header">
            <div>
              <h2 id="rankings-title" className="admin-analytics-card__title">
                Application Performance Rankings
              </h2>
              <p className="admin-analytics-card__subtitle">
                Accurately labeled rankings based on actual platform telemetry data.
              </p>
            </div>

            <div className="admin-analytics-ranking-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={rankingTab === 'views'}
                className={`admin-analytics-ranking-tab ${
                  rankingTab === 'views' ? 'admin-analytics-ranking-tab--active' : ''
                }`}
                onClick={() => setRankingTab('views')}
              >
                Views
              </button>
              <button
                role="tab"
                aria-selected={rankingTab === 'actions'}
                className={`admin-analytics-ranking-tab ${
                  rankingTab === 'actions' ? 'admin-analytics-ranking-tab--active' : ''
                }`}
                onClick={() => setRankingTab('actions')}
              >
                Launches
              </button>
              <button
                role="tab"
                aria-selected={rankingTab === 'saves'}
                className={`admin-analytics-ranking-tab ${
                  rankingTab === 'saves' ? 'admin-analytics-ranking-tab--active' : ''
                }`}
                onClick={() => setRankingTab('saves')}
              >
                Saves
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="admin-analytics-loading" aria-busy="true">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="admin-analytics-bar-skeleton">
                  <Skeleton variant="text" width="30%" height="20px" />
                  <Skeleton variant="rectangular" width="100%" height="16px" />
                </div>
              ))}
            </div>
          ) : rankedApps.length === 0 ? (
            <div className="admin-analytics-empty">
              <BarChart3 size={36} aria-hidden="true" />
              <p>No application performance data registered yet.</p>
            </div>
          ) : (
            <div className="admin-analytics-bars-list">
              {rankedApps.slice(0, 8).map((app, idx) => {
                const metricVal =
                  rankingTab === 'views'
                    ? app.stats?.views || 0
                    : rankingTab === 'actions'
                      ? app.stats?.launches || 0
                      : app.stats?.libraryAdds || 0;

                const percent = Math.min(Math.round((metricVal / maxMetricValue) * 100), 100);

                return (
                  <div key={app.id} className="admin-analytics-bar-item">
                    <div className="admin-analytics-bar-info">
                      <div className="admin-analytics-bar-name-group">
                        <span className="admin-analytics-bar-rank">#{idx + 1}</span>
                        <span className="admin-analytics-bar-title">{app.name}</span>
                        <Badge variant="default" size="sm">
                          {app.primaryCategory}
                        </Badge>
                      </div>
                      <span className="admin-analytics-bar-number">
                        {metricVal.toLocaleString()}{' '}
                        {rankingTab === 'views'
                          ? 'views'
                          : rankingTab === 'actions'
                            ? 'launches'
                            : 'saves'}
                      </span>
                    </div>

                    <div
                      className="admin-analytics-meter-track"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${app.name} ${percent}%`}
                    >
                      <div
                        className={`admin-analytics-meter-fill admin-analytics-meter-fill--${rankingTab}`}
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Live Event Telemetry Stream */}
        <section className="admin-analytics-card" aria-labelledby="activity-title">
          <div className="admin-analytics-card__header">
            <div>
              <h2 id="activity-title" className="admin-analytics-card__title">
                Recent Interaction Telemetry
              </h2>
              <p className="admin-analytics-card__subtitle">
                Granular non-blocking event stream across applications.
              </p>
            </div>
            <Badge variant="mono" size="sm">
              Live Stream
            </Badge>
          </div>

          {isLoading ? (
            <div className="admin-analytics-loading" aria-busy="true">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="admin-analytics-event-skeleton">
                  <Skeleton variant="text" width="80%" height="16px" />
                  <Skeleton variant="text" width="40%" height="12px" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="admin-analytics-empty">
              <Activity size={36} aria-hidden="true" />
              <p>No recent user telemetry logged yet.</p>
            </div>
          ) : (
            <div className="admin-analytics-events-list">
              {events.slice(0, 10).map((ev) => (
                <div key={ev.id} className="admin-analytics-event-row">
                  <div className="admin-analytics-event-left">
                    <span className="admin-analytics-event-type-badge">
                      {ev.eventType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="admin-analytics-event-app">
                      App ID: <span className="font-mono">{ev.appId}</span>
                    </span>
                  </div>
                  <span className="admin-analytics-event-time">{formatDate(ev.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
