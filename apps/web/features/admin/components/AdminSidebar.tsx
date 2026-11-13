'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@elsesourav/ui';
import type { AdminContext } from '@elsesourav/types';
import {
  Activity,
  BookOpen,
  FileText,
  GalleryHorizontalEnd,
  Image,
  LifeBuoy,
  Package,
  Shield,
  Sliders,
  Users,
} from 'lucide-react';

interface AdminSidebarProps {
  context: AdminContext;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Activity, exact: true },
  { href: '/admin/apps', label: 'Applications', icon: Package },
  { href: '/admin/carousel', label: 'Hero Carousel', icon: GalleryHorizontalEnd },
  { href: '/admin/updates', label: 'Updates CMS', icon: FileText },
  { href: '/admin/help', label: 'Help Articles', icon: BookOpen },
  { href: '/admin/support', label: 'Support Queue', icon: LifeBuoy },
  { href: '/admin/users', label: 'User Directory', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/settings', label: 'Portal Config', icon: Sliders },
  { href: '/admin/audit', label: 'Audit Trail', icon: Shield },
];

export function AdminSidebar({ context }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact?: boolean): boolean => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Admin Navigation Sidebar"
      className="hidden lg:flex w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 flex-col shrink-0 sticky top-0 h-screen overflow-y-auto"
    >
      <div className="space-y-6">
        {/* User Identity Header: Name & Gmail on left, Admin on right */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase shrink-0">
              {context.displayName ? context.displayName.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {context.displayName}
              </div>
              <div
                className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[125px]"
                title={context.email}
              >
                {context.email}
              </div>
            </div>
          </div>
          <Badge variant="warning" className="text-[9px] px-1.5 py-0.5 font-mono uppercase shrink-0">
            {context.role}
          </Badge>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 text-xs font-medium" aria-label="Desktop Admin Navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isLinkActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
