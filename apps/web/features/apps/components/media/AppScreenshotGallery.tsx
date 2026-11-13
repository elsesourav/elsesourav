'use client';

import * as React from 'react';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Button, IconButton } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import {
  ImageIcon,
  LayoutGrid,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  organizeScreenshotGrid,
  type GalleryMediaItem,
  type ScreenshotAspect,
} from './screenshot-grid-layout';
import {
  AppScreenshotCarouselTrack,
  type AppScreenshotCarouselTrackHandle,
} from './AppScreenshotCarouselTrack';
import { AppScreenshotExpandedGrid } from './AppScreenshotExpandedGrid';

interface AppScreenshotGalleryProps {
  appName: string;
  screenshots: readonly string[];
  videoUrl?: string | null;
}

export function AppScreenshotGallery({
  appName,
  screenshots,
  videoUrl,
}: AppScreenshotGalleryProps) {
  // Consolidate video and screenshots into a unified media list
  const allMedia = React.useMemo<GalleryMediaItem[]>(() => {
    const list: GalleryMediaItem[] = [];

    if (videoUrl && videoUrl.trim()) {
      list.push({
        id: `video-${videoUrl.trim()}`,
        type: 'video',
        url: videoUrl.trim(),
        originalIndex: 1,
      });
    }

    const seenUrls = new Set<string>();

    if (screenshots && screenshots.length > 0) {
      screenshots.forEach((s) => {
        const trimmed = s?.trim();
        if (trimmed && !seenUrls.has(trimmed)) {
          seenUrls.add(trimmed);
          list.push({
            id: `img-${list.length + 1}-${trimmed}`,
            type: 'image',
            url: trimmed,
            originalIndex: list.length + 1,
          });
        }
      });
    }

    return list;
  }, [screenshots, videoUrl]);

  // Extract pure images for the 4K Lightbox viewer
  const imageList = React.useMemo(() => {
    return allMedia.filter((item): item is GalleryMediaItem & { type: 'image' } => item.type === 'image');
  }, [allMedia]);

  const [aspectMap, setAspectMap] = React.useState<Record<string, ScreenshotAspect>>({});
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const carouselRef = React.useRef<AppScreenshotCarouselTrackHandle>(null);

  const handleImageLoadAspect = React.useCallback(
    (url: string, aspect: ScreenshotAspect) => {
      setAspectMap((prev) => (prev[url] === aspect ? prev : { ...prev, [url]: aspect }));
    },
    []
  );

  // Preload high-res screenshots and detect natural aspect ratios
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    imageList.forEach((img) => {
      const highResUrl = getAppScreenshotUrl(img.url, 2560, 1440, 'limit');
      const preloadImg = new window.Image();
      preloadImg.src = highResUrl;
      preloadImg.onload = () => {
        if (preloadImg.naturalWidth && preloadImg.naturalHeight) {
          const isPortrait = preloadImg.naturalHeight > preloadImg.naturalWidth * 1.05;
          const detectedAspect: ScreenshotAspect = isPortrait ? 'portrait' : 'landscape';
          handleImageLoadAspect(img.url, detectedAspect);
        }
      };
    });
  }, [imageList, handleImageLoadAspect]);

  // Compute responsive desktop grid rows using the intelligent pairing algorithm
  const gridRows = React.useMemo(() => {
    return organizeScreenshotGrid(allMedia, aspectMap);
  }, [allMedia, aspectMap]);

  if (allMedia.length === 0) {
    return null;
  }

  const openLightboxForUrl = (url: string) => {
    const idx = imageList.findIndex((item) => item.url === url);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  return (
    <section
      aria-label={`${appName} screenshots showcase`}
      className="space-y-3 sm:space-y-4"
    >
      {/* Header bar: Section title, visuals count, navigation arrows & expand toggle */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[hsl(var(--foreground))] font-semibold truncate">
            <span className="hidden sm:inline">INTERFACE SHOWCASE & VISUALS</span>
            <span className="sm:hidden">VISUAL SHOWCASE</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-medium bg-[hsl(var(--surface-subtle))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] shrink-0">
            {allMedia.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Track scroll arrows (desktop & tablet, hidden on touch mobile) */}
          {!isExpanded && allMedia.length > 1 && (
            <div className="hidden sm:flex items-center gap-1">
              <IconButton
                icon={<ChevronLeft className="w-4 h-4" />}
                aria-label="Scroll screenshots left"
                size="sm"
                variant="outline"
                onClick={() => carouselRef.current?.scrollLeft()}
                className="h-8 w-8 rounded-lg border-[hsl(var(--border))] hover:border-indigo-500/40 text-[hsl(var(--foreground))]"
              />
              <IconButton
                icon={<ChevronRight className="w-4 h-4" />}
                aria-label="Scroll screenshots right"
                size="sm"
                variant="outline"
                onClick={() => carouselRef.current?.scrollRight()}
                className="h-8 w-8 rounded-lg border-[hsl(var(--border))] hover:border-indigo-500/40 text-[hsl(var(--foreground))]"
              />
            </div>
          )}

          {/* Expand / Collapse toggle */}
          {allMedia.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs font-mono rounded-lg h-8 px-2.5 sm:px-3 border-[hsl(var(--border))] hover:border-indigo-500/40 text-[hsl(var(--foreground))]"
              leftIcon={
                isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                )
              }
            >
              {isExpanded ? 'Collapse' : `Expand (${allMedia.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait" initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <AppScreenshotExpandedGrid
              appName={appName}
              rows={gridRows}
              totalItems={allMedia.length}
              aspectMap={aspectMap}
              onOpenLightbox={openLightboxForUrl}
              onCollapse={() => setIsExpanded(false)}
              onImageLoadAspect={handleImageLoadAspect}
            />
          </motion.div>
        ) : (
          <motion.div
            key="horizontal-carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AppScreenshotCarouselTrack
              ref={carouselRef}
              appName={appName}
              items={allMedia}
              aspectMap={aspectMap}
              onOpenLightbox={openLightboxForUrl}
              onImageLoadAspect={handleImageLoadAspect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4K Fullscreen Lightbox Modal with navigation controls */}
      {lightboxIndex !== null && imageList[lightboxIndex] && (
        <Lightbox
          open={lightboxIndex !== null}
          src={getAppScreenshotUrl(imageList[lightboxIndex].url, 3840, 2160, 'limit')}
          alt={`${appName} screenshot ${imageList[lightboxIndex].originalIndex}`}
          caption={`${appName} — Visual #${String(imageList[lightboxIndex].originalIndex).padStart(2, '0')}`}
          index={lightboxIndex + 1}
          total={imageList.length}
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : imageList.length - 1
            )
          }
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev < imageList.length - 1 ? prev + 1 : 0
            )
          }
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
