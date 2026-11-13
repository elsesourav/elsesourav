'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card, Button } from '@elsesourav/ui';
import { ChevronUp, Maximize2, Monitor, Smartphone } from 'lucide-react';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import type { GridRow, ScreenshotAspect } from './screenshot-grid-layout';

interface AppScreenshotExpandedGridProps {
  appName: string;
  rows: readonly GridRow[];
  totalItems: number;
  aspectMap: Record<string, ScreenshotAspect>;
  onOpenLightbox: (url: string) => void;
  onCollapse: () => void;
  onImageLoadAspect?: (url: string, aspect: ScreenshotAspect) => void;
}

export function AppScreenshotExpandedGrid({
  appName,
  rows,
  totalItems,
  aspectMap,
  onOpenLightbox,
  onCollapse,
  onImageLoadAspect,
}: AppScreenshotExpandedGridProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-stretch"
        >
          {row.cells.map((cell) => {
            const item = cell.item;
            const isVideo = item.type === 'video';
            const aspect = isVideo ? 'landscape' : aspectMap[item.url] || 'landscape';
            const isPortrait = aspect === 'portrait';

            // Resolve column span classes
            let colSpanClass = 'col-span-12';
            if (cell.colSpan === 8) {
              colSpanClass = 'col-span-12 lg:col-span-8';
            } else if (cell.colSpan === 4) {
              colSpanClass = 'col-span-12 lg:col-span-4';
            } else if (cell.colSpan === 6) {
              colSpanClass = cell.isCentered
                ? 'col-span-12 lg:col-span-6 lg:col-start-4'
                : 'col-span-12 lg:col-span-6';
            }

            // Resolve responsive aspect ratio styling based on cell placement
            let aspectClass = 'aspect-[16/9]';
            if (cell.colSpan === 8) {
              aspectClass = 'aspect-[16/10] sm:aspect-[16/9] min-h-[260px] sm:min-h-[340px]';
            } else if (cell.colSpan === 4) {
              aspectClass = isPortrait
                ? 'aspect-[9/16] lg:aspect-auto lg:h-full min-h-[300px] sm:min-h-[340px]'
                : 'aspect-[16/9] lg:aspect-auto lg:h-full min-h-[240px]';
            } else if (cell.colSpan === 6) {
              aspectClass = isPortrait
                ? 'aspect-[9/14] sm:aspect-[9/16] min-h-[320px] sm:min-h-[380px]'
                : 'aspect-[16/10] sm:aspect-[16/9] min-h-[240px] sm:min-h-[300px]';
            } else if (cell.colSpan === 12) {
              aspectClass = isPortrait
                ? 'aspect-[9/16] max-h-[580px] mx-auto w-full'
                : 'aspect-[16/9] sm:aspect-[21/9] min-h-[260px] sm:min-h-[360px]';
            }

            return (
              <div key={item.id} className={`${colSpanClass} flex flex-col`}>
                <Card
                  onClick={() => !isVideo && onOpenLightbox(item.url)}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 sm:p-2.5 shadow-md hover:shadow-2xl hover:border-indigo-500/40 transition-all duration-300 flex-1 flex flex-col items-center justify-center ${
                    isVideo ? '' : 'cursor-zoom-in'
                  } ${aspectClass}`}
                >
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                    {isVideo ? (
                      <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                        <AppMediaVideoCard
                          videoUrl={item.url}
                          appName={appName}
                          className="w-full h-full"
                        />
                        <span className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/80 text-white border border-white/20">
                          VIDEO
                        </span>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={getAppScreenshotUrl(item.url, 2560, 1440, 'limit')}
                          alt={`${appName} screenshot ${item.originalIndex}`}
                          fill
                          unoptimized
                          sizes={
                            cell.colSpan === 8
                              ? '(max-width: 1024px) 100vw, 800px'
                              : cell.colSpan === 4
                              ? '(max-width: 1024px) 100vw, 420px'
                              : '(max-width: 768px) 100vw, 650px'
                          }
                          className="w-full h-full object-contain rounded-xl sm:rounded-2xl group-hover:scale-[1.015] transition-transform duration-500 ease-out"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            if (img.naturalWidth && img.naturalHeight && onImageLoadAspect) {
                              const detectedAspect: ScreenshotAspect =
                                img.naturalHeight > img.naturalWidth * 1.05
                                  ? 'portrait'
                                  : 'landscape';
                              if (detectedAspect !== aspect) {
                                onImageLoadAspect(item.url, detectedAspect);
                              }
                            }
                          }}
                        />

                        {/* Original Index Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-black/75 dark:bg-zinc-950/80 text-white backdrop-blur-md border border-white/10 pointer-events-none">
                          #{String(item.originalIndex).padStart(2, '0')} / {String(totalItems).padStart(2, '0')}
                        </div>

                        {/* Aspect Ratio Badge */}
                        <div className="absolute top-2.5 right-2.5 z-10 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
                          {isPortrait ? (
                            <>
                              <Smartphone className="w-2.5 h-2.5 text-indigo-400" />
                              <span>9:16</span>
                            </>
                          ) : (
                            <>
                              <Monitor className="w-2.5 h-2.5 text-emerald-400" />
                              <span>16:9</span>
                            </>
                          )}
                        </div>

                        {/* Expand Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLightbox(item.url);
                          }}
                          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 text-white backdrop-blur-xl transition-all active:scale-95 shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 flex items-center justify-center cursor-pointer z-10"
                          aria-label={`Expand screenshot ${item.originalIndex}`}
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ))}

      {/* Bottom Collapse Bar */}
      <div className="flex justify-center pt-3 pb-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCollapse}
          className="rounded-full px-5 py-2 font-mono text-xs shadow-md border-[hsl(var(--border))] hover:border-indigo-500/50"
          leftIcon={<ChevronUp className="w-4 h-4" />}
        >
          Collapse to Horizontal View
        </Button>
      </div>
    </div>
  );
}
