import { CREATOR_CONFIG, ROUTES, SITE_CONFIG } from '@elsesourav/config';
import { AdminRepository } from '@elsesourav/database';
import type { SiteLinkPlatform } from '@elsesourav/types';
import { Badge, Card, CardHeader, CardTitle, MarkdownRenderer } from '@elsesourav/ui';
import { parseContactMethods, parseSiteLinks, parseStringList } from '@elsesourav/validation';
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
  Sparkles,
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
  const adminRepo = new AdminRepository();
  const dbSettings: Record<string, string> = await adminRepo.getAllSettings().catch(() => ({}));

  const creatorName = dbSettings['creator_name'] || CREATOR_CONFIG.name;
  const creatorTitle = dbSettings['creator_title'] || CREATOR_CONFIG.identity.title;
  const creatorLocation = dbSettings['creator_location'] || CREATOR_CONFIG.identity.location;
  const creatorLongBio = dbSettings['creator_long_bio'] || CREATOR_CONFIG.longBio;
  const creatorAvatarUrl = dbSettings['creator_avatar_url'] || '';
  const creatorPrinciples = parseStringList(
    dbSettings['creator_principles_json'],
    CREATOR_CONFIG.principles
  );
  const creatorFocus = parseStringList(dbSettings['creator_focus_json'], CREATOR_CONFIG.focus);

  // Dynamic prioritized links & contact methods
  const siteLinks = parseSiteLinks(dbSettings['social_links_json'], dbSettings).filter(
    (l) => l.isActive
  );
  const contactMethods = parseContactMethods(dbSettings['contact_methods_json'], dbSettings).filter(
    (c) => c.isActive
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_CONFIG.name} & Creator`,
    description: CREATOR_CONFIG.positioning,
    url: `${SITE_CONFIG.url}/about`,
    mainEntity: {
      '@type': 'Person',
      name: creatorName,
      jobTitle: creatorTitle,
      image: creatorAvatarUrl || undefined,
      url: SITE_CONFIG.url,
      sameAs: siteLinks.map((l) => l.url),
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit border-zinc-700 text-xs text-zinc-300 gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Creator & Platform
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About {SITE_CONFIG.name}
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          {SITE_CONFIG.tagline} — {CREATOR_CONFIG.positioning}
        </p>
      </div>

      {/* Main Narrative Card with Creator Avatar Support */}
      <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl space-y-6">
        <CardHeader className="p-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-4">
              {creatorAvatarUrl ? (
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 overflow-hidden shrink-0 shadow-lg shadow-indigo-950/40">
                  <img
                    src={creatorAvatarUrl}
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 shrink-0">
                  {creatorName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{creatorName}</h2>
                <span className="text-xs font-semibold text-indigo-400">{creatorTitle}</span>
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-medium px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60 w-fit">
              {creatorLocation}
            </span>
          </div>

          <CardTitle className="text-xl sm:text-2xl text-white font-bold">
            Crafting Practical Software & Digital Tools
          </CardTitle>

          <div className="text-sm text-zinc-300 leading-relaxed pt-1">
            <MarkdownRenderer content={creatorLongBio} />
          </div>
        </CardHeader>
      </Card>

      {/* Engineering & Design Principles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Guiding Principles</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {creatorPrinciples.map((principle: string, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-300 font-medium leading-relaxed">{principle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Areas of Focus</h2>
        <div className="flex flex-wrap gap-2">
          {creatorFocus.map((item: string, idx: number) => (
            <Badge
              key={idx}
              variant="outline"
              className="text-xs py-1.5 px-3 border-zinc-800 bg-zinc-900/60 text-zinc-200"
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {/* Platform & Social Links */}
      <div className="pt-6 border-t border-zinc-800/80 space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Platform & Social Channels</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {siteLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
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

      {/* Direct Contact & Inquiries */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Direct Contact & Inquiries</h2>
        <p className="text-xs text-zinc-400">
          Have questions, technical inquiries, or want to discuss collaboration?
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {contactMethods.map((contact) => (
            <a
              key={contact.id}
              href={
                contact.value.includes('@') && !contact.value.startsWith('http')
                  ? `mailto:${contact.value}`
                  : contact.value
              }
              target={contact.value.startsWith('http') ? '_blank' : undefined}
              rel={contact.value.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-300 hover:text-indigo-200 transition-colors"
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
  );
}
