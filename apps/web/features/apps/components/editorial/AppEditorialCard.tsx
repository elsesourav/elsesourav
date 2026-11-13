'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAppIconUrl, getAppScreenshotUrl } from '@elsesourav/media';
import type { AppListItem, AppOrientation } from '@elsesourav/types';
import { cn } from '@elsesourav/ui';
import { ArrowUpRight } from 'lucide-react';

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

export function AppEditorialCard({
  app,
  variant,
  priority = false,
  className = '',
}: AppEditorialCardProps) {
  const orientation = variant || resolveAppOrientation(app);
  const isPortrait = orientation === 'portrait';
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [iconLoaded, setIconLoaded] = React.useState(false);

  // Automatically select the optimal image ratio:
  // - In a portrait slot (3:4 vertical space): prioritize 3:4 portrait image
  // - In a landscape slot (16:9 wide space): prioritize 16:9 landscape image
  const rawImageUrl = isPortrait
    ? app.featuredImageMobileUrl || app.featuredImageUrl || app.iconUrl
    : app.featuredImageUrl || app.featuredImageMobileUrl || app.iconUrl;

  // Use 'limit' crop mode so Cloudinary NEVER cuts off or crops any pixel of the artwork
  const bannerUrl = rawImageUrl
    ? getAppScreenshotUrl(rawImageUrl, isPortrait ? 1200 : 1600, isPortrait ? 1600 : 900, 'limit')
    : null;
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`group/editorial flex flex-col h-full w-full min-w-0 rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
    >
      {/* 1. Full Image Showcase Area (100% visible, zero crop, fitted with even narrow padding) */}
      <div
        className={`relative w-full overflow-hidden bg-zinc-100/90 dark:bg-zinc-950/90 flex items-center justify-center p-2 sm:p-2.5 ${
          isPortrait
            ? 'aspect-[3/4] md:aspect-auto md:flex-1 md:min-h-[380px]'
            : 'aspect-[16/9]'
        }`}
      >
        {/* Loading Skeleton Shimmer */}
        {bannerUrl && (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-2 sm:inset-2.5 rounded-lg skeleton-shimmer bg-zinc-200/60 dark:bg-zinc-800/60 z-[1] transition-opacity duration-500 pointer-events-none',
              imageLoaded ? 'opacity-0' : 'opacity-100'
            )}
          />
        )}

        {/* Subtle ambient blurred backdrop so letterbox edges blend organically in light and dark mode */}
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            className={cn(
              'pointer-events-none object-cover blur-2xl scale-110 transition-opacity duration-700 ease-out',
              imageLoaded ? 'opacity-20 dark:opacity-30' : 'opacity-0'
            )}
          />
        )}

        {/* Foreground Pristine Artwork — 100% contained, zero cropping, smooth progressive reveal */}
        {bannerUrl ? (
          <div className="relative w-full h-full flex items-center justify-center z-[2]">
            <Image
              src={bannerUrl}
              alt={`${app.name} background visual`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              unoptimized
              onLoad={() => setImageLoaded(true)}
              className={cn(
                'pointer-events-none object-contain rounded-lg drop-shadow-xs transition-all duration-500 ease-out group-hover/editorial:scale-[1.015]',
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.01]'
              )}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-zinc-800 to-black" />
        )}
      </div>

      {/* 2. Dedicated Bottom Metadata Bar (Below image, pristine text contrast & zero overlay) */}
      <div className="shrink-0 w-full flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 md:p-3.5 bg-white dark:bg-zinc-900/95 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
        {/* App Icon + Title & Category */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0 shadow-2xs flex items-center justify-center">
            {iconUrl ? (
              <>
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 skeleton-shimmer bg-zinc-200/60 dark:bg-zinc-700/60 transition-opacity duration-300 pointer-events-none z-[1]',
                    iconLoaded ? 'opacity-0' : 'opacity-100'
                  )}
                />
                <Image
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  width={40}
                  height={40}
                  unoptimized
                  onLoad={() => setIconLoaded(true)}
                  className={cn(
                    'w-full h-full object-cover pointer-events-none transition-opacity duration-300',
                    iconLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-mono font-bold text-xs bg-indigo-600">
                {app.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pr-1">
            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 block truncate font-display group-hover/editorial:text-indigo-600 dark:group-hover/editorial:text-indigo-400 transition-colors">
              {app.name}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 block truncate font-sans font-medium">
              {app.primaryCategory}
            </span>
          </div>
        </div>

        {/* View Action Pill */}
        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-zinc-100 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 text-zinc-900 hover:text-white dark:text-zinc-200 dark:hover:text-white border border-zinc-200 dark:border-zinc-700/60 hover:border-indigo-600 font-semibold text-[10.5px] sm:text-xs tracking-wide shadow-2xs transition-all duration-200 ease-out group-hover/editorial:bg-indigo-600 group-hover/editorial:text-white group-hover/editorial:border-indigo-600 font-display shrink-0">
          <span>View</span>
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80 group-hover/editorial:opacity-100 transition-transform duration-200 ease-out group-hover/editorial:translate-x-0.5 group-hover/editorial:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
