'use client';

import * as React from 'react';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card } from '@elsesourav/ui';
import { BlurUpImage, Lightbox } from '@elsesourav/ui/interior';
import { inspectUrlDimensions, type ImageDimensionInfo } from '@/features/admin/media/utils/image-dimensions';
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2, Smartphone, Monitor } from 'lucide-react';

interface AppScreenshotGalleryProps {
  appName: string;
  screenshots: readonly string[];
  featuredImageUrl?: string | null;
}

export function AppScreenshotGallery({
  appName,
  screenshots,
  featuredImageUrl,
}: AppScreenshotGalleryProps) {
  // Combine featured image with screenshots if not already included
  const allMedia = React.useMemo(() => {
    const list: string[] = [];
    if (featuredImageUrl) {
      list.push(featuredImageUrl);
    }
    if (screenshots && screenshots.length > 0) {
      for (const s of screenshots) {
        if (!list.includes(s)) {
          list.push(s);
        }
      }
    }
    return list;
  }, [featuredImageUrl, screenshots]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [dimensionsMap, setDimensionsMap] = React.useState<Record<string, ImageDimensionInfo>>({});
  const mainImageRef = React.useRef<HTMLDivElement>(null);

  // Inspect dimensions for all screenshots to adapt framing
  React.useEffect(() => {
    let cancelled = false;

    allMedia.forEach((src) => {
      if (dimensionsMap[src]) return;
      void inspectUrlDimensions(src).then((info) => {
        if (!cancelled) {
          setDimensionsMap((prev) => ({ ...prev, [src]: info }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [allMedia, dimensionsMap]);

  // Keyboard navigation for carousel when not in lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) {
        if (e.key === 'ArrowLeft' && allMedia.length > 1) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
        } else if (e.key === 'ArrowRight' && allMedia.length > 1) {
          setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allMedia.length]);

  if (allMedia.length === 0) {
    return null;
  }

  const currentScreenshot = allMedia[selectedIndex] || allMedia[0] || '';
  const currentDim = dimensionsMap[currentScreenshot];
  const isCurrentPortrait = currentDim?.isPortrait ?? false;
  const transformedUrl = currentScreenshot
    ? getAppScreenshotUrl(currentScreenshot, 1600, 900, 'fit')
    : '';

  return (
    <section aria-labelledby="interface-showcase-heading" className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
          <ImageIcon className="w-4 h-4" />
          <h2
            id="interface-showcase-heading"
            className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold"
          >
            Interface Showcase &amp; Visuals
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--muted-foreground))]">
          {isCurrentPortrait ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Preview</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Preview</span>
            </span>
          )}
          <span>•</span>
          <span>
            {allMedia.length} {allMedia.length === 1 ? 'Preview' : 'Screenshots'}
          </span>
        </div>
      </div>

      {/* Main Preview Container */}
      <Card className="relative overflow-hidden rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-4 aspect-[16/10] sm:aspect-video flex items-center justify-center shadow-xl backdrop-blur-xl group">
        {transformedUrl ? (
          <div
            ref={mainImageRef}
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center cursor-zoom-in"
          >
            {isCurrentPortrait ? (
              /* Mobile Portrait Layout: Ambient Blurred Backdrop + Centered Phone Frame */
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Ambient Blurred Backdrop */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-15 scale-110 bg-cover bg-center filter blur-2xl"
                  style={{ backgroundImage: `url(${transformedUrl})` }}
                />

                {/* Centered Phone Chassis Mockup */}
                <div className="relative z-10 h-[92%] aspect-[9/16] rounded-[2rem] border-2 border-zinc-300/80 dark:border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl overflow-hidden">
                  <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-black">
                    <div
                      aria-hidden="true"
                      className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-2.5 rounded-full bg-black/80 border border-white/10 z-20 pointer-events-none"
                    />
                    <BlurUpImage
                      src={transformedUrl}
                      alt={`${appName} mobile interface preview ${selectedIndex + 1}`}
                      fill
                      objectFit="cover"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Landscape Layout: Crisp Clean Preview */
              <BlurUpImage
                src={transformedUrl}
                alt={`${appName} interface preview ${selectedIndex + 1}`}
                fill
                objectFit="contain"
                className="w-full h-full rounded-2xl"
              />
            )}

            {/* Expand Overlay Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/75 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 dark:border-zinc-700/80 text-white backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center cursor-pointer z-20"
              aria-label="Expand screenshot in Lightbox"
            >
              <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        ) : null}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1))
              }
              className="pointer-events-auto w-10 h-10 rounded-full bg-[hsl(var(--card))]/90 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--surface-elevated))] hover:scale-105 active:scale-95 shadow-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0))
              }
              className="pointer-events-auto w-10 h-10 rounded-full bg-[hsl(var(--card))]/90 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--surface-elevated))] hover:scale-105 active:scale-95 shadow-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              aria-label="Next screenshot"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </Card>

      {/* Thumbnail Strip: Ratio-Adaptive Thumbnails with BlurUp */}
      {allMedia.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {allMedia.map((src, idx) => {
            const isThumbPortrait = dimensionsMap[src]?.isPortrait ?? false;
            const thumbUrl = getAppScreenshotUrl(
              src,
              isThumbPortrait ? 180 : 280,
              isThumbPortrait ? 320 : 160,
              'fit'
            );
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[hsl(var(--surface-subtle))] cursor-pointer ${
                  isThumbPortrait ? 'w-12 sm:w-14 aspect-[9/16]' : 'w-24 sm:w-28 aspect-video'
                } ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 opacity-100 scale-[1.02]'
                    : 'border-[hsl(var(--border))] opacity-60 hover:opacity-100'
                }`}
                aria-label={`View screenshot ${idx + 1}`}
              >
                <BlurUpImage
                  src={thumbUrl}
                  alt={`${appName} thumbnail ${idx + 1}`}
                  fill
                  objectFit="cover"
                  className="w-full h-full"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox with Fluid Spring Physics & Gallery Navigation */}
      {transformedUrl && (
        <Lightbox
          open={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          src={getAppScreenshotUrl(currentScreenshot, 1920, 1080, 'fit')}
          alt={`${appName} interface preview ${selectedIndex + 1}`}
          caption={`${appName} — Screenshot ${selectedIndex + 1} of ${allMedia.length}`}
          originRef={mainImageRef}
          index={selectedIndex}
          total={allMedia.length}
          onPrev={
            allMedia.length > 1
              ? () => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1))
              : undefined
          }
          onNext={
            allMedia.length > 1
              ? () => setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0))
              : undefined
          }
        />
      )}
    </section>
  );
}
