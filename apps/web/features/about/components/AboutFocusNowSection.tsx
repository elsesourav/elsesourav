import React from 'react';
import Link from 'next/link';
import { Reveal } from '@elsesourav/ui';
import { Radio, ArrowRight } from 'lucide-react';

export interface AboutFocusNowSectionProps {
  activeApp?: {
    slug: string;
    name: string;
    shortDescription: string;
  } | null;
  secondaryApp?: {
    slug: string;
    name: string;
    shortDescription: string;
  } | null;
  activePost?: {
    slug: string;
    title: string;
    excerpt: string;
  } | null;
  focusTopics: readonly string[];
}

export function AboutFocusNowSection({
  activeApp,
  secondaryApp,
  activePost,
  focusTopics,
}: AboutFocusNowSectionProps) {
  return (
    <Reveal direction="up" distance={14}>
      <section
        data-section="focus-now"
        aria-labelledby="now-focus-heading"
        className="space-y-3.5 sm:space-y-5 md:space-y-6 p-3.5 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[hsl(var(--border-subtle))]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 animate-pulse" />
            <h2
              id="now-focus-heading"
              className="text-sm min-[400px]:text-base sm:text-lg font-bold text-[hsl(var(--foreground))] tracking-tight"
            >
              Studio Focus // Now
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Live Status
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {/* Currently Building */}
          {activeApp && (
            <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
              <span className="text-[9px] sm:text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold block">
                Currently Building
              </span>
              <Link
                href={`/apps/${activeApp.slug}`}
                className="font-bold text-xs sm:text-sm text-[hsl(var(--foreground))] hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors block line-clamp-1"
              >
                {activeApp.name}
              </Link>
              <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                {activeApp.shortDescription}
              </p>
              <Link
                href={`/apps/${activeApp.slug}`}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono pt-0.5 group"
              >
                <span>Inspect project</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Featured Software / Systems */}
          {secondaryApp && (
            <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
              <span className="text-[9px] sm:text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider font-semibold block">
                Featured Software
              </span>
              <Link
                href={`/apps/${secondaryApp.slug}`}
                className="font-bold text-xs sm:text-sm text-[hsl(var(--foreground))] hover:text-purple-600 dark:hover:text-purple-300 transition-colors block line-clamp-1"
              >
                {secondaryApp.name}
              </Link>
              <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                {secondaryApp.shortDescription}
              </p>
              <Link
                href={`/apps/${secondaryApp.slug}`}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-mono pt-0.5 group"
              >
                <span>Launch application</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Latest Note */}
          {activePost && (
            <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))]">
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold block">
                Latest Note
              </span>
              <Link
                href={`/blog/${activePost.slug}`}
                className="font-bold text-xs sm:text-sm text-[hsl(var(--foreground))] hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors block line-clamp-1"
              >
                {activePost.title}
              </Link>
              <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                {activePost.excerpt}
              </p>
              <Link
                href={`/blog/${activePost.slug}`}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-mono pt-0.5 group"
              >
                <span>Read Note</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Active Technical Topics */}
        {focusTopics && focusTopics.length > 0 && (
          <div className="pt-2.5 sm:pt-3 border-t border-[hsl(var(--border-subtle))] space-y-1.5 sm:space-y-2">
            <span className="text-[10px] sm:text-[11px] font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
              Active Architectural Focus:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {focusTopics.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[10px] sm:text-xs py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-lg border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] font-medium font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </Reveal>
  );
}
