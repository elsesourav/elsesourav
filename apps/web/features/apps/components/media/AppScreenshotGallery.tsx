'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Card } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2, Play } from 'lucide-react';

interface AppScreenshotGalleryProps {
  appName: string;
  screenshots: readonly string[];
  featuredImageUrl?: string | null;
  videoUrl?: string | null;
}

type GalleryMediaItem =
  | { type: 'video'; url: string }
  | { type: 'image'; url: string };

export function AppScreenshotGallery({
  appName,
  screenshots,
  featuredImageUrl,
  videoUrl,
}: AppScreenshotGalleryProps) {
  // Combine video, featured image, and screenshots
  const allMedia = React.useMemo<GalleryMediaItem[]>(() => {
    const list: GalleryMediaItem[] = [];

    if (videoUrl && videoUrl.trim()) {
      list.push({ type: 'video', url: videoUrl.trim() });
    }

    const seenUrls = new Set<string>();

    if (featuredImageUrl && featuredImageUrl.trim()) {
      seenUrls.add(featuredImageUrl.trim());
      list.push({ type: 'image', url: featuredImageUrl.trim() });
    }

    if (screenshots && screenshots.length > 0) {
      for (const s of screenshots) {
        const trimmed = s?.trim();
        if (trimmed && !seenUrls.has(trimmed)) {
          seenUrls.add(trimmed);
          list.push({ type: 'image', url: trimmed });
        }
      }
    }

    return list;
  }, [featuredImageUrl, screenshots, videoUrl]);

  // Extract only images for Lightbox navigation
  const imageList = React.useMemo(() => {
    return allMedia.filter((item): item is { type: 'image'; url: string } => item.type === 'image');
  }, [allMedia]);

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

  const currentItem = allMedia[selectedIndex] || allMedia[0];
  const isVideo = currentItem?.type === 'video';
  const currentImageUrl = !isVideo && currentItem ? currentItem.url : '';
  const transformedImageUrl = currentImageUrl
    ? getAppScreenshotUrl(currentImageUrl, 2560, 1440, 'limit')
    : '';

  // Index within the imageList for the Lightbox
  const lightboxIndex = currentImageUrl
    ? imageList.findIndex((item) => item.url === currentImageUrl)
    : -1;

  const handleLightboxPrev = () => {
    if (imageList.length <= 1) return;
    const nextIdx = lightboxIndex > 0 ? lightboxIndex - 1 : imageList.length - 1;
    const targetItem = imageList[nextIdx];
    if (targetItem) {
      const globalIdx = allMedia.findIndex((m) => m.url === targetItem.url);
      if (globalIdx !== -1) setSelectedIndex(globalIdx);
    }
  };

  const handleLightboxNext = () => {
    if (imageList.length <= 1) return;
    const nextIdx = lightboxIndex < imageList.length - 1 ? lightboxIndex + 1 : 0;
    const targetItem = imageList[nextIdx];
    if (targetItem) {
      const globalIdx = allMedia.findIndex((m) => m.url === targetItem.url);
      if (globalIdx !== -1) setSelectedIndex(globalIdx);
    }
  };

  return (
    <section aria-labelledby="interface-showcase-heading" className="space-y-4">
      {/* Header bar */}
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
        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          {allMedia.length} {allMedia.length === 1 ? 'Preview' : 'Screenshots'}
        </span>
      </div>

      {/* Main Preview Container */}
      <Card className="relative overflow-hidden rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-4 aspect-[16/10] sm:aspect-video flex items-center justify-center shadow-xl backdrop-blur-xl group">
        {isVideo ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <AppMediaVideoCard
              videoUrl={currentItem.url}
              appName={appName}
              posterUrl={featuredImageUrl || undefined}
              className="w-full h-full"
            />
          </div>
        ) : transformedImageUrl ? (
          <div
            ref={mainImageRef}
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center cursor-zoom-in"
          >
            <Image
              key={transformedImageUrl}
              src={transformedImageUrl}
              alt={`${appName} interface preview ${selectedIndex + 1}`}
              fill
              unoptimized
              sizes="100vw"
              className="w-full h-full object-contain rounded-2xl"
              priority
            />

            {/* Expand Overlay Button: Fullscreen icon on bottom right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/75 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 dark:border-zinc-700/80 text-white backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center cursor-pointer z-10"
              aria-label="Expand screenshot in Lightbox"
            >
              <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        ) : null}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10">
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1))
              }
              className="pointer-events-auto w-10 h-10 rounded-full bg-[hsl(var(--card))]/90 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--surface-elevated))] hover:scale-105 active:scale-95 shadow-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              aria-label="Previous preview"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0))
              }
              className="pointer-events-auto w-10 h-10 rounded-full bg-[hsl(var(--card))]/90 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--surface-elevated))] hover:scale-105 active:scale-95 shadow-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              aria-label="Next preview"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </Card>

      {/* Thumbnail Strip */}
      {allMedia.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {allMedia.map((media, idx) => {
            const isSelected = selectedIndex === idx;

            if (media.type === 'video') {
              return (
                <button
                  key={`video-${media.url}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-black cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 opacity-100 scale-[1.02]'
                      : 'border-[hsl(var(--border))] opacity-60 hover:opacity-100'
                  }`}
                  aria-label="View showcase video"
                >
                  {featuredImageUrl ? (
                    <Image
                      src={getAppScreenshotUrl(featuredImageUrl, 280, 160, 'fit')}
                      alt={`${appName} video thumbnail`}
                      fill
                      sizes="120px"
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : null}
                  <div className="relative z-10 w-7 h-7 rounded-full bg-indigo-600/90 flex items-center justify-center text-white shadow-md">
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono font-medium bg-black/80 text-white z-10">
                    VIDEO
                  </span>
                </button>
              );
            }

            const thumbUrl = getAppScreenshotUrl(media.url, 400, 240, 'limit');
            return (
              <button
                key={media.url}
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
                  unoptimized
                  sizes="120px"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox with Fluid Spring Physics & Image Navigation */}
      {transformedImageUrl && (
        <Lightbox
          open={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          src={currentImageUrl ? getAppScreenshotUrl(currentImageUrl, 3840, 2160, 'limit') : transformedImageUrl}
          alt={`${appName} interface preview ${selectedIndex + 1}`}
          caption={`${appName} — Screenshot ${lightboxIndex + 1} of ${imageList.length}`}
          originRef={mainImageRef}
          index={lightboxIndex >= 0 ? lightboxIndex : 0}
          total={imageList.length}
          onPrev={imageList.length > 1 ? handleLightboxPrev : undefined}
          onNext={imageList.length > 1 ? handleLightboxNext : undefined}
        />
      )}
    </section>
  );
}
