'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Home, Layers, Sparkles, Info, Shield } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';
import type { AuthenticatedUser } from '@elsesourav/auth';

export interface MobileBottomNavProps {
  user?: AuthenticatedUser | null;
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);

  // Reciprocal scroll tracking:
  // - Top of page (scrollY <= 48): Hidden (top header is visible)
  // - Scroll down: Visible (slides up smoothly)
  // - Scroll up: Hidden (slides down smoothly, revealing top header)
  // - Reached bottom of page: Visible
  React.useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const evaluateScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const isAtBottom = maxScroll > 0 && currentScrollY >= maxScroll - 40;
      const isAtTop = currentScrollY <= 48;

      if (isAtTop) {
        setIsVisible(false);
      } else if (isAtBottom) {
        setIsVisible(true);
      } else {
        const delta = currentScrollY - lastScrollY;
        if (delta > 8) {
          // Scrolling down -> show bottom navigation
          setIsVisible(true);
        } else if (delta < -8) {
          // Scrolling up -> hide bottom navigation
          setIsVisible(false);
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(evaluateScroll);
        ticking = true;
      }
    };

    evaluateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      href: ROUTES.HOME,
      label: 'Home',
      icon: Home,
      isActive: pathname === ROUTES.HOME,
    },
    {
      href: ROUTES.APPS,
      label: 'Apps',
      icon: Layers,
      isActive: pathname === ROUTES.APPS || pathname.startsWith(`${ROUTES.APPS}/`),
    },
    {
      href: ROUTES.UPDATES,
      label: 'Updates',
      icon: Sparkles,
      isActive:
        pathname === ROUTES.UPDATES || pathname.startsWith(`${ROUTES.UPDATES}/`),
    },
    {
      href: ROUTES.ABOUT,
      label: 'About',
      icon: Info,
      isActive: pathname === ROUTES.ABOUT,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('elsesourav:about-activate'));
      },
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            href: ROUTES.ADMIN.ROOT,
            label: 'Admin',
            icon: Shield,
            isActive: pathname.startsWith('/admin'),
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          role="navigation"
          aria-label="Mobile bottom navigation"
          initial={reduced ? { opacity: 0 } : { y: '100%' }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: '100%' }}
          transition={
            reduced
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 360, damping: 32, mass: 0.8 }
          }
          className="fixed bottom-0 inset-x-0 z-40 w-full md:hidden border-t border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/92 dark:bg-[#0c0c10]/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,0px)]"
        >
          <div className="w-full h-15 max-w-lg mx-auto flex items-center justify-around px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.onClick}
                  aria-current={item.isActive ? 'page' : undefined}
                  className="relative flex-1 flex flex-col items-center justify-center h-14 select-none outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-xl transition-colors group"
                >
                  {item.isActive && (
                    <motion.span
                      layoutId="mobile-bottom-nav-active-indicator"
                      className="absolute inset-x-1 sm:inset-x-2 inset-y-1 rounded-xl bg-gradient-to-b from-indigo-500/15 via-indigo-500/20 to-indigo-600/25 dark:from-indigo-500/25 dark:via-indigo-500/30 dark:to-indigo-600/35 border border-indigo-500/30 dark:border-indigo-400/35 shadow-[0_2px_12px_rgba(99,102,241,0.18)] dark:shadow-[0_2px_16px_rgba(99,102,241,0.3)] backdrop-blur-md -z-10"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 34 }
                      }
                    >
                      {/* Top micro-pip indicator */}
                      <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    </motion.span>
                  )}

                  <motion.span
                    animate={
                      item.isActive && !reduced ? { scale: 1.08, y: -1 } : { scale: 1, y: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`shrink-0 mb-0.5 transition-colors ${
                      item.isActive
                        ? 'text-indigo-600 dark:text-indigo-300 drop-shadow-[0_1px_4px_rgba(99,102,241,0.35)]'
                        : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.span>
                  <span
                    className={`text-[11px] leading-tight tracking-tight transition-colors ${
                      item.isActive
                        ? 'text-indigo-700 dark:text-indigo-200 font-semibold'
                        : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
