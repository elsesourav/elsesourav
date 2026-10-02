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

function DiscordIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
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
    case 'discord':
      return <DiscordIcon className="w-4 h-4 text-[#5865F2] transition-colors" />;
    case 'telegram':
      return <TelegramIcon className="w-4 h-4 text-[#229ED9] transition-colors" />;
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
    { id: 'discord', label: 'Discord Community (@elsesourav)', url: 'https://discord.gg/elsesourav', platform: 'discord' as const },
    { id: 'telegram', label: 'Telegram (@elsesourav)', url: 'https://t.me/elsesourav', platform: 'telegram' as const },
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
                `${identity.site.name} is the personal software studio and archive of ${identity.creator.fullName}. Practical tools, simulations, and engineering notes.`}
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
                  Apps & Tools
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ARCHIVE}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  The Archive
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.BLOG}
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Notes & Essays
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
                  About Sourav
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
                  Support Desk
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

          {/* Column 4: Legal */}
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
