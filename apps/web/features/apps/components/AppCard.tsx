'use client';

import { getAppIconUrl } from '@elsesourav/media';
import type { AppListItem, AppPlatform } from '@elsesourav/types';
import { Card } from '@elsesourav/ui';
import {
  Apple,
  ArrowRight,
  Compass,
  Cpu,
  Globe,
  Layers,
  Palette,
  Radio,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  Wrench,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface AppCardProps {
  app: AppListItem;
  index?: number;
  featured?: boolean;
}

/* ─── Category → Fallback Icon ─── */
function getCategoryFallbackIcon(category?: string) {
  const norm = (category || '').toLowerCase();
  if (norm.includes('ai') || norm.includes('ml') || norm.includes('neural')) {
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  }
  if (norm.includes('auto') || norm.includes('e-com') || norm.includes('flow')) {
    return <Cpu className="w-5 h-5 text-emerald-400" />;
  }
  if (norm.includes('hardware') || norm.includes('iot') || norm.includes('embedded')) {
    return <Radio className="w-5 h-5 text-cyan-400" />;
  }
  if (norm.includes('media') || norm.includes('design') || norm.includes('creative')) {
    return <Palette className="w-5 h-5 text-rose-400" />;
  }
  if (norm.includes('simul') || norm.includes('algo') || norm.includes('math')) {
    return <Layers className="w-5 h-5 text-violet-400" />;
  }
  if (norm.includes('util') || norm.includes('tool')) {
    return <Wrench className="w-5 h-5 text-amber-400" />;
  }
  if (norm.includes('terminal') || norm.includes('cli') || norm.includes('code')) {
    return <Terminal className="w-5 h-5 text-indigo-400" />;
  }
  return <Globe className="w-5 h-5 text-indigo-400" />;
}

/* ─── Platform Icon Helper ─── */
function PlatformIcon({ platform }: { platform: AppPlatform }) {
  switch (platform) {
    case 'web':
      return <Globe className="w-3 h-3" />;
    case 'chrome':
      return <Compass className="w-3 h-3" />;
    case 'android':
    case 'ios':
      return <Smartphone className="w-3 h-3" />;
    case 'macos':
      return <Apple className="w-3 h-3" />;
    case 'github':
    case 'linux':
    case 'windows':
    default:
      return <Terminal className="w-3 h-3" />;
  }
}

/* ─── Platform Label Helper ─── */
function platformLabel(platform: AppPlatform): string {
  const labels: Record<string, string> = {
    web: 'Web',
    chrome: 'Chrome',
    android: 'Android',
    ios: 'iOS',
    macos: 'Mac',
    windows: 'Windows',
    linux: 'Linux',
    github: 'GitHub',
    download: 'Download',
    other: 'Other',
  };
  return labels[platform] || platform;
}

/* ─── Compact Rating Count Formatter ─── */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/* ─── Star Rating Row ─── */
function StarRating({
  value,
  count,
  size = 'sm',
}: {
  value: number;
  count?: number;
  size?: 'xs' | 'sm';
}) {
  const max = 5;
  const starCls = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textCls = size === 'xs' ? 'text-[11px]' : 'text-xs';

  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label={`Rated ${value.toFixed(1)} out of ${max}`}
    >
      <div className="flex items-center">
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(Math.max(value - i, 0), 1);
          return (
            <span key={i} className="relative inline-block">
              <Star
                className={`${starCls} shrink-0 fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700`}
              />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={`${starCls} max-w-none shrink-0 fill-amber-400 text-amber-400`} />
              </span>
            </span>
          );
        })}
      </div>
      <span className={`${textCls} font-semibold tabular-nums text-[hsl(var(--foreground))]`}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && count > 0 && (
        <span className={`${textCls} font-normal text-[hsl(var(--muted-foreground))]`}>
          ({formatCount(count)})
        </span>
      )}
    </div>
  );
}

/* ─── AppCard (16:9 Banner Style, No Lightbox, Streamlined Padding) ─── */
export function AppCard({ app, featured = false }: AppCardProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
  const bannerUrl = app.featuredImageUrl || iconUrl || app.iconUrl;
  const isFallbackBanner = !app.featuredImageUrl && !!(iconUrl || app.iconUrl);
  const hasRating = app.ratingAverage !== undefined && app.ratingAverage > 0;

  /* ─── Featured (Large) Card ─── */
  if (featured) {
    return (
      <Link
        href={`/apps/${app.slug}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-3xl"
      >
        <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:bg-[hsl(var(--surface-elevated))] rounded-3xl transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 active:scale-[0.99] active:translate-y-0 backdrop-blur-md relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
            {/* ── Banner Cover (16:9 on mobile, full-height on md+) ── */}
            <div className="md:col-span-6 relative">
              {bannerUrl ? (
                <div className="relative aspect-[16/9] md:aspect-auto md:h-full w-full overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center group/thumb">
                  {isFallbackBanner ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600/40 via-violet-500/50 to-purple-700/60 p-6 sm:p-8">
                      <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-300">
                        <Image
                          src={bannerUrl}
                          alt={`${app.name} banner icon`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                      <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
                    </div>
                  ) : (
                    <Image
                      src={bannerUrl}
                      alt={`${app.name} project cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Badge (Featured / Pinned) */}
                  {(app.isFeatured || app.isPinned) && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm border border-white/15">
                      {app.isPinned ? 'Pinned' : 'Featured'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative aspect-[16/9] md:aspect-auto md:h-full w-full overflow-hidden bg-gradient-to-br from-indigo-600/30 via-violet-500/20 to-purple-700/30 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xl">
                    {app.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {app.primaryCategory}
                  </span>
                </div>
              )}
            </div>

            {/* ── Metadata (Right) ── */}
            <div className="md:col-span-6 flex flex-col justify-between p-4 sm:p-5 md:p-6 space-y-3.5">
              {/* Category & Version */}
              <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[hsl(var(--border-subtle))]">
                <span className="text-[hsl(var(--muted-foreground))] font-medium">
                  {app.primaryCategory}
                </span>
                {app.currentVersion && (
                  <span className="text-[hsl(var(--subtle-foreground))] text-xs font-mono">
                    v{app.currentVersion}
                  </span>
                )}
              </div>

              {/* Icon + Title */}
              <div className="flex items-start gap-3 pt-0.5">
                <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] shrink-0 flex items-center justify-center shadow-md">
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt={`${app.name} icon`}
                      width={52}
                      height={52}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    getCategoryFallbackIcon(app.primaryCategory)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xl sm:text-2xl text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1 leading-tight">
                    {app.name}
                  </h3>
                  {hasRating && (
                    <div className="mt-1">
                      <StarRating value={app.ratingAverage!} count={app.ratingCount} size="sm" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {app.shortDescription}
              </p>

              {/* Footer: Platforms + CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border-subtle))] text-xs text-[hsl(var(--muted-foreground))]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {app.platforms.slice(0, 4).map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--surface-subtle))] px-2 py-1 text-[11px] font-medium leading-none text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border-subtle))] transition-colors group-hover:border-indigo-500/20 group-hover:text-[hsl(var(--foreground))]"
                    >
                      <PlatformIcon platform={platform} />
                      {platformLabel(platform)}
                    </span>
                  ))}
                </div>

                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs sm:text-sm shrink-0 ml-2">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  /* ─── Regular (16:9 Banner Grid) Card ─── */
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
    >
      <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 rounded-2xl transition-all duration-300 ease-out flex flex-col overflow-hidden group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-indigo-500/10 active:scale-[0.99] active:translate-y-0 backdrop-blur-sm">
        {/* ── Banner Area: 16:9 Ratio, No Lightbox ── */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[hsl(var(--surface-subtle))] group/thumb">
          {bannerUrl ? (
            isFallbackBanner ? (
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600/30 via-violet-500/40 to-purple-700/50">
                <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={bannerUrl}
                    alt={`${app.name} preview icon`}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <Image
                src={bannerUrl}
                alt={`${app.name} preview`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
              />
            )
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-600/25 via-violet-500/20 to-purple-700/25 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 font-mono font-bold text-base">
                {app.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Badge */}
          {(app.isFeatured || app.isPinned) && (
            <span className="absolute left-3 top-3 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-sm border border-white/15">
              {app.isPinned ? 'Pinned' : 'Featured'}
            </span>
          )}
        </div>

        {/* ── Body: Grand visual, streamlined padding ── */}
        <div className="relative flex flex-1 flex-col px-3.5 pt-1 pb-3.5 sm:px-4 sm:pb-4">
          {/* Floating Icon */}
          <div className="-mt-8 mb-2 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[hsl(var(--card))] shadow-lg shadow-black/15 ring-[3px] ring-[hsl(var(--card))] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 overflow-hidden">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={`${app.name} icon`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--surface-subtle))]">
                {getCategoryFallbackIcon(app.primaryCategory)}
              </div>
            )}
          </div>

          {/* Title & Category Row */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base sm:text-lg font-bold tracking-tight text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug">
              {app.name}
            </h3>
            <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] shrink-0">
              {app.primaryCategory}
            </span>
          </div>

          {/* Rating */}
          {hasRating && (
            <div className="mt-1">
              <StarRating value={app.ratingAverage!} count={app.ratingCount} size="xs" />
            </div>
          )}

          {/* Description */}
          <p className="mt-1.5 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed flex-1">
            {app.shortDescription}
          </p>

          {/* Footer: Platform badges + explore arrow */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[hsl(var(--border-subtle))]">
            <div className="flex flex-wrap items-center gap-1">
              {app.platforms.slice(0, 3).map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--surface-subtle))] px-2 py-1 text-[10px] font-medium leading-none text-[hsl(var(--muted-foreground))] transition-colors group-hover:text-[hsl(var(--foreground))]"
                >
                  <PlatformIcon platform={platform} />
                  {platformLabel(platform)}
                </span>
              ))}
              {app.platforms.length > 3 && (
                <span className="inline-flex items-center rounded-lg bg-[hsl(var(--surface-subtle))] px-1.5 py-1 text-[10px] font-medium leading-none text-[hsl(var(--subtle-foreground))]">
                  +{app.platforms.length - 3}
                </span>
              )}
            </div>

            <span className="text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
