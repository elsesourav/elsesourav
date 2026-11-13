'use client';

import * as React from 'react';
import { Badge } from '@elsesourav/ui';
import { Monitor, Smartphone, GalleryHorizontalEnd, ExternalLink } from 'lucide-react';

export interface AdminCarouselPreviewProps {
  title: string;
  subtitle: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  targetUrl: string;
  badgeText: string;
}

export function AdminCarouselPreview({
  title,
  subtitle,
  desktopImageUrl,
  mobileImageUrl,
  targetUrl,
  badgeText,
}: AdminCarouselPreviewProps) {
  const [deviceMode, setDeviceMode] = React.useState<'desktop' | 'mobile'>('desktop');

  const activeImage =
    deviceMode === 'desktop'
      ? desktopImageUrl || mobileImageUrl
      : mobileImageUrl || desktopImageUrl;

  return (
    <div className="space-y-3">
      {/* Device Mode Switcher */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <GalleryHorizontalEnd className="w-4 h-4 text-indigo-500" />
          Interactive Live Preview
        </span>

        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-xs">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              deviceMode === 'desktop'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (21:9)</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              deviceMode === 'mobile'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (3:4)</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex items-center justify-center p-4 sm:p-6 bg-zinc-950/90 rounded-2xl sm:rounded-3xl border border-zinc-800/80 overflow-hidden relative min-h-[220px]">
        {deviceMode === 'desktop' ? (
          /* Desktop 21:9 Aspect Ratio Frame */
          <div className="w-full max-w-2xl aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl group bg-zinc-900">
            {activeImage ? (
              <img
                src={activeImage}
                alt={title || 'Carousel preview'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2 p-4 text-center">
                <GalleryHorizontalEnd className="w-8 h-8 opacity-40" />
                <span className="text-xs">Upload or select a 21:9 desktop banner to preview</span>
              </div>
            )}

            {/* Overlaid Pill Details for Context */}
            {(badgeText || title) && (
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                {badgeText && (
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase font-mono px-2 py-0.5 bg-black/60 text-white border-white/20 backdrop-blur-md"
                  >
                    {badgeText}
                  </Badge>
                )}
                {title && (
                  <span className="text-xs font-semibold text-white/90 drop-shadow-md truncate max-w-[200px]">
                    {title}
                  </span>
                )}
              </div>
            )}

            {targetUrl && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-[10px] font-mono border border-white/10 backdrop-blur-md">
                <span className="truncate max-w-[150px]">{targetUrl}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
              </div>
            )}
          </div>
        ) : (
          /* Mobile 3:4 Aspect Ratio Frame */
          <div className="w-56 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-zinc-700/80 relative shadow-2xl bg-zinc-900">
            {activeImage ? (
              <img
                src={activeImage}
                alt={title || 'Mobile carousel preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2 p-4 text-center">
                <GalleryHorizontalEnd className="w-8 h-8 opacity-40" />
                <span className="text-xs">Upload or select a 3:4 mobile banner</span>
              </div>
            )}

            {/* Mobile Callout */}
            {(badgeText || title) && (
              <div className="absolute top-2.5 left-2.5 right-2.5 space-y-1 pointer-events-none">
                {badgeText && (
                  <Badge
                    variant="outline"
                    className="text-[8px] uppercase font-mono px-1.5 py-0.2 bg-black/70 text-white border-white/20 backdrop-blur-md"
                  >
                    {badgeText}
                  </Badge>
                )}
                {title && (
                  <div className="text-[11px] font-bold text-white drop-shadow-md line-clamp-1">
                    {title}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Navigation Indicator Bar */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center">
              <div className="w-12 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
