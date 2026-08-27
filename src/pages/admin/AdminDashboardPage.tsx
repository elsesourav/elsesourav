import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FileText,
  LifeBuoy,
  Plus,
  ArrowRight,
  TrendingUp,
  FolderTree,
  AlertCircle,
  Clock,
  CheckCircle2,
  Shield,
  Layers,
} from 'lucide-react';
import { Button, Badge, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { appRepository, blogRepository } from '@/repositories';
import { supportService } from '@/services/support.service';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { SupportTicket } from '@/types/support.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/format';
import { AdminHealthCard } from '@/components/admin/AdminHealthCard';
import './AdminDashboardPage.css';

interface DashboardMetrics {
  readonly publishedAppsCount: number;
  readonly draftAppsCount: number;
  readonly publishedBlogsCount: number;
  readonly openTicketsCount: number;
}

interface RecentActivityItem {
  readonly id: string;
  readonly type: 'app' | 'blog' | 'ticket';
  readonly title: string;
  readonly subtitle: string;
  readonly timestamp: number;
  readonly link: string;
  readonly status: string;
  readonly statusVariant: 'success' | 'warning' | 'default' | 'accent';
}

export const AdminDashboardPage: React.FC = () => {
  const { user, authUser } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivities, setRecentActivities] = useState<readonly RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserContext = useMemo(
    () => ({
      id: user?.id || authUser?.uid || '',
      email: user?.email || authUser?.email || '',
      name: user?.displayName || authUser?.displayName || '',
      role: (user?.role || 'admin') as 'admin' | 'user',
    }),
    [user, authUser]
  );

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parallel fetch for overview metrics & real records
      const [appsRes, blogsRes, ticketsRes] = await Promise.all([
        appRepository.findMany({ limit: 50, orderBy: 'updatedAt', orderDirection: 'desc' }),
        blogRepository.findMany({ limit: 50, orderBy: 'updatedAt', orderDirection: 'desc' }),
        supportService.listAdminTickets(currentUserContext, {
          limit: 50,
          orderBy: 'updatedAt',
          orderDirection: 'desc',
        }),
      ]);

      if (!appsRes.success) {
        setError(appsRes.error.message);
        setIsLoading(false);
        return;
      }
      if (!blogsRes.success) {
        setError(blogsRes.error.message);
        setIsLoading(false);
        return;
      }
      if (!ticketsRes.success) {
        setError(ticketsRes.error.message);
        setIsLoading(false);
        return;
      }

      const appsList: readonly App[] = appsRes.data.items;
      const blogsList: readonly BlogPost[] = blogsRes.data.items;
      const ticketsList: readonly SupportTicket[] = ticketsRes.data.items;

      const publishedApps = appsList.filter((a) => a.status === 'published').length;
      const draftApps = appsList.filter((a) => a.status === 'draft').length;
      const publishedBlogs = blogsList.filter((b) => b.status === 'published').length;
      const openTickets = ticketsList.filter(
        (t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting_for_user'
      ).length;

      setMetrics({
        publishedAppsCount: publishedApps,
        draftAppsCount: draftApps,
        publishedBlogsCount: publishedBlogs,
        openTicketsCount: openTickets,
      });

      // Construct recent activities timeline
      const activities: RecentActivityItem[] = [];

      appsList.slice(0, 3).forEach((app) => {
        activities.push({
          id: `app-${app.id}`,
          type: 'app',
          title: app.name,
          subtitle: `Version ${app.currentVersion} • ${app.primaryCategory}`,
          timestamp: app.updatedAt,
          link: ROUTES.ADMIN.APPS,
          status: app.status,
          statusVariant: app.status === 'published' ? 'success' : 'default',
        });
      });

      blogsList.slice(0, 3).forEach((blog) => {
        activities.push({
          id: `blog-${blog.id}`,
          type: 'blog',
          title: blog.title,
          subtitle: `Slug: /blog/${blog.slug}`,
          timestamp: blog.updatedAt,
          link: ROUTES.ADMIN.BLOG,
          status: blog.status,
          statusVariant: blog.status === 'published' ? 'success' : 'default',
        });
      });

      ticketsList.slice(0, 3).forEach((ticket) => {
        activities.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket',
          title: ticket.subject,
          subtitle: `From: ${ticket.userName} (#${ticket.ticketNumber})`,
          timestamp: ticket.updatedAt || ticket.createdAt,
          link: ROUTES.ADMIN.SUPPORT,
          status: ticket.status.replace('_', ' '),
          statusVariant:
            ticket.status === 'resolved' || ticket.status === 'closed' ? 'default' : 'warning',
        });
      });

      // Sort activities chronologically (newest first)
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 6));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load administrative overview.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserContext]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="admin-dashboard">
      {/* Top Banner */}
      <section className="admin-dashboard__banner" aria-labelledby="admin-dashboard-title">
        <div className="admin-dashboard__banner-info">
          <div className="admin-dashboard__banner-badge">
            <Shield size={13} aria-hidden="true" />
            <span>Platform Overview</span>
          </div>
          <h1 id="admin-dashboard-title" className="admin-dashboard__title">
            Admin Dashboard
          </h1>
          <p className="admin-dashboard__desc">
            Welcome to the ElseSourav publisher console. Monitor live applications, publish
            engineering blog posts, and resolve customer support tickets.
          </p>
        </div>

        <div className="admin-dashboard__banner-actions">
          <Link to={ROUTES.ADMIN.APPS} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm" leftIcon={<Package size={15} />}>
              Manage Apps
            </Button>
          </Link>
          <Link to={ROUTES.ADMIN.BLOG_NEW} style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm" leftIcon={<Plus size={15} />}>
              Write Article
            </Button>
          </Link>
        </div>
      </section>

      {/* Error Alert */}
      {error && !isLoading && (
        <div className="admin-dashboard__error-alert" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void fetchDashboardData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Metric Cards Row */}
      <section className="admin-dashboard__metrics-grid" aria-label="Key Platform Metrics">
        {isLoading ? (
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="admin-metric-card">
              <Skeleton variant="rectangular" width="36px" height="36px" className="mb-3" />
              <Skeleton variant="text" width="40%" height="28px" className="mb-2" />
              <Skeleton variant="text" width="60%" height="16px" />
            </div>
          ))
        ) : (
          <>
            <Link
              to={ROUTES.ADMIN.APPS}
              className="admin-metric-card admin-metric-card--interactive"
            >
              <div className="admin-metric-card__header">
                <div className="admin-metric-card__icon admin-metric-card__icon--brand">
                  <Package size={20} aria-hidden="true" />
                </div>
                <Badge variant="success" size="sm">
                  Live
                </Badge>
              </div>
              <p className="admin-metric-card__value">{metrics?.publishedAppsCount ?? 0}</p>
              <p className="admin-metric-card__label">Published Applications</p>
            </Link>

            <Link
              to={ROUTES.ADMIN.APPS}
              className="admin-metric-card admin-metric-card--interactive"
            >
              <div className="admin-metric-card__header">
                <div className="admin-metric-card__icon admin-metric-card__icon--muted">
                  <Layers size={20} aria-hidden="true" />
                </div>
                <Badge variant="default" size="sm">
                  Drafts
                </Badge>
              </div>
              <p className="admin-metric-card__value">{metrics?.draftAppsCount ?? 0}</p>
              <p className="admin-metric-card__label">Draft Software Builds</p>
            </Link>

            <Link
              to={ROUTES.ADMIN.BLOG}
              className="admin-metric-card admin-metric-card--interactive"
            >
              <div className="admin-metric-card__header">
                <div className="admin-metric-card__icon admin-metric-card__icon--accent">
                  <FileText size={20} aria-hidden="true" />
                </div>
                <Badge variant="accent" size="sm">
                  Published
                </Badge>
              </div>
              <p className="admin-metric-card__value">{metrics?.publishedBlogsCount ?? 0}</p>
              <p className="admin-metric-card__label">Blog & Devlog Posts</p>
            </Link>

            <Link
              to={ROUTES.ADMIN.SUPPORT}
              className="admin-metric-card admin-metric-card--interactive"
            >
              <div className="admin-metric-card__header">
                <div className="admin-metric-card__icon admin-metric-card__icon--warning">
                  <LifeBuoy size={20} aria-hidden="true" />
                </div>
                <Badge variant="warning" size="sm">
                  Action Needed
                </Badge>
              </div>
              <p className="admin-metric-card__value">{metrics?.openTicketsCount ?? 0}</p>
              <p className="admin-metric-card__label">Open Support Tickets</p>
            </Link>
          </>
        )}
      </section>

      {/* 2-Column Dashboard Body */}
      <div className="admin-dashboard__grid">
        {/* Main Column: Recent Activity */}
        <section className="admin-dashboard__section-card" aria-labelledby="recent-activity-title">
          <div className="admin-dashboard__card-header">
            <div>
              <h2 id="recent-activity-title" className="admin-dashboard__card-title">
                Recent Activity & Updates
              </h2>
              <p className="admin-dashboard__card-desc">
                Latest updates across applications, published blog posts, and support tickets.
              </p>
            </div>
            <Link to={ROUTES.ADMIN.AUDIT_LOGS} className="admin-dashboard__view-all-link">
              <span>View Audit Trail</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {isLoading ? (
            <div className="admin-activity-list" aria-busy="true">
              {[1, 2, 3].map((n) => (
                <div key={n} className="admin-activity-item">
                  <Skeleton variant="circular" width="32px" height="32px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height="18px" className="mb-1" />
                    <Skeleton variant="text" width="70%" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="admin-activity-empty">
              <CheckCircle2 size={36} aria-hidden="true" />
              <p className="admin-activity-empty__title">All Caught Up</p>
              <p className="admin-activity-empty__desc">
                No recent administrative activity found. Create a new app or write an article to get
                started.
              </p>
            </div>
          ) : (
            <ul className="admin-activity-list">
              {recentActivities.map((act) => (
                <li key={act.id} className="admin-activity-item">
                  <div className={`admin-activity-icon admin-activity-icon--${act.type}`}>
                    {act.type === 'app' && <Package size={16} aria-hidden="true" />}
                    {act.type === 'blog' && <FileText size={16} aria-hidden="true" />}
                    {act.type === 'ticket' && <LifeBuoy size={16} aria-hidden="true" />}
                  </div>
                  <div className="admin-activity-details">
                    <div className="admin-activity-top-row">
                      <Link to={act.link} className="admin-activity-item-title">
                        {act.title}
                      </Link>
                      <Badge variant={act.statusVariant} size="sm">
                        {act.status}
                      </Badge>
                    </div>
                    <p className="admin-activity-item-sub">{act.subtitle}</p>
                    <span className="admin-activity-time">
                      <Clock size={11} aria-hidden="true" />
                      <span>{formatDate(act.timestamp)}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Sidebar Column: Quick Shortcuts & Platform Status */}
        <aside
          className="admin-dashboard__sidebar-col"
          aria-label="Quick Actions and Platform Config"
        >
          {/* Quick Actions Card */}
          <div className="admin-dashboard__section-card">
            <h2 className="admin-dashboard__card-title">Quick Actions</h2>
            <div className="admin-shortcuts-grid">
              <Link to={ROUTES.ADMIN.APPS} className="admin-shortcut-btn">
                <Package size={16} aria-hidden="true" />
                <span>Manage Apps</span>
              </Link>
              <Link to={ROUTES.ADMIN.BLOG_NEW} className="admin-shortcut-btn">
                <FileText size={16} aria-hidden="true" />
                <span>Write Blog</span>
              </Link>
              <Link to={ROUTES.ADMIN.CATEGORIES} className="admin-shortcut-btn">
                <FolderTree size={16} aria-hidden="true" />
                <span>Taxonomy</span>
              </Link>
              <Link to={ROUTES.ADMIN.THEME} className="admin-shortcut-btn">
                <TrendingUp size={16} aria-hidden="true" />
                <span>Theme Config</span>
              </Link>
            </div>
          </div>

          {/* System Environment Card */}
          <div className="admin-dashboard__section-card">
            <h2 className="admin-dashboard__card-title">Publisher Architecture</h2>
            <div className="admin-status-list">
              <div className="admin-status-item">
                <span className="admin-status-label">Environment</span>
                <Badge variant="mono" size="sm">
                  Production Ready
                </Badge>
              </div>
              <div className="admin-status-item">
                <span className="admin-status-label">Database</span>
                <span className="admin-status-value">Cloud Firestore</span>
              </div>
              <div className="admin-status-item">
                <span className="admin-status-label">Authorization</span>
                <span className="admin-status-value">Role: ADMIN</span>
              </div>
              <div className="admin-status-item">
                <span className="admin-status-label">Architecture</span>
                <span className="admin-status-value">Single Publisher</span>
              </div>
            </div>
          </div>

          {/* System Health Diagnostics Card */}
          <AdminHealthCard />
        </aside>
      </div>
    </div>
  );
};
