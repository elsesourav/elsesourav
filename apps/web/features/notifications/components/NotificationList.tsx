'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Button } from '@elsesourav/ui';
import type { NotificationItem } from '@elsesourav/types';
import { NotificationItemCard } from './NotificationItemCard';
import { markAllNotificationsAsReadAction } from '../actions/notification-actions';
import { CheckCheck, Inbox, Loader2 } from 'lucide-react';

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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
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
      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="inline-flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border text-xs">
          <Button
            type="button"
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => setFilter('all')}
            className={`rounded-lg ${filter === 'all' ? 'shadow-sm font-semibold' : ''}`}
          >
            All ({notifications.length})
          </Button>
          <Button
            type="button"
            variant={filter === 'unread' ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => setFilter('unread')}
            className={`rounded-lg ${filter === 'unread' ? 'shadow-sm font-semibold' : ''}`}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="xs"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            loading={isMarkingAll}
            loadingText="Marking all read..."
            leftIcon={<CheckCheck className="w-3.5 h-3.5 text-primary" />}
            className="rounded-xl"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl py-14 px-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-sm">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground">No notifications</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {filter === 'unread'
                ? "You've read all your notifications! Nice and clean."
                : "You don't have any unread notifications right now."}
            </p>
          </div>
          <div className="pt-1">
            <Link href="/account?tab=settings">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border hover:bg-accent text-foreground rounded-xl px-4 py-2 cursor-pointer"
              >
                <span>Adjust Notification Channels</span>
              </Button>
            </Link>
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
