'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAppIconUrl, getAppScreenshotUrl } from '@elsesourav/media';
import type { AppListItem, AppPlatform } from '@elsesourav/types';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Compass,
  Smartphone,
  Apple,
  Terminal,
  Sparkles,
  Star,
} from 'lucide-react';
import MorphSlider, { type MorphSliderRef } from './MorphSlider';

const FALLBACK_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80',
];

/* ─── Platform Label ─── */
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

/* ─── Platform Icon ─── */
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
    default:
      return <Terminal className="w-3 h-3" />;
  }
}

/* ─── Mini Star Rating ─── */
function MiniStarRating({ value, count }: { value: number; count?: number }) {
  const max = 5;
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(Math.max(value - i, 0), 1);
          return (
            <span key={i} className="relative inline-block">
              <Star className="h-3 w-3 shrink-0 fill-zinc-600 text-zinc-600" />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="h-3 w-3 max-w-none shrink-0 fill-amber-400 text-amber-400" />
              </span>
            </span>
          );
        })}
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-white/90">
        {value.toFixed(1)}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] text-white/50">
          ({count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : count})
        </span>
      )}
    </div>
  );
}

export interface AppsMorphHeroProps {
  apps: readonly AppListItem[];
}

/**
 * Featured apps hero slider using MorphSlider with app info overlay.
 * Auto-scrolls in infinite loop. Manual interaction resets the autoplay timer.
 */
export function AppsMorphHero({ apps }: AppsMorphHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<MorphSliderRef>(null);

  const morphItems = useMemo(
    () =>
      apps.map((app, index) => {
        const imageUrl = app.featuredImageUrl
          ? getAppScreenshotUrl(app.featuredImageUrl, 1600, 900)
          : app.iconUrl
            ? getAppIconUrl(app.iconUrl, 512)
            : FALLBACK_HERO_IMAGES[index % FALLBACK_HERO_IMAGES.length];
        return {
          image: imageUrl || FALLBACK_HERO_IMAGES[index % FALLBACK_HERO_IMAGES.length]!,
          caption: app.name,
        };
      }),
    [apps]
  );

  const handlePrev = useCallback(() => {
    sliderRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    sliderRef.current?.next();
  }, []);

  const handleGoToIndex = useCallback((targetIndex: number) => {
    sliderRef.current?.goToIndex(targetIndex);
  }, []);

  const activeApp = apps[activeIndex] ?? apps[0];
  if (!activeApp || apps.length === 0) return null;

  const hasRating = activeApp.ratingAverage !== undefined && activeApp.ratingAverage > 0;

  return (
    <section
      aria-labelledby="morph-hero-heading"
      className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0c]"
    >
      <h2 id="morph-hero-heading" className="sr-only">
        Featured Projects Showcase
      </h2>

      {/* MorphSlider — full-bleed canvas behind the overlay */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] min-h-[250px] sm:min-h-[290px] lg:min-h-[360px] max-h-[460px]">
        <MorphSlider
          ref={sliderRef}
          items={morphItems}
          transition="melt"
          intensity={0.45}
          aberration={0.25}
          drift={0.3}
          duration={0.85}
          autoplay
          autoplayDelay={5}
          loop
          radius={0}
          overlayColor="#0a0a0c"
          showCaptions={false}
          showControls={false}
          showIndicators={false}
          onIndexChange={setActiveIndex}
        />

        {/* Ambient legibility gradients — pointer-events-none */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-[4]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-[4]" />

        {/* Dedicated Left & Right Navigation Buttons — High z-index & unobstructed */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous project"
          className="pointer-events-auto absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-[20] w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next project"
          className="pointer-events-auto absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-[20] w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 group-hover:text-white transition-colors" />
        </button>

        {/* App info overlay — Wrapper has pointer-events-none so click-through works */}
        <div className="pointer-events-none absolute inset-0 z-[10] p-4 sm:p-6 md:p-7 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-3 pointer-events-none">
            {/* App Card Info */}
            <div className="flex-1 min-w-0 pointer-events-auto pl-8 sm:pl-10">
              {/* Badge + Counter */}
              <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 backdrop-blur-md border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Featured Project
                </span>
                <span className="text-[11px] font-mono text-white/60">
                  {activeIndex + 1} / {apps.length}
                </span>
              </div>

              {/* Icon + App Title */}
              <Link
                href={`/apps/${activeApp.slug}`}
                className="group inline-flex items-center gap-3.5 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl overflow-hidden bg-white/10 border border-white/15 shadow-lg shrink-0 flex items-center justify-center backdrop-blur-sm">
                  {activeApp.iconUrl ? (
                    <Image
                      src={getAppIconUrl(activeApp.iconUrl, 96)}
                      alt={`${activeApp.name} icon`}
                      width={52}
                      height={52}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/70 font-mono font-bold text-base sm:text-lg">
                      {activeApp.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white group-hover:text-indigo-300 transition-colors truncate leading-tight">
                    {activeApp.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/60 font-medium">
                      {activeApp.primaryCategory}
                    </span>
                    {activeApp.currentVersion && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-xs font-mono text-white/40">
                          v{activeApp.currentVersion}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>

              {/* Rating */}
              {hasRating && (
                <div className="mb-2">
                  <MiniStarRating
                    value={activeApp.ratingAverage!}
                    count={activeApp.ratingCount}
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/70 max-w-xl line-clamp-2 leading-relaxed mb-3">
                {activeApp.shortDescription}
              </p>

              {/* Footer: platforms + CTA */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {activeApp.platforms.slice(0, 4).map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-medium text-white/70 border border-white/15 leading-none"
                    >
                      <PlatformIcon platform={platform} />
                      {platformLabel(platform)}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/apps/${activeApp.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group/cta"
                >
                  <span>Explore Project</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Clickable Dot Indicators (bottom-right) */}
            <div
              className="hidden sm:flex flex-col items-center gap-1.5 shrink-0 pointer-events-auto bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 pr-1"
              role="tablist"
              aria-label="Project slides"
            >
              {apps.map((app, i) => (
                <button
                  key={app.id || i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Go to ${app.name}`}
                  onClick={() => handleGoToIndex(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    i === activeIndex
                      ? 'w-2 h-6 bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
