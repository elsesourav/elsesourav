'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Sparkles, Cpu, Layers, Palette } from 'lucide-react';
import type { AppListItem } from '@elsesourav/types';

interface HeroProjectVisualProps {
  apps: readonly AppListItem[];
}

export function HeroProjectVisual({ apps }: HeroProjectVisualProps) {
  // Use up to 3 real apps from canonical database query
  const displayApps = apps.slice(0, 3);

  if (displayApps.length === 0) return null;

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none pt-4 pb-2 sm:py-6">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-cyan-500/10 blur-2xl rounded-3xl -z-10 opacity-70"
      />

      {/* Art-directed layered composition */}
      <div className="relative space-y-3 sm:space-y-4">
        {displayApps.map((app, idx) => {
          const isPrimary = idx === 0;
          const isSecondary = idx === 1;

          return (
            <Link
              key={app.id}
              href={`/apps/${app.slug}`}
              className={`group block rounded-2xl sm:rounded-3xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isPrimary
                  ? 'border-indigo-500/40 bg-zinc-900/80 shadow-2xl shadow-indigo-950/40 hover:border-indigo-400 hover:bg-zinc-900/95 sm:translate-x-0'
                  : isSecondary
                    ? 'border-zinc-800/80 bg-zinc-900/60 shadow-xl hover:border-zinc-700 hover:bg-zinc-900/80 sm:translate-x-3'
                    : 'border-zinc-800/60 bg-zinc-900/40 shadow-lg hover:border-zinc-700 hover:bg-zinc-900/60 sm:translate-x-6'
              } p-4 sm:p-5`}
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                {/* App Icon or Category Mark */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border ${
                    isPrimary
                      ? 'border-indigo-500/30 bg-indigo-950/50 shadow-inner'
                      : 'border-zinc-800 bg-zinc-950/60'
                  }`}
                >
                  {app.iconUrl ? (
                    <Image
                      src={app.iconUrl}
                      alt={`${app.name} icon`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : idx === 0 ? (
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  ) : idx === 1 ? (
                    <Cpu className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Palette className="w-5 h-5 text-purple-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-200 transition-colors truncate">
                        {app.name}
                      </h3>
                      {app.currentVersion && (
                        <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 shrink-0">
                          v{app.currentVersion}
                        </span>
                      )}
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-1 mt-1 leading-relaxed">
                    {app.shortDescription}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-indigo-400/90 font-medium">{app.primaryCategory}</span>
                    <span>•</span>
                    <span>{app.platforms.map((p) => p.toUpperCase()).join(' · ') || 'WEB'}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
