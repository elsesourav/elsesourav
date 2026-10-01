'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  User,
  SlidersHorizontal,
  ShieldCheck,
  LifeBuoy,
  Menu,
  ChevronDown,
  X,
  LogOut,
} from 'lucide-react';
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
    label: 'Profile',
    href: '/profile',
    icon: User,
    isActive: (pathname) => pathname === '/profile' || pathname === '/dashboard',
  },
  {
    label: 'Account',
    href: '/settings?tab=profile',
    icon: SlidersHorizontal,
    isActive: (pathname, tab) => pathname === '/settings' && (!tab || tab === 'profile'),
  },
  {
    label: 'Security',
    href: '/settings?tab=account',
    icon: ShieldCheck,
    isActive: (pathname, tab) =>
      pathname === '/settings' && (tab === 'account' || tab === 'security' || tab === 'danger'),
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
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
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

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
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
              <span className="text-[10px] text-muted-foreground">Navigation</span>
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

            <div className="pt-1.5 mt-1 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all cursor-pointer text-left group"
              >
                <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Desktop Sticky Sidebar (visible on lg+ screens) */}
      <aside className="w-56 shrink-0 hidden lg:block sticky top-[5.5rem] self-start h-[calc(100dvh-7rem)]">
        <nav className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card text-card-foreground p-2.5 shadow-sm flex flex-col justify-between h-full overflow-y-auto overscroll-contain">
          <div className="space-y-1">
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
          </div>

          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all cursor-pointer group"
            >
              <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              <span>Sign Out</span>
            </button>
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
