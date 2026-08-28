import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { AppListItem, AppPlatform } from '@elsesourav/types';
import { Sparkles, Globe, Compass, Smartphone, Apple, Terminal } from 'lucide-react';

interface AppCardProps {
  app: AppListItem;
}

function PlatformIcon({ platform }: { platform: AppPlatform }) {
  switch (platform) {
    case 'web':
      return <Globe className="w-3 h-3" />;
    case 'chrome':
      return <Compass className="w-3 h-3" />;
    case 'android':
    case 'ios':
      return <Smartphone className="w-3 h-3" />;
    case 'macos':
      return <Apple className="w-3 h-3" />;
    case 'github':
    case 'linux':
    case 'windows':
    default:
      return <Terminal className="w-3 h-3" />;
  }
}

export function AppCard({ app }: AppCardProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;

  return (
    <Link href={`/apps/${app.slug}`} className="group block h-full focus:outline-none">
      <Card className="h-full border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between backdrop-blur-sm group-hover:shadow-xl group-hover:shadow-indigo-500/10 group-focus-visible:ring-2 group-focus-visible:ring-indigo-500">
        <div className="space-y-3">
          {/* Header row with icon, title, and category */}
          <div className="flex items-start gap-3.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700/50 shrink-0 flex items-center justify-center">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Sparkles className="w-6 h-6 text-indigo-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <h3 className="font-semibold text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                  {app.name}
                </h3>
                {app.isFeatured && (
                  <span className="shrink-0 text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 border border-amber-400/20">
                    <Sparkles className="w-2.5 h-2.5 fill-current" /> Featured
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {app.primaryCategory}
              </span>
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

          {app.currentVersion && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-zinc-400 border-zinc-800 font-mono">
              v{app.currentVersion}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
