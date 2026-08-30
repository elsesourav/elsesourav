'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Sparkles, Cpu, Layers, Palette, Terminal, Shield, Zap, ExternalLink } from 'lucide-react';
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
        className="pointer-events-none absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-500/15 blur-3xl rounded-3xl -z-10 opacity-80"
      />

      <div className="space-y-3.5 sm:space-y-4">
        {/* 1. Flagship Lead Project Window Card */}
        {flagshipApp && (
          <Link
            href={`/apps/${flagshipApp.slug}`}
            className="group block rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/95 p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-indigo-950/50 hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all duration-300 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {/* Window Top Chrome Bar */}
            <div className="flex items-center justify-between text-xs pb-3.5 mb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-zinc-500 font-mono text-[11px] ml-2">flagship_app.preview</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-[10px] font-mono text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Project</span>
              </div>
            </div>

            {/* App Main Body */}
            <div className="flex items-start gap-4">
              {/* App Icon */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 to-zinc-900 border border-indigo-500/30 shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                {flagshipApp.iconUrl ? (
                  <Image
                    src={flagshipApp.iconUrl}
                    alt={`${flagshipApp.name} icon`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-7 h-7 text-indigo-400" />
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-indigo-200 transition-colors truncate">
                      {flagshipApp.name}
                    </h3>
                    {flagshipApp.currentVersion && (
                      <span className="text-[10px] font-mono text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-800/60 shrink-0">
                        v{flagshipApp.currentVersion}
                      </span>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mt-1.5 leading-relaxed">
                  {flagshipApp.shortDescription}
                </p>
              </div>
            </div>

            {/* Architecture Highlights Strip */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-zinc-800/70 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-950/50 px-2.5 py-1.5 rounded-xl border border-zinc-800/60">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{flagshipApp.primaryCategory}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-950/50 px-2.5 py-1.5 rounded-xl border border-zinc-800/60">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">
                  {flagshipApp.platforms.map((p) => p.toUpperCase()).join(' · ') || 'WEB'}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* 2. Staggered Companion Projects Grid (2 Cards) */}
        {(secondaryApp || tertiaryApp) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {secondaryApp && (
              <Link
                href={`/apps/${secondaryApp.slug}`}
                className="group p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-md flex flex-col justify-between space-y-3 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-cyan-950/50 border border-cyan-800/40 shrink-0 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-300">
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
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-200 transition-colors truncate">
                        {secondaryApp.name}
                      </h4>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/90 block truncate mt-0.5">
                      {secondaryApp.primaryCategory}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {secondaryApp.shortDescription}
                </p>
              </Link>
            )}

            {tertiaryApp && (
              <Link
                href={`/apps/${tertiaryApp.slug}`}
                className="group p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-md flex flex-col justify-between space-y-3 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-950/50 border border-purple-800/40 shrink-0 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
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
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-purple-200 transition-colors truncate">
                        {tertiaryApp.name}
                      </h4>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
                    </div>
                    <span className="text-[10px] font-mono text-purple-400/90 block truncate mt-0.5">
                      {tertiaryApp.primaryCategory}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
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
