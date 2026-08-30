import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { AppListItem, AppPlatform } from '@elsesourav/types';
import {
  Globe,
  Compass,
  Smartphone,
  Apple,
  Terminal,
  ArrowRight,
  Sparkles,
  Cpu,
  Radio,
  Palette,
  Layers,
  Wrench,
} from 'lucide-react';

export interface AppCardProps {
  app: AppListItem;
  index?: number;
  featured?: boolean;
}

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

function PlatformIcon({ platform }: { platform: AppPlatform }) {
  switch (platform) {
    case 'web':
      return <Globe className="w-3.5 h-3.5" />;
    case 'chrome':
      return <Compass className="w-3.5 h-3.5" />;
    case 'android':
    case 'ios':
      return <Smartphone className="w-3.5 h-3.5" />;
    case 'macos':
      return <Apple className="w-3.5 h-3.5" />;
    case 'github':
    case 'linux':
    case 'windows':
    default:
      return <Terminal className="w-3.5 h-3.5" />;
  }
}

export function AppCard({ app, index, featured = false }: AppCardProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
  const bannerUrl = app.featuredImageUrl || iconUrl || app.iconUrl;
  const isFallbackBanner = !app.featuredImageUrl && !!(iconUrl || app.iconUrl);
  const formattedIndex = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  if (featured) {
    return (
      <Link
        href={`/apps/${app.slug}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-3xl"
      >
        <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:bg-[hsl(var(--surface-elevated))] p-5 sm:p-7 md:p-8 rounded-3xl transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 active:scale-[0.99] active:translate-y-0 backdrop-blur-md relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
            {/* Visual Cover / Interface Showcase (Left/Top) */}
            <div className="md:col-span-6 relative">
              {bannerUrl ? (
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] shadow-md flex items-center justify-center">
                  {isFallbackBanner ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-950/80 p-8">
                      <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                        <Image
                          src={bannerUrl}
                          alt={`${app.name} banner icon`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={bannerUrl}
                      alt={`${app.name} project cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(var(--surface-subtle))] to-[hsl(var(--card))] border border-[hsl(var(--border))] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono font-bold text-lg">
                    {app.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {app.primaryCategory}
                  </span>
                </div>
              )}
            </div>

            {/* Editorial Metadata & Context (Right/Bottom) */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[hsl(var(--border-subtle))]">
                <div className="flex items-center gap-2">
                  {formattedIndex && (
                    <span className="font-mono text-indigo-700 dark:text-indigo-400 font-bold text-xs bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                      {formattedIndex}
                    </span>
                  )}
                  <span className="text-[hsl(var(--muted-foreground))] font-medium text-xs">
                    {app.primaryCategory}
                  </span>
                </div>
                {app.currentVersion && (
                  <span className="text-[hsl(var(--subtle-foreground))] text-xs font-mono">
                    v{app.currentVersion}
                  </span>
                )}
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-3.5 pt-1">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] shrink-0 flex items-center justify-center shadow-md">
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt={`${app.name} icon`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    getCategoryFallbackIcon(app.primaryCategory)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xl sm:text-2xl text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight">
                    {app.name}
                  </h3>
                  <p className="text-xs text-[hsl(var(--subtle-foreground))] font-mono mt-1">
                    {app.primaryCategory}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3 leading-relaxed">
                {app.shortDescription}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border-subtle))] text-xs text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-2">
                  {app.platforms.slice(0, 4).map((platform) => (
                    <span
                      key={platform}
                      title={platform.toUpperCase()}
                      className="w-6 h-6 rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] flex items-center justify-center text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                      <PlatformIcon platform={platform} />
                    </span>
                  ))}
                </div>

                <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5 group-hover:translate-x-1 transition-transform text-xs sm:text-sm">
                  <span>Inspect project</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
    >
      <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 p-4 sm:p-5 rounded-2xl transition-all duration-300 ease-out flex flex-col justify-between backdrop-blur-sm group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-indigo-500/5 active:scale-[0.99] active:translate-y-0 overflow-hidden">
        <div className="space-y-3">
          {/* Visual Banner Thumbnail (with Icon Fallback) */}
          {bannerUrl && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] shadow-inner flex items-center justify-center">
              {isFallbackBanner ? (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/30 via-zinc-900/50 to-zinc-950/70 p-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={bannerUrl}
                      alt={`${app.name} preview icon`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <Image
                  src={bannerUrl}
                  alt={`${app.name} preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                />
              )}
            </div>
          )}

          {/* Header row with index and category */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[hsl(var(--border-subtle))]">
            <div className="flex items-center gap-2">
              {formattedIndex && (
                <span className="font-mono text-[hsl(var(--subtle-foreground))] font-medium text-[11px]">
                  {formattedIndex}
                </span>
              )}
              <span className="text-[hsl(var(--muted-foreground))] text-xs font-medium truncate max-w-[160px]">
                {app.primaryCategory}
              </span>
            </div>
            {app.currentVersion && (
              <span className="text-[11px] text-[hsl(var(--subtle-foreground))] font-mono">
                v{app.currentVersion}
              </span>
            )}
          </div>

          {/* Icon + Title */}
          <div className="flex items-start gap-3 pt-0.5">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] shrink-0 flex items-center justify-center shadow-sm">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                getCategoryFallbackIcon(app.primaryCategory)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                {app.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
            {app.shortDescription}
          </p>
        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[hsl(var(--border-subtle))] text-xs text-[hsl(var(--subtle-foreground))]">
          <div className="flex items-center gap-1.5">
            {app.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                title={platform.toUpperCase()}
                className="w-5 h-5 rounded-full bg-[hsl(var(--surface-subtle))] flex items-center justify-center text-[hsl(var(--muted-foreground))]"
              >
                <PlatformIcon platform={platform} />
              </span>
            ))}
          </div>

          <span className="text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
            <span>View project</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
