'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Sparkles, Cpu, Palette, Terminal, Zap } from 'lucide-react';
import type { AppListItem } from '@elsesourav/types';

interface HeroProjectVisualProps {
  apps: readonly AppListItem[];
}

export function HeroProjectVisual({ apps }: HeroProjectVisualProps) {
  if (!apps || apps.length === 0) return null;

  const flagshipApp = apps[0];
  const secondaryApp = apps[1];
  const tertiaryApp = apps[2];

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none pt-2 pb-2 sm:py-4">
      {/* Ambient background glow orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-500/15 blur-3xl rounded-3xl -z-10 opacity-70"
      />

      <div className="space-y-4">
        {/* 1. Flagship Lead Project Window Card */}
        {flagshipApp && (
          <Link
            href={`/apps/${flagshipApp.slug}`}
            className="group block rounded-3xl border border-indigo-500/35 bg-[hsl(var(--card))] p-4 sm:p-5 backdrop-blur-xl shadow-2xl shadow-indigo-950/20 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-indigo-500/20 hover:-translate-y-1.5 active:scale-[0.99] active:translate-y-0 transition-all duration-300 ease-out relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {/* Window Top Chrome Bar */}
            <div className="flex items-center justify-between text-xs pb-3 mb-3 border-b border-[hsl(var(--border-subtle))]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[hsl(var(--subtle-foreground))] font-mono text-[11px] ml-1.5 truncate max-w-[150px] sm:max-w-none">
                  {flagshipApp.slug}.preview
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Project</span>
              </div>
            </div>

            {/* Visual Cover / Interface Preview */}
            {(flagshipApp.featuredImageUrl || flagshipApp.iconUrl) ? (
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] mb-3.5 shadow-inner">
                <Image
                  src={flagshipApp.featuredImageUrl || flagshipApp.iconUrl}
                  alt={`${flagshipApp.name} interface preview`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : null}

            {/* App Header & Identity */}
            <div className="flex items-start gap-3.5">
              {/* App Icon */}
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] border border-indigo-500/30 shrink-0 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                {flagshipApp.iconUrl ? (
                  <Image
                    src={flagshipApp.iconUrl}
                    alt={`${flagshipApp.name} icon`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span role="heading" aria-level={3} className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate block">
                      {flagshipApp.name}
                    </span>
                    {flagshipApp.currentVersion && (
                      <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 shrink-0">
                        v{flagshipApp.currentVersion}
                      </span>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mt-1 leading-relaxed">
                  {flagshipApp.shortDescription}
                </p>
              </div>
            </div>

            {/* Highlights Tag Strip */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[hsl(var(--border-subtle))] text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--surface-subtle))] px-2.5 py-1.5 rounded-xl border border-[hsl(var(--border-subtle))]">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{flagshipApp.primaryCategory}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--surface-subtle))] px-2.5 py-1.5 rounded-xl border border-[hsl(var(--border-subtle))]">
                <Terminal className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">
                  {flagshipApp.platforms.map((p) => p.toUpperCase()).join(' · ') || 'WEB'}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* 2. Staggered Companion Projects Grid (2 Cards) */}
        {(secondaryApp || tertiaryApp) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5">
            {secondaryApp && (
              <Link
                href={`/apps/${secondaryApp.slug}`}
                className="group p-3.5 sm:p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-cyan-500/40 hover:-translate-y-1 active:scale-[0.99] active:translate-y-0 transition-all duration-300 ease-out backdrop-blur-md flex flex-col justify-between space-y-2.5 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-cyan-500/15 border border-cyan-500/30 shrink-0 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                    {secondaryApp.iconUrl ? (
                      <Image
                        src={secondaryApp.iconUrl}
                        alt={`${secondaryApp.name} icon`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Cpu className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span role="heading" aria-level={3} className="font-bold text-sm text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate block">
                        {secondaryApp.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 block truncate mt-0.5">
                      {secondaryApp.primaryCategory}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                  {secondaryApp.shortDescription}
                </p>
              </Link>
            )}

            {tertiaryApp && (
              <Link
                href={`/apps/${tertiaryApp.slug}`}
                className="group p-3.5 sm:p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-purple-500/40 hover:-translate-y-1 active:scale-[0.99] active:translate-y-0 transition-all duration-300 ease-out backdrop-blur-md flex flex-col justify-between space-y-2.5 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-500/15 border border-purple-500/30 shrink-0 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                    {tertiaryApp.iconUrl ? (
                      <Image
                        src={tertiaryApp.iconUrl}
                        alt={`${tertiaryApp.name} icon`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Palette className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span role="heading" aria-level={3} className="font-bold text-sm text-[hsl(var(--foreground))] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate block">
                        {tertiaryApp.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block truncate mt-0.5">
                      {tertiaryApp.primaryCategory}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                  {tertiaryApp.shortDescription}
                </p>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
