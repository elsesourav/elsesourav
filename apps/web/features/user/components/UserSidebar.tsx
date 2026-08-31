'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, User, UserCheck, Lock, LifeBuoy } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string, tab: string | null) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/profile',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/profile' || pathname === '/dashboard',
  },
  {
    label: 'Profile',
    href: '/settings?tab=profile',
    icon: User,
    isActive: (pathname, tab) => pathname === '/settings' && (!tab || tab === 'profile'),
  },
  {
    label: 'Account',
    href: '/settings?tab=account',
    icon: UserCheck,
    isActive: (pathname, tab) => pathname === '/settings' && tab === 'account',
  },
  {
    label: 'Password & Security',
    href: '/settings?tab=security',
    icon: Lock,
    isActive: (pathname, tab) =>
      pathname === '/settings' && (tab === 'security' || tab === 'danger'),
  },
  {
    label: 'Help & Support',
    href: '/support/tickets',
    icon: LifeBuoy,
    isActive: (pathname) => pathname.startsWith('/support'),
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  return (
    <aside className="w-56 shrink-0 hidden lg:block sticky top-24 self-start">
      <nav className="rounded-2xl border border-border/80 bg-card text-card-foreground p-2 space-y-1 shadow-sm">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname, currentTab);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
