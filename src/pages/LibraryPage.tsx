import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  LifeBuoy,
  Bell,
  Settings,
  Sliders,
  LogOut,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Shield,
  Layers,
  AlertCircle,
  Inbox,
  Trash2,
} from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components/ui';
import { AppCard } from '@/components/apps/AppCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { useNotifications } from '@/hooks/useNotifications';
import { supportService } from '@/services/support.service';
import { getSafeRedirectUrl } from '@/utils/redirect';
import { ROUTES } from '@/constants/routes';
import type { SupportTicket, SupportTicketStatus } from '@/types/support.types';
import { isOk } from '@/lib/result';
import './LibraryPage.css';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, authUser, isLoading: isAuthLoading, signOut } = useAuth();
  const { libraryItems, libraryCount, isLoading: isLibraryLoading, removeApp } = useUserLibrary();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState<boolean>(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const userId = user?.id || authUser?.uid || '';
  const displayName =
    user?.displayName || authUser?.displayName || authUser?.email?.split('@')[0] || 'User';
  const email = user?.email || authUser?.email || '';
  const emailVerified = authUser?.emailVerified ?? false;

  // SEO & Robots
  useEffect(() => {
    document.title = 'My Software Library | ElseSourav';

    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !metaTag;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
    }
    const previousContent = metaTag.content;
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (created && metaTag && metaTag.parentNode) {
        metaTag.parentNode.removeChild(metaTag);
      } else if (metaTag) {
        metaTag.content = previousContent || '';
      }
    };
  }, []);

  // Fetch support tickets summary
  useEffect(() => {
    if (!userId) {
      setTickets([]);
      setIsTicketsLoading(false);
      return;
    }

    let isMounted = true;
    setIsTicketsLoading(true);
    setTicketsError(null);

    const userContext = {
      id: userId,
      email: user?.email,
      name: user?.displayName,
      role: user?.role || 'user',
    };

    supportService
      .listUserTickets(userId, userContext, { limit: 5 })
      .then((res) => {
        if (!isMounted) return;
        if (isOk(res)) {
          setTickets([...res.data.items]);
        } else {
          setTicketsError(res.error.message);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setTicketsError(err instanceof Error ? err.message : 'Failed to load tickets');
      })
      .finally(() => {
        if (isMounted) {
          setIsTicketsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, user?.email, user?.displayName, user?.role]);

  // Compute open tickets count
  const openTicketCount = useMemo(() => {
    const openStatuses: SupportTicketStatus[] = ['open', 'in_progress', 'waiting_for_user'];
    return tickets.filter((t) => openStatuses.includes(t.status)).length;
  }, [tickets]);

  // Initials for avatar
  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [displayName]);

  // Status badge variant mapper
  const getTicketStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="warning" size="sm">
            Open
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="accent" size="sm">
            In Progress
          </Badge>
        );
      case 'waiting_for_user':
        return (
          <Badge variant="warning" size="sm">
            Awaiting Reply
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="success" size="sm">
            Resolved
          </Badge>
        );
      case 'closed':
      default:
        return (
          <Badge variant="default" size="sm">
            Closed
          </Badge>
        );
    }
  };

  const handleNotificationClick = (notifId: string, link?: string, linkUrl?: string) => {
    void markAsRead(notifId);
    const destination = link || linkUrl;
    if (destination) {
      const safeUrl = getSafeRedirectUrl(destination, '');
      if (safeUrl) {
        navigate(safeUrl);
      }
    }
  };

  if (isAuthLoading) {
    return (
      <main className="library-dashboard" aria-busy="true">
        <div className="library-welcome-card">
          <div className="library-welcome-left">
            <Skeleton variant="rounded" width="64px" height="64px" />
            <div>
              <Skeleton variant="text" width="220px" height="32px" className="mb-2" />
              <Skeleton variant="text" width="180px" height="18px" />
            </div>
          </div>
        </div>
        <div className="library-stats-grid">
          <Skeleton variant="rounded" width="100%" height="80px" />
          <Skeleton variant="rounded" width="100%" height="80px" />
          <Skeleton variant="rounded" width="100%" height="80px" />
        </div>
      </main>
    );
  }

  return (
    <main className="library-dashboard" aria-labelledby="library-dashboard-heading">
      {/* 1. Welcome / Account Header Card */}
      <header className="library-welcome-card">
        <div className="library-welcome-left">
          {user?.photoUrl || authUser?.photoURL ? (
            <img
              src={user?.photoUrl || authUser?.photoURL || ''}
              alt={displayName}
              className="library-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="library-avatar" aria-hidden="true">
              {initials}
            </div>
          )}

          <div>
            <div className="library-welcome-title-row">
              <h1 id="library-dashboard-heading" className="library-welcome-title">
                My Software Library
              </h1>
              {emailVerified ? (
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="library-welcome-email">
              Welcome back, {displayName} • {email}
            </p>
            <span className="library-welcome-meta">
              Member since{' '}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="library-welcome-actions">
          <Link to={ROUTES.SETTINGS}>
            <Button variant="secondary" size="sm" leftIcon={<Settings size={15} />}>
              Settings
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut().then(() => navigate(ROUTES.HOME))}
            leftIcon={<LogOut size={15} />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Quick Account Metrics Row */}
      <section className="library-stats-grid" aria-label="Account statistics">
        <div className="library-stat-card">
          <div className="library-stat-icon library-stat-icon--apps">
            <Bookmark size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="library-stat-value">{libraryCount}</p>
            <p className="library-stat-label">Saved Applications</p>
          </div>
        </div>

        <div className="library-stat-card">
          <div className="library-stat-icon library-stat-icon--tickets">
            <LifeBuoy size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="library-stat-value">{openTicketCount}</p>
            <p className="library-stat-label">Open Support Tickets</p>
          </div>
        </div>

        <div className="library-stat-card">
          <div className="library-stat-icon library-stat-icon--notifs">
            <Bell size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="library-stat-value">{unreadCount}</p>
            <p className="library-stat-label">Unread Notifications</p>
          </div>
        </div>
      </section>

      {/* Main Two-Column Dashboard Layout */}
      <div className="library-main-layout">
        {/* Left Column: Saved Apps & Recent Updates */}
        <div className="library-primary-column">
          {/* Saved Applications Section */}
          <section aria-labelledby="saved-apps-heading">
            <div className="library-section-header">
              <div className="library-section-title-group">
                <h2 id="saved-apps-heading" className="library-section-title">
                  My Saved Software
                </h2>
                <Badge variant="mono" size="sm">
                  {libraryCount}
                </Badge>
              </div>

              {libraryItems.length > 0 && (
                <Link to={ROUTES.APPS} style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                    Explore More Apps
                  </Button>
                </Link>
              )}
            </div>

            {isLibraryLoading ? (
              <div className="library-apps-grid" aria-busy="true">
                <Skeleton variant="rounded" width="100%" height="240px" />
                <Skeleton variant="rounded" width="100%" height="240px" />
                <Skeleton variant="rounded" width="100%" height="240px" />
              </div>
            ) : libraryItems.length === 0 ? (
              <div className="library-empty-card" role="region" aria-label="Empty library">
                <div className="library-empty-icon">
                  <Bookmark size={28} aria-hidden="true" />
                </div>
                <h3 className="library-empty-title">Save apps you want to come back to</h3>
                <p className="library-empty-desc">
                  Your personal library is empty. Bookmark web applications, developer utilities,
                  and tools from our catalog to launch them instantly from this dashboard.
                </p>
                <Link to={ROUTES.APPS}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight size={15} />}>
                    Explore Software Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="library-apps-grid">
                {libraryItems.map((item) => {
                  if (item.isUnavailable || !item.app) {
                    return (
                      <article
                        key={item.libraryItem.id}
                        className="library-archived-card"
                        aria-label="Unavailable or archived software bookmark"
                      >
                        <div className="library-archived-card__top">
                          <div className="library-archived-card__icon">
                            <Layers size={20} aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="library-archived-card__title">
                              {item.app?.name || 'Archived Software'}
                            </h3>
                            <p className="library-archived-card__desc">
                              This application is currently archived or no longer publicly listed.
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Badge variant="default" size="sm">
                            Archived
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void removeApp(item.libraryItem.appId)}
                            leftIcon={<Trash2 size={13} />}
                            aria-label="Remove archived app from library"
                          >
                            Remove
                          </Button>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <AppCard
                      key={item.libraryItem.id}
                      app={item.app}
                      isUnavailable={item.isUnavailable}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Support, Notifications, Quick Actions */}
        <aside className="library-secondary-column" aria-label="Dashboard summaries and shortcuts">
          {/* Support Ticket Summary Widget */}
          <section className="library-widget-card" aria-labelledby="widget-support-heading">
            <div className="library-widget-header">
              <h3 id="widget-support-heading" className="library-widget-title">
                <LifeBuoy size={16} color="#38bdf8" aria-hidden="true" />
                Support & Tickets
              </h3>
              <Link to={ROUTES.SUPPORT_TICKETS} style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" style={{ padding: '2px 6px', fontSize: '11px' }}>
                  View All
                </Button>
              </Link>
            </div>

            {isTicketsLoading ? (
              <div className="library-widget-list" aria-busy="true">
                <Skeleton variant="rounded" width="100%" height="48px" />
                <Skeleton variant="rounded" width="100%" height="48px" />
              </div>
            ) : ticketsError ? (
              <div className="library-empty-state" style={{ padding: 'var(--space-4) 0' }}>
                <AlertCircle size={20} color="var(--color-error-400)" aria-hidden="true" />
                <p style={{ fontSize: '12px' }}>Could not load ticket summary</p>
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    margin: '0 0 var(--space-3) 0',
                  }}
                >
                  No support tickets open.
                </p>
                <Link to={ROUTES.SUPPORT}>
                  <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                    Contact Support
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="library-widget-list">
                {tickets.slice(0, 3).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={ROUTES.SUPPORT_TICKET_DETAIL.replace(':ticketId', ticket.id)}
                    className="library-ticket-item"
                  >
                    <div>
                      <h4 className="library-ticket-item__title">{ticket.subject}</h4>
                      <span className="library-ticket-item__date">
                        {ticket.ticketNumber || `#${ticket.id.substring(0, 6)}`} •{' '}
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {getTicketStatusBadge(ticket.status)}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Notifications Summary Widget */}
          <section className="library-widget-card" aria-labelledby="widget-notifs-heading">
            <div className="library-widget-header">
              <h3 id="widget-notifs-heading" className="library-widget-title">
                <Bell size={16} color="#f59e0b" aria-hidden="true" />
                Recent Alerts
              </h3>
              {unreadCount > 0 && (
                <Badge variant="accent" size="sm">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                <Inbox
                  size={22}
                  color="var(--color-text-muted)"
                  aria-hidden="true"
                  style={{ margin: '0 auto var(--space-1) auto' }}
                />
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  You are all caught up!
                </p>
              </div>
            ) : (
              <div className="library-widget-list">
                {notifications.slice(0, 3).map((notif) => {
                  const isUnread = !notif.read && !notif.isRead;
                  return (
                    <button
                      key={notif.id}
                      type="button"
                      className={`library-ticket-item ${isUnread ? 'notification-item--unread' : ''}`}
                      onClick={() => handleNotificationClick(notif.id, notif.link, notif.linkUrl)}
                      style={{
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 className="library-ticket-item__title" style={{ maxWidth: '100%' }}>
                          {notif.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notif.message}
                        </p>
                      </div>
                      {isUnread && <span className="notification-item__dot" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Platform Actions */}
          <section className="library-widget-card" aria-labelledby="widget-actions-heading">
            <div className="library-widget-header">
              <h3 id="widget-actions-heading" className="library-widget-title">
                <Sparkles size={16} color="var(--color-primary-400)" aria-hidden="true" />
                Quick Actions
              </h3>
            </div>

            <div className="library-quick-actions">
              <Link to={ROUTES.SETTINGS_PROFILE} className="library-quick-action-btn">
                <Shield size={14} />
                <span>My Profile</span>
              </Link>
              <Link to={ROUTES.SETTINGS_PREFERENCES} className="library-quick-action-btn">
                <Sliders size={14} />
                <span>Preferences</span>
              </Link>
              <Link to={ROUTES.HELP} className="library-quick-action-btn">
                <HelpCircle size={14} />
                <span>Help Center</span>
              </Link>
              <Link to={ROUTES.APPS} className="library-quick-action-btn">
                <Layers size={14} />
                <span>Browse Apps</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};
