'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Badge } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: ROUTES.APPS, label: 'Apps' },
    { href: ROUTES.BLOG, label: 'Blog' },
    { href: ROUTES.HELP, label: 'Help' },
    { href: ROUTES.SUPPORT, label: 'Support' },
    { href: ROUTES.ABOUT, label: 'About' },
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-base sm:text-lg text-white group">
          <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>{SITE_CONFIG.name}</span>
          <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0 border-zinc-700">v2.0</Badge>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors font-medium ${
                  isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href={ROUTES.SIGNUP}>
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 p-0 text-zinc-300 hover:text-white focus-visible:ring-indigo-500"
            aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-zinc-950/95 backdrop-blur-2xl px-5 py-6 flex flex-col justify-between border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-semibold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth Actions */}
          <div className="pt-6 border-t border-zinc-800/80 space-y-3">
            <Link href={ROUTES.SIGNUP} className="block">
              <Button size="lg" className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                Get Started
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN} className="block">
              <Button variant="outline" size="lg" className="w-full justify-center border-zinc-700 text-zinc-200 hover:bg-zinc-900">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
