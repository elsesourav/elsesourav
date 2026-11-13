'use client';

import * as React from 'react';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Button } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import { ImageIcon, LayoutGrid, ChevronUp } from 'lucide-react';
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
    return allMedia.filter(
      (item): item is GalleryMediaItem & { type: 'image' } => item.type === 'image'
    );
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
      className="space-y-2 sm:space-y-2.5 w-full overflow-visible"
    >
      {/* Clean, compact header bar */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[hsl(var(--foreground))] font-semibold truncate">
            <span className="hidden sm:inline">INTERFACE SHOWCASE & VISUALS</span>
            <span className="sm:hidden">VISUAL SHOWCASE</span>
          </h2>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-medium bg-[hsl(var(--surface-subtle))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] shrink-0">
            {allMedia.length}
          </span>
        </div>

        {/* Expand / Collapse Action */}
        {allMedia.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-mono rounded-lg h-7 sm:h-8 px-2.5 sm:px-3 border-[hsl(var(--border))] hover:border-indigo-500/40 text-[hsl(var(--foreground))]"
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

      {/* Main Content Area */}
      <AnimatePresence mode="wait" initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
            className="overflow-visible"
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

      {/* 4K Fullscreen Lightbox Modal */}
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
