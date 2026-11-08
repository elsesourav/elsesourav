'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { User, SlidersHorizontal, ShieldCheck, LifeBuoy, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@elsesourav/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string, tab: string | null) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Account',
    href: '/account',
    icon: User,
    isActive: (pathname, tab) =>
      (pathname === '/account' && (!tab || tab === 'overview')) ||
      pathname === '/profile' ||
      pathname === '/dashboard',
  },
  {
    label: 'Settings',
    href: '/account?tab=settings',
    icon: SlidersHorizontal,
    isActive: (pathname, tab) =>
      (pathname === '/account' && (tab === 'settings' || tab === 'profile')) ||
      (pathname === '/settings' && (!tab || tab === 'profile' || tab === 'settings')),
  },
  {
    label: 'Security',
    href: '/account?tab=security',
    icon: ShieldCheck,
    isActive: (pathname, tab) =>
      (pathname === '/account' &&
        (tab === 'security' || tab === 'account' || tab === 'danger')) ||
      (pathname === '/settings' &&
        (tab === 'account' || tab === 'security' || tab === 'danger')),
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
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  return (
    <>
      {/* 1. Mobile (< sm): 2-Layer Grid (compact, minimal border & margin) */}
      <nav
        data-section="account-nav"
        className="sm:hidden w-full p-1 rounded-xl border border-border/50 bg-card/90 text-card-foreground shadow-xs"
        aria-label="Account Settings Navigation"
      >
        <div className="grid grid-cols-2 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname, currentTab);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 2. Tablet (sm to < lg): One line, centered, no extra space, no logout button */}
      <div data-section="account-nav" className="hidden sm:flex lg:hidden w-full justify-center">
        <nav
          className="inline-flex items-center justify-center gap-1.5 p-1.5 rounded-2xl border border-border/70 bg-card/90 text-card-foreground shadow-xs"
          aria-label="Account Settings Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname, currentTab);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/25 shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Desktop Sidebar (visible on lg+ screens): in flow, fills height, with Sign Out */}
      <aside data-section="account-nav" className="w-56 shrink-0 hidden lg:block h-full">
        <nav className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card text-card-foreground p-2.5 shadow-sm flex flex-col justify-between h-full overflow-y-auto overscroll-contain">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(pathname, currentTab);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
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
          </div>

          <div className="pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowLogoutModal(true)}
              leftIcon={<LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />}
              className="w-full justify-start gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all cursor-pointer group"
            >
              <span>Sign Out</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* 3. Accessible Logout Confirmation Dialog */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent onClose={() => setShowLogoutModal(false)} className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
              <LogOut className="w-5 h-5" />
            </div>
            <DialogTitle>Sign out of ElseSourav?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end your active session? You will need to sign in again to
              access your account and security settings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
              className="w-full sm:w-auto rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <form action="/api/auth/logout" method="POST" className="w-full sm:w-auto">
              <Button
                type="submit"
                variant="danger"
                className="w-full sm:w-auto rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Sign Out</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
