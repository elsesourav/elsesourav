'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card } from '@elsesourav/ui';
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2, X } from 'lucide-react';

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

  // Keyboard navigation for carousel & modal
  const [isLightboxClosing, setIsLightboxClosing] = React.useState(false);

  const requestCloseLightbox = React.useCallback(() => {
    if (isLightboxClosing) return;
    setIsLightboxClosing(true);
    setTimeout(() => {
      setIsLightboxClosing(false);
      setIsLightboxOpen(false);
    }, 150);
  }, [isLightboxClosing]);

  // Keyboard navigation & escape key in lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen && !isLightboxClosing) {
        if (e.key === 'Escape') {
          requestCloseLightbox();
        } else if (e.key === 'ArrowLeft' && allMedia.length > 1) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
        } else if (e.key === 'ArrowRight' && allMedia.length > 1) {
          setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, isLightboxClosing, allMedia.length, requestCloseLightbox]);

  // Lock body scroll when lightbox is open
  React.useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

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
          <h2 id="interface-showcase-heading" className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
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
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
            <Image
              src={transformedUrl}
              alt={`${appName} interface preview ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="w-full h-full object-contain rounded-2xl transition-transform duration-500"
            />

            {/* Expand Overlay Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all duration-150 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              aria-label="Expand screenshot in full resolution"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Enlarge</span>
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
                className={`relative w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[hsl(var(--surface-subtle))] ${
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

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${appName} screenshot viewer`}
          className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 ${
            isLightboxClosing ? 'animate-overlay-out' : 'animate-overlay-in'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              requestCloseLightbox();
            }
          }}
        >
          {/* Top Bar */}
          <div className="w-full max-w-7xl flex items-center justify-between text-white pb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm sm:text-base">{appName}</span>
              <span className="text-xs font-mono text-zinc-400">
                {selectedIndex + 1} / {allMedia.length}
              </span>
            </div>
            <button
              type="button"
              onClick={requestCloseLightbox}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              aria-label="Close image viewer (Escape)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Image Container */}
          <div
            className={`relative flex-1 w-full max-w-7xl flex items-center justify-center min-h-0 py-2 ${
              isLightboxClosing ? 'animate-dialog-out' : 'animate-dialog-in'
            }`}
          >
            {transformedUrl && (
              <div className="relative w-full h-full max-h-[82vh]">
                <Image
                  src={transformedUrl}
                  alt={`${appName} expanded preview`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            )}

            {/* Lightbox Navigation Buttons */}
            {allMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1))
                  }
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 border border-white/20 text-white flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label="Previous screenshot (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 border border-white/20 text-white flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label="Next screenshot (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Hint / Touch status */}
          <div className="text-center text-xs font-mono text-zinc-400 pt-3">
            <span className="sm:hidden">
              Swipe or tap arrows to navigate • Tap ✕ to close
            </span>
            <span className="hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">Esc</kbd> to close, arrow keys to navigate
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
