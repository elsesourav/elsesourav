import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, ImageOff } from 'lucide-react';
import { Dialog, IconButton, Image } from '@/components/ui';
import type { AppMedia } from '@/types/media.types';
import './AppGallery.css';

export interface AppGalleryProps {
  media: AppMedia[];
  appName: string;
  className?: string;
}

export const AppGallery: React.FC<AppGalleryProps> = ({ media, appName, className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const screenshots = media.filter((m) => m.type === 'screenshot' || m.type === 'hero');

  const handleOpenLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
  };

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : screenshots.length - 1));
  }, [selectedIndex, screenshots.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < screenshots.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, screenshots.length]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') handleCloseLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  if (screenshots.length === 0) {
    return null;
  }

  const currentMedia = selectedIndex !== null ? screenshots[selectedIndex] : null;

  return (
    <section className={`app-gallery ${className}`} aria-label={`${appName} Screenshots Gallery`}>
      <div className="app-gallery__strip" role="region" aria-label="Screenshots scroll strip">
        {screenshots.map((item, idx) => (
          <div
            key={item.id || idx}
            className="app-gallery__item"
            onClick={() => handleOpenLightbox(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenLightbox(idx);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`View screenshot ${idx + 1} of ${screenshots.length}: ${item.altText || appName}`}
          >
            <Image
              src={item.url}
              alt={item.altText || `${appName} screenshot ${idx + 1}`}
              aspectRatio="16/9"
              loading="lazy"
              decoding="async"
              className="app-gallery__image"
              fallbackIcon={<ImageOff size={20} />}
              fallbackText="Preview unavailable"
            />
            <span className="app-gallery__zoom-badge" aria-hidden="true">
              <Maximize2 size={12} />
              <span>Zoom</span>
            </span>
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog
        isOpen={selectedIndex !== null}
        onClose={handleCloseLightbox}
        title={`${appName} - Screenshot ${(selectedIndex ?? 0) + 1} of ${screenshots.length}`}
        size="lg"
      >
        {currentMedia && (
          <div className="app-gallery__lightbox">
            <div className="app-gallery__lightbox-image-wrapper">
              <Image
                src={currentMedia.url}
                alt={currentMedia.altText || `${appName} full preview`}
                aspectRatio="16/9"
                priority={true}
                loading="eager"
                decoding="async"
                className="app-gallery__lightbox-image"
                fallbackIcon={<ImageOff size={32} />}
                fallbackText="Screenshot unavailable"
              />
            </div>

            <div className="app-gallery__lightbox-nav">
              <IconButton
                icon={<ChevronLeft size={20} />}
                aria-label="Previous screenshot"
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                disabled={screenshots.length <= 1}
              />

              <p className="app-gallery__lightbox-caption">
                {currentMedia.altText || currentMedia.title || `${appName} Screenshot`}
              </p>

              <IconButton
                icon={<ChevronRight size={20} />}
                aria-label="Next screenshot"
                variant="secondary"
                size="sm"
                onClick={handleNext}
                disabled={screenshots.length <= 1}
              />
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
};
