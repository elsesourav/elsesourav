'use client';

import * as React from 'react';
import { Reveal } from '@elsesourav/ui';
import { Code, Star, Users } from 'lucide-react';

export interface HeroTrustMetricsProps {
  displayCount: string;
  isLight: boolean;
}

export function HeroTrustMetrics({ displayCount, isLight }: HeroTrustMetricsProps) {
  return (
    <Reveal direction="up" distance={10} delay={250}>
      <div
        className={`pt-4 sm:pt-6 grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 max-w-lg border-t ${
          isLight ? 'border-slate-300/70' : 'border-white/10'
        }`}
      >
        {/* Metric 1: Projects */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${
              isLight
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'bg-purple-500/10 border-purple-500/25 text-purple-400'
            }`}
          >
            <Code className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </div>
          <div className="min-w-0">
            <div
              className={`text-xs sm:text-sm font-extrabold truncate ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}
            >
              {displayCount}
            </div>
            <div
              className={`text-[9px] sm:text-[10px] md:text-[11px] leading-tight truncate font-semibold ${
                isLight ? 'text-slate-700' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Projects
            </div>
          </div>
        </div>

        {/* Metric 2: Passion */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${
              isLight
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
            }`}
          >
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </div>
          <div className="min-w-0">
            <div
              className={`text-xs sm:text-sm font-extrabold truncate ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}
            >
              100%
            </div>
            <div
              className={`text-[9px] sm:text-[10px] md:text-[11px] leading-tight font-semibold ${
                isLight ? 'text-slate-700' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Passion
            </div>
          </div>
        </div>

        {/* Metric 3: Opportunities */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${
              isLight
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
            }`}
          >
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </div>
          <div className="min-w-0">
            <div
              className={`text-xs sm:text-sm font-extrabold truncate ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}
            >
              Open
            </div>
            <div
              className={`text-[9px] sm:text-[10px] md:text-[11px] leading-tight truncate font-semibold ${
                isLight ? 'text-slate-700' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Opportunities
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
