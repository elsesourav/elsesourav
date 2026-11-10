'use client';

import * as React from 'react';
import Link from 'next/link';
import type { PublicApp, AppPlatform } from '@elsesourav/types';
import {
  Globe,
  Terminal,
  Smartphone,
  Apple,
  GitBranch,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Scale,
  Compass,
} from 'lucide-react';
import { getAppDisplaySize, getProjectAge } from '@/features/apps/utils/app-metrics';

interface AppInformationSpecsProps {
  app: PublicApp;
}

function getPlatformLabel(platform: AppPlatform): string {
  switch (platform) {
    case 'web':
      return 'Web Browser (Chrome, Safari, Firefox, Edge)';
    case 'chrome':
      return 'Google Chrome Extension';
    case 'macos':
      return 'macOS 12.0 or later';
    case 'ios':
      return 'iOS 15.0 or later (iPhone & iPad)';
    case 'android':
      return 'Android 10.0 or later';
    case 'linux':
      return 'Linux (x86_64, ARM64)';
    case 'windows':
      return 'Windows 10 / 11 (64-bit)';
    case 'github':
      return 'GitHub Source / CLI';
    default:
      return 'Modern Web Platform';
  }
}

function getPlatformIcon(platform: AppPlatform) {
  switch (platform) {
    case 'web':
      return <Globe className="w-4 h-4 text-emerald-500" />;
    case 'chrome':
      return <Compass className="w-4 h-4 text-amber-500" />;
    case 'macos':
      return <Apple className="w-4 h-4 text-zinc-300" />;
    case 'ios':
    case 'android':
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    case 'github':
      return <GitBranch className="w-4 h-4 text-purple-500" />;
    case 'linux':
    case 'windows':
    default:
      return <Terminal className="w-4 h-4 text-indigo-500" />;
  }
}

export function AppInformationSpecs({ app }: AppInformationSpecsProps) {
  const [isCompatibilityExpanded, setIsCompatibilityExpanded] = React.useState(false);

  // Find github link
  const githubLink = app.links.find((l) => l.platform === 'github' || l.url.includes('github.com'));

  // Dynamic estimated size and project age
  const displaySize = getAppDisplaySize(app).formatted;
  const projectAge = getProjectAge(app.publishedAt ?? app.createdAt ?? app.releaseDate);

  return (
    <section
      aria-labelledby="app-information-heading"
      className="space-y-6 pt-10 border-t border-[hsl(var(--border-subtle))]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
        <h2
          id="app-information-heading"
          className="text-lg sm:text-xl font-bold tracking-tight text-[hsl(var(--foreground))] font-display"
        >
          Information
        </h2>
        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          Application Specifications
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm divide-y md:divide-y-0 divide-[hsl(var(--border-subtle))]">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Contributor / Author (Only displayed when explicitly configured) */}
          {app.authorName && app.authorName.trim() ? (
            <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
              <span className="text-[hsl(var(--muted-foreground))] font-medium">
                {app.authorRole || 'Contributor'}
              </span>
              <div className="flex items-center gap-2">
                {app.authorImageUrl && (
                  <img
                    src={app.authorImageUrl}
                    alt={app.authorName}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                {app.authorUrl ? (
                  <a
                    href={app.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    {app.authorName}
                  </a>
                ) : (
                  <span className="text-[hsl(var(--foreground))] font-semibold">
                    {app.authorName}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Size */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Size</span>
            <span className="text-[hsl(var(--foreground))] font-mono font-medium">
              {displaySize}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Category</span>
            <Link
              href={`/apps?category=${app.categorySlug}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {app.primaryCategory}
            </Link>
          </div>

          {/* Compatibility with Accordion Dropdown */}
          <div className="py-2 border-b border-[hsl(var(--border-subtle))]">
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--muted-foreground))] font-medium">Compatibility</span>
              <button
                type="button"
                onClick={() => setIsCompatibilityExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold cursor-pointer"
                aria-expanded={isCompatibilityExpanded}
              >
                <span>
                  {app.platforms.length > 0 ? `${app.platforms.length} Platforms` : 'Web'}
                </span>
                {isCompatibilityExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {isCompatibilityExpanded && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {app.platforms.length > 0 ? (
                  app.platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-2.5 text-xs">
                      {getPlatformIcon(platform)}
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {getPlatformLabel(platform)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))]">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>Works on all modern Web Browsers (Desktop & Mobile)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Languages</span>
            <span className="text-[hsl(var(--foreground))] font-medium">English</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Project Age / Active Since */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Project Age</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] text-xs font-mono font-semibold text-[hsl(var(--foreground))]">
              {projectAge.fullText} Active
            </span>
          </div>

          {/* Access / License */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Access Control</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--foreground))]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{app.requiresAuth ? 'Member Access Required' : 'Public & Open'}</span>
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Price</span>
            <span className="text-[hsl(var(--foreground))] font-semibold text-emerald-600 dark:text-emerald-400">
              Free
            </span>
          </div>

          {/* License & Source */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">
              Software License
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--foreground))]">
              <Scale className="w-3.5 h-3.5 text-indigo-500" />
              <span>{githubLink ? 'MIT / Open Source' : 'Proprietary Freeware'}</span>
            </span>
          </div>

          {/* Copyright */}
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-subtle))]">
            <span className="text-[hsl(var(--muted-foreground))] font-medium">Copyright</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
              © 2026 ElseSourav
            </span>
          </div>
        </div>
      </div>

      {/* Developer Quick Links Strip */}
      <div className="pt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all duration-150 active:scale-[0.98]"
        >
          <span>Developer Profile</span>
          <ExternalLink className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
        </Link>
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all duration-150 active:scale-[0.98]"
        >
          <span>App Support & Documentation</span>
          <ExternalLink className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
        </Link>
        <Link
          href="/notes/privacy"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all duration-150 active:scale-[0.98]"
        >
          <span>Privacy Policy</span>
          <ExternalLink className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
        </Link>
      </div>
    </section>
  );
}
