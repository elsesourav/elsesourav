'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container, Reveal, RevealGroup } from '@elsesourav/ui';
import { TextReveal } from '@elsesourav/ui/interior';
import { ROUTES } from '@elsesourav/config';
import type { AppListItem } from '@elsesourav/types';
import { AppCard } from '@/features/apps/components/AppCard';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';

interface SelectedAppsSectionProps {
  apps: readonly AppListItem[];
  totalCount: number;
  title?: string | null;
  subtitle?: string | null;
}

export function SelectedAppsSection({
  apps,
  totalCount,
  title,
  subtitle,
}: SelectedAppsSectionProps) {
  if (!apps || apps.length === 0) return null;

  const flagshipApp = apps[0];
  const supportingApps = apps.slice(1, 5);

  return (
    <section
      id="selected-apps"
      className="relative isolate overflow-hidden py-16 sm:py-24 lg:py-28 transition-colors duration-500 bg-[#f8fafc] dark:bg-[#07090e]"
    >
      {/* ── 1. Top Edge Horizon Beam (Seamless bridge from Hero above) ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/30 to-transparent pointer-events-none"
      />

      {/* ── 2. Ambient Gradient Auroras (Zero Canvas, Pure CSS, Dark & Light Mode) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      >
        {/* Top Center Nebula Bloom */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[340px] bg-gradient-to-b from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl rounded-full dark:opacity-80 opacity-60" />

        {/* Right Flank Cosmic Violet Glow */}
        <div className="absolute top-1/4 -right-28 w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] bg-gradient-to-bl from-purple-500/12 via-indigo-500/6 to-transparent blur-[90px] rounded-full dark:opacity-70 opacity-40" />

        {/* Left Flank Sky Glow */}
        <div className="absolute bottom-16 -left-28 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent blur-[85px] rounded-full dark:opacity-65 opacity-40" />

        {/* Architectural Micro-Dot Matrix Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.045] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_50%,transparent_100%)] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <Container size="lg" className="relative z-10">
        {/* ── 3. Polished Section Header ── */}
        <Reveal direction="up" distance={14}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 pb-6 border-b border-slate-200/80 dark:border-white/10">
            <div className="space-y-3 max-w-2xl text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="uppercase tracking-wider">SELECTED APPS</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                <TextReveal
                  text={title || 'Selected Apps'}
                  by="word"
                  stagger={0.06}
                  className="text-slate-900 dark:text-white font-bold"
                />
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                <TextReveal
                  text={
                    subtitle ||
                    'A curated selection of software, developer tools, games, and systems.'
                  }
                  by="word"
                  stagger={0.03}
                  delay={0.15}
                  className="text-slate-600 dark:text-zinc-400"
                />
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0">
              <Link
                href={ROUTES.APPS}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-white/5 dark:hover:bg-white/10 border border-indigo-200/70 dark:border-white/10 shadow-sm hover:shadow transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Explore all apps {totalCount > 0 ? `(${totalCount})` : ''}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* ── 4. Apps Showcase Grid ── */}
        <div className="space-y-6 pt-2">
          {/* Flagship Lead Project */}
          {flagshipApp && (
            <Reveal direction="up" distance={16} delay={0.05}>
              <AppCard app={flagshipApp} index={0} featured={true} />
            </Reveal>
          )}

          {/* Supporting Projects Grid (up to 4 projects in 2x2) */}
          {supportingApps.length > 0 && (
            <RevealGroup
              staggerDelay={0.06}
              baseDelay={0.08}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch"
            >
              {supportingApps.map((app: AppListItem, idx: number) => (
                <AppCard key={app.id} app={app} index={idx + 1} />
              ))}
            </RevealGroup>
          )}
        </div>

        {/* ── 5. Bottom Catalog Exploration Banner ── */}
        <Reveal direction="up" distance={12} delay={0.15}>
          <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl border border-indigo-500/20 dark:border-white/10 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-transparent backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Browse the Complete Ecosystem</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Discover all {totalCount} open-source experiments, production tools, and native software.
              </p>
            </div>

            <Link
              href={ROUTES.APPS}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 active:scale-95 transition-all group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Full Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
