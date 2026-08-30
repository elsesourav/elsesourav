import * as React from 'react';
import Link from 'next/link';
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
  Sparkles,
} from 'lucide-react';

function getPlatformIcon(platform: SiteLinkPlatform) {
  switch (platform) {
    case 'github':
      return <Code2 className="w-4 h-4 text-zinc-300" />;
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
      return <Globe className="w-4 h-4 text-zinc-400" />;
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
      className="border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md pt-16 pb-12 text-sm text-zinc-400"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand & Creator Bio Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2.5 font-bold text-base sm:text-lg text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600/30 transition-all">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="tracking-tight text-white font-bold">{identity.site.name}</span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {identity.footer.text || identity.site.description}
            </p>

            {/* Operational Status Pill */}
            {identity.footer.statusText && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {identity.footer.statusText}
                </span>
              </div>
            )}

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
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href={ROUTES.APPS} className="hover:text-white transition-colors">
                  Work
                </Link>
              </li>
              <li>
                <Link href="/apps?category=simulations" className="hover:text-white transition-colors">
                  Lab & Experiments
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BLOG} className="hover:text-white transition-colors">
                  Notes
                </Link>
              </li>
              <li>
                <Link href={ROUTES.HELP} className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: About */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href={ROUTES.ABOUT} className="hover:text-white transition-colors">
                  About Creator
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ACCESSIBILITY} className="hover:text-white transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-white transition-colors">
                  Design System
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href={ROUTES.SUPPORT} className="hover:text-white transition-colors">
                  Support Desk
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SETTINGS} className="hover:text-white transition-colors">
                  Account Settings
                </Link>
              </li>
              {customFooterLinks.map((cLink) => (
                <li key={cLink.id}>
                  <a
                    href={cLink.url}
                    target={cLink.isExternal ? '_blank' : undefined}
                    rel={cLink.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>{cLink.label}</span>
                    {cLink.isExternal && <ExternalLink className="w-3 h-3 text-zinc-500" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href={ROUTES.PRIVACY} className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={ROUTES.TERMS} className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Row */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{identity.footer.copyright || `© ${new Date().getFullYear()} ${identity.site.name}. All rights reserved.`}</p>

          {identity.footer.showBackToTop && (
            <a
              href="#"
              aria-label="Scroll back to top of page"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 px-3 py-1.5 rounded-xl transition-all hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
