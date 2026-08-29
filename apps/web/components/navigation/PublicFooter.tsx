import * as React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { AdminRepository } from '@elsesourav/database';
import { parseSiteLinks, parseFooterLinks } from '@elsesourav/validation';
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
      return <Code2 className="w-3.5 h-3.5 text-zinc-300" />;
    case 'twitter':
      return <Share2 className="w-3.5 h-3.5 text-sky-400" />;
    case 'linkedin':
      return <Globe className="w-3.5 h-3.5 text-blue-400" />;
    case 'discord':
      return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
    case 'telegram':
      return <Send className="w-3.5 h-3.5 text-cyan-400" />;
    case 'email':
      return <Mail className="w-3.5 h-3.5 text-emerald-400" />;
    default:
      return <Globe className="w-3.5 h-3.5 text-zinc-400" />;
  }
}

export async function PublicFooter() {
  const adminRepo = new AdminRepository();
  const dbSettings: Record<string, string> = await adminRepo.getAllSettings().catch(() => ({}));

  const siteName = dbSettings['site_name'] || SITE_CONFIG.name;
  const siteLogo = dbSettings['site_logo_url'] || '';
  const footerCopyright =
    dbSettings['footer_copyright'] ||
    `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const footerText = dbSettings['footer_text'] || '';
  const statusText =
    dbSettings['footer_status_text'] ||
    dbSettings['site_status_badge'] ||
    '● All Systems Operational';
  const showSocials = dbSettings['footer_show_socials'] !== 'false';
  const showBackToTop = dbSettings['footer_show_back_to_top'] !== 'false';

  const siteLinks = parseSiteLinks(dbSettings['social_links_json'], dbSettings).filter(
    (l) => l.isActive
  );

  const customFooterLinks = parseFooterLinks(dbSettings['footer_links_json']).filter(
    (f) => f.isActive
  );

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl py-12 text-sm text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Footer Row: Brand Info + Operational Status + Socials */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="w-6 h-6 rounded-lg object-cover" />
              ) : null}
              <span className="text-base font-bold text-zinc-100 tracking-tight">{siteName}</span>
              {statusText && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                  {statusText}
                </span>
              )}
            </div>
            {footerText && <p className="text-xs text-zinc-400 max-w-md">{footerText}</p>}
            <p className="text-xs text-zinc-500">{footerCopyright}</p>
          </div>

          {/* Social / Platform Links */}
          {showSocials && siteLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              {siteLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  {getPlatformIcon(link.platform)}
                  <span>{link.label}</span>
                  {!link.url.startsWith('mailto:') && (
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigation & Legal Links */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
            <Link href={ROUTES.APPS} className="hover:text-zinc-300 transition-colors">
              Applications
            </Link>
            <Link href={ROUTES.BLOG} className="hover:text-zinc-300 transition-colors">
              Blog
            </Link>
            <Link href={ROUTES.HELP} className="hover:text-zinc-300 transition-colors">
              Documentation
            </Link>
            <Link href={ROUTES.ABOUT} className="hover:text-zinc-300 transition-colors">
              About
            </Link>
            <Link href={ROUTES.SUPPORT} className="hover:text-zinc-300 transition-colors">
              Support
            </Link>

            {/* Custom Admin Footer Links */}
            {customFooterLinks.map((cLink) => (
              <a
                key={cLink.id}
                href={cLink.url}
                target={cLink.isExternal ? '_blank' : undefined}
                rel={cLink.isExternal ? 'noopener noreferrer' : undefined}
                className="hover:text-zinc-300 transition-colors"
              >
                {cLink.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-5">
              <Link href={ROUTES.PRIVACY} className="hover:text-zinc-300 transition-colors">
                Privacy
              </Link>
              <Link href={ROUTES.TERMS} className="hover:text-zinc-300 transition-colors">
                Terms
              </Link>
              <Link href={ROUTES.ACCESSIBILITY} className="hover:text-zinc-300 transition-colors">
                Accessibility
              </Link>
            </div>

            {showBackToTop && (
              <a
                href="#"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-indigo-400 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 px-2.5 py-1 rounded-lg transition-colors"
                title="Scroll to top"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
