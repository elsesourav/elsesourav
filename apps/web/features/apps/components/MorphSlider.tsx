'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { CSSProperties } from 'react';
import { MorphEngine } from './morph-engine';
import type { EngineOptions } from './morph-engine';

export type MorphTransition = 'melt' | 'ripple' | 'shear' | 'swirl';

export interface MorphItem {
  image: string;
  caption?: string;
}

export interface MorphSliderRef {
  next: () => void;
  prev: () => void;
  goToIndex: (index: number) => void;
  goTo: (dir: number) => void;
  getIndex: () => number;
}

export interface MorphSliderProps {
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
  /** Called whenever the visible slide index changes */
  onIndexChange?: (index: number) => void;
}

const DEFAULT_ITEMS: MorphItem[] = [
  {
    image:
      'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop',
    caption: 'One',
  },
  {
    image:
      'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop',
    caption: 'Two',
  },
  {
    image:
      'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop',
    caption: 'Three',
  },
  {
    image:
      'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=1600&auto=format&fit=crop',
    caption: 'Four',
  },
];

/**
 * GPU-accelerated morph slider with infinite-loop autoplay.
 *
 * Autoplay behaviour:
 * - On manual drag or button press the current timeout is cleared
 *   and a fresh delay is scheduled from zero after the interaction completes.
 * - Hovering pauses the timer; leaving resumes with a fresh delay.
 */
const MorphSlider = forwardRef<MorphSliderRef, MorphSliderProps>(function MorphSlider(
  {
    items = DEFAULT_ITEMS,
    startIndex = 0,
    transition = 'melt',
    duration = 1.1,
    ease = 'power2.inOut',
    intensity = 0.55,
    scale = 2.4,
    aberration = 0.35,
    drift = 0.4,
    autoplay = false,
    autoplayDelay = 4,
    loop = true,
    radius = 16,
    overlayColor = '#000000',
    showCaptions = true,
    showControls = true,
    showIndicators = true,
    className = '',
    onIndexChange: onIndexChangeProp,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [hovering, setHovering] = useState(false);

  // Autoplay timer ref — cleared on manual interaction and hover
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Epoch counter: bumped on every manual interaction to invalidate stale timers
  const epochRef = useRef(0);

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

  const handleIndexChange = useCallback(
    (i: number) => {
      setIndex(i);
      onIndexChangeProp?.(i);
    },
    [onIndexChangeProp]
  );

  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const engine = new MorphEngine(containerRef.current, {
        items,
        startIndex,
        reducedMotion,
        dprCap: 2,
        getOptions: () => optsRef.current,
        onIndexChange: handleIndexChange,
      });
      engineRef.current = engine;
      setIndex(startIndex);

      return () => {
        engine.destroy();
        engineRef.current = null;
      };
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to static visual:', err);
      setWebglAvailable(false);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, startIndex]);

  /* ── Autoplay timer with proper reset ── */
  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const scheduleAutoAdvance = useCallback(() => {
    clearAutoTimer();
    if (!autoplay) return;
    const epoch = ++epochRef.current;
    autoTimerRef.current = setTimeout(() => {
      // Only fire if this is still the latest epoch
      if (epochRef.current !== epoch) return;
      if (engineRef.current) {
        engineRef.current.next();
      } else {
        setIndex((prev) => {
          const next = (prev + 1) % items.length;
          onIndexChangeProp?.(next);
          return next;
        });
      }
    }, Math.max(autoplayDelay, 0.5) * 1000);
  }, [autoplay, autoplayDelay, clearAutoTimer, items.length, onIndexChangeProp]);

  // (Re)start autoplay whenever index changes and not hovering
  useEffect(() => {
    if (hovering) {
      clearAutoTimer();
      return;
    }
    scheduleAutoAdvance();
    return clearAutoTimer;
  }, [index, hovering, scheduleAutoAdvance, clearAutoTimer]);

  /* ── Manual interaction handlers — reset timer ── */
  const handleNext = useCallback(() => {
    clearAutoTimer();
    epochRef.current++;
    if (engineRef.current) {
      engineRef.current.next();
    } else {
      const nextIdx = (index + 1) % items.length;
      handleIndexChange(nextIdx);
    }
  }, [clearAutoTimer, handleIndexChange, index, items.length]);

  const handlePrev = useCallback(() => {
    clearAutoTimer();
    epochRef.current++;
    if (engineRef.current) {
      engineRef.current.prev();
    } else {
      const prevIdx = (index - 1 + items.length) % items.length;
      handleIndexChange(prevIdx);
    }
  }, [clearAutoTimer, handleIndexChange, index, items.length]);

  /* ── Pointer drag — reset timer on drag end ── */
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
        // Clear autoplay during drag
        clearAutoTimer();
        epochRef.current++;
        if (el.setPointerCapture) {
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            /* noop */
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
      engineRef.current?.endDrag();
      // Timer restarts via the index-change effect after commit
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
  }, [clearAutoTimer]);

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

  useImperativeHandle(
    ref,
    () => ({
      next: handleNext,
      prev: handlePrev,
      goToIndex: (targetIdx: number) => {
        const engine = engineRef.current;
        if (!engine || targetIdx === index) return;
        clearAutoTimer();
        epochRef.current++;
        engine.goToIndex(targetIdx);
      },
      goTo: (dir: number) => {
        clearAutoTimer();
        epochRef.current++;
        engineRef.current?.goTo(dir);
      },
      getIndex: () => index,
    }),
    [handleNext, handlePrev, index, clearAutoTimer]
  );

  const hasCaptions = items.some((item) => item.caption);

  return (
    <div
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
    >
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.7)]"
        role="group"
        aria-roledescription="carousel"
        aria-label="Image morph slider"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {!webglAvailable && items[index] && (
          <img
            src={items[index].image}
            alt={items[index].caption || 'Slide visual'}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        )}
      </div>

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
        <div className="absolute top-1/2 left-0 right-0 z-[30] flex justify-between px-4 -translate-y-1/2 pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.6)] backdrop-blur-md cursor-pointer transition-transform duration-200 hover:scale-110 hover:bg-[rgba(24,24,28,0.8)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 shadow-lg"
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
            className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.6)] backdrop-blur-md cursor-pointer transition-transform duration-200 hover:scale-110 hover:bg-[rgba(24,24,28,0.8)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 shadow-lg"
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
          className="absolute left-0 right-0 bottom-[18px] z-[30] flex gap-2 justify-center items-center"
          role="tablist"
          aria-label="Slides"
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full cursor-pointer [transition:width_var(--ms-dot)_cubic-bezier(0.16,1,0.3,1),background-color_var(--ms-dot)_ease] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                i === index ? 'w-[22px] bg-white/95' : 'w-2 bg-white/35'
              }`}
              onClick={() => {
                const engine = engineRef.current;
                if (!engine || i === index) return;
                clearAutoTimer();
                epochRef.current++;
                engine.goToIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MorphSlider;
export { MorphSlider };
