import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { PublicApp, AppLink } from '@elsesourav/types';
import {
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  Globe,
  Code2,
  Layers,
  Terminal,
  Cpu,
  Bookmark,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { SaveAppButton } from './SaveAppButton';
import { ShareButton } from '@/components/share/ShareButton';

interface AppDetailHeroProps {
  app: PublicApp;
}

export function AppDetailHero({ app }: AppDetailHeroProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 160) : null;
  
  // Find GitHub repository link
  const githubLink = app.links.find(
    (l) => l.platform === 'github' || l.url.includes('github.com')
  );

  // Find primary web/demo link
  const webDemoLink =
    app.demoUrl ||
    app.links.find((l) => l.isPrimary || l.platform === 'web' || l.platform === 'chrome')?.url;

  const primaryLink: AppLink | undefined = app.links.find((l) => l.isPrimary) || app.links[0];

  const isLab =
    app.categorySlug === 'simulations' ||
    app.primaryCategory.toLowerCase().includes('simulation') ||
    app.primaryCategory.toLowerCase().includes('lab');

  const isArchived =
    app.tags.includes('archived') ||
    app.tags.includes('legacy') ||
    app.tags.includes('inactive');

  return (
    <header className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--muted-foreground))]">
        <Link href="/apps" className="hover:text-[hsl(var(--foreground))] transition-colors">
          Apps
        </Link>
        <span className="text-[hsl(var(--subtle-foreground))]">/</span>
        <Link
          href={`/apps?category=${app.categorySlug}`}
          className="hover:text-[hsl(var(--foreground))] transition-colors text-indigo-600 dark:text-indigo-400 font-medium"
        >
          {app.primaryCategory}
        </Link>
        <span className="text-[hsl(var(--subtle-foreground))]">/</span>
        <span className="text-[hsl(var(--foreground))] truncate max-w-[200px] sm:max-w-xs">{app.name}</span>
      </nav>

      {/* Main Hero Card */}
      <div className="p-6 sm:p-9 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-xl space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* App Icon / Visual Mark */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] shadow-xl shrink-0 flex items-center justify-center">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={`${app.name} icon`}
                width={96}
                height={96}
                priority
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-[hsl(var(--surface))] text-indigo-600 dark:text-indigo-400 font-bold text-2xl font-mono">
                {app.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Title & Core Copy */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
                {app.name}
              </h1>

              {/* Meaningful Lifecycle State */}
              {isArchived ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <Archive className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span>Archived Project</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Software</span>
                </span>
              )}

              {app.currentVersion && (
                <span className="text-[11px] font-mono text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))]">
                  v{app.currentVersion}
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-3xl">
              {app.shortDescription}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Primary Live / Web Trigger */}
              {webDemoLink && (
                <a
                  href={webDemoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  <Button
                    size="md"
                    className="bg-[hsl(var(--primary))] hover:opacity-90 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-lg shadow-indigo-600/25 gap-2 min-h-[44px] active:scale-[0.98]"
                  >
                    <span>Launch Application</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </a>
              )}

              {/* GitHub Repository Link */}
              {githubLink && (
                <a
                  href={githubLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-xs sm:text-sm gap-2 min-h-[44px] active:scale-[0.98]"
                  >
                    <Code2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <span>View Source Code</span>
                  </Button>
                </a>
              )}

              {/* Secondary Demo link if separate from primary */}
              {app.demoUrl && webDemoLink !== app.demoUrl && (
                <a
                  href={app.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  <Button
                    variant="ghost"
                    size="md"
                    className="text-indigo-600 dark:text-indigo-300 hover:bg-[hsl(var(--accent))] text-xs sm:text-sm gap-1.5 min-h-[44px] active:scale-[0.98]"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demo</span>
                  </Button>
                </a>
              )}

              {/* Save to User Library */}
              <SaveAppButton appId={app.id} appSlug={app.slug} />

              {/* Content-Aware Canonical Share */}
              <ShareButton
                title={app.name}
                text={app.shortDescription}
                canonicalPathOrUrl={`/apps/${app.slug}`}
              />
            </div>
          </div>
        </div>

        {/* Supporting Technical Metadata Strip */}
        <div className="pt-5 border-t border-[hsl(var(--border-subtle))] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[hsl(var(--muted-foreground))] block">Domain</span>
            <span className="text-[hsl(var(--foreground))] font-medium">{app.primaryCategory}</span>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))] block">Target Platforms</span>
            <span className="text-[hsl(var(--foreground))] font-medium">
              {app.platforms.length > 0
                ? app.platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                : 'Web Browser'}
            </span>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))] block">Distribution</span>
            <span className="text-[hsl(var(--foreground))] font-medium">
              {githubLink ? 'Open Source' : 'Web Application'}
            </span>
          </div>
          <div>
            <span className="text-[hsl(var(--muted-foreground))] block">Status</span>
            <span className="text-[hsl(var(--foreground))] font-medium">
              {isArchived ? 'Archived Project' : 'Active Release'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
