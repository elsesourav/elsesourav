'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, User, Lock, Sliders, LifeBuoy, Bell } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchExact?: boolean;
  matchPrefix?: string;
  matchPath?: string;
  matchTab?: (string | null)[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/profile', icon: LayoutDashboard, matchExact: true },
  { label: 'Account & Profile', href: '/settings?tab=profile', icon: User, matchPath: '/settings', matchTab: ['profile', null] },
  { label: 'Password & Security', href: '/settings?tab=security', icon: Lock, matchPath: '/settings', matchTab: ['security'] },
  { label: 'Preferences', href: '/settings?tab=preferences', icon: Sliders, matchPath: '/settings', matchTab: ['preferences'] },
  { label: 'Support Tickets', href: '/support/tickets', icon: LifeBuoy, matchPrefix: '/support' },
  { label: 'Notifications', href: '/notifications', icon: Bell, matchExact: true },
];

export function UserSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const isActive = (item: NavItem) => {
    if (item.matchExact) {
      return pathname === item.href.split('?')[0];
    }
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    if (item.matchPath && item.matchTab) {
      if (pathname !== item.matchPath) return false;
      return item.matchTab.includes(currentTab);
    }
    return false;
  };

  return (
    <aside className="w-56 shrink-0 hidden lg:block sticky top-24 self-start">
      <nav className="card-obsidian-glass p-2.5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                active
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/35 shadow-neon-glow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
