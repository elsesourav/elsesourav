import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { AppListItem, AppPlatform } from '@elsesourav/types';
import { Globe, Compass, Smartphone, Apple, Terminal, ArrowRight } from 'lucide-react';

export interface AppCardProps {
  app: AppListItem;
  index?: number;
  featured?: boolean;
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

export function AppCard({ app, index, featured = false }: AppCardProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
  const formattedIndex = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  if (featured) {
    return (
      <Link href={`/apps/${app.slug}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-3xl">
        <Card className="h-full border-zinc-800/90 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 hover:border-indigo-500/50 p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-indigo-500/10 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            {/* Top metadata index bar */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                {formattedIndex && (
                  <span className="font-mono text-indigo-400 font-bold text-xs bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    {formattedIndex}
                  </span>
                )}
                <span className="text-zinc-400 font-medium">{app.primaryCategory}</span>
              </div>
              {app.currentVersion && (
                <span className="text-zinc-500 text-xs font-mono">v{app.currentVersion}</span>
              )}
            </div>

            {/* Icon + Title */}
            <div className="flex items-start gap-4 pt-1">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800/90 border border-zinc-700/60 shrink-0 flex items-center justify-center shadow-md">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={`${app.name} icon`}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Globe className="w-7 h-7 text-indigo-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-indigo-200 transition-colors truncate">
                  {app.name}
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{app.primaryCategory}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
              {app.shortDescription}
            </p>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-zinc-800/80 text-xs text-zinc-400 relative z-10">
            <div className="flex items-center gap-2">
              {app.platforms.slice(0, 4).map((platform) => (
                <span
                  key={platform}
                  title={platform.toUpperCase()}
                  className="w-6 h-6 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors"
                >
                  <PlatformIcon platform={platform} />
                </span>
              ))}
            </div>

            <span className="text-indigo-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Inspect project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/apps/${app.slug}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
      <Card className="h-full border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between backdrop-blur-sm group-hover:shadow-xl group-hover:shadow-indigo-500/10">
        <div className="space-y-3">
          {/* Header row with index and category */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              {formattedIndex && (
                <span className="font-mono text-zinc-500 font-medium text-[11px]">
                  {formattedIndex}
                </span>
              )}
              <span className="text-zinc-400 text-xs font-medium">{app.primaryCategory}</span>
            </div>
            {app.currentVersion && (
              <span className="text-[11px] text-zinc-500 font-mono">v{app.currentVersion}</span>
            )}
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700/50 shrink-0 flex items-center justify-center">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Globe className="w-5 h-5 text-indigo-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                {app.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {app.shortDescription}
          </p>
        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            {app.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                title={platform.toUpperCase()}
                className="w-5 h-5 rounded-full bg-zinc-800/60 flex items-center justify-center text-zinc-400"
              >
                <PlatformIcon platform={platform} />
              </span>
            ))}
          </div>

          <span className="text-zinc-400 group-hover:text-indigo-400 font-medium flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
            <span>View project</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
