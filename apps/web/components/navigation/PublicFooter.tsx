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

import {
  GithubIcon,
  TwitterXIcon,
  LinkedinIcon,
  YoutubeIcon,
  InstagramIcon,
} from '@/components/icons/SocialIcons';

function getPlatformIcon(platform: SiteLinkPlatform | string, url?: string) {
  const norm = (url || '').toLowerCase();
  if (platform === 'youtube' || norm.includes('youtube.com') || norm.includes('youtu.be')) {
    return <YoutubeIcon className="w-4 h-4 text-[#ff0000] group-hover:scale-110 transition-transform" />;
  }
  if (platform === 'instagram' || norm.includes('instagram.com')) {
    return <InstagramIcon className="w-4 h-4 text-[#e4405f] group-hover:scale-110 transition-transform" />;
  }
  if (platform === 'github' || norm.includes('github.com')) {
    return <GithubIcon className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />;
  }
  if (platform === 'twitter' || norm.includes('twitter.com') || norm.includes('x.com')) {
    return <TwitterXIcon className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />;
  }
  if (platform === 'linkedin' || norm.includes('linkedin.com')) {
    return <LinkedinIcon className="w-4 h-4 text-[#0077b5] transition-colors" />;
  }
  if (platform === 'email' || norm.startsWith('mailto:')) {
    return <Mail className="w-4 h-4 text-emerald-500 transition-colors" />;
  }
  return <Globe className="w-4 h-4" />;
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
                    {getPlatformIcon(link.platform, link.url)}
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
