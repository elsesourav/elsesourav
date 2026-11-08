import * as React from 'react';
import Link from 'next/link';
import { ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import type { SiteLinkPlatform } from '@elsesourav/types';
import { ExternalLink, Globe, Mail } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BackToTopButton } from '@/components/navigation/BackToTopButton';

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
    return (
      <YoutubeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff0000] group-hover:scale-110 transition-transform" />
    );
  }
  if (platform === 'instagram' || norm.includes('instagram.com')) {
    return (
      <InstagramIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e4405f] group-hover:scale-110 transition-transform" />
    );
  }
  if (platform === 'github' || norm.includes('github.com')) {
    return (
      <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
    );
  }
  if (platform === 'twitter' || norm.includes('twitter.com') || norm.includes('x.com')) {
    return (
      <TwitterXIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
    );
  }
  if (platform === 'linkedin' || norm.includes('linkedin.com')) {
    return (
      <LinkedinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0077b5] transition-colors" />
    );
  }
  if (platform === 'email' || norm.startsWith('mailto:')) {
    return <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 transition-colors" />;
  }
  return <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
}

export async function PublicFooter() {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity();

  const siteLinks = identity.creator.links.filter((l) => l.isActive);
  const customFooterLinks = identity.footer.links.filter(
    (f) =>
      f.isActive &&
      !f.label.toLowerCase().includes('status') &&
      !f.url.toLowerCase().includes('status')
  );

  // Fallback social profiles if database returns none
  const defaultSocials = [
    {
      id: 'github',
      label: 'GitHub (@elsesourav)',
      url: 'https://github.com/elsesourav',
      platform: 'github' as const,
    },
    {
      id: 'twitter',
      label: 'X / Twitter (@elsesourav)',
      url: 'https://x.com/elsesourav',
      platform: 'twitter' as const,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn (@elsesourav)',
      url: 'https://linkedin.com/in/elsesourav',
      platform: 'linkedin' as const,
    },
    {
      id: 'youtube',
      label: 'YouTube (@elsesourav)',
      url: 'https://www.youtube.com/@elsesourav',
      platform: 'youtube' as const,
    },
    {
      id: 'instagram',
      label: 'Instagram (@elsesourav)',
      url: 'https://instagram.com/elsesourav',
      platform: 'instagram' as const,
    },
    {
      id: 'email',
      label: 'Email Contact',
      url: 'mailto:contact@elsesourav.com',
      platform: 'email' as const,
    },
  ];

  const activeLinks = siteLinks.length > 0 ? siteLinks : defaultSocials;

  return (
    <footer
      aria-label="Site footer"
      className="border-t border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/95 backdrop-blur-md pt-8 pb-24 sm:pt-12 sm:pb-14 lg:pt-14 text-sm text-[hsl(var(--muted-foreground))] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Main Responsive Grid: 1 col on mobile, 12 cols on tablet & desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
          {/* Brand & Studio Bio Column */}
          <div className="md:col-span-5 lg:col-span-4 space-y-2.5 sm:space-y-3.5">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg py-0.5 sm:py-1 px-0.5"
              aria-label={`${identity.site.name} Home`}
            >
              <BrandLogo
                variant="theme"
                size="md"
                name={identity.site.name}
                logoUrl={identity.site.logoUrl}
                brandLogoUrl={identity.site.brandLogoUrl}
              />
            </Link>

            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm">
              {identity.footer.text ||
                `${identity.site.name} is the personal software studio and digital archive of ${identity.creator.fullName}. Handcrafted applications, developer tools, and engineering updates.`}
            </p>

            {/* Social / External Profiles */}
            {identity.footer.showSocials && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {activeLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    aria-label={`${link.label} (${link.platform})`}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="group inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                    title={link.label}
                  >
                    {getPlatformIcon(link.platform, link.url)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 3 Link Columns: Symmetrical 3-column layout on all viewports */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
            {/* Column 1: Explore */}
            <div className="space-y-2 sm:space-y-2.5">
              <h4 className="text-[11px] sm:text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider font-mono">
                Explore
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
                <li>
                  <Link
                    href={ROUTES.APPS}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    Apps
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.ARCHIVE}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    Archive
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.UPDATES}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    Updates
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.ABOUT}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Support */}
            <div className="space-y-2 sm:space-y-2.5">
              <h4 className="text-[11px] sm:text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider font-mono">
                Support
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
                <li>
                  <Link
                    href={ROUTES.HELP}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    <span className="sm:hidden">Help</span>
                    <span className="hidden sm:inline">Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.SUPPORT}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    <span className="sm:hidden">Support</span>
                    <span className="hidden sm:inline">Contact Support</span>
                  </Link>
                </li>
                {customFooterLinks.map((cLink) => (
                  <li key={cLink.id}>
                    <a
                      href={cLink.url}
                      target={cLink.isExternal ? '_blank' : undefined}
                      rel={cLink.isExternal ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1 hover:text-[hsl(var(--foreground))] transition-colors py-0.5"
                    >
                      <span className="truncate">{cLink.label}</span>
                      {cLink.isExternal && (
                        <ExternalLink className="w-3 h-3 text-[hsl(var(--subtle-foreground))] shrink-0" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-2 sm:space-y-2.5">
              <h4 className="text-[11px] sm:text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider font-mono">
                Legal
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
                <li>
                  <Link
                    href={ROUTES.PRIVACY}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    <span className="sm:hidden">Privacy</span>
                    <span className="hidden sm:inline">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.TERMS}
                    className="hover:text-[hsl(var(--foreground))] transition-colors block py-0.5"
                  >
                    <span className="sm:hidden">Terms</span>
                    <span className="hidden sm:inline">Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Row with Back to Top */}
        <div className="pt-5 sm:pt-7 border-t border-[hsl(var(--border))]/60 flex flex-col-reverse sm:flex-row items-center justify-between gap-3.5 sm:gap-4 text-xs text-[hsl(var(--subtle-foreground))]">
          <p className="text-center sm:text-left text-[11px] sm:text-xs leading-relaxed">
            {identity.footer.copyright ||
              `© ${new Date().getFullYear()} ${identity.site.name}. Crafted by ${identity.creator.fullName} (@${identity.creator.handle || 'elsesourav'}). All rights reserved.`}
          </p>

          {identity.footer.showBackToTop && (
            <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
              <BackToTopButton />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
