'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import {
  useLightbox,
  HOME,
  VEIL,
  EASE,
  EXIT,
  GLYPH,
  TOGGLE,
} from './useLightbox';

export { useLightbox };
export type { UseLightboxOptions } from './useLightbox';

const CHROME_BUTTON =
  'grid size-8 place-items-center rounded-[9px] border border-[var(--interior-border)] bg-white text-[var(--interior-fg-muted)] outline-none transition-[border-color,color,box-shadow,transform] duration-150 hover:border-[var(--interior-border-strong)] hover:text-[var(--interior-fg)] active:scale-95 focus-visible:border-[var(--interior-primary)] focus-visible:shadow-[0_1px_2px_rgba(28,25,23,0.08),0_10px_20px_-14px_rgba(69,104,255,0.6)] dark:border-[var(--interior-border)] dark:bg-[var(--interior-bg-elevated)] dark:text-[var(--interior-fg-muted)] dark:hover:border-white/20 dark:hover:text-stone-200 dark:focus-visible:border-[var(--interior-primary)] dark:focus-visible:shadow-[0_10px_20px_-14px_rgba(147,176,255,0.5)] cursor-pointer';

const NAV_BUTTON =
  'grid size-10 place-items-center rounded-full border border-white/20 bg-stone-900/80 text-white shadow-xl backdrop-blur-md outline-none transition-[transform,background-color] duration-150 hover:bg-stone-800 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white cursor-pointer';

export type LightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  originRef?: React.RefObject<HTMLElement | null>;
  caption?: string;
  width?: number;
  height?: number;
  maxScale?: number;
  className?: string;
  onPrev?: () => void;
  onNext?: () => void;
  index?: number;
  total?: number;
};

type Landing = { dx: number; dy: number; s: number; o: number; r: number };

function Stage({
  onClose,
  src,
  alt,
  originRef,
  caption,
  width,
  height,
  maxScale = 4,
  className = '',
  onPrev,
  onNext,
  index,
  total,
}: LightboxProps) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const hintId = useId();

  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const fs = useMotionValue(1);
  const fo = useMotionValue(0);
  const fr = useMotionValue(14);

  const { frameRef, contentRef, bind, scale, x, y, zoomed, settledZoom, reset, zoomAt } =
    useLightbox({ maxScale, onDismiss: onClose, onPrev, onNext });

  const shellRef = useRef<HTMLDivElement>(null);

  const toggleZoom = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (zoomed) {
      reset();
      return;
    }
    const r = frame.getBoundingClientRect();
    zoomAt(
      Math.min(TOGGLE, Math.max(1.1, maxScale)),
      r.left + r.width / 2,
      r.top + r.height / 2,
      true
    );
  }, [frameRef, maxScale, reset, zoomAt, zoomed]);

  const landing = useCallback((): Landing => {
    const frame = frameRef.current;
    const content = contentRef.current;
    const origin = originRef?.current;
    if (frame && content && origin && content.offsetWidth > 0) {
      const r = frame.getBoundingClientRect();
      const o = origin.getBoundingClientRect();
      if (o.width > 0) {
        const s = o.width / content.offsetWidth;
        const rad = Number.parseFloat(getComputedStyle(origin).borderTopLeftRadius) || 9;
        return {
          dx: o.left + o.width / 2 - (r.left + r.width / 2),
          dy: o.top + o.height / 2 - (r.top + r.height / 2),
          s,
          o: 1,
          r: rad / s,
        };
      }
    }
    return { dx: 0, dy: 10, s: 0.97, o: 0, r: 14 };
  }, [contentRef, frameRef, originRef]);

  useLayoutEffect(() => {
    if (reduced) {
      fx.set(0);
      fy.set(0);
      fs.set(1);
      fo.set(1);
      fr.set(14);
      return;
    }
    const d = landing();
    fx.set(d.dx);
    fy.set(d.dy);
    fs.set(d.s);
    fo.set(d.o);
    fr.set(d.r);

    const runs = [
      animate(fx, 0, HOME),
      animate(fy, 0, HOME),
      animate(fs, 1, HOME),
      animate(fo, 1, HOME),
      animate(fr, 14, HOME),
    ];
    return () => runs.forEach((r) => r.stop());
  }, [fo, fr, fs, fx, fy, landing, reduced]);

  const away = useCallback(() => {
    if (reduced) return { opacity: 0, transition: { duration: 0.12 } };
    const d = landing();
    animate(fr, d.r, HOME);
    return {
      x: d.dx,
      y: d.dy,
      scale: d.s,
      opacity: d.o,
      filter: 'blur(4px)',
      transition: HOME,
    };
  }, [fr, landing, reduced]);

  const unwind = useCallback(
    () => ({
      x: 0,
      y: 0,
      scale: 1,
      transition: reduced ? { duration: 0 } : HOME,
    }),
    [reduced]
  );

  useEffect(() => {
    const frame = frameRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const base = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${base + gap}px`;
    frame?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [frameRef]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) return;
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = Array.from(shell.querySelectorAll<HTMLElement>('[data-lightbox-focus="1"]'));
      if (nodes.length === 0) return;
      e.preventDefault();
      const here =
        document.activeElement instanceof HTMLElement ? nodes.indexOf(document.activeElement) : -1;
      const next = e.shiftKey
        ? here <= 0
          ? nodes.length - 1
          : here - 1
        : here === -1 || here === nodes.length - 1
          ? 0
          : here + 1;
      nodes[next]?.focus();
    };

    shell.addEventListener('keydown', onKeyDown);
    return () => shell.removeEventListener('keydown', onKeyDown);
  }, [onClose, zoomed]);

  return (
    <div
      data-interior="lightbox"
      ref={shellRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 ${className}`}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: reduced ? { duration: 0 } : { duration: 0.3, ease: EASE },
        }}
        transition={reduced ? { duration: 0 } : VEIL}
        className="absolute inset-0 bg-stone-950/85 backdrop-blur-md"
      />
      <div
        ref={frameRef}
        data-lightbox-focus="1"
        tabIndex={-1}
        role="group"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        style={{ touchAction: 'none', WebkitTouchCallout: 'none' }}
        className={`absolute inset-0 overflow-hidden outline-none select-none focus-visible:shadow-[inset_0_0_0_1px_var(--interior-primary)] ${
          zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        {...bind}
      >
        <motion.div
          style={{ x: fx, y: fy, scale: fs, opacity: fo }}
          initial={reduced ? false : { filter: 'blur(6px)' }}
          animate={{ filter: 'blur(0px)' }}
          variants={{ away }}
          exit="away"
          transition={reduced ? { duration: 0 } : { filter: { duration: 0.35, ease: EASE } }}
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-14"
        >
          <motion.img
            key={src}
            ref={contentRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            draggable={false}
            style={{ x, y, scale, borderRadius: fr }}
            variants={{ away: unwind }}
            exit="away"
            className="max-h-full max-w-full object-contain pointer-events-none"
          />
        </motion.div>
      </div>

      {/* Floating Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, transition: reduced ? { duration: 0 } : EXIT }}
        transition={reduced ? { duration: 0 } : VEIL}
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-3 sm:p-4"
      >
        <div className="pointer-events-auto flex items-center gap-2 max-w-[70%]">
          <p
            id={titleId}
            className="truncate rounded-[9px] border border-[var(--interior-border)] bg-stone-900/90 text-stone-100 backdrop-blur-md px-3 py-1.5 text-[12.5px] font-medium shadow-lg"
          >
            {caption ?? alt}
          </p>
          {index !== undefined && total !== undefined && total > 1 ? (
            <span className="shrink-0 rounded-[9px] border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-mono text-stone-300">
              {index + 1} / {total}
            </span>
          ) : null}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            data-lightbox-focus="1"
            type="button"
            onClick={toggleZoom}
            aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
            className={CHROME_BUTTON}
          >
            <svg
              viewBox="0 0 256 256"
              className="size-[15px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="116" cy="116" r="84" />
              <path d="M175.4 175.4 224 224M84 116h64" />
              <motion.path
                d="M116 84v64"
                initial={false}
                animate={{ opacity: zoomed ? 0 : 1 }}
                transition={reduced ? { duration: 0 } : GLYPH}
              />
            </svg>
          </button>
          <button
            data-lightbox-focus="1"
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={CHROME_BUTTON}
          >
            <svg
              viewBox="0 0 256 256"
              className="size-[15px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M200 56 56 200M200 200 56 56" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Floating Navigation Controls (when gallery has multiple items) */}
      {onPrev && (!zoomed || scale.get() <= 1.05) && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="pointer-events-none absolute inset-y-0 left-3 sm:left-6 flex items-center"
        >
          <button
            type="button"
            data-lightbox-focus="1"
            onClick={onPrev}
            aria-label="Previous image (Left Arrow)"
            className={`${NAV_BUTTON} pointer-events-auto`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </motion.div>
      )}

      {onNext && (!zoomed || scale.get() <= 1.05) && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="pointer-events-none absolute inset-y-0 right-3 sm:right-6 flex items-center"
        >
          <button
            type="button"
            data-lightbox-focus="1"
            onClick={onNext}
            aria-label="Next image (Right Arrow)"
            className={`${NAV_BUTTON} pointer-events-auto`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      )}

      <p id={hintId} className="sr-only">
        Scroll to zoom toward the pointer, or press plus and minus. Drag or use the arrow keys to
        pan, and double-click to switch between fit and close-up. Press zero to return to the
        starting frame; Escape returns home first, then closes.
      </p>
      <p role="status" className="sr-only">
        Zoom {settledZoom.toFixed(1)} times
      </p>
    </div>
  );
}

export function Lightbox(props: LightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>{props.open ? <Stage key="lightbox" {...props} /> : null}</AnimatePresence>,
    document.body
  );
}

export default Lightbox;
