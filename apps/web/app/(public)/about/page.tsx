import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Sparkles, CheckCircle2, Compass } from 'lucide-react';
import { ROUTES, SITE_CONFIG, CREATOR_CONFIG } from '@elsesourav/config';

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

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_CONFIG.name} & Creator`,
    description: CREATOR_CONFIG.positioning,
    url: `${SITE_CONFIG.url}/about`,
    mainEntity: {
      '@type': 'Person',
      name: CREATOR_CONFIG.name,
      jobTitle: CREATOR_CONFIG.identity.title,
      url: SITE_CONFIG.url,
      sameAs: [CREATOR_CONFIG.links.github, CREATOR_CONFIG.links.twitter],
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
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
      </div>

      {/* Main Narrative Card */}
      <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl">
        <CardHeader className="p-0 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {CREATOR_CONFIG.identity.title}
            </span>
            <span className="text-xs text-zinc-500">
              {CREATOR_CONFIG.identity.location}
            </span>
          </div>

          <CardTitle className="text-xl sm:text-2xl text-white font-bold">
            Crafting Practical Software & Digital Tools
          </CardTitle>

          <CardDescription className="text-sm text-zinc-300 leading-relaxed space-y-4 pt-2">
            <p>{CREATOR_CONFIG.longBio}</p>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Engineering & Design Principles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Guiding Principles</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CREATOR_CONFIG.principles.map((principle, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-300 font-medium leading-relaxed">
                {principle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Areas of Focus</h2>
        <div className="flex flex-wrap gap-2">
          {CREATOR_CONFIG.focus.map((item, idx) => (
            <Badge key={idx} variant="outline" className="text-xs py-1.5 px-3 border-zinc-800 bg-zinc-900/60 text-zinc-200">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {/* Connect & Social Links */}
      <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">
          Interested in discussing tools, design, or engineering collaboration?
        </p>
        <div className="flex items-center gap-4 text-xs font-medium">
          <a
            href={CREATOR_CONFIG.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={CREATOR_CONFIG.links.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            Twitter / X <ExternalLink className="w-3 h-3" />
          </a>
          <Link
            href={ROUTES.SUPPORT}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Direct Inquiries →
          </Link>
        </div>
      </div>
    </div>
  );
}
