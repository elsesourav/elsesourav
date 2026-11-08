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
  Lock,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface AppCardProps {
  app: AppListItem;
  index?: number;
  featured?: boolean;
  variant?: 'banner' | 'list';
  className?: string;
  showPlatforms?: boolean;
  showDescription?: boolean;
  showCategory?: boolean;
}

/* ─── Category → Fallback Icon ─── */
function getCategoryFallbackIcon(category?: string) {
  const norm = (category || '').toLowerCase();
  if (norm.includes('ai') || norm.includes('ml') || norm.includes('neural'))
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  if (norm.includes('auto') || norm.includes('flow') || norm.includes('e-com'))
    return <Cpu className="w-5 h-5 text-emerald-400" />;
  if (norm.includes('hardware') || norm.includes('iot') || norm.includes('embedded'))
    return <Radio className="w-5 h-5 text-cyan-400" />;
  if (norm.includes('media') || norm.includes('design') || norm.includes('creative'))
    return <Palette className="w-5 h-5 text-rose-400" />;
  if (norm.includes('simul') || norm.includes('algo') || norm.includes('math'))
    return <Layers className="w-5 h-5 text-violet-400" />;
  if (norm.includes('util') || norm.includes('tool'))
    return <Wrench className="w-5 h-5 text-amber-400" />;
  if (norm.includes('terminal') || norm.includes('cli') || norm.includes('code'))
    return <Terminal className="w-5 h-5 text-indigo-400" />;
  return <Globe className="w-5 h-5 text-indigo-400" />;
}

/* ─── Platform Icon Helper ─── */
const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  web: Globe,
  chrome: Compass,
  android: Smartphone,
  ios: Smartphone,
  macos: Apple,
  linux: Terminal,
  windows: Terminal,
  github: Terminal,
};
function PlatformIcon({ platform }: { platform: AppPlatform }) {
  const Icon = PLATFORM_ICONS[platform] || Terminal;
  return <Icon className="w-3 h-3" />;
}

/* ─── Platform Label Helper ─── */
const PLATFORM_LABELS: Record<string, string> = {
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
function platformLabel(platform: AppPlatform): string {
  return PLATFORM_LABELS[platform] || platform;
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

/* ─── AppCard Component ─── */
export function AppCard({
  app,
  featured = false,
  variant = 'banner',
  className = '',
  showPlatforms = true,
  showDescription = true,
  showCategory = true,
}: AppCardProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
  const bannerUrl = app.featuredImageUrl || iconUrl || app.iconUrl;
  const isFallbackBanner = !app.featuredImageUrl && !!(iconUrl || app.iconUrl);
  const hasRating = app.ratingAverage !== undefined && app.ratingAverage > 0;

  /* ─── 1. Featured (Large / Split) Card ─── */
  if (featured) {
    return (
      <Link
        href={`/apps/${app.slug}`}
        className={`group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl ${className}`}
      >
        <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-2xl transition-colors duration-200 ease-out shadow-xs hover:shadow-md backdrop-blur-md relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
            {/* ── Banner Cover (Compact 16:8 on mobile, full-height on md+) ── */}
            <div className="md:col-span-6 relative">
              {bannerUrl ? (
                <div className="relative aspect-[16/8] md:aspect-auto md:h-full w-full overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                  {isFallbackBanner ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600/40 via-violet-500/50 to-purple-700/60 p-6 sm:p-8">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-white/20">
                        <Image
                          src={bannerUrl}
                          alt={`${app.name} banner icon`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-black/15 blur-2xl pointer-events-none" />
                    </div>
                  ) : (
                    <Image
                      src={bannerUrl}
                      alt={`${app.name} project cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Pinned Top-Left Corner Badge - matching app slider left top */}
                  {(app.isFeatured || app.isPinned || featured) && (
                    <div className="absolute top-0 left-0 z-10 px-2.5 py-0.5 bg-white/95 text-zinc-900 border-b border-r border-zinc-200 dark:bg-black/95 dark:text-white/90 dark:border-white/15 font-semibold text-[10px] uppercase tracking-wider font-mono rounded-tl-none rounded-br-md shadow-sm pointer-events-none select-none">
                      {app.isPinned ? 'Pinned' : 'Featured'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative aspect-[16/8] md:aspect-auto md:h-full w-full overflow-hidden bg-gradient-to-br from-indigo-600/30 via-violet-500/20 to-purple-700/30 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono font-bold text-lg">
                    {app.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {app.primaryCategory}
                  </span>
                </div>
              )}
            </div>

            {/* ── Metadata (Right) ── */}
            <div className="md:col-span-6 flex flex-col justify-between p-2.5 sm:p-3.5 md:p-4 space-y-2 sm:space-y-2.5">
              {/* Category & Version */}
              <div className="flex items-center justify-between text-xs pb-1.5 sm:pb-2 border-b border-[hsl(var(--border-subtle))]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[hsl(var(--muted-foreground))] font-medium text-[10px] sm:text-[11px]">
                    {app.primaryCategory}
                  </span>
                  {app.requiresAuth && (
                    <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Member</span>
                    </span>
                  )}
                </div>
                {app.currentVersion && (
                  <span className="text-[hsl(var(--muted-foreground))] text-[10px] sm:text-xs font-mono">
                    v{app.currentVersion}
                  </span>
                )}
              </div>

              {/* Icon + Title */}
              <div className="flex items-start gap-2.5 sm:gap-3 pt-0.5">
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] shrink-0 flex items-center justify-center shadow-sm">
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt={`${app.name} icon`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    getCategoryFallbackIcon(app.primaryCategory)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base sm:text-lg md:text-xl text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1 leading-tight font-display tracking-tight">
                    {app.name}
                  </h3>
                  {hasRating && (
                    <div className="mt-0.5">
                      <StarRating value={app.ratingAverage!} count={app.ratingCount} size="xs" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                {app.shortDescription}
              </p>

              {/* Footer: Platforms + CTA */}
              <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-[hsl(var(--border-subtle))] text-xs text-[hsl(var(--muted-foreground))]">
                <div className="flex flex-wrap items-center gap-1">
                  {app.platforms.slice(0, 4).map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--surface-subtle))] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium leading-none text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border-subtle))] transition-colors group-hover:border-indigo-500/20 group-hover:text-[hsl(var(--foreground))]"
                    >
                      <PlatformIcon platform={platform} />
                      {platformLabel(platform)}
                    </span>
                  ))}
                </div>

                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px] sm:text-xs shrink-0 ml-2">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  /* ─── 2. List (Compact Horizontal) Card ─── */
  if (variant === 'list') {
    return (
      <Link
        href={`/apps/${app.slug}`}
        className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl ${className}`}
      >
        <Card className="p-2.5 sm:p-3 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-colors duration-200 shadow-xs hover:shadow-md flex items-center gap-3 backdrop-blur-sm">
          {/* Left: Square Thumbnail / Icon */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] shrink-0 flex items-center justify-center shadow-inner">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={`${app.name} icon`}
                width={72}
                height={72}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              getCategoryFallbackIcon(app.primaryCategory)
            )}
          </div>

          {/* Right: Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm sm:text-base font-bold tracking-tight text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-display">
                {app.name}
              </h3>
              {hasRating && (
                <div className="shrink-0">
                  <StarRating value={app.ratingAverage!} count={app.ratingCount} size="xs" />
                </div>
              )}
            </div>

            {showDescription && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1 leading-normal">
                {app.shortDescription}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              <span className="font-mono">{app.primaryCategory}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  /* ─── 3. Standard / Banner Grid Card (The New App Card) ─── */
  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl ${className}`}
    >
      <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-2xl transition-colors duration-200 ease-out flex flex-col overflow-hidden shadow-xs hover:shadow-md backdrop-blur-md">
        {/* ── Banner Area: Compact Aspect Ratio with Atmospheric Glow ── */}
        <div className="relative aspect-[16/8] sm:aspect-[2.1/1] w-full shrink-0 overflow-hidden bg-[hsl(var(--surface-subtle))]">
          {bannerUrl ? (
            isFallbackBanner ? (
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600/35 via-violet-500/40 to-purple-700/50">
                <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-black/15 blur-2xl pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border border-white/20">
                  <Image
                    src={bannerUrl}
                    alt={`${app.name} preview icon`}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Subtle decorative watermark icon on the side */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none">
                  {getCategoryFallbackIcon(app.primaryCategory)}
                </div>
              </div>
            ) : (
              <Image
                src={bannerUrl}
                alt={`${app.name} preview`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            )
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-600/25 via-violet-500/20 to-purple-700/25 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/80 font-mono font-bold text-base">
                {app.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Pinned Top-Left Corner Badge - matching app slider left top */}
          {(app.isFeatured || app.isPinned) && (
            <div className="absolute top-0 left-0 z-10 px-2.5 py-0.5 bg-white/95 text-zinc-900 border-b border-r border-zinc-200 dark:bg-black/95 dark:text-white/90 dark:border-white/15 font-semibold text-[10px] uppercase tracking-wider font-mono rounded-tl-none rounded-br-md shadow-sm pointer-events-none select-none">
              {app.isPinned ? 'Pinned' : 'Featured'}
            </div>
          )}

          {/* Badge: Member Access Required */}
          {app.requiresAuth && (
            <div className="absolute top-0 right-0 z-10 px-2 py-0.5 bg-amber-500/90 text-white font-mono text-[10px] font-semibold tracking-wider uppercase rounded-tr-none rounded-bl-md shadow-sm flex items-center gap-1 border-b border-l border-amber-300/30">
              <Lock className="w-2.5 h-2.5" />
              <span>Member</span>
            </div>
          )}
        </div>

        {/* ── Body: Floating Squircle Icon + Metadata ── */}
        <div className="relative flex flex-1 flex-col px-2.5 sm:px-3.5 md:px-4 pt-0.5 pb-2 sm:pb-3">
          {/* Overlapping Floating Squircle Icon */}
          <div className="-mt-5 mb-1 sm:-mt-6 sm:mb-1.5 flex h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-[hsl(var(--card))] shadow-md ring-2 sm:ring-3 ring-[hsl(var(--card))] overflow-hidden transition-colors">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={`${app.name} icon`}
                width={48}
                height={48}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--surface-subtle))]">
                {getCategoryFallbackIcon(app.primaryCategory)}
              </div>
            )}
          </div>

          {/* Title & Category Row */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2 min-w-0">
            <h3 className="truncate text-xs sm:text-sm md:text-base font-bold tracking-tight text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug font-display">
              {app.name}
            </h3>
            {showCategory && (
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-mono text-[hsl(var(--muted-foreground))] shrink-0 truncate max-w-full sm:max-w-[140px] md:max-w-none">
                {app.primaryCategory}
              </span>
            )}
          </div>

          {/* Rating */}
          {hasRating && (
            <div className="mt-0.5">
              <StarRating value={app.ratingAverage!} count={app.ratingCount} size="xs" />
            </div>
          )}

          {/* Description */}
          {showDescription && (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed flex-1">
              {app.shortDescription}
            </p>
          )}

          {/* Footer: Platforms + Explore CTA */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 sm:pt-2.5 border-t border-[hsl(var(--border-subtle))]">
            {showPlatforms && (
              <div className="flex flex-wrap items-center gap-1">
                {app.platforms.slice(0, 3).map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--surface-subtle))] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium leading-normal text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border-subtle))] transition-colors group-hover:text-[hsl(var(--foreground))]"
                  >
                    <PlatformIcon platform={platform} />
                    {platformLabel(platform)}
                  </span>
                ))}
                {app.platforms.length > 3 && (
                  <span className="inline-flex items-center rounded-lg bg-[hsl(var(--surface-subtle))] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium leading-normal text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border-subtle))]">
                    +{app.platforms.length - 3}
                  </span>
                )}
              </div>
            )}

            <span className="text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold flex items-center gap-1 text-[11px] sm:text-xs group-hover:translate-x-0.5 transition-transform shrink-0 ml-auto">
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
