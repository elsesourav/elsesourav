'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

interface HeaderNotificationBellProps {
  initialUnreadCount?: number;
}

export function HeaderNotificationBell({ initialUnreadCount = 0 }: HeaderNotificationBellProps) {
  const pathname = usePathname();
  const [unreadCount] = React.useState(initialUnreadCount);
  const isActive = pathname === '/notifications' || pathname.startsWith('/notifications/');

  return (
    <Link
      href="/notifications"
      className={`relative flex items-center justify-center h-10 w-10 min-h-[40px] min-w-[40px] rounded-xl transition-all duration-150 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 ${
        isActive
          ? 'bg-accent text-foreground font-semibold shadow-inner'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
      }`}
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
      aria-current={isActive ? 'page' : undefined}
    >
      <Bell className="w-4 h-4" />

      {unreadCount > 0 && (
        <span
          className="absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background"
          aria-hidden="true"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
