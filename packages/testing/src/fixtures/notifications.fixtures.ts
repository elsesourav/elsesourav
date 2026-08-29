import type { NotificationItem } from '@elsesourav/types';

export const fixtureNotificationUnreadAppRelease: NotificationItem = {
  id: 'notif-1',
  userId: 'usr-standard-1',
  type: 'APP_UPDATE',
  title: 'Terminal Pro v2.1.0 Released',
  message: 'WebGPU acceleration and multiplexed split panes are now available in your terminal emulator.',
  linkUrl: '/apps/terminal-pro',
  isRead: false,
  createdAt: 1704067200000,
};

export const fixtureNotificationUnreadTicketReply: NotificationItem = {
  id: 'notif-2',
  userId: 'usr-standard-1',
  type: 'SUPPORT_REPLY',
  title: 'Staff Replied to Ticket #TICK-2026-0001',
  message: 'Jordan Taylor replied to your ticket regarding WebSocket handshake drops.',
  linkUrl: '/support/tickets/tick-open-1',
  isRead: false,
  createdAt: 1704070800000,
};

export const fixtureNotificationReadBlog: NotificationItem = {
  id: 'notif-3',
  userId: 'usr-standard-1',
  type: 'SYSTEM',
  title: 'New Article: Architecture Insights',
  message: 'Explore our latest deep-dive on Next.js 15 App Router migration and domain modeling.',
  linkUrl: '/blog/architecture-insights',
  isRead: true,
  createdAt: 1704060000000,
};

export const fixtureNotificationReadSystem: NotificationItem = {
  id: 'notif-4',
  userId: 'usr-standard-1',
  type: 'SYSTEM',
  title: 'Welcome to ElseSourav',
  message: 'Your developer account has been provisioned with standard privileges.',
  linkUrl: '/dashboard',
  isRead: true,
  createdAt: 1704000000000,
};

export const fixtureNotificationsList: readonly NotificationItem[] = [
  fixtureNotificationUnreadAppRelease,
  fixtureNotificationUnreadTicketReply,
  fixtureNotificationReadBlog,
  fixtureNotificationReadSystem,
];
