"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ============================================================
   CardCarousel — single-file, fully configurable component.
   Drop into any project. Pass `cards` and (optionally) tweak
   sizes, timing, colors, or the action icon/label via props.
   ============================================================ */

function useCompactDetection(): boolean {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsCompact(media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isCompact;
}

function useVisibility(): React.MutableRefObject<boolean> {
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return isVisibleRef;
}

export interface CarouselCard {
  id: string | number;
  /** Small badge text shown at top-left (e.g. "NEWS"). Optional. */
  category?: string;
  /** Tailwind classes (or inline color) for the badge background. */
  categoryClassName?: string;
  /** Title. Use \n for line breaks. */
  title: string;
  /** Subtitle shown above the title. */
  subtitle?: string;
  /** Sub/meta text shown under the title (e.g. "5 mins ago"). */
  meta?: string;
  /** Optional detail lines shown under the meta row. */
  details?: string[];
  /** Image URL used as the card background. */
  image: string;
  /** Optional click handler when the active card's CTA is used. */
  href?: string;
}

export interface CardCarouselProps {
  cards: CarouselCard[];
  activeWidth?: number;
  inactiveWidth?: number;
  height?: number;
  gap?: number;
  /** Auto-advance interval in ms. Set 0 to disable autoplay. */
  autoMoveMs?: number;
  /** Multiplier of autoMoveMs to pause autoplay after user interaction. */
  pauseMultiplier?: number;
  /** Number of card-list copies for the infinite loop illusion. */
  copies?: number;
  actionIcon?: ReactNode;
  actionLabel?: ReactNode;
  className?: string;
  transition?: string;
  style?: React.CSSProperties;
  transitionMs?: number; // MUST match your CSS duration
}

const DEFAULTS = {
  activeWidth: 560,
  inactiveWidth: 240,
  height: 600,
  gap: 32,
  autoMoveMs: 2600,
  pauseMultiplier: 2,
  copies: 5,
  transition: "750ms cubic-bezier(0.7, 0, 0.2, 1)",
  transitionMs: 750,
};

export function CardCarousel({
  cards,
  activeWidth = DEFAULTS.activeWidth,
  inactiveWidth = DEFAULTS.inactiveWidth,
  height = DEFAULTS.height,
  gap = DEFAULTS.gap,
  autoMoveMs = DEFAULTS.autoMoveMs,
  pauseMultiplier = DEFAULTS.pauseMultiplier,
  copies = DEFAULTS.copies,
  transitionMs = DEFAULTS.transitionMs,
  actionIcon = (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  ),
  actionLabel = "Read more",
  className = "",
  transition = DEFAULTS.transition,
  style,
}: CardCarouselProps) {
  const N = cards.length;
  const LIST: CarouselCard[] = Array.from(
    { length: copies },
    () => cards,
  ).flat();
  const PAUSE_MS = autoMoveMs * pauseMultiplier;

  const isCompact = useCompactDetection();

  const [active, setActive] = useState(N * Math.floor(copies / 2));
  const [animate, setAnimate] = useState(true);
  const [drag, setDrag] = useState(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startActiveRef = useRef(0);
  const pausedRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useVisibility();

  useEffect(() => {
    if (!autoMoveMs) return undefined;

    const t = setInterval(() => {
      if (!pausedRef.current && !draggingRef.current && isVisibleRef.current) {
        setAnimate(true);
        setActive((value) => value + 1);
      }
    }, autoMoveMs);

    return () => clearInterval(t);
  }, [autoMoveMs]);

  useLayoutEffect(() => {
    if (active <= N || active >= N * (copies - 2)) {
      const t = setTimeout(() => {
        setAnimate(false);

        requestAnimationFrame(() => {
          const r = ((active % N) + N) % N;

          setActive(N * Math.floor(copies / 2) + r);

          requestAnimationFrame(() => {
            setAnimate(true);
          });
        });
      }, transitionMs);
      return () => clearTimeout(t);
    }
  }, [active, N, copies]);

  const effectiveActiveWidth = isCompact
    ? Math.min(activeWidth, 320)
    : activeWidth;
  const effectiveInactiveWidth = isCompact
    ? Math.min(inactiveWidth, 200)
    : inactiveWidth;
  const effectiveHeight = isCompact ? Math.min(height, 440) : height;
  const effectiveGap = isCompact ? Math.min(gap, 16) : gap;
  const STEP = effectiveInactiveWidth + effectiveGap;
  const activeCenter =
    active * effectiveInactiveWidth +
    active * effectiveGap +
    effectiveActiveWidth / 2;
  const fractionalActive = animate ? active - drag / STEP : active;

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, PAUSE_MS);
  }, [PAUSE_MS]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggingRef.current = true;
      movedRef.current = false;
      pausedRef.current = true;
      startXRef.current = e.clientX;
      startActiveRef.current = active;
    },
    [active],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) {
      if (!movedRef.current) {
        movedRef.current = true;
        setAnimate(false);
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      }
      setDrag(dx);
    }
  }, []);

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const d = drag;
      setDrag(0);
      setAnimate(true);
      const steps = Math.round(d / STEP);
      if (steps !== 0) setActive(startActiveRef.current - steps);
      try {
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      } catch {
        // no-op
      }
      pauseAutoplay();
    },
    [drag, STEP, pauseAutoplay],
  );

  const handleCardClick = (i: number, card: CarouselCard) => {
    if (movedRef.current) return;
    if (i === active) {
      if (card.href) window.open(card.href, "_self");
      return;
    }
    setAnimate(true);
    setActive(i);
    pauseAutoplay();
  };

  if (N === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: effectiveHeight, ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div
        className={`flex items-stretch will-change-transform transform-gpu transition-all duration-750 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          animate ? "" : "transition-none"
        }`}
        style={{
          gap: effectiveGap,
          transform: `translateX(calc(50% - ${activeCenter}px + ${drag}px))`,
          transition: animate ? transition : "none",
        }}
      >
        {LIST.map((card, i) => {
          const logicalActive = ((active % N) + N) % N;
          const isActive = i % N === logicalActive;
          const distance = Math.abs(i - fractionalActive);
          const progress = Math.max(0, 1 - distance);
          const width =
            effectiveInactiveWidth +
            (effectiveActiveWidth - effectiveInactiveWidth) * progress;

          return (
            <button
              key={`${card.id}-${i}`}
              type="button"
              onClick={() => handleCardClick(i, card)}
              className={`relative shrink-0 overflow-hidden rounded-2xl text-left ${
                animate ? "" : "transition-none"
              }`}
              style={{
                width,
                height: effectiveHeight,
                transition: animate ? transition : "none",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6">
                <div>
                  {card.category && (
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase ${
                        card.categoryClassName ?? ""
                      }`}
                    >
                      {card.category}
                    </span>
                  )}
                </div>

                <div className="relative flex-1 flex items-end overflow-hidden">
                  {/* TITLE LAYER */}
                  <div
                    className={`absolute left-0 right-0 will-change-transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "top-[50%] translate-y-[-50%] px-4 sm:px-6"
                        : "top-[80%] translate-y-0 px-1"
                    }`}
                  >
                    <p
                      className={`text-white font-semibold leading-[1.05] transition-all duration-500 ${
                        isActive
                          ? "text-2xl sm:text-3xl"
                          : "text-xs sm:text-sm opacity-90"
                      }`}
                    >
                      {card.title}
                    </p>

                    {card.meta && (
                      <p
                        className={`font-semibold mt-1 uppercase tracking-[0.24em] text-white/80 transition-all duration-500 ${
                          isActive
                            ? "text-xs sm:text-sm opacity-100 bg-black/60 rounded-xl px-1 w-max max-w-full overflow-hidden whitespace-nowrap text-ellipsis"
                            : "text-[0px] opacity-0"
                        }`}
                      >
                        {card.meta}
                      </p>
                    )}
                  </div>

                  {/* CONTENT LAYER */}
                  <div
                    className={`absolute max-w-[70%] left-0 right-0 px-4 sm:px-6 top-[60%] transition-all duration-500 ease-out ${
                      isActive
                        ? "opacity-100 translate-y-0 delay-700"
                        : "opacity-0 translate-y-6 pointer-events-none delay-0"
                    }`}
                  >
                    {card.subtitle && (
                      <p className="text-white/90 mt-1 text-sm sm:text-base line-clamp-5">
                        {card.subtitle}
                      </p>
                    )}

                    {card.details && (
                      <ul className="mt-2 text-xs text-white/80 sm:text-sm">
                        {card.details.slice(0, 3).map((item) => (
                          <li key={item} className="leading-5">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-semibold text-white sm:text-sm">
                  <span
                    className={`inline-flex size-8 items-center justify-center rounded-full border border-white/80 transition-all duration-500 ease-out ${
                      isActive
                        ? "rotate-0 bg-white/20"
                        : "-rotate-90 bg-transparent"
                    }`}
                  >
                    {actionIcon}
                  </span>
                  <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] sm:text-[11px] sm:tracking-[0.18em]">
                    {actionLabel}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
