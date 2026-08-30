import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import type { SiteLinkPlatform } from '@elsesourav/types';
import {
  ExternalLink,
  Code2,
  Share2,
  Globe,
  MessageSquare,
  Send,
  Mail,
  ArrowUp,
} from 'lucide-react';

function getPlatformIcon(platform: SiteLinkPlatform) {
  switch (platform) {
    case 'github':
      return <Code2 className="w-4 h-4" />;
    case 'twitter':
      return <Share2 className="w-4 h-4 text-sky-400" />;
    case 'linkedin':
      return <Globe className="w-4 h-4 text-blue-400" />;
    case 'discord':
      return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    case 'telegram':
      return <Send className="w-4 h-4 text-cyan-400" />;
    case 'email':
      return <Mail className="w-4 h-4 text-emerald-400" />;
    default:
      return <Globe className="w-4 h-4" />;
  }
}

export async function PublicFooter() {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity();

  const siteLinks = identity.creator.links.filter((l) => l.isActive);
  const customFooterLinks = identity.footer.links.filter((f) => f.isActive);

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
              className="inline-flex items-center gap-2.5 font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg p-1"
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
              {identity.footer.text || `${identity.site.name} is the personal software studio and archive of ${identity.creator.fullName}. Practical tools, simulations, and engineering notes.`}
            </p>

            {/* Social / External Links */}
            {identity.footer.showSocials && siteLinks.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {siteLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    aria-label={`${link.label} (${link.platform})`}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] hover:border-[hsl(var(--border-strong))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
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
                <Link href={ROUTES.APPS} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Apps
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ARCHIVE} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  The Archive
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BLOG} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Notes
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
                <Link href={ROUTES.ABOUT} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  About Creator
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ACCESSIBILITY} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-[hsl(var(--foreground))] transition-colors">
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
                <Link href={ROUTES.HELP} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SUPPORT} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Support Desk
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SETTINGS} className="hover:text-[hsl(var(--foreground))] transition-colors">
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
                    {cLink.isExternal && <ExternalLink className="w-3 h-3 text-[hsl(var(--subtle-foreground))]" />}
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
                <Link href={ROUTES.PRIVACY} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={ROUTES.TERMS} className="hover:text-[hsl(var(--foreground))] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Row */}
        <div className="pt-8 border-t border-[hsl(var(--border-subtle))] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[hsl(var(--subtle-foreground))]">
          <p>{identity.footer.copyright || `© ${new Date().getFullYear()} ${identity.site.name} • Built by ${identity.creator.fullName}`}</p>

          {identity.footer.showBackToTop && (
            <a
              href="#"
              aria-label="Scroll back to top of page"
              className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] px-3 py-1.5 rounded-xl transition-all duration-150 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
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
