'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@elsesourav/ui';
import type { NotificationItem } from '@elsesourav/types';
import { NotificationItemCard } from './NotificationItemCard';
import { markAllNotificationsAsReadAction } from '../actions/notification-actions';
import { Bell, CheckCheck, Inbox, Loader2 } from 'lucide-react';

interface NotificationListProps {
  initialNotifications: readonly NotificationItem[];
  initialUnreadCount: number;
}

export function NotificationList({
  initialNotifications,
  initialUnreadCount,
}: NotificationListProps) {
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleReadChanged = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleDeleted = (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    if (isMarkingAll || unreadCount === 0) return;

    setIsMarkingAll(true);
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsReadAction();
    } catch {
      // Non-blocking
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'unread'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
          >
            {isMarkingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <Card className="py-16 px-4 text-center rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100">No notifications</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              {filter === 'unread'
                ? "You've read all your notifications! Nice and clean."
                : "You don't have any notifications right now."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItemCard
              key={notification.id}
              notification={notification}
              onReadChanged={handleReadChanged}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
