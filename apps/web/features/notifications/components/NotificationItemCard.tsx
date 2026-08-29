'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@elsesourav/ui';
import type { NotificationItem, NotificationType } from '@elsesourav/types';
import {
  markNotificationAsReadAction,
  deleteNotificationAction,
} from '../actions/notification-actions';
import {
  Bell,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  User,
  Info,
  Check,
  Trash2,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface NotificationItemCardProps {
  notification: NotificationItem;
  onReadChanged?: (id: string) => void;
  onDeleted?: (id: string) => void;
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'SUPPORT_REPLY':
    case 'SUPPORT_STATUS_CHANGE':
    case 'support_reply':
      return <MessageSquare className="w-4 h-4 text-sky-400" />;
    case 'APP_UPDATE':
    case 'app_release':
      return <Sparkles className="w-4 h-4 text-amber-400" />;
    case 'SECURITY':
    case 'security_alert':
      return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    case 'ACCOUNT':
      return <User className="w-4 h-4 text-indigo-400" />;
    default:
      return <Info className="w-4 h-4 text-purple-400" />;
  }
}

export function NotificationItemCard({
  notification,
  onReadChanged,
  onDeleted,
}: NotificationItemCardProps) {
  const [isRead, setIsRead] = React.useState(notification.isRead);
  const [isPending, setIsPending] = React.useState(false);
  const [isDeleted, setIsDeleted] = React.useState(false);

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRead || isPending) return;

    setIsPending(true);
    setIsRead(true);

    try {
      await markNotificationAsReadAction(notification.id);
      onReadChanged?.(notification.id);
    } catch {
      // Non-blocking
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    setIsPending(true);
    setIsDeleted(true);

    try {
      await deleteNotificationAction(notification.id);
      onDeleted?.(notification.id);
    } catch {
      setIsDeleted(false);
    } finally {
      setIsPending(false);
    }
  };

  if (isDeleted) return null;

  const formattedDate = new Date(notification.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cardContent = (
    <Card
      className={`p-5 rounded-2xl border transition-all ${
        !isRead
          ? 'border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/30'
          : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Type Icon Badge */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            !isRead
              ? 'bg-indigo-900/40 border-indigo-500/40 shadow-sm'
              : 'bg-zinc-800/60 border-zinc-700/60'
          }`}
        >
          {getTypeIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm truncate">
                {notification.title}
              </h4>
              {!isRead && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" aria-label="Unread" />
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {!isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={isPending}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-emerald-400"
                  aria-label="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-400"
                aria-label="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {notification.message}
          </p>

          <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-600" />
              <span>{formattedDate}</span>
            </div>

            {notification.linkUrl && (
              <span className="text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5">
                <span>View details</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (notification.linkUrl) {
    return (
      <Link href={notification.linkUrl} className="block group">
        {cardContent}
      </Link>
    );
  }

  return <div>{cardContent}</div>;
}
