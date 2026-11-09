'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container, Reveal } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import {
  ArrowRight,
  HeartHandshake,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PhilosophySectionProps {
  creator: {
    name: string;
    fullName?: string | null;
    title: string;
    location?: string | null;
    avatarUrl?: string | null;
    portraitImageDarkUrl?: string | null;
    portraitImageLightUrl?: string | null;
    statement?: string | null;
    shortBio?: string | null;
    positioning?: string | null;
    principles?: readonly string[];
  };
  badge?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

interface PrincipleItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  borderColor: string;
}

const PRINCIPLES: PrincipleItem[] = [
  {
    id: 'craft',
    num: '01',
    title: 'Obsessive Craft',
    tagline: 'Designed and engineered solo with care for every interaction.',
    icon: Sparkles,
    iconColor: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/25',
    borderColor: 'hover:border-violet-500/40',
  },
  {
    id: 'privacy',
    num: '02',
    title: 'Privacy by Default',
    tagline: 'Zero telemetry spyware, zero ads, and zero dark patterns.',
    icon: ShieldCheck,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/25',
    borderColor: 'hover:border-emerald-500/40',
  },
  {
    id: 'performance',
    num: '03',
    title: 'Built for Speed',
    tagline: 'Lightweight, snappy response, and minimal resource usage.',
    icon: Zap,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/25',
    borderColor: 'hover:border-amber-500/40',
  },
  {
    id: 'utility',
    num: '04',
    title: 'Real Utility',
    tagline: 'Practical tools and games created to solve real daily needs.',
    icon: Layers,
    iconColor: 'text-sky-500 dark:text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/25',
    borderColor: 'hover:border-sky-500/40',
  },
  {
    id: 'support',
    num: '05',
    title: 'Direct Access',
    tagline: 'Talk directly with the builder—feedback is read and valued.',
    icon: HeartHandshake,
    iconColor: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/25',
    borderColor: 'hover:border-rose-500/40',
  },
  {
    id: 'evolution',
    num: '06',
    title: 'Enduring Quality',
    tagline: 'Actively maintained with modern web standards and care.',
    icon: RefreshCw,
    iconColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/25',
    borderColor: 'hover:border-fuchsia-500/40',
  },
];

export function PhilosophySection({
  creator,
  badge = 'Craft & Principles',
  ctaLabel = 'About the journey',
  ctaUrl = ROUTES.ABOUT,
}: PhilosophySectionProps) {
  const creatorName = creator.name || 'Sourav';
  const creatorTitle = creator.title || 'Software Engineer & Creator';
  const creatorStatement =
    creator.statement || 'I care about software that is useful, fast, and considerate.';
  const creatorPositioning =
    creator.positioning ||
    'Independent creator building practical software, developer tools, and thoughtful web experiences with strong engineering fundamentals.';

  // Default to Sourav's authentic portrait
  const avatarSrc =
    creator.avatarUrl ||
    creator.portraitImageDarkUrl ||
    '/about/souravbarui-dark-512.webp';

  return (
    <section
      id="philosophy"
      className="relative isolate overflow-hidden py-8 sm:py-14 lg:py-20 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-500 bg-[#f8fafc] dark:bg-[#07090e]"
    >
      {/* ── 1. Top Edge Horizon Beam ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/30 to-transparent pointer-events-none"
      />

      {/* ── 2. Ambient Gradient Auroras ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      >
        <div className="absolute -top-24 right-1/4 w-[480px] sm:w-[600px] h-[260px] bg-gradient-to-b from-indigo-500/10 via-violet-500/6 to-transparent blur-3xl rounded-full dark:opacity-70 opacity-40" />
        <div className="absolute -bottom-16 -left-16 w-[360px] sm:w-[460px] h-[360px] bg-gradient-to-tr from-sky-500/8 via-indigo-500/4 to-transparent blur-[80px] rounded-full dark:opacity-60 opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <Container size="full" className="max-w-[1536px] px-3 sm:px-6 lg:px-8 xl:px-12">
        <Reveal direction="up" distance={16}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            {/* Left Column: Creator Identity & Philosophy Statement */}
            <div className="lg:col-span-5 space-y-3.5 sm:space-y-5 lg:sticky lg:top-28">
              {/* Studio Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>{badge}</span>
              </div>

              {/* Main Headline (Crisp, Accessible, Zero-Duplication) */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.25rem] font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-snug">
                {creatorStatement}
              </h2>

              {/* Subtitle / Positioning Narrative */}
              <p className="text-xs sm:text-sm md:text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg">
                {creatorPositioning}
              </p>

              {/* Heroic Creator Spotlight Card */}
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[hsl(var(--border))]/90 bg-[hsl(var(--card))]/80 dark:bg-[hsl(var(--surface-subtle))]/70 backdrop-blur-md shadow-sm space-y-2.5 sm:space-y-3 max-w-md">
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  {/* High-res squircle portrait with ambient neon glow */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-sky-500/20 p-0.5 border border-indigo-500/35 dark:border-indigo-400/40 shadow-md shrink-0 group/avatar overflow-visible">
                    <img
                      src={avatarSrc}
                      alt={`${creatorName} — ${creatorTitle}`}
                      className="w-full h-full object-cover rounded-[10px] sm:rounded-[14px] aspect-square transition-transform duration-300 group-hover/avatar:scale-105"
                      loading="lazy"
                    />
                    {/* Live builder status indicator */}
                    <span
                      title="Active Studio Builder"
                      className="absolute -bottom-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
                    </span>
                  </div>

                  {/* Creator Identity Meta */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-[hsl(var(--foreground))] truncate">
                        {creatorName}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Builder
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {creatorTitle}
                    </div>
                  </div>
                </div>

                {/* Action Link: About the Journey */}
                <div className="pt-2 sm:pt-2.5 border-t border-[hsl(var(--border))]/60 flex items-center justify-between">
                  <Link
                    href={ctaUrl}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--surface-elevated))] hover:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:border-indigo-500/40 active:scale-95 transition-all shadow-xs group"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[10px] sm:text-[11px] font-mono text-[hsl(var(--subtle-foreground))]">
                    Solo Studio
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: 6 Concise, Clean Principle Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              {PRINCIPLES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`group p-3 sm:p-3.5 md:p-4 rounded-xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--card))]/70 dark:bg-[hsl(var(--card))]/50 hover:bg-[hsl(var(--surface-elevated))] ${item.borderColor} hover:shadow-md transition-colors duration-200 flex flex-col justify-between shadow-xs`}
                  >
                    <div className="space-y-1.5 sm:space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform duration-200`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))] font-semibold">
                          {item.num}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-[hsl(var(--foreground))] group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                        {item.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
