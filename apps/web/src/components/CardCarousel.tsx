"use client";

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
  const STEP = inactiveWidth + gap;
  const PAUSE_MS = autoMoveMs * pauseMultiplier;

  const [active, setActive] = useState(N * Math.floor(copies / 2));
  const [animate, setAnimate] = useState(true);
  const [drag, setDrag] = useState(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startActiveRef = useRef(0);
  const pausedRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoMoveMs) return undefined;

    const t = setInterval(() => {
      if (!pausedRef.current && !draggingRef.current) {
        setAnimate(true);
        setActive((value) => value + 1);
      }
    }, autoMoveMs);

    return () => clearInterval(t);
  }, [autoMoveMs]);

  useLayoutEffect(() => {
    if (active < N || active >= N * (copies - 1)) {
      const t = setTimeout(() => {
        setAnimate(false);
        const r = ((active % N) + N) % N;
        setActive(N * Math.floor(copies / 2) + r);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setAnimate(true)),
        );
      }, 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [active, N, copies]);

  const activeCenter = active * inactiveWidth + active * gap + activeWidth / 2;

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
      style={{ height, ...style }}
    >
      <div
        className="flex items-stretch"
        style={{
          gap,
          transform: `translateX(calc(50% - ${activeCenter}px + ${drag}px))`,
          transition: animate ? `transform ${transition}` : "none",
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {LIST.map((card, i) => {
          const isActive = i === active;

          return (
            <button
              key={`${card.id}-${i}`}
              type="button"
              onClick={() => handleCardClick(i, card)}
              className="relative shrink-0 overflow-hidden rounded-2xl text-left"
              style={{
                width: isActive ? activeWidth : inactiveWidth,
                height,
                transition: animate
                  ? `width ${transition}, transform ${transition}`
                  : "none",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <div className="absolute inset-0" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6">
                <div>
                  {card.category && (
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${
                        card.categoryClassName ?? ""
                      }`}
                    >
                      {card.category}
                    </span>
                  )}
                </div>

                <div
                  className={`transition-all duration-300 ease-linear ${isActive ? "mt-0" : "mt-[200%]"}`}
                >
                  <p
                    className={`text-white font-semibold leading-[1.05] transition-all duration-300 ease-linear ${isActive ? "text-3xl" : "text-base"}`}
                  >
                    {card.title}
                  </p>
                  {card.meta && (
                    <p className="mt-2 text-sm text-white">{card.meta}</p>
                  )}
                  {card.subtitle && (
                    <p
                      className={`w-[max(400px,70%)] tracking-[0.2em] text-white transition-all duration-300 ease-linear ${isActive ? "text-base" : "text-[0px]"}`}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>

                <div className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                  <span
                    className={`inline-flex size-8 items-center justify-center rounded-full border border-white/80 transition-all duration-300 ease-linear ${isActive ? "rotate-0 bg-white/20" : "-rotate-90 bg-transparent"}`}
                  >
                    {actionIcon}
                  </span>
                  <span className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
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
