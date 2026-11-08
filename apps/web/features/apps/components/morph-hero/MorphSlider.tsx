'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { CSSProperties } from 'react';
import { MorphEngine } from './morph-engine';
import type { EngineOptions } from './morph-engine';
import { MorphSliderControls } from './MorphSliderControls';

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
  pauseOnHover?: boolean;
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
    pauseOnHover = false,
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
  const [isWebglActive, setIsWebglActive] = useState(false);

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
      setIsWebglActive(true);

      return () => {
        engine.destroy();
        engineRef.current = null;
        setIsWebglActive(false);
      };
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to static visual:', err);
      setIsWebglActive(false);
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
    autoTimerRef.current = setTimeout(
      () => {
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
      },
      Math.max(autoplayDelay, 0.5) * 1000
    );
  }, [autoplay, autoplayDelay, clearAutoTimer, items.length, onIndexChangeProp]);

  // (Re)start autoplay whenever index changes
  useEffect(() => {
    if (pauseOnHover && hovering) {
      clearAutoTimer();
      return;
    }
    scheduleAutoAdvance();
    return clearAutoTimer;
  }, [index, hovering, pauseOnHover, scheduleAutoAdvance, clearAutoTimer]);

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

  /* ── Pointer & Touch drag — reset timer on drag end ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    let startX = 0;
    let width = 1;
    let active = false;

    // Native touch handling with directional locking for smooth mobile swipe
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    let isDetermining = false;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      const rect = el.getBoundingClientRect();
      width = rect.width || 1;
      isDetermining = true;
      isSwiping = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (isDetermining) {
        if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) {
          isSwiping = true;
          isDetermining = false;
          active = engineRef.current?.beginDrag() ?? false;
          if (active) {
            clearAutoTimer();
            epochRef.current++;
          }
        } else if (Math.abs(dy) > 7) {
          isDetermining = false;
        }
      }

      if (isSwiping && active) {
        if (e.cancelable) e.preventDefault();
        const ndx = (dx / Math.min(width, 500)) * 1.6;
        engineRef.current?.drag(ndx);
      }
    };

    const onTouchEnd = () => {
      isDetermining = false;
      if (isSwiping && active) {
        isSwiping = false;
        active = false;
        engineRef.current?.endDrag();
      }
    };

    // Mouse pointer drag handling
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      width = rect.width || 1;
      startX = e.clientX;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      engineRef.current?.setPointer(px, 1 - py);
      active = engineRef.current?.beginDrag() ?? false;
      if (active) {
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
      if (e.pointerType === 'touch' || !active) return;
      const ndx = ((e.clientX - startX) / Math.min(width, 700)) * 1.5;
      engineRef.current?.drag(ndx);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !active) return;
      active = false;
      engineRef.current?.endDrag();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);

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
      className={`relative w-full h-full overflow-hidden select-none bg-transparent ${className}`.trim()}
      style={
        {
          borderRadius: `${radius}px`,
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          maskImage: 'radial-gradient(white, black)',
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
        style={{
          borderRadius: `${radius}px`,
          overflow: 'hidden',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          maskImage: 'radial-gradient(white, black)',
        }}
        className="absolute inset-0 cursor-grab active:cursor-grabbing outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.7)]"
        role="group"
        aria-roledescription="carousel"
        aria-label="Image morph slider"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {!isWebglActive && items[index] && (
          <img
            src={items[index].image}
            alt={items[index].caption || 'Slide visual'}
            style={{ borderRadius: `${radius}px` }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-[1]"
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

      <MorphSliderControls
        items={items}
        index={index}
        showControls={showControls}
        showIndicators={showIndicators}
        onPrev={handlePrev}
        onNext={handleNext}
        onIndicatorClick={(i) => {
          const engine = engineRef.current;
          if (!engine || i === index) return;
          clearAutoTimer();
          epochRef.current++;
          engine.goToIndex(i);
        }}
      />
    </div>
  );
});

export default MorphSlider;
export { MorphSlider };
