'use client';

import { getAppIconUrl, getAppScreenshotUrl } from '@elsesourav/media';
import type { AppListItem, AppOrientation } from '@elsesourav/types';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface AppEditorialCardProps {
  app: AppListItem;
  variant?: AppOrientation;
  eyebrow?: string;
  headline?: string;
  priority?: boolean;
  className?: string;
}

export function resolveAppOrientation(app: AppListItem): AppOrientation {
  if (app.orientation === 'portrait' || app.orientation === 'landscape') {
    return app.orientation;
  }
  const normSlug = (app.slug || '').toLowerCase();
  const normName = (app.name || '').toLowerCase();
  if (
    normSlug.includes('breakout') ||
    normName.includes('breakout') ||
    normSlug.includes('meal-tracker') ||
    normName.includes('meal tracker') ||
    normSlug.includes('esp32') ||
    normName.includes('esp32')
  ) {
    return 'portrait';
  }
  const hasMobileOnly =
    Boolean(app.platforms?.length) && app.platforms.every((p) => p === 'android' || p === 'ios');
  if (hasMobileOnly) {
    return 'portrait';
  }
  return 'landscape';
}

function getAppEyebrow(app: AppListItem, isPortrait: boolean): string {
  const norm = (app.categorySlug || app.primaryCategory || '').toLowerCase();
  const normSlug = (app.slug || '').toLowerCase();
  if (normSlug.includes('breakout')) return 'ARCADE SHOWCASE';
  if (normSlug.includes('meal-tracker') || norm.includes('meal')) return 'MOBILE UTILITY';
  if (normSlug.includes('esp32')) return 'HARDWARE & EMBEDDED';
  if (isPortrait) return 'MOBILE SHOWCASE';
  if (norm.includes('game') || norm.includes('play')) return 'GAMES WE LOVE';
  if (norm.includes('simul') || norm.includes('algo')) return 'SIMULATION SPOTLIGHT';
  if (norm.includes('ai') || norm.includes('neural')) return 'AI BREAKTHROUGH';
  if (norm.includes('auto') || norm.includes('e-com')) return 'WORKFLOW AUTOMATION';
  if (norm.includes('iot') || norm.includes('hardware')) return 'HARDWARE & EMBEDDED';
  if (norm.includes('tool') || norm.includes('dev')) return 'DEVELOPER ESSENTIALS';
  return 'FEATURED SOFTWARE';
}

function getEditorialHeadline(app: AppListItem): string {
  const norm = app.name.toLowerCase();
  const normSlug = (app.slug || '').toLowerCase();
  if (normSlug.includes('breakout') || norm.includes('breakout'))
    return 'WASM Brick-Breaker Physics';
  if (normSlug.includes('meal-tracker') || norm.includes('meal tracker'))
    return 'Offline Habit & Diet Portability';
  if (norm.includes('particle')) return 'Real-Time Chain Physics';
  if (norm.includes('automation')) return 'Automate Marketplace Scale';
  if (norm.includes('wifi') || norm.includes('vehicle') || normSlug.includes('esp32'))
    return 'ESP32 Live Video Rover';
  if (norm.includes('img') || norm.includes('editor')) return 'Non-Destructive Creative Suite';
  if (norm.includes('gst')) return 'Tax & Marketplace Reconciliation';
  if (norm.includes('spectralens')) return 'Intelligent Edge Vision';
  return app.name;
}

export function AppEditorialCard({
  app,
  variant,
  eyebrow,
  headline,
  priority = false,
  className = '',
}: AppEditorialCardProps) {
  const orientation = variant || resolveAppOrientation(app);
  const isPortrait = orientation === 'portrait';

  const bannerUrl = app.featuredImageUrl
    ? getAppScreenshotUrl(app.featuredImageUrl, 1600, 1000)
    : app.iconUrl;
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
  const tagEyebrow = eyebrow || getAppEyebrow(app, isPortrait);
  const displayHeadline = headline || getEditorialHeadline(app);

  const aspectClasses = isPortrait
    ? 'aspect-[4/5] sm:aspect-[3/4] md:aspect-auto w-full h-full min-h-[300px] sm:min-h-[360px] md:min-h-[460px]'
    : 'aspect-[16/10] sm:aspect-[16/9] w-full min-h-[190px] sm:min-h-[240px] md:min-h-[280px]';

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`group/editorial block h-full w-full min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg ${className}`}
    >
      <div
        className={`relative w-full h-full min-w-0 rounded-lg overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-950 shadow-xs hover:shadow-xl hover:shadow-black/15 dark:hover:shadow-black/50 transition-all duration-300 ease-out flex flex-col justify-end p-2.5 sm:p-3 md:p-4 ${aspectClasses}`}
      >
        {/* Full-Bleed Artwork / Screenshot (smooth image zoom on hover) */}
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${app.name} background visual`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            unoptimized
            className={`pointer-events-none object-cover transition-transform duration-500 ease-out group-hover/editorial:scale-105 ${
              isPortrait ? 'object-top' : 'object-center'
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-zinc-900 to-black" />
        )}

        {/* Transparent subtle gradient scrim: allows artwork/text to remain fully visible through the bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background: isPortrait
              ? 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0,0,0,0.06) 74%, rgba(0,0,0,0.20) 88%, rgba(0,0,0,0.36) 100%)'
              : 'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.08) 72%, rgba(0,0,0,0.22) 88%, rgba(0,0,0,0.36) 100%)',
          }}
        />

        {/* Inside Card Content Layer (Eyebrow + Title + Transparent Glass Bottom Capsule) */}
        <div className="relative z-[5] space-y-1.5 sm:space-y-2.5 w-full min-w-0">
          {/* Eyebrow & Headline — Transparent backing, protected with crisp text shadows for light/dark images */}
          <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
            <span className="inline-block text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-amber-400 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {tagEyebrow}
            </span>

            <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl text-white font-display tracking-tight leading-snug line-clamp-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] group-hover/editorial:text-indigo-200 transition-colors duration-200">
              {displayHeadline}
            </h3>
          </div>

          {/* Transparent Frosted Glass Bottom Capsule (Visible Artwork Beneath) */}
          <div className="w-full min-w-0">
            <div className="w-full min-w-0 flex items-center justify-between gap-2 sm:gap-2.5 p-1.5 sm:p-2 md:p-2.5 rounded-md bg-white/50 dark:bg-black/45 backdrop-blur-md border border-white/40 dark:border-white/15 group-hover/editorial:border-white/60 dark:group-hover/editorial:border-white/25 shadow-sm transition-colors duration-200">
              {/* App Icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md overflow-hidden bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/15 shrink-0 shadow-xs flex items-center justify-center">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={`${app.name} icon`}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-mono font-bold text-xs bg-indigo-600">
                    {app.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Category in Capsule (Transparent Glass Backing) */}
              <div className="min-w-0 flex-1 overflow-hidden pr-1">
                <span className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white block line-clamp-1 sm:line-clamp-2 font-display drop-shadow-[0_0.5px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {app.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-zinc-800 dark:text-zinc-300 block truncate font-sans font-medium drop-shadow-[0_0.5px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {app.primaryCategory}
                </span>
              </div>

              {/* Button inside capsule with transparent styling and group-hover transition */}
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-white/70 dark:bg-white/15 text-zinc-950 dark:text-white border border-white/50 dark:border-white/20 font-semibold text-[10px] sm:text-[11px] md:text-xs tracking-wide shadow-xs transition-all duration-200 ease-out group-hover/editorial:bg-indigo-600 group-hover/editorial:text-white group-hover/editorial:border-indigo-600 group-hover/editorial:shadow-sm font-display shrink-0">
                <span>View</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80 group-hover/editorial:opacity-100 transition-transform duration-200 ease-out group-hover/editorial:translate-x-0.5 group-hover/editorial:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
