'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Container, Section, ActionGroup } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import type { AppListItem } from '@elsesourav/types';
import { HeroProjectVisual } from './HeroProjectVisual';
import { Layers, User, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  creatorName: string;
  heroBadge?: string | null;
  heroHeadline?: string | null;
  heroSubtitle?: string | null;
  primaryCtaLabel?: string | null;
  secondaryCtaLabel?: string | null;
  apps: readonly AppListItem[];
  totalAppsCount?: number;
}

function renderHighlightedHeadline(headline: string) {
  const words = headline.trim().split(/\s+/);
  if (words.length <= 4) {
    return (
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-700 dark:from-indigo-300 dark:via-cyan-200 dark:to-white font-extrabold">
        {headline}
      </span>
    );
  }

  // Dynamically highlight the final ~45% of words
  const highlightCount = Math.max(3, Math.min(8, Math.round(words.length * 0.45)));
  const splitIndex = words.length - highlightCount;
  const leadPart = words.slice(0, splitIndex).join(' ');
  const highlightPart = words.slice(splitIndex).join(' ');

  return (
    <>
      <span className="text-[hsl(var(--foreground))]">{leadPart}</span>{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-700 dark:from-indigo-300 dark:via-cyan-200 dark:to-white font-extrabold">
        {highlightPart}
      </span>
    </>
  );
}

export function HeroSection({
  creatorName,
  heroBadge,
  heroHeadline,
  heroSubtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  apps,
  totalAppsCount = 0,
}: HeroSectionProps) {
  const badgeText =
    heroBadge && heroBadge !== 'SOURAV / ELSESOURAV' ? heroBadge : 'Personal Software Studio';

  const defaultHeadline =
    'Building software, tools, games, and experiments that solve real problems and spark new ideas.';

  const defaultSubtitle =
    'ElseSourav is my personal space for the applications I build, the ideas I explore, and the things I learn along the way.';

  return (
    <Section
      spacing="lg"
      className="relative pt-6 sm:pt-10 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 overflow-hidden"
    >
      {/* Dynamic ambient gradient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden flex justify-center"
      >
        <div className="w-[700px] sm:w-[1100px] h-[400px] bg-gradient-to-b from-indigo-500/15 via-purple-600/10 to-transparent blur-3xl rounded-full transform -translate-y-1/2" />
      </div>

      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Primary Hero Statement & Positioning */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Context Badge Cluster */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-xs font-mono text-indigo-700 dark:text-indigo-300 font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>{badgeText}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-mono text-emerald-700 dark:text-emerald-300 font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {totalAppsCount > 0 ? `${totalAppsCount} Apps Active` : 'Available to Explore'}
                </span>
              </div>
            </div>

            {/* Headline with dynamic "I am {creator.name}." */}
            <h1 className="text-[clamp(1.75rem,4vw,3.25rem)] font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-[1.15] max-w-2xl">
              <span className="block text-[clamp(1.25rem,2.8vw,2rem)] font-extrabold text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-300 dark:via-indigo-200 dark:to-zinc-100 mb-2 sm:mb-3">
                I am {creatorName || 'Sourav'}.
              </span>
              {renderHighlightedHeadline(heroHeadline || defaultHeadline)}
            </h1>

            {/* Supporting Explanation */}
            <p className="text-[clamp(0.95rem,1.8vw,1.125rem)] text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl">
              {heroSubtitle || defaultSubtitle}
            </p>

            {/* Action Buttons */}
            <ActionGroup className="pt-2 flex-wrap">
              <Link href={ROUTES.APPS}>
                <Button
                  size="lg"
                  className="gap-2 shadow-xl shadow-indigo-600/25 px-6 font-semibold min-h-[48px] rounded-2xl active:scale-[0.98] transition-transform"
                >
                  <Layers className="w-4 h-4" />
                  <span>{primaryCtaLabel || 'Explore Apps'}</span>
                </Button>
              </Link>
              <Link href={ROUTES.ABOUT}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2 px-6 min-h-[48px] rounded-2xl active:scale-[0.98] transition-transform border border-[hsl(var(--border))]"
                >
                  <User className="w-4 h-4" />
                  <span>{secondaryCtaLabel || 'About Me'}</span>
                </Button>
              </Link>
            </ActionGroup>
          </div>

          {/* Right Column: Visual Representation of Sourav's Work */}
          <div className="lg:col-span-5">
            <HeroProjectVisual apps={apps} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
