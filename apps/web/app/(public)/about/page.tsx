import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import type { SiteLinkPlatform } from '@elsesourav/types';
import { PageShell, PageHeader, Badge, Button, Reveal, RevealGroup } from '@elsesourav/ui';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { CapabilityMap } from '@/features/about/components/CapabilityMap';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import {
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  Mail,
  MessageSquare,
  Send,
  Share2,
  Terminal,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Radio,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Sourav Barui — Independent Software Creator',
  description:
    'About Sourav Barui, an independent software creator building software, tools, games, and experiments across web architecture, AI, graphics, and systems.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: `About Sourav Barui — ${SITE_CONFIG.name}`,
    description:
      'About Sourav Barui, an independent software creator building software, tools, games, and experiments across web architecture, AI, graphics, and systems.',
    url: `${SITE_CONFIG.url}/about`,
    siteName: SITE_CONFIG.name,
    type: 'profile',
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1024,
        height: 576,
        alt: `About Sourav Barui — ${SITE_CONFIG.name}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About Sourav Barui — ${SITE_CONFIG.name}`,
    description:
      'About Sourav Barui, an independent software creator building software, tools, games, and experiments across web architecture, AI, graphics, and systems.',
    images: [SITE_CONFIG.ogImage],
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

  const [identity, appsResult, labResult, blogResult] = await Promise.all([
    siteService.getSiteAndCreatorIdentity(),
    discoverPublishedApps({ limit: 1, sort: 'popularity' }).catch(() => ({ items: [] })),
    discoverPublishedApps({ filters: { categorySlug: 'simulations' }, limit: 1 }).catch(() => ({ items: [] })),
    getPublicBlogListing({ limit: 1 }).catch(() => ({ items: [] })),
  ]);

  const activeApp = appsResult.items?.[0] || null;
  const activeLab = labResult.items?.[0] || null;
  const activePost = blogResult.items?.[0] || null;

  const activeLinks = identity.creator.links.filter((l) => l.isActive);
  const activeContacts = identity.creator.contacts.filter((c) => c.isActive);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${identity.creator.fullName || identity.creator.name} — ${identity.site.name}`,
    description: identity.site.description,
    url: `${identity.site.url}/about`,
    mainEntity: {
      '@type': 'Person',
      name: identity.creator.fullName || identity.creator.name,
      jobTitle: identity.creator.title,
      image: identity.creator.avatarUrl || undefined,
      url: `${identity.site.url}/about`,
      sameAs: activeLinks.map((l) => l.url),
    },
  };

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16 max-w-4xl mx-auto">
        {/* Page Header: Clear Semantic Identity */}
        <PageHeader
          eyebrow="About the Creator"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              Independent Studio
            </Badge>
          }
          title={identity.creator.fullName || `${identity.creator.name} Barui`}
          description={`${identity.creator.title} · ${identity.site.name} Studio`}
        />

        {/* 1. Creator Profile & The Studio Story */}
        <section aria-labelledby="creator-bio-heading" className="space-y-6">
          <div className="p-6 sm:p-10 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/70">
              <div className="flex items-center gap-4">
                {identity.creator.avatarUrl ? (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 overflow-hidden shrink-0 shadow-lg shadow-indigo-950/40">
                    <img
                      src={identity.creator.avatarUrl}
                      alt={identity.creator.fullName || identity.creator.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 shrink-0 font-mono">
                    SB
                  </div>
                )}
                <div>
                  <h2 id="creator-bio-heading" className="text-xl font-bold text-white">
                    {identity.creator.fullName || `${identity.creator.name} Barui`}
                  </h2>
                  <span className="text-xs font-semibold text-indigo-400 font-mono">
                    {identity.creator.title}
                  </span>
                </div>
              </div>
              <span className="text-xs text-zinc-400 font-mono px-3.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60 w-fit">
                {identity.creator.location || 'India · Remote'}
              </span>
            </div>

            <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
              {identity.creator.longBio ? (
                <BlogContentRenderer content={identity.creator.longBio} />
              ) : (
                <p>
                  Sourav Barui is an independent software creator who enjoys turning ideas into useful software, tools, games, and experiments. ElseSourav is his personal software studio, digital workshop, and engineering archive.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800/60">
              <Link href={ROUTES.APPS}>
                <Button size="sm" className="gap-2 text-xs font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Explore Work</span>
                </Button>
              </Link>
              <Link href={ROUTES.BLOG}>
                <Button variant="secondary" size="sm" className="gap-2 text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Field Notes</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Why So Many Different Projects? (Learning by Building) */}
        <Reveal direction="up" distance={16}>
          <section aria-labelledby="why-projects-heading" className="space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Core Motivation</span>
              </div>
              <h2 id="why-projects-heading" className="text-2xl font-bold text-white tracking-tight">
                &ldquo;I like understanding ideas by building them.&rdquo;
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Rather than viewing software engineering through a single narrow framework, Sourav approaches programming as a medium for understanding systems from first principles. When exploring computer graphics, he writes canvas renderers and physics loops. When studying AI, he builds browser extensions with local WebAssembly models. When solving data management bottlenecks, he develops batch automation tools.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Every project in this portfolio represents an intentional exploration: exploring new paradigms, testing performance boundaries, and crafting tools that solve concrete real-world problems.
              </p>
            </div>
          </section>
        </Reveal>

        {/* 3. Project Journey & Technical Evolution */}
        <section aria-labelledby="journey-heading" className="space-y-6">
          <Reveal direction="up" distance={14}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                <Layers className="w-4 h-4" />
                <span>Evolution</span>
              </div>
              <h2 id="journey-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Project Journey & Technical Progression
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Organized conceptually by the engineering challenges and paradigms explored across different stages:
              </p>
            </div>
          </Reveal>

          <RevealGroup staggerDelay={0.06} baseDelay={0.08} className="space-y-4">
            {/* Stage 01 */}
            <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/40">
                  Stage 01 // Foundations
                </span>
                <span className="text-zinc-500">Core Utilities & DOM</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Foundations, Calculators & Web Utilities
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Early exploration focused on mastering native browser APIs, client-side input validation, asynchronous state machines, and building tools with zero external dependencies.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Representative work:</span>
                <Link href="/apps/base-calculator" className="text-indigo-300 hover:underline">Base Calculator</Link>
                <span>·</span>
                <Link href="/apps/currency-converter" className="text-indigo-300 hover:underline">Currency Converter</Link>
                <span>·</span>
                <Link href="/apps/form-maker" className="text-indigo-300 hover:underline">Form Maker</Link>
              </div>
            </div>

            {/* Stage 02 */}
            <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/40">
                  Stage 02 // Interactive
                </span>
                <span className="text-zinc-500">Graphics & Physics</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Interactive Systems, Canvas Graphics & Simulations
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Exploring real-time 60 FPS animation loops, physics constraints, particle dynamics, and cellular automata to understand computer graphics and procedural generation from first principles.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Representative work:</span>
                <Link href="/apps/breakout-ball" className="text-purple-300 hover:underline">Breakout Ball</Link>
                <span>·</span>
                <Link href="/apps/particle-chain-wasm" className="text-purple-300 hover:underline">Particle Chain WASM</Link>
                <span>·</span>
                <Link href="/apps/wave-function-collapse" className="text-purple-300 hover:underline">Wave Function Collapse</Link>
                <span>·</span>
                <Link href="/apps/falling-sands" className="text-purple-300 hover:underline">Falling Sands</Link>
              </div>
            </div>

            {/* Stage 03 */}
            <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40">
                  Stage 03 // Systems
                </span>
                <span className="text-zinc-500">WASM, ML & Hardware</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Systems Programming, WebAssembly & Machine Learning
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Stepping below high-level frameworks—compiling C++ to WebAssembly with Emscripten, implementing matrix mathematics for on-device neural networks, and writing embedded microcontroller firmware.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Representative work:</span>
                <Link href="/apps/neural-network-number-recognition" className="text-cyan-300 hover:underline">Neural Network Number Recognition</Link>
                <span>·</span>
                <Link href="/apps/esp32-cam-with-car-contro" className="text-cyan-300 hover:underline">ESP32-CAM WiFi Car</Link>
                <span>·</span>
                <Link href="/apps/spectralens-ai" className="text-cyan-300 hover:underline">SpectraLens AI WASM OCR</Link>
              </div>
            </div>

            {/* Stage 04 */}
            <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40">
                  Stage 04 // Applications
                </span>
                <span className="text-zinc-500">Production Software</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Full-Stack Applications, Mobile & Automation Platforms
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Shipping resilient end-to-end software tools: multi-seller e-commerce batch reconciliation engines, browser extensions, client-side photo editors, and local-first mobile applications.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Representative work:</span>
                <Link href="/apps/es-automation" className="text-emerald-300 hover:underline">ES Automation</Link>
                <span>·</span>
                <Link href="/apps/img-editor" className="text-emerald-300 hover:underline">Img Editor</Link>
                <span>·</span>
                <Link href="/apps/meal-tracker" className="text-emerald-300 hover:underline">Meal Tracker Mobile</Link>
                <span>·</span>
                <Link href="/apps/gcelt-automate" className="text-emerald-300 hover:underline">GCELT Automate</Link>
              </div>
            </div>
          </RevealGroup>
        </section>

        {/* 4. Professional Capability Map: Capabilities to Real Evidence */}
        <CapabilityMap />

        {/* 5. Guiding Principles & Engineering Approach */}
        <section aria-labelledby="principles-heading" className="space-y-6">
          <Reveal direction="up" distance={14}>
            <div className="space-y-2">
              <h2 id="principles-heading" className="text-xl font-bold text-white tracking-tight">
                Building Principles
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                The core principles guiding how software is designed, engineered, and maintained:
              </p>
            </div>
          </Reveal>

          <RevealGroup staggerDelay={0.05} baseDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {identity.creator.principles.map((principle: string, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 flex items-start gap-3.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                  {principle}
                </span>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* 6. Current Focus / Now */}
        <Reveal direction="up" distance={14}>
          <section aria-labelledby="now-focus-heading" className="space-y-6 p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h2 id="now-focus-heading" className="text-lg font-bold text-white tracking-tight">
                  Studio Focus // Now
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Live Status
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Currently Building */}
              {activeApp && (
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold block">
                    Currently Building
                  </span>
                  <Link
                    href={`/apps/${activeApp.slug}`}
                    className="font-bold text-sm text-zinc-100 hover:text-indigo-300 transition-colors block line-clamp-1"
                  >
                    {activeApp.name}
                  </Link>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {activeApp.shortDescription}
                  </p>
                  <Link
                    href={`/apps/${activeApp.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono pt-1 group"
                  >
                    <span>Inspect project</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}

              {/* Currently Exploring (The Lab) */}
              {activeLab && (
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold block">
                    Currently Exploring
                  </span>
                  <Link
                    href={`/apps/${activeLab.slug}`}
                    className="font-bold text-sm text-zinc-100 hover:text-purple-300 transition-colors block line-clamp-1"
                  >
                    {activeLab.name}
                  </Link>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {activeLab.shortDescription}
                  </p>
                  <Link
                    href={`/apps/${activeLab.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-mono pt-1 group"
                  >
                    <span>Launch experiment</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}

              {/* Latest Published Note */}
              {activePost && (
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
                    Latest Field Note
                  </span>
                  <Link
                    href={`/blog/${activePost.slug}`}
                    className="font-bold text-sm text-zinc-100 hover:text-cyan-300 transition-colors block line-clamp-1"
                  >
                    {activePost.title}
                  </Link>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {activePost.excerpt}
                  </p>
                  <Link
                    href={`/blog/${activePost.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono pt-1 group"
                  >
                    <span>Read writing</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Active Technical Topics */}
            {identity.creator.focus.length > 0 && (
              <div className="pt-3 border-t border-zinc-800/60 space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Active Architectural Focus:
                </span>
                <div className="flex flex-wrap gap-2">
                  {identity.creator.focus.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs py-1 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 font-medium font-mono"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </Reveal>

        {/* 7. Verified Social & Platform Channels */}
        <Reveal direction="up" distance={14}>
          <section aria-labelledby="channels-heading" className="pt-6 border-t border-zinc-800/80 space-y-4">
            <h2 id="channels-heading" className="text-sm font-bold text-white tracking-tight font-mono uppercase">
              Platform & Social Channels
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              {activeLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {getPlatformIcon(link.platform)}
                  <span>{link.label}</span>
                  {!link.url.startsWith('mailto:') && (
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  )}
                </a>
              ))}
            </div>
          </section>
        </Reveal>

        {/* 8. Direct Contact & Support Channels */}
        <Reveal direction="up" distance={14}>
          <section aria-labelledby="contact-heading" className="pt-4 border-t border-zinc-800/80 space-y-4">
            <h2 id="contact-heading" className="text-sm font-bold text-white tracking-tight font-mono uppercase">
              Direct Contact & Inquiries
            </h2>
            <p className="text-xs text-zinc-400">
              Have questions, technical inquiries, or want to discuss software collaboration?
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-300 hover:text-indigo-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {contact.label}: {contact.value}
                  </span>
                </a>
              ))}
              <Link
                href={ROUTES.SUPPORT}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                <span>Support Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </PageShell>
  );
}
