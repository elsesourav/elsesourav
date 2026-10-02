'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import {
  MorphEngine,
  DEFAULT_ITEMS,
  type MorphItem,
  type MorphTransition,
  type EngineOptions,
} from './morph-slider.engine';

export type { MorphItem, MorphTransition };

export interface MorphSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: MorphItem[];
  startIndex?: number;
  transition?: MorphTransition;
  duration?: number;
  ease?: string;
  intensity?: number;
  scale?: number;
  aberration?: number;
  drift?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  radius?: number;
  overlayColor?: string;
  showCaptions?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export function MorphSlider({
  items = DEFAULT_ITEMS,
  startIndex = 0,
  transition = 'melt',
  duration = 1.1,
  ease = 'power2.inOut',
  intensity = 0.55,
  scale = 2.4,
  aberration = 0.35,
  drift = 0.4,
  autoplay = true,
  autoplayDelay = 5,
  loop = true,
  radius = 16,
  overlayColor = '#000000',
  showCaptions = true,
  showControls = true,
  showIndicators = true,
  className = '',
  ...props
}: MorphSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [hovering, setHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const autoplayTimerRef = useRef<number | null>(null);

  const optsRef = useRef<EngineOptions>({
    transition,
    duration,
    ease,
    intensity,
    scale,
    aberration,
    drift,
    overlayColor,
    loop,
  });
  optsRef.current = {
    transition,
    duration,
    ease,
    intensity,
    scale,
    aberration,
    drift,
    overlayColor,
    loop,
  };

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const engine = new MorphEngine(containerRef.current, {
      items,
      startIndex,
      reducedMotion,
      dprCap: 2,
      getOptions: () => optsRef.current,
      onIndexChange: setIndex,
    });
    engineRef.current = engine;
    setIndex(startIndex);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [items, startIndex]);

  // Autoplay management: handles 5s timer, clears on drag or hover, and refreshes cleanly
  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current !== null) {
      window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const refreshAutoplayTimer = useCallback(() => {
    clearAutoplayTimer();
    if (!autoplay || hovering || isDragging) return;

    autoplayTimerRef.current = window.setTimeout(() => {
      engineRef.current?.next();
    }, Math.max(autoplayDelay, 1) * 1000);
  }, [autoplay, autoplayDelay, hovering, isDragging, clearAutoplayTimer]);

  useEffect(() => {
    refreshAutoplayTimer();
    return () => clearAutoplayTimer();
  }, [refreshAutoplayTimer, clearAutoplayTimer, index]);

  const handleNext = useCallback(() => {
    engineRef.current?.next();
    refreshAutoplayTimer();
  }, [refreshAutoplayTimer]);

  const handlePrev = useCallback(() => {
    engineRef.current?.prev();
    refreshAutoplayTimer();
  }, [refreshAutoplayTimer]);

  const handleSelectIndex = useCallback(
    (targetIndex: number) => {
      const engine = engineRef.current;
      if (!engine || targetIndex === index) return;
      engine.goTo(targetIndex > index ? 1 : -1);
      refreshAutoplayTimer();
    },
    [index, refreshAutoplayTimer]
  );

  // Pointer drag gestures with automatic timer pausing and refreshing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    let startX = 0;
    let width = 1;
    let active = false;

    const onDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      width = rect.width || 1;
      startX = e.clientX;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      engineRef.current?.setPointer(px, 1 - py);
      active = engineRef.current?.beginDrag() ?? false;
      if (active) {
        setIsDragging(true);
        clearAutoplayTimer();
        if (el.setPointerCapture) {
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            // Ignore pointer capture failure on unsupported environments
          }
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const ndx = (e.clientX - startX) / width;
      engineRef.current?.drag(ndx);
    };

    const onUp = () => {
      if (!active) return;
      active = false;
      setIsDragging(false);
      engineRef.current?.endDrag();
      refreshAutoplayTimer();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [clearAutoplayTimer, refreshAutoplayTimer]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  const hasCaptions = items.some((item) => item.caption);

  return (
    <div
      data-interior="morph-slider"
      className={`relative w-full h-full overflow-hidden select-none bg-[#0c0c0e] ${className}`.trim()}
      style={
        {
          borderRadius: `${radius}px`,
          '--ms-swap': `${(duration * 0.66).toFixed(3)}s`,
          '--ms-dot': `${(duration * 0.45).toFixed(3)}s`,
          touchAction: 'pan-y',
        } as CSSProperties
      }
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      {...props}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.7)]"
        role="group"
        aria-roledescription="carousel"
        aria-label="Image morph slider"
        tabIndex={0}
        onKeyDown={onKeyDown}
      />

      {showCaptions && hasCaptions && (
        <div
          className="morph-slider-caption pointer-events-none absolute bottom-[22px] left-[22px] z-[2] grid max-w-[70%]"
          aria-live="polite"
        >
          {items.map((item, i) =>
            item.caption ? (
              <span
                key={i}
                aria-hidden={i === index ? undefined : true}
                className={`morph-slider-caption-text pointer-events-none inline-block rounded-[10px] bg-[rgba(10,10,12,0.42)] px-[14px] py-[8px] text-[15px] font-semibold tracking-[0.01em] text-white backdrop-blur-[8px] [grid-area:1/1] [justify-self:start] [transition:opacity_var(--ms-swap)_cubic-bezier(0.16,1,0.3,1),transform_var(--ms-swap)_cubic-bezier(0.16,1,0.3,1),filter_var(--ms-swap)_cubic-bezier(0.16,1,0.3,1)] ${
                  i === index
                    ? 'opacity-100 [transform:translateY(0)] [filter:blur(0)]'
                    : 'opacity-0 [transform:translateY(12px)] [filter:blur(6px)]'
                }`}
              >
                {item.caption}
              </span>
            ) : null
          )}
        </div>
      )}

      {showControls && (
        <div className="absolute top-1/2 left-0 right-0 z-[3] flex justify-between px-4 -translate-y-1/2 pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.4)] backdrop-blur-md cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-[rgba(24,24,28,0.6)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            aria-label="Previous slide"
            onClick={handlePrev}
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
            className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.4)] backdrop-blur-md cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-[rgba(24,24,28,0.6)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            aria-label="Next slide"
            onClick={handleNext}
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
          className="absolute left-0 right-0 bottom-[18px] z-[3] flex gap-2 justify-center items-center"
          role="tablist"
          aria-label="Slides"
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full cursor-pointer [transition:width_var(--ms-dot)_cubic-bezier(0.16,1,0.3,1),background-color_var(--ms-dot)_ease] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                i === index ? 'w-[22px] bg-white/95' : 'w-2 bg-white/35'
              }`}
              onClick={() => handleSelectIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MorphSlider;
