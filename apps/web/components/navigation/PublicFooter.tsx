import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import type { SiteLinkPlatform } from '@elsesourav/types';
import {
  ExternalLink,
  Globe,
  Mail,
  ArrowUp,
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterXIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function getPlatformIcon(platform: SiteLinkPlatform) {
  switch (platform) {
    case 'github':
      return <GithubIcon className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />;
    case 'twitter':
      return <TwitterXIcon className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />;
    case 'linkedin':
      return <LinkedinIcon className="w-4 h-4 text-[#0077b5] transition-colors" />;
    case 'youtube':
      return <YoutubeIcon className="w-4 h-4 text-[#ff0000] group-hover:scale-110 transition-transform" />;
    case 'instagram':
      return <InstagramIcon className="w-4 h-4 text-[#e4405f] group-hover:scale-110 transition-transform" />;
    case 'email':
      return <Mail className="w-4 h-4 text-emerald-500 transition-colors" />;
    default:
      return <Globe className="w-4 h-4" />;
  }
}

export async function PublicFooter() {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity();

  const siteLinks = identity.creator.links.filter((l) => l.isActive);
  const customFooterLinks = identity.footer.links.filter((f) => f.isActive);

  // Fallback social profiles if database returns none
  const defaultSocials = [
    { id: 'github', label: 'GitHub (@elsesourav)', url: 'https://github.com/elsesourav', platform: 'github' as const },
    { id: 'twitter', label: 'X / Twitter (@elsesourav)', url: 'https://x.com/elsesourav', platform: 'twitter' as const },
    { id: 'linkedin', label: 'LinkedIn (@elsesourav)', url: 'https://linkedin.com/in/elsesourav', platform: 'linkedin' as const },
    { id: 'youtube', label: 'YouTube (@elsesourav)', url: 'https://www.youtube.com/@elsesourav', platform: 'youtube' as const },
    { id: 'instagram', label: 'Instagram (@elsesourav)', url: 'https://instagram.com/elsesourav', platform: 'instagram' as const },
    { id: 'email', label: 'Email Contact', url: 'mailto:contact@elsesourav.com', platform: 'email' as const },
  ];

  const activeLinks = siteLinks.length > 0 ? siteLinks : defaultSocials;

  return (
    <footer
      aria-label="Site footer"
      className="border-t border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/95 backdrop-blur-md pt-16 pb-12 text-sm text-[hsl(var(--muted-foreground))]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand & Creator Bio Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2.5 font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg p-0.5"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/logo-sm.png"
                  alt={`${identity.site.name} Logo`}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="tracking-tight font-bold">{identity.site.name}</span>
            </Link>

            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm">
              {identity.footer.text ||
                `${identity.site.name} is the personal software studio and archive of ${identity.creator.fullName}. Practical tools, simulations, and engineering updates.`}
            </p>

            {/* Social / External Links with Proper Brand SVGs */}
            {identity.footer.showSocials && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {activeLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    aria-label={`${link.label} (${link.platform})`}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="group inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                    title={link.label}
                  >
                    {getPlatformIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[hsl(var(--muted-foreground))]">
              <li>
                <Link
                  href={ROUTES.APPS}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Apps
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ARCHIVE}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Archive
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.NOTES}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: About */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-2.5 text-xs text-[hsl(var(--muted-foreground))]">
              <li>
                <Link
                  href={ROUTES.ABOUT}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ACCESSIBILITY}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  href="/design-system"
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Design System
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[hsl(var(--muted-foreground))]">
              <li>
                <Link
                  href={ROUTES.HELP}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.SUPPORT}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/support/tickets"
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Support Tickets
                </Link>
              </li>
              {customFooterLinks.map((cLink) => (
                <li key={cLink.id}>
                  <a
                    href={cLink.url}
                    target={cLink.isExternal ? '_blank' : undefined}
                    rel={cLink.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    <span>{cLink.label}</span>
                    {cLink.isExternal && (
                      <ExternalLink className="w-3 h-3 text-[hsl(var(--subtle-foreground))]" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-[hsl(var(--muted-foreground))]">
              <li>
                <Link
                  href={ROUTES.PRIVACY}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.TERMS}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.SETTINGS}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Row */}
        <div className="pt-8 border-t border-[hsl(var(--border))]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[hsl(var(--subtle-foreground))]">
          <p>
            {identity.footer.copyright ||
              `© ${new Date().getFullYear()} ${identity.site.name}. Crafted by ${identity.creator.fullName} (@${identity.creator.handle || 'elsesourav'}). All rights reserved.`}
          </p>

          {identity.footer.showBackToTop && (
            <a
              href="#hero"
              aria-label="Scroll back to top of page"
              className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:border-indigo-500/40 bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] px-3 py-1.5 rounded-xl transition-all duration-150 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
