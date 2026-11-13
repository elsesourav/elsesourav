'use client';

import * as React from 'react';
import type { MorphItem } from './MorphSlider';

interface MorphSliderControlsProps {
  items: MorphItem[];
  index: number;
  showControls?: boolean;
  showIndicators?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onIndicatorClick: (i: number) => void;
}

export function MorphSliderControls({
  items,
  index,
  showControls = true,
  showIndicators = true,
  onPrev,
  onNext,
  onIndicatorClick,
}: MorphSliderControlsProps) {
  return (
    <>
      {showControls && (
        <div className="absolute top-1/2 left-0 right-0 z-[30] flex justify-between px-4 -translate-y-1/2 pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.6)] backdrop-blur-md cursor-pointer transition-colors duration-200 hover:bg-[rgba(24,24,28,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 shadow-lg"
            aria-label="Previous slide"
            onClick={onPrev}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.6)] backdrop-blur-md cursor-pointer transition-colors duration-200 hover:bg-[rgba(24,24,28,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 shadow-lg"
            aria-label="Next slide"
            onClick={onNext}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {showIndicators && (
        <div
          className="absolute left-0 right-0 bottom-[18px] z-[30] flex gap-2 justify-center items-center"
          role="tablist"
          aria-label="Slides"
        >
          <style>{`
            @keyframes heroSlideProgress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full cursor-pointer relative overflow-hidden [transition:width_var(--ms-dot)_cubic-bezier(0.16,1,0.3,1),background-color_var(--ms-dot)_ease] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                i === index ? 'w-[28px] bg-white/20' : 'w-2 bg-white/35 hover:bg-white/60'
              }`}
              onClick={() => onIndicatorClick(i)}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
              {i === index && (
                <span
                  key={`ms-ctrl-progress-${i}`}
                  data-carousel-progress
                  className="absolute inset-y-0 left-0 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.95)] pointer-events-none"
                  style={{
                    width: '0%',
                    animation: 'heroSlideProgress 5s linear forwards',
                    WebkitAnimation: 'heroSlideProgress 5s linear forwards',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
