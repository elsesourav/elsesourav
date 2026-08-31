'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  LifeBuoy,
  Menu,
  ChevronDown,
  X,
} from 'lucide-react';

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
    label: 'Account & Security',
    href: '/settings?tab=account',
    icon: ShieldCheck,
    isActive: (pathname, tab) =>
      pathname === '/settings' &&
      (tab === 'account' || tab === 'security' || tab === 'danger'),
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  // Determine current active item for mobile header label
  const activeItem: NavItem =
    NAV_ITEMS.find((item) => item.isActive(pathname, currentTab)) ?? NAV_ITEMS[0]!;
  const ActiveIcon = activeItem.icon;

  // Close mobile menu on route or tab change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, currentTab]);

  // Click outside to close mobile dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* 1. Mobile & Small Devices Section Menu Button (visible on < lg screens) */}
      <div className="lg:hidden w-full relative z-30" ref={mobileMenuRef}>
        <div className="flex items-center justify-between p-2.5 rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ActiveIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">{activeItem.label}</span>
              <span className="text-[10px] text-muted-foreground">Account Navigation</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-accent text-foreground text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <>
                <X className="w-3.5 h-3.5 text-primary" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Menu className="w-3.5 h-3.5 text-primary" />
                <span>Menu</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Options List */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 p-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(pathname, currentTab);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
        )}
      </div>

      {/* 2. Desktop Sticky Sidebar (visible on lg+ screens) */}
      <aside className="w-56 shrink-0 hidden lg:block sticky top-[4.5rem] self-start h-[calc(100vh-4rem-3rem)]">
        <nav className="rounded-2xl border border-border/80 bg-card text-card-foreground p-1.5 space-y-1 shadow-sm h-full flex flex-col">
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
    </>
  );
}
