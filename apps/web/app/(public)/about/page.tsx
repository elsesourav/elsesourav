import { SITE_CONFIG, CREATOR_CONFIG, ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import type { SiteLinkPlatform } from '@elsesourav/types';
import { PageShell, PageHeader, Badge, Button } from '@elsesourav/ui';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import {
  CheckCircle2,
  Code2,
  Compass,
  ExternalLink,
  Globe,
  Mail,
  MessageSquare,
  Send,
  Share2,
  Terminal,
  BookOpen,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Sourav & ElseSourav',
  description: CREATOR_CONFIG.positioning,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: `About Sourav & ${SITE_CONFIG.name}`,
    description: CREATOR_CONFIG.positioning,
    url: `${SITE_CONFIG.url}/about`,
    siteName: SITE_CONFIG.name,
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: `About Sourav & ${SITE_CONFIG.name}`,
    description: CREATOR_CONFIG.positioning,
  },
};

export const dynamic = 'force-dynamic';

function getPlatformIcon(platform: SiteLinkPlatform) {
  switch (platform) {
    case 'github':
      return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
    case 'twitter':
      return <Share2 className="w-3.5 h-3.5 text-cyan-400" />;
    case 'linkedin':
      return <Globe className="w-3.5 h-3.5 text-blue-400" />;
    case 'youtube':
      return <Share2 className="w-3.5 h-3.5 text-rose-400" />;
    case 'discord':
      return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
    case 'telegram':
      return <Send className="w-3.5 h-3.5 text-sky-400" />;
    case 'email':
      return <Mail className="w-3.5 h-3.5 text-emerald-400" />;
    default:
      return <Globe className="w-3.5 h-3.5 text-zinc-400" />;
  }
}

export default async function AboutPage() {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity();

  const activeLinks = identity.creator.links.filter((l) => l.isActive);
  const activeContacts = identity.creator.contacts.filter((c) => c.isActive);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${identity.site.name} & Creator`,
    description: identity.site.description,
    url: `${identity.site.url}/about`,
    mainEntity: {
      '@type': 'Person',
      name: identity.creator.name,
      jobTitle: identity.creator.title,
      image: identity.creator.avatarUrl || undefined,
      url: identity.site.url,
      sameAs: activeLinks.map((l) => l.url),
    },
  };

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12 max-w-4xl mx-auto">
        {/* Page Introduction Header */}
        <PageHeader
          eyebrow="Creator & Philosophy"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              Software Studio
            </Badge>
          }
          title={`About ${identity.creator.name} & ${identity.site.name}`}
          description={`${identity.site.tagline} — ${identity.creator.positioning}`}
        />

        {/* Creator Bio & Mission Card */}
        <div className="p-6 sm:p-10 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/70">
            <div className="flex items-center gap-4">
              {identity.creator.avatarUrl ? (
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 overflow-hidden shrink-0 shadow-lg shadow-indigo-950/40">
                  <img
                    src={identity.creator.avatarUrl}
                    alt={identity.creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 shrink-0">
                  {identity.creator.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{identity.creator.name}</h2>
                <span className="text-xs font-semibold text-indigo-400">
                  {identity.creator.title}
                </span>
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-medium px-3.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60 w-fit">
              {identity.creator.location}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl text-white font-bold tracking-tight">
            Crafting Practical Software & Digital Tools
          </h3>

          <div className="text-sm text-zinc-300 leading-relaxed pt-1">
            <BlogContentRenderer content={identity.creator.longBio} />
          </div>

          {/* Quick Bridge Exploration Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800/60">
            <Link href={ROUTES.APPS}>
              <Button size="sm" className="gap-2 text-xs font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Explore Applications</span>
              </Button>
            </Link>
            <Link href={ROUTES.BLOG}>
              <Button variant="secondary" size="sm" className="gap-2 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Engineering Journal</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Guiding Principles Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Guiding Principles</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {identity.creator.principles.map((principle: string, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 flex items-start gap-3.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-300 font-medium leading-relaxed">{principle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas of Focus */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Areas of Focus</h2>
          <div className="flex flex-wrap gap-2.5">
            {identity.creator.focus.map((item: string, idx: number) => (
              <span
                key={idx}
                className="text-xs py-1.5 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-200 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Verified Social & Platform Channels */}
        <div className="pt-6 border-t border-zinc-800/80 space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Platform & Social Channels</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            {activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                {getPlatformIcon(link.platform)}
                <span>{link.label}</span>
                {!link.url.startsWith('mailto:') && (
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Direct Contact & Support Channels */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Direct Contact & Inquiries</h2>
          <p className="text-xs text-zinc-400">
            Have questions, technical inquiries, or want to discuss engineering collaboration?
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            {activeContacts.map((contact) => (
              <a
                key={contact.id}
                href={
                  contact.value.includes('@') && !contact.value.startsWith('http')
                    ? `mailto:${contact.value}`
                    : contact.value
                }
                target={contact.value.startsWith('http') ? '_blank' : undefined}
                rel={contact.value.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {contact.label}: {contact.value}
                </span>
              </a>
            ))}
            <Link
              href={ROUTES.SUPPORT}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 transition-colors inline-flex items-center gap-1"
            >
              <span>Support Desk</span> →
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
