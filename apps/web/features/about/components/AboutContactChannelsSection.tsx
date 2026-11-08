import React from 'react';
import Link from 'next/link';
import { Reveal } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import type { SiteLinkPlatform } from '@elsesourav/types';
import {
  Code2,
  ExternalLink,
  Globe,
  Mail,
  Share2,
  ArrowRight,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/icons/SocialIcons';

export interface CreatorLinkItem {
  id: string;
  platform: SiteLinkPlatform | string;
  url: string;
  label: string;
  isActive: boolean;
}

export interface CreatorContactItem {
  id: string;
  label: string;
  value: string;
  isActive: boolean;
}

export interface AboutContactChannelsSectionProps {
  links: CreatorLinkItem[];
  contacts: CreatorContactItem[];
}

function getPlatformIcon(platform: SiteLinkPlatform | string, url?: string) {
  const norm = (url || '').toLowerCase();
  if (platform === 'youtube' || norm.includes('youtube.com') || norm.includes('youtu.be')) {
    return <YoutubeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff0000] shrink-0" />;
  }
  if (platform === 'instagram' || norm.includes('instagram.com')) {
    return <InstagramIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#e4405f] shrink-0" />;
  }
  switch (platform) {
    case 'github':
      return <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />;
    case 'twitter':
      return <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />;
    case 'linkedin':
      return <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 shrink-0" />;
    case 'email':
      return <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />;
    default:
      return <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 shrink-0" />;
  }
}

export function AboutContactChannelsSection({
  links,
  contacts,
}: AboutContactChannelsSectionProps) {
  return (
    <div
      data-section="contact-channels"
      className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-[hsl(var(--border-subtle))]"
    >
      {/* 1. Verified Social & Platform Channels */}
      {links.length > 0 && (
        <Reveal direction="up" distance={12}>
          <section aria-labelledby="channels-heading" className="space-y-2.5 sm:space-y-3">
            <h2
              id="channels-heading"
              className="text-xs sm:text-sm font-bold text-[hsl(var(--foreground))] tracking-tight font-mono uppercase"
            >
              Platform & Social Channels
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-medium">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {getPlatformIcon(link.platform, link.url)}
                  <span>{link.label}</span>
                  {!link.url.startsWith('mailto:') && (
                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[hsl(var(--muted-foreground))]" />
                  )}
                </a>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* 2. Direct Contact & Support Channels */}
      <Reveal direction="up" distance={12}>
        <section aria-labelledby="contact-heading" className="space-y-2.5 sm:space-y-3">
          <h2
            id="contact-heading"
            className="text-xs sm:text-sm font-bold text-[hsl(var(--foreground))] tracking-tight font-mono uppercase"
          >
            Direct Contact & Inquiries
          </h2>
          <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))]">
            Have questions, technical inquiries, or want to discuss software collaboration?
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-medium">
            {contacts.map((contact) => {
              const isHttp = contact.value.startsWith('http');
              return (
                <a
                  key={contact.id}
                  href={
                    contact.value.includes('@') && !isHttp
                      ? `mailto:${contact.value}`
                      : contact.value
                  }
                  target={isHttp ? '_blank' : undefined}
                  rel={isHttp ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 max-w-full truncate"
                >
                  {isHttp ? (
                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  ) : (
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {contact.label}: {contact.value}
                  </span>
                </a>
              );
            })}
            {!contacts.some(
              (c) =>
                c.label.toLowerCase().includes('support') ||
                c.value.toLowerCase().includes('/support')
            ) && (
              <Link
                href={ROUTES.SUPPORT}
                className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold px-2 py-1 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                <span>Support Desk</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
