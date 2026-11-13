'use client';

import * as React from 'react';
import Image from 'next/image';
import { getAppScreenshotUrl } from '@elsesourav/media';
import { Button, Card, cn } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import { AppMediaVideoCard } from './AppMediaVideoCard';
import {
  ImageIcon,
  LayoutGrid,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppScreenshotGalleryProps {
  appName: string;
  screenshots: readonly string[];
  featuredImageUrl?: string | null;
  videoUrl?: string | null;
}

type GalleryMediaItem =
  | { type: 'video'; url: string; id: string }
  | { type: 'image'; url: string; id: string };

export function AppScreenshotGallery({
  appName,
  screenshots,
  featuredImageUrl,
  videoUrl,
}: AppScreenshotGalleryProps) {
  // Consolidate video, featured image, and screenshots into a unified media list
  const allMedia = React.useMemo<GalleryMediaItem[]>(() => {
    const list: GalleryMediaItem[] = [];

    if (videoUrl && videoUrl.trim()) {
      list.push({ type: 'video', url: videoUrl.trim(), id: `video-${videoUrl.trim()}` });
    }

    const seenUrls = new Set<string>();

    if (featuredImageUrl && featuredImageUrl.trim()) {
      seenUrls.add(featuredImageUrl.trim());
      list.push({
        type: 'image',
        url: featuredImageUrl.trim(),
        id: `img-featured-${featuredImageUrl.trim()}`,
      });
    }

    if (screenshots && screenshots.length > 0) {
      screenshots.forEach((s, idx) => {
        const trimmed = s?.trim();
        if (trimmed && !seenUrls.has(trimmed)) {
          seenUrls.add(trimmed);
          list.push({
            type: 'image',
            url: trimmed,
            id: `img-${idx}-${trimmed}`,
          });
        }
      });
    }

    return list;
  }, [featuredImageUrl, screenshots, videoUrl]);

  // Extract only images for Lightbox modal inspection
  const imageList = React.useMemo(() => {
    return allMedia.filter((item): item is { type: 'image'; url: string; id: string } => item.type === 'image');
  }, [allMedia]);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Preload remaining high-res images in background so expand displays instantly
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload all image assets via browser Image cache
    imageList.forEach((img) => {
      const highResUrl = getAppScreenshotUrl(img.url, 2560, 1440, 'limit');
      const preloadImg = new window.Image();
      preloadImg.src = highResUrl;
    });
  }, [imageList]);

  if (allMedia.length === 0) {
    return null;
  }

  const openLightboxForUrl = (url: string) => {
    const idx = imageList.findIndex((item) => item.url === url);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const handleLightboxPrev = () => {
    if (imageList.length <= 1) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleLightboxNext = () => {
    if (imageList.length <= 1) return;
    setLightboxIndex((prev) => (prev !== null && prev < imageList.length - 1 ? prev + 1 : 0));
  };

  const heroItem = allMedia[0];
  const supportingItems = allMedia.slice(1, 3);
  const remainingCount = Math.max(0, allMedia.length - 3);

  return (
    <section aria-labelledby="interface-showcase-heading" className="space-y-4">
      {/* ── Section Header: Title, Count Badge & Expand Toggle ── */}
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
            <ImageIcon className="w-4 h-4" />
            <h2
              id="interface-showcase-heading"
              className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold"
            >
              Interface Showcase &amp; Visuals
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
            {allMedia.length} {allMedia.length === 1 ? 'Preview' : 'Visuals'}
          </span>
        </div>

        {/* Expand All / Collapse Toggle Action Button */}
        {allMedia.length > 1 && (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl px-3 font-mono text-xs shadow-xs"
            aria-expanded={isExpanded}
            title={isExpanded ? 'Collapse to compact preview' : `Expand all ${allMedia.length} screenshots`}
            leftIcon={
              isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
              )
            }
          >
            {isExpanded ? 'Collapse' : `Expand All (${allMedia.length})`}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {/* ── MODE 1: EXPANDED FULL GRID (Shows ALL screenshots on one page) ── */}
        {isExpanded ? (
          <motion.div
            key="expanded-grid-showcase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {allMedia.map((media, idx) => {
                if (media.type === 'video') {
                  return (
                    <Card
                      key={media.id}
                      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-black aspect-[16/10] shadow-md hover:shadow-xl transition-shadow flex items-center justify-center group"
                    >
                      <AppMediaVideoCard
                        videoUrl={media.url}
                        appName={appName}
                        posterUrl={featuredImageUrl || undefined}
                        className="w-full h-full"
                      />
                      <span className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/80 text-white border border-white/20">
                        VIDEO SHOWCASE
                      </span>
                    </Card>
                  );
                }

                const fullUrl = getAppScreenshotUrl(media.url, 2560, 1440, 'limit');
                return (
                  <Card
                    key={media.id}
                    onClick={() => openLightboxForUrl(media.url)}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-3 aspect-[16/10] shadow-md hover:shadow-2xl hover:border-indigo-500/40 transition-all duration-300 flex items-center justify-center cursor-zoom-in"
                  >
                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                      <Image
                        src={fullUrl}
                        alt={`${appName} screenshot ${idx + 1}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="w-full h-full object-contain rounded-xl sm:rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                      />

                      {/* Header Badge: Index number */}
                      <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-black/75 dark:bg-zinc-950/80 text-white backdrop-blur-md border border-white/10 pointer-events-none">
                        #{String(idx + 1).padStart(2, '0')} / {String(allMedia.length).padStart(2, '0')}
                      </div>

                      {/* Expand Button: Fullscreen trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightboxForUrl(media.url);
                        }}
                        className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 border border-white/20 dark:border-zinc-700/80 text-white backdrop-blur-xl transition-all duration-200 active:scale-95 shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 flex items-center justify-center cursor-pointer z-10"
                        aria-label={`Expand screenshot ${idx + 1}`}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Bottom Collapse Bar */}
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="rounded-full px-5 py-2 font-mono text-xs shadow-md"
                leftIcon={<ChevronUp className="w-4 h-4" />}
              >
                Collapse to Preview
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ── MODE 2: COMPACT BENTO PREVIEW (Curated modern grid with expand prompt) ── */
          <motion.div
            key="compact-bento-showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* If only 1 item exists: Display single full-width showcase */}
            {allMedia.length === 1 && heroItem ? (
              <Card
                onClick={() => heroItem.type === 'image' && openLightboxForUrl(heroItem.url)}
                className="relative overflow-hidden rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-4 aspect-[16/10] sm:aspect-video flex items-center justify-center shadow-xl group cursor-zoom-in"
              >
                {heroItem.type === 'video' ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
                    <AppMediaVideoCard
                      videoUrl={heroItem.url}
                      appName={appName}
                      posterUrl={featuredImageUrl || undefined}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                    <Image
                      src={getAppScreenshotUrl(heroItem.url, 2560, 1440, 'limit')}
                      alt={`${appName} preview`}
                      fill
                      unoptimized
                      sizes="100vw"
                      className="w-full h-full object-contain rounded-2xl"
                      priority
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightboxForUrl(heroItem.url);
                      }}
                      className="absolute bottom-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/75 hover:bg-black/90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Expand preview"
                    >
                      <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                )}
              </Card>
            ) : allMedia.length === 2 ? (
              /* If 2 items exist: Display balanced side-by-side cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {allMedia.map((item, idx) => (
                  <Card
                    key={item.id}
                    onClick={() => item.type === 'image' && openLightboxForUrl(item.url)}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-3 aspect-[16/10] shadow-md hover:shadow-xl transition-all group cursor-zoom-in"
                  >
                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                      <Image
                        src={getAppScreenshotUrl(item.url, 2560, 1440, 'limit')}
                        alt={`${appName} preview ${idx + 1}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                        priority={idx === 0}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightboxForUrl(item.url);
                        }}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Expand preview"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* If 3+ items exist: Display Asymmetric Bento Grid with Prominent Expand Trigger */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
                {/* Left Primary Hero Anchor Card */}
                {heroItem && (
                  <Card
                    onClick={() => heroItem.type === 'image' && openLightboxForUrl(heroItem.url)}
                    className="lg:col-span-8 relative overflow-hidden rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 sm:p-3 aspect-[16/10] shadow-md hover:shadow-xl transition-all group cursor-zoom-in"
                  >
                    {heroItem.type === 'video' ? (
                      <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                        <AppMediaVideoCard
                          videoUrl={heroItem.url}
                          appName={appName}
                          posterUrl={featuredImageUrl || undefined}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                        <Image
                          src={getAppScreenshotUrl(heroItem.url, 2560, 1440, 'limit')}
                          alt={`${appName} primary preview`}
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="w-full h-full object-contain rounded-xl sm:rounded-2xl group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                          priority
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightboxForUrl(heroItem.url);
                          }}
                          className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Expand preview"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Card>
                )}

                {/* Right Stacked Supporting Cards */}
                <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3.5 sm:gap-4">
                  {supportingItems.map((item, sIdx) => {
                    const isLastSupporting = sIdx === supportingItems.length - 1;
                    const hasMore = isLastSupporting && remainingCount > 0;

                    return (
                      <Card
                        key={item.id}
                        onClick={() => {
                          if (hasMore) {
                            setIsExpanded(true);
                          } else if (item.type === 'image') {
                            openLightboxForUrl(item.url);
                          }
                        }}
                        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-2.5 aspect-[16/10] shadow-sm hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[hsl(var(--surface-subtle))] flex items-center justify-center">
                          <Image
                            src={getAppScreenshotUrl(item.url, 2560, 1440, 'limit')}
                            alt={`${appName} preview ${sIdx + 2}`}
                            fill
                            unoptimized
                            sizes="(max-width: 1024px) 50vw, 400px"
                            className={cn(
                              'w-full h-full object-contain rounded-xl sm:rounded-2xl transition-transform duration-500 ease-out',
                              hasMore ? 'brightness-75 group-hover:scale-105' : 'group-hover:scale-105'
                            )}
                          />

                          {/* Frosted "Show All" Overlay on the Last Supporting Card */}
                          {hasMore ? (
                            <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-3 text-center transition-colors group-hover:bg-black/65">
                              <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-4 h-4" />
                              </div>
                              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight">
                                +{remainingCount} more
                              </span>
                              <span className="text-zinc-300 text-[10px] font-mono hidden sm:inline">
                                View all {allMedia.length}
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLightboxForUrl(item.url);
                              }}
                              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Expand preview"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen Lightbox Modal (4K Zoom & Pan Inspection) ── */}
      {lightboxIndex !== null && imageList[lightboxIndex] && (
        <Lightbox
          open={true}
          onClose={() => setLightboxIndex(null)}
          src={getAppScreenshotUrl(imageList[lightboxIndex]!.url, 3840, 2160, 'limit')}
          alt={`${appName} screenshot ${lightboxIndex + 1}`}
          caption={`${appName} — Screenshot ${lightboxIndex + 1} of ${imageList.length}`}
          index={lightboxIndex}
          total={imageList.length}
          onPrev={imageList.length > 1 ? handleLightboxPrev : undefined}
          onNext={imageList.length > 1 ? handleLightboxNext : undefined}
        />
      )}
    </section>
  );
}
