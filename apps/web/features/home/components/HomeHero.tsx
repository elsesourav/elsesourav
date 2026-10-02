'use client';

import { useTheme } from '@/components/theme/ThemeProvider';
import { ROUTES } from '@elsesourav/config';
import { Container, Reveal, Section } from '@elsesourav/ui';
import { BlurUpImage, TextReveal } from '@elsesourav/ui/interior';
import { ArrowRight, Code, Layers, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { DaylightFogCanvas } from './DaylightFogCanvas';
import { EarthScene } from './EarthScene';
import { StarsCanvas } from './StarsCanvas';
import { useScenePerformance } from './useScenePerformance';

interface HomeHeroProps {
  creatorName?: string;
  heroHeadline?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  totalAppsCount?: number;
}

function renderHighlightedHeadline(headline: string, isLight: boolean) {
  const words = headline.trim().split(/\s+/);
  if (words.length <= 4) {
    return (
      <TextReveal
        text={headline}
        by="word"
        delay={0.08}
        stagger={0.06}
        className={
          isLight
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 font-bold'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-300 font-bold drop-shadow-[0_2px_14px_rgba(129,140,248,0.25)]'
        }
      />
    );
  }

  // Dynamically highlight the final ~45% of words (between 3 and 8 words)
  const highlightCount = Math.max(3, Math.min(8, Math.round(words.length * 0.45)));
  const splitIndex = words.length - highlightCount;
  const leadWords = words.slice(0, splitIndex);
  const highlightWords = words.slice(splitIndex);
  const leadPart = leadWords.join(' ');
  const highlightPart = highlightWords.join(' ');
  const leadDuration = leadWords.length * 0.05;

  return (
    <>
      <TextReveal
        text={leadPart}
        by="word"
        delay={0.08}
        stagger={0.05}
        className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}
      />{' '}
      <TextReveal
        text={highlightPart}
        by="word"
        delay={0.08 + leadDuration}
        stagger={0.05}
        className={
          isLight
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 font-bold'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-300 font-bold drop-shadow-[0_2px_14px_rgba(129,140,248,0.25)]'
        }
      />
    </>
  );
}

export function HomeHero({
  creatorName,
  heroHeadline,
  heroSubtitle,
  heroBadge,
  primaryCtaLabel,
  secondaryCtaLabel,
  totalAppsCount = 10,
}: HomeHeroProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const displayCount = totalAppsCount > 0 ? `${totalAppsCount}+` : '10+';

  const { isSceneActive } = useScenePerformance({ elementId: 'hero' });

  return (
    <Section
      id="hero"
      spacing="none"
      className="relative isolate overflow-hidden min-h-[100dvh] sm:min-h-[720px] lg:min-h-[800px] xl:min-h-[860px] flex items-center justify-center pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-16"
    >
      {/* ── 1. Full-Cover Window Background (Starts at y=0 from top of viewport) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 w-full h-full pointer-events-none select-none overflow-hidden"
      >
        {/* Dark Theme Background Layers (Cosmic Night Sky - High blur on mobile for soft atmospheric depth) */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out blur-[4px] sm:blur-[5px] md:blur-0 scale-110 md:scale-100 ${
            isLight ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <BlurUpImage
            src="/hero/sky-bg.webp"
            placeholder="/hero/sky-bg-thumb.webp"
            alt="Cosmic night sky backdrop"
            fill
            loading="eager"
            fetchPriority="high"
            imgClassName="object-[82%_center] md:object-center object-cover"
          />
        </div>

        {/* Light Theme Background Layers (Daylight Cloudscape - High blur on mobile for soft atmospheric depth) */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out blur-[4px] sm:blur-[5px] md:blur-0 scale-110 md:scale-100 ${
            isLight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <BlurUpImage
            src="/hero/sky-light-bg.webp"
            placeholder="/hero/sky-light-bg-thumb.webp"
            alt="Daylight cloudscape backdrop"
            fill
            loading="eager"
            fetchPriority="high"
            imgClassName="object-[82%_center] md:object-center object-cover"
          />
        </div>

        {/* ── 2. Atmospheric Layer: Cosmic Stars (Dark) OR Daylight Volumetric Fog (Light) ── */}
        {isLight ? (
          <DaylightFogCanvas isSceneActive={isSceneActive} />
        ) : (
          <StarsCanvas isSceneActive={isSceneActive} />
        )}

        {/* Ambient Contrast Gradient: Left-weighted on desktop, soft diagonal on mobile to showcase right-side nebula */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: isLight
              ? 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 35%, rgba(255,255,255,0.15) 65%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(9,9,11,0.88) 0%, rgba(9,9,11,0.65) 35%, rgba(9,9,11,0.2) 65%, transparent 100%)',
          }}
        />
        <div
          className="md:hidden absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.05) 85%, transparent 100%)'
              : 'linear-gradient(135deg, rgba(9,9,11,0.82) 0%, rgba(9,9,11,0.45) 50%, rgba(9,9,11,0.05) 85%, transparent 100%)',
          }}
        />

        {/* Subtle top edge fade that lets the sky show through the transparent navbar */}
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none transition-all duration-700"
          style={{
            background: isLight
              ? 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)'
              : 'linear-gradient(to bottom, rgba(9,9,11,0.35) 0%, transparent 100%)',
          }}
        />

        {/* Bottom edge fade for seamless section transition to #selected-apps */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-36 pointer-events-none transition-all duration-700"
          style={{
            background: isLight
              ? 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 100%)'
              : 'linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(9,9,11,0.7) 40%, rgba(9,9,11,0) 100%)',
          }}
        />
      </div>

      {/* ── Content Container (12-column responsive layout) ── */}
      <Container
        size="full"
        className="relative z-10 w-full max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12 my-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-center relative">
          {/* Mobile-Only Static Floating Island Image: Single lightweight static image with high blur for soft atmospheric depth & 0% lag */}
          <div
            aria-hidden="true"
            className="md:hidden absolute -right-6 sm:-right-4 -top-2 sm:top-2 w-[280px] sm:w-[360px] pointer-events-none select-none z-0 overflow-visible opacity-85 dark:opacity-90"
          >
            <img
              src="/hero/floating-island-mobile.webp"
              alt=""
              width={560}
              height={485}
              className="w-full h-auto object-contain blur-[4px] sm:blur-[5px] scale-105 drop-shadow-[0_16px_32px_rgba(0,0,0,0.6)] transition-all"
              loading="eager"
              draggable={false}
            />
          </div>

          {/* Left Column: Hero Narrative, CTAs & Metrics (7 columns on iPad & desktop for wider text lines & larger headline) */}
          <div className="relative z-10 md:col-span-7 xl:col-span-7 space-y-6 text-left max-w-2xl lg:max-w-[44rem] xl:max-w-[48rem]">
            <Reveal direction="down" distance={12}>
              {/* Studio Pill Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium tracking-wide backdrop-blur-md transition-colors ${
                  isLight
                    ? 'border-indigo-600/25 bg-indigo-50/80 text-indigo-700'
                    : 'border-indigo-500/25 bg-indigo-500/10 text-indigo-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isLight ? 'bg-indigo-600' : 'bg-indigo-400'
                  }`}
                />
                <span>
                  <TextReveal
                    text={
                      heroBadge && heroBadge !== 'SOURAV / ELSESOURAV'
                        ? heroBadge
                        : 'Personal Software Studio'
                    }
                    by="word"
                    delay={0.02}
                    stagger={0.04}
                    className={isLight ? 'text-indigo-700' : 'text-indigo-400'}
                  />
                </span>
              </div>
            </Reveal>

            {/* Main Highlight: Showcases application ecosystem & why this studio is helpful */}
            <Reveal direction="up" distance={16} delay={100}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] xl:text-[3.6rem] font-bold tracking-tight leading-[1.18] sm:leading-[1.16] lg:leading-[1.14] break-words">
                {renderHighlightedHeadline(
                  heroHeadline ||
                    'Building software, tools, games, and experiments that solve real problems and spark new ideas.',
                  isLight
                )}
              </h1>
            </Reveal>

            {/* Bottom Subtext: Highlights creator details & studio context */}
            <Reveal direction="up" distance={14} delay={150}>
              <p
                className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl ${
                  isLight ? 'text-slate-700' : 'text-zinc-300/90'
                }`}
              >
                <TextReveal
                  text={
                    heroSubtitle
                      ? heroSubtitle.replace(/ElseSourav/gi, '').includes(creatorName || 'Sourav')
                        ? heroSubtitle
                        : `Crafted by ${creatorName || 'Sourav'}. ${heroSubtitle}`
                      : `Crafted by ${creatorName || 'Sourav'}. ElseSourav is my personal space for the applications I build, the ideas I explore, and the things I learn along the way.`
                  }
                  by="word"
                  delay={0.35}
                  stagger={0.025}
                  className={isLight ? 'text-slate-700' : 'text-zinc-300/90'}
                />
              </p>
            </Reveal>

            {/* Action Buttons Cluster */}
            <Reveal direction="up" distance={12} delay={200}>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={ROUTES.APPS}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Layers className="w-4 h-4" />
                  <span>{primaryCtaLabel || 'Explore Apps'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={ROUTES.BLOG}
                  className={`inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold backdrop-blur-md active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isLight
                      ? 'text-slate-800 bg-black/5 hover:bg-black/10 border border-black/10 hover:border-black/20'
                      : 'text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{secondaryCtaLabel || 'View Updates'}</span>
                </Link>
              </div>
            </Reveal>

            {/* Trust Metrics */}
            <Reveal direction="up" distance={10} delay={250}>
              <div
                className={`pt-6 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg border-t ${
                  isLight ? 'border-black/10' : 'border-white/10'
                }`}
              >
                {/* Metric 1: Projects */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isLight
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-600'
                        : 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {displayCount}
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] truncate ${
                        isLight ? 'text-slate-600' : 'text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      Projects
                    </div>
                  </div>
                </div>

                {/* Metric 2: Passion */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isLight
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-600'
                        : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      100%
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] truncate ${
                        isLight ? 'text-slate-600' : 'text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      Passion Driven
                    </div>
                  </div>
                </div>

                {/* Metric 3: Opportunities */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isLight
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600'
                        : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Open
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] leading-tight truncate ${
                        isLight ? 'text-slate-600' : 'text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      Opportunities
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Floating Rock & Island Scene (iPad & Desktop, hidden on phones) */}
          <div className="hidden md:flex md:col-span-5 xl:col-span-5 justify-center md:justify-end relative w-full h-[440px] md:h-[460px] lg:h-[520px] xl:h-[560px]">
            <EarthScene isSceneActive={isSceneActive} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
