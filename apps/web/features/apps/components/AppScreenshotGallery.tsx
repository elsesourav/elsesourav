'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2 } from 'lucide-react';

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
  const mainImageRef = React.useRef<HTMLDivElement>(null);

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

  const currentScreenshot = allMedia[selectedIndex] || allMedia[0];
  const transformedUrl = currentScreenshot ? getAppScreenshotUrl(currentScreenshot, 1600, 900) : '';

  return (
    <section aria-labelledby="interface-showcase-heading" className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
          <ImageIcon className="w-4 h-4" />
          <h2
            id="interface-showcase-heading"
            className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold"
          >
            Interface Showcase & Visuals
          </h2>
        </div>
        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          {allMedia.length} {allMedia.length === 1 ? 'Preview' : 'Screenshots'}
        </span>
      </div>

      {/* Main Preview Container */}
      <Card className="relative overflow-hidden rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-4 aspect-[16/10] sm:aspect-video flex items-center justify-center shadow-xl backdrop-blur-xl group">
        {transformedUrl ? (
          <div
            ref={mainImageRef}
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center cursor-zoom-in"
          >
            <Image
              src={transformedUrl}
              alt={`${appName} interface preview ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
            />

            {/* Expand Overlay Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all duration-150 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              aria-label="Expand screenshot in Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Lightbox</span>
            </button>
          </div>
        ) : null}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
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

      {/* Thumbnail Strip */}
      {allMedia.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {allMedia.map((src, idx) => {
            const thumbUrl = getAppScreenshotUrl(src, 280, 160);
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[hsl(var(--surface-subtle))] cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 opacity-100 scale-[1.02]'
                    : 'border-[hsl(var(--border))] opacity-60 hover:opacity-100'
                }`}
                aria-label={`View screenshot ${idx + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt={`${appName} thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="w-full h-full object-cover"
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
          src={transformedUrl}
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
