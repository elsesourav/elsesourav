'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card, Button, cn } from '@elsesourav/ui';
import { ChevronUp, Maximize2 } from 'lucide-react';
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
  totalItems: _totalItems,
  aspectMap,
  onOpenLightbox,
  onCollapse,
  onImageLoadAspect,
}: AppScreenshotExpandedGridProps) {
  const [loadedMap, setLoadedMap] = React.useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3 sm:space-y-4">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 md:gap-3 items-stretch"
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
                ? 'aspect-[3/4] lg:aspect-auto lg:h-full min-h-[300px] sm:min-h-[340px]'
                : 'aspect-[16/9] lg:aspect-auto lg:h-full min-h-[240px]';
            } else if (cell.colSpan === 6) {
              aspectClass = isPortrait
                ? 'aspect-[3/4] min-h-[320px] sm:min-h-[380px]'
                : 'aspect-[16/10] sm:aspect-[16/9] min-h-[240px] sm:min-h-[300px]';
            } else if (cell.colSpan === 12) {
              aspectClass = isPortrait
                ? 'aspect-[3/4] max-h-[580px] mx-auto w-full'
                : 'aspect-[16/9] sm:aspect-[21/9] min-h-[260px] sm:min-h-[360px]';
            }

            return (
              <div key={item.id} className={`${colSpanClass} flex flex-col`}>
                <Card
                  onClick={() => !isVideo && onOpenLightbox(item.url)}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-100/90 dark:bg-zinc-950/80 p-0 shadow-xs hover:shadow-lg hover:border-indigo-500/50 transition-all duration-300 flex-1 flex flex-col items-center justify-center ${
                    isVideo ? '' : 'cursor-zoom-in'
                  } ${aspectClass}`}
                >
                  <div className="relative w-full h-full overflow-hidden bg-zinc-100/60 dark:bg-black/40 flex items-center justify-center">
                    {isVideo ? (
                      <div className="relative w-full h-full overflow-hidden bg-black">
                        <AppMediaVideoCard
                          videoUrl={item.url}
                          appName={appName}
                          className="w-full h-full"
                        />
                        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-black/80 text-white border border-white/20">
                          VIDEO
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Shimmer skeleton while high-res screenshot loads */}
                        <div
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-0 skeleton-shimmer bg-zinc-200/60 dark:bg-zinc-800/60 z-[1] transition-opacity duration-400 pointer-events-none rounded-xl sm:rounded-2xl',
                            loadedMap[item.url] ? 'opacity-0' : 'opacity-100'
                          )}
                        />
                        <Image
                          src={getAppScreenshotUrl(item.url, 2560, 1440, 'limit')}
                          alt={`${appName} screenshot ${item.originalIndex}`}
                          fill
                          unoptimized
                          sizes={
                            cell.colSpan === 8
                              ? '(max-width: 1024px) 100vw, 850px'
                              : cell.colSpan === 4
                              ? '(max-width: 1024px) 100vw, 450px'
                              : '(max-width: 768px) 100vw, 700px'
                          }
                          className={cn(
                            'w-full h-full object-contain rounded-xl sm:rounded-2xl group-hover:scale-[1.01] transition-all duration-400 ease-out',
                            loadedMap[item.url] ? 'opacity-100' : 'opacity-0'
                          )}
                          onLoad={(e) => {
                            setLoadedMap((prev) => ({ ...prev, [item.url]: true }));
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

                        {/* Expand Button on Hover */}
                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-white/85 dark:bg-black/75 hover:bg-white dark:hover:bg-black/90 text-zinc-800 dark:text-white backdrop-blur-md border border-zinc-200 dark:border-white/20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none shadow-xs">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
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
      <div className="flex justify-center pt-2 pb-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCollapse}
          className="rounded-full px-4 py-1.5 font-mono text-xs shadow-sm border-[hsl(var(--border))] hover:border-indigo-500/50"
          leftIcon={<ChevronUp className="w-3.5 h-3.5" />}
        >
          Collapse to Horizontal View
        </Button>
      </div>
    </div>
  );
}
