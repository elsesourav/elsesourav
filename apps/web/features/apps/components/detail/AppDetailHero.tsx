'use client';

import { ShareButton } from '@/components/share/ShareButton';
import {
  getAppDisplaySize,
  getAppLanguageDisplay,
  getProjectAge,
} from '@/features/apps/utils/app-metrics';
import { getAppIconUrl } from '@elsesourav/media';
import type { PublicApp } from '@elsesourav/types';
import { Button } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import {
  Archive,
  ArrowUpRight,
  ChevronRight,
  Code2,
  Globe,
  Lock,
  Maximize2,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

interface AppDetailHeroProps {
  app: PublicApp;
  isAuthenticated?: boolean;
}

export function AppDetailHero({ app, isAuthenticated = false }: AppDetailHeroProps) {
  const [isIconLightboxOpen, setIsIconLightboxOpen] = React.useState(false);
  const iconRef = React.useRef<HTMLDivElement>(null);

  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 160) : null;

  // Find GitHub repository link
  const githubLink = app.links.find((l) => l.platform === 'github' || l.url.includes('github.com'));

  // Find primary web/demo link
  const webDemoLink =
    app.demoUrl ||
    app.links.find((l) => l.isPrimary || l.platform === 'web' || l.platform === 'chrome')?.url;

  const isArchived =
    app.tags.includes('archived') || app.tags.includes('legacy') || app.tags.includes('inactive');

  const ratingAvg = app.stats?.ratingAverage ?? 0;
  const ratingCount = app.stats?.ratingCount ?? 0;

  // Dynamic calculated project age based on publishedAt / createdAt starting date
  const projectAge = getProjectAge(app.publishedAt ?? app.createdAt ?? app.releaseDate);

  // Dynamic non-constant build size calculation
  const appSize = getAppDisplaySize(app);

  // Dynamic primary language display
  const appLanguage = getAppLanguageDisplay(app);

  return (
    <header className="relative space-y-4 sm:space-y-6">
      {/* ── Ambient Radial Atmosphere Bloom ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-gradient-to-b from-indigo-500/12 via-violet-500/6 to-transparent blur-3xl rounded-full select-none -z-10"
      />

      {/* ── Breadcrumb Navigation ── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--muted-foreground))] overflow-x-auto no-scrollbar whitespace-nowrap py-0.5"
      >
        <Link
          href="/apps"
          className="hover:text-[hsl(var(--foreground))] transition-colors shrink-0"
        >
          <span>Apps</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]/60 shrink-0" />
        <Link
          href={`/apps?category=${app.categorySlug}`}
          className="hover:text-[hsl(var(--foreground))] transition-colors text-indigo-600 dark:text-indigo-400 font-medium shrink-0"
        >
          {app.primaryCategory}
        </Link>
        <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]/60 shrink-0" />
        <span className="text-[hsl(var(--foreground))] font-semibold truncate max-w-[160px] sm:max-w-xs shrink-0">
          {app.name}
        </span>
      </nav>

      {/* ── Main Hero Card ── */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-2xl p-4 sm:p-7 md:p-8 space-y-4 sm:space-y-6 shadow-md overflow-hidden">
        {/* Subtle Top Specular Horizon Line */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent pointer-events-none"
        />

        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 md:gap-7">
          {/* App Icon Visual Mark with Squircle Lightbox */}
          <div
            ref={iconRef}
            onClick={() => iconUrl && setIsIconLightboxOpen(true)}
            className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] shadow-lg ring-1 ring-white/10 shrink-0 flex items-center justify-center ${
              iconUrl ? 'cursor-zoom-in group/icon' : ''
            }`}
            title={iconUrl ? 'Click to inspect visual mark in Lightbox' : undefined}
          >
            {iconUrl ? (
              <>
                <Image
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  width={112}
                  height={112}
                  priority
                  className="w-full h-full object-cover group-hover/icon:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/icon:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                  <Maximize2 className="w-5 h-5 drop-shadow-md" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-[hsl(var(--surface))] text-indigo-600 dark:text-indigo-400 font-bold text-2xl sm:text-3xl font-mono">
                {app.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Title & Core Copy */}
          <div className="flex-1 space-y-2.5 sm:space-y-3.5 min-w-0">
            {/* Status Eyebrow Row (Displays status tags when applicable; category is displayed once in Key Stats) */}
            {(isArchived || (app.requiresAuth && !isAuthenticated)) && (
              <div className="flex items-center gap-2">
                {isArchived ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                    <Archive className="w-3 h-3" />
                    <span>Archived Project</span>
                  </span>
                ) : app.requiresAuth && !isAuthenticated ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-medium">
                    <Lock className="w-3 h-3" />
                    <span>Sign In Required</span>
                  </span>
                ) : null}
              </div>
            )}

            {/* Display Title */}
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--foreground))] tracking-tight font-display leading-snug sm:leading-tight">
              {app.name}
            </h1>

            {/* Short Description */}
            <p className="text-xs sm:text-sm md:text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-3xl">
              {app.shortDescription}
            </p>

            {/* Tech Stack Chips */}
            {app.tags && app.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {app.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
              {/* Primary Live / Web Trigger */}
              {webDemoLink &&
                (app.requiresAuth && !isAuthenticated ? (
                  <Link
                    href={`/login?next=/apps/${encodeURIComponent(app.slug)}`}
                    className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
                  >
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] shadow-lg shadow-amber-600/25 gap-2 rounded-xl active:scale-[0.98] transition-transform"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Launch</span>
                    </Button>
                  </Link>
                ) : (
                  <a
                    href={webDemoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                  >
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] shadow-lg shadow-indigo-600/25 gap-2 rounded-xl active:scale-[0.98] transition-transform"
                    >
                      <span>Launch Application</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </a>
                ))}

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
                    size="sm"
                    className="border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] gap-2 rounded-xl active:scale-[0.98] transition-transform"
                  >
                    <Code2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <span>Source Code</span>
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
                    size="sm"
                    className="text-indigo-600 dark:text-indigo-300 hover:bg-[hsl(var(--accent))] text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] gap-1.5 rounded-xl active:scale-[0.98]"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demo</span>
                  </Button>
                </a>
              )}

              {/* Content-Aware Canonical Share */}
              <ShareButton
                title={app.name}
                text={app.shortDescription}
                canonicalPathOrUrl={`/apps/${app.slug}`}
              />
            </div>
          </div>
        </div>

        {/* ── App Store Key Stats Strip (5 Focused Columns) ── */}
        <div className="pt-4 sm:pt-6 border-t border-[hsl(var(--border-subtle))] grid grid-cols-5 divide-x divide-[hsl(var(--border-subtle))] text-center select-none">
          {/* 1. RATINGS */}
          <div className="px-1 sm:px-2 py-1 space-y-0.5 flex flex-col items-center justify-center min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              {ratingCount > 0 ? `${ratingCount} RATINGS` : 'RATINGS'}
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-bold font-display text-[hsl(var(--foreground))]">
              {ratingAvg > 0 ? ratingAvg.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < Math.round(ratingAvg || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-600 fill-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 2. AGE (Calculated from project starting date) */}
          <div className="px-1 sm:px-2 py-1 space-y-0.5 flex flex-col items-center justify-center min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              AGE
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-bold font-display text-[hsl(var(--foreground))]">
              {projectAge.value}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[hsl(var(--muted-foreground))] font-medium">
              {projectAge.unit}
            </span>
          </div>

          {/* 3. CATEGORY */}
          <div className="px-0.5 sm:px-2 py-1 space-y-0.5 flex flex-col items-center justify-center min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              CATEGORY
            </span>
            <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-[hsl(var(--foreground))] leading-tight line-clamp-2 px-0.5 text-center break-words">
              {app.primaryCategory}
            </span>
          </div>

          {/* 4. LANGUAGE */}
          <div className="px-1 sm:px-2 py-1 space-y-0.5 flex flex-col items-center justify-center min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              LANGUAGE
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-bold font-display text-[hsl(var(--foreground))]">
              {appLanguage.code}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[hsl(var(--muted-foreground))] font-medium truncate max-w-[85px]">
              {appLanguage.subtext}
            </span>
          </div>

          {/* 5. SIZE (Dynamic calculated build size) */}
          <div className="px-1 sm:px-2 py-1 space-y-0.5 flex flex-col items-center justify-center min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              SIZE
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-bold font-display text-[hsl(var(--foreground))]">
              {appSize.value}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[hsl(var(--muted-foreground))] font-medium">
              {appSize.unit}
            </span>
          </div>
        </div>
      </div>

      {iconUrl && (
        <Lightbox
          open={isIconLightboxOpen}
          onClose={() => setIsIconLightboxOpen(false)}
          src={iconUrl}
          alt={`${app.name} icon`}
          caption={`${app.name} — Visual Mark & Icon`}
          originRef={iconRef}
        />
      )}
    </header>
  );
}
