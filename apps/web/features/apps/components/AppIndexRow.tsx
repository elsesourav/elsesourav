import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAppIconUrl } from '@elsesourav/media';
import type { AppListItem, AppPlatform } from '@elsesourav/types';
import { Sparkles, Globe, Compass, Smartphone, Apple, Terminal, ArrowRight } from 'lucide-react';

export interface AppIndexRowProps {
  app: AppListItem;
  index?: number;
}

function PlatformIcon({ platform }: { platform: AppPlatform }) {
  switch (platform) {
    case 'web':
      return <Globe className="w-3.5 h-3.5" />;
    case 'chrome':
      return <Compass className="w-3.5 h-3.5" />;
    case 'android':
    case 'ios':
      return <Smartphone className="w-3.5 h-3.5" />;
    case 'macos':
      return <Apple className="w-3.5 h-3.5" />;
    case 'github':
    case 'linux':
    case 'windows':
    default:
      return <Terminal className="w-3.5 h-3.5" />;
  }
}

export function AppIndexRow({ app, index }: AppIndexRowProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 80) : null;
  const formattedIndex = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
    >
      <div className="py-4 px-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-indigo-500/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Index + Icon + Identity + Description */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {formattedIndex && (
            <span className="font-mono text-zinc-500 text-xs font-semibold shrink-0 hidden sm:block">
              {formattedIndex}
            </span>
          )}

          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700/60 shrink-0 flex items-center justify-center">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={`${app.name} icon`}
                width={40}
                height={40}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                {app.name}
              </h3>
              {app.currentVersion && (
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.2 rounded border border-zinc-700/40">
                  v{app.currentVersion}
                </span>
              )}
              {app.isFeatured && (
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 font-medium">
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate leading-relaxed">
              {app.shortDescription}
            </p>
          </div>
        </div>

        {/* Right: Category + Platform Icons + Explore Action */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
          <span className="text-xs text-zinc-400 font-medium bg-zinc-800/50 px-2.5 py-1 rounded-lg border border-zinc-700/40">
            {app.primaryCategory}
          </span>

          <div className="flex items-center gap-1.5 text-zinc-400">
            {app.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                title={platform.toUpperCase()}
                className="w-6 h-6 rounded-lg bg-zinc-800/60 flex items-center justify-center"
              >
                <PlatformIcon platform={platform} />
              </span>
            ))}
          </div>

          <div className="text-xs text-indigo-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span className="hidden md:inline">Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
