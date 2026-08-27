import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Bookmark,
  Shield,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { getSafeRedirectUrl } from '@/utils/redirect';
import { Badge, Skeleton } from '@/components/ui';
import type { Notification, NotificationType } from '@/types/notification.types';
import './NotificationCenter.css';

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'APP_UPDATE':
      return <Sparkles size={15} aria-hidden="true" />;
    case 'SUPPORT_REPLY':
      return <MessageSquare size={15} aria-hidden="true" />;
    case 'SUPPORT_STATUS_CHANGE':
      return <RefreshCw size={15} aria-hidden="true" />;
    case 'LIBRARY_UPDATE':
      return <Bookmark size={15} aria-hidden="true" />;
    case 'ACCOUNT':
      return <Shield size={15} aria-hidden="true" />;
    case 'SYSTEM':
    default:
      return <Bell size={15} aria-hidden="true" />;
  }
}

function getNotificationIconClass(type: NotificationType): string {
  switch (type) {
    case 'APP_UPDATE':
      return 'notification-item__icon--app';
    case 'SUPPORT_REPLY':
      return 'notification-item__icon--support';
    case 'SUPPORT_STATUS_CHANGE':
      return 'notification-item__icon--status';
    case 'LIBRARY_UPDATE':
      return 'notification-item__icon--library';
    case 'ACCOUNT':
      return 'notification-item__icon--account';
    case 'SYSTEM':
    default:
      return 'notification-item__icon--system';
  }
}

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, refetch } =
    useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read && !notif.isRead) {
      void markAsRead(notif.id);
    }

    setIsOpen(false);

    const destination = notif.link || notif.linkUrl;
    if (destination) {
      const safeUrl = getSafeRedirectUrl(destination, '');
      if (safeUrl) {
        navigate(safeUrl);
      }
    }
  };

  return (
    <div className="notification-center" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        className={`notification-bell-btn ${isOpen ? 'notification-bell-btn--active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notification-badge-count" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="notification-dropdown" role="region" aria-label="Notifications list">
          {/* Header */}
          <div className="notification-header">
            <div className="notification-header__title-row">
              <h3 className="notification-header__title">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="accent" size="sm">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            <button
              type="button"
              className="notification-mark-all-btn"
              onClick={() => void markAllAsRead()}
              disabled={unreadCount === 0}
              aria-label="Mark all notifications as read"
            >
              <CheckCheck size={14} aria-hidden="true" />
              <span>Mark all read</span>
            </button>
          </div>

          {/* Body List */}
          <div className="notification-list" role="feed" aria-busy={isLoading}>
            {isLoading ? (
              <>
                <div className="notification-skeleton-row">
                  <Skeleton variant="rounded" width="32px" height="32px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height="14px" className="mb-1" />
                    <Skeleton variant="text" width="90%" height="12px" />
                  </div>
                </div>
                <div className="notification-skeleton-row">
                  <Skeleton variant="rounded" width="32px" height="32px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height="14px" className="mb-1" />
                    <Skeleton variant="text" width="80%" height="12px" />
                  </div>
                </div>
                <div className="notification-skeleton-row">
                  <Skeleton variant="rounded" width="32px" height="32px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height="14px" className="mb-1" />
                    <Skeleton variant="text" width="85%" height="12px" />
                  </div>
                </div>
              </>
            ) : error ? (
              <div className="notification-empty-state" role="alert">
                <AlertCircle size={24} color="var(--color-error-400)" aria-hidden="true" />
                <p>Failed to load notifications.</p>
                <button
                  type="button"
                  className="notification-mark-all-btn"
                  onClick={() => void refetch()}
                  style={{ color: 'var(--color-primary-400)' }}
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty-state">
                <Inbox size={28} aria-hidden="true" />
                <p>No notifications yet</p>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  We’ll notify you of app updates and ticket replies here.
                </span>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read && !notif.isRead;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    className={`notification-item ${isUnread ? 'notification-item--unread' : ''}`}
                    onClick={() => void handleNotificationClick(notif)}
                    aria-label={`${notif.title}: ${notif.message}`}
                  >
                    <div
                      className={`notification-item__icon ${getNotificationIconClass(notif.type)}`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="notification-item__content">
                      <div className="notification-item__header">
                        <h4 className="notification-item__title">{notif.title}</h4>
                        <span className="notification-item__time">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="notification-item__msg">{notif.message}</p>
                    </div>

                    {isUnread && <span className="notification-item__dot" aria-hidden="true" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
