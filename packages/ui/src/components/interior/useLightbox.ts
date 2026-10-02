'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';

export const CELL = {
  type: 'spring',
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

export const HOME = {
  type: 'spring',
  stiffness: 150,
  damping: 27,
  mass: 1,
} as const;

export const VEIL = {
  type: 'spring',
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;

export const EASE = [0.23, 1, 0.32, 1] as const;
export const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const;

export const GLYPH = {
  type: 'spring',
  stiffness: 700,
  damping: 46,
  mass: 0.5,
} as const;

export const TOGGLE = 2.5;
export const KEY_ZOOM = 1.6;
export const KEY_PAN = 56;
export const WHEEL_RATE = 140;
export const SLOP = 8;
export const NEAR_HOME = 1.02;
export const SNAP_HOME = 1.05;

export type Spring = {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass: number;
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type Drag = {
  id: number;
  from: { x: number; y: number };
  x: number;
  y: number;
};

export type UseLightboxOptions = {
  maxScale?: number;
  steps?: number;
  disabled?: boolean;
  onDismiss?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function useLightbox<
  Frame extends HTMLElement = HTMLDivElement,
  Content extends HTMLElement = HTMLImageElement,
>({ maxScale = 4, steps = 8, disabled = false, onDismiss, onPrev, onNext }: UseLightboxOptions = {}) {
  const cells = Math.max(1, Math.round(steps));
  const top = Math.max(1.1, maxScale);

  const frameRef = useRef<Frame>(null);
  const contentRef = useRef<Content>(null);

  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [step, setStep] = useState(0);
  const [settled, setSettled] = useState(0);

  const stepRef = useRef(0);
  const settledRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<Drag | null>(null);
  const onContent = useRef(false);

  const reduced = useReducedMotion();
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  const toStep = useCallback(
    (s: number) => clamp(Math.round(((s - 1) / (top - 1)) * cells), 0, cells),
    [cells, top]
  );

  const mark = useCallback(
    (s: number) => {
      const next = toStep(s);
      if (stepRef.current === next) return;
      stepRef.current = next;
      setStep(next);
    },
    [toStep]
  );

  const settle = useCallback(
    (s: number) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      const next = toStep(s);
      if (settledRef.current === next) return;
      settledRef.current = next;
      setSettled(next);
    },
    [toStep]
  );

  const settleSoon = useCallback(
    (s: number) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        settle(s);
      }, 220);
    },
    [settle]
  );

  const limit = useCallback((s: number) => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return { mx: 0, my: 0 };
    return {
      mx: Math.max(0, (content.offsetWidth * s - frame.clientWidth) / 2),
      my: Math.max(0, (content.offsetHeight * s - frame.clientHeight) / 2),
    };
  }, []);

  const place = useCallback(
    (s: number, nx: number, ny: number) => {
      const { mx, my } = limit(s);
      scale.set(s);
      x.set(clamp(nx, -mx, mx));
      y.set(clamp(ny, -my, my));
      mark(s);
    },
    [limit, mark, scale, x, y]
  );

  const glide = useCallback(
    (s: number, nx: number, ny: number, spring: Spring = CELL) => {
      const { mx, my } = limit(s);
      const tx = clamp(nx, -mx, mx);
      const ty = clamp(ny, -my, my);
      if (reduced) {
        scale.set(s);
        x.set(tx);
        y.set(ty);
      } else {
        animate(scale, s, spring);
        animate(x, tx, spring);
        animate(y, ty, spring);
      }
      mark(s);
      settle(s);
    },
    [limit, mark, reduced, scale, settle, x, y]
  );

  const reset = useCallback(() => {
    glide(1, 0, 0, HOME);
  }, [glide]);

  const zoomAt = useCallback(
    (next: number, cx: number, cy: number, animated: boolean) => {
      const frame = frameRef.current;
      if (!frame) return;
      const r = frame.getBoundingClientRect();
      const px = cx - (r.left + r.width / 2);
      const py = cy - (r.top + r.height / 2);
      const s0 = scale.get();
      const ax = (px - x.get()) / s0;
      const ay = (py - y.get()) / s0;
      const s = clamp(next, 1, top);
      const nx = px - ax * s;
      const ny = py - ay * s;
      if (animated) {
        glide(s, nx, ny, s <= 1 ? HOME : CELL);
        return;
      }
      place(s, nx, ny);
      settleSoon(s);
    },
    [glide, place, scale, settleSoon, top, x, y]
  );

  const finish = useCallback(() => {
    const s0 = scale.get();
    if (s0 < SNAP_HOME) reset();
    else settle(s0);
  }, [reset, scale, settle]);

  const release = (e: React.PointerEvent) => {
    const held = drag.current;
    if (!held || held.id !== e.pointerId) return;
    drag.current = null;
    const moved = Math.hypot(e.clientX - held.from.x, e.clientY - held.from.y);
    if (moved < SLOP && !onContent.current && scale.get() <= NEAR_HOME) {
      dismiss.current?.();
      return;
    }
    finish();
  };

  const cancel = (e: React.PointerEvent) => {
    const held = drag.current;
    if (!held || held.id !== e.pointerId) return;
    drag.current = null;
    finish();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const frame = frameRef.current;
    if (!frame || disabled) return;
    const r = frame.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const s0 = scale.get();

    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomAt(s0 * KEY_ZOOM, cx, cy, true);
      return;
    }
    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      zoomAt(s0 / KEY_ZOOM, cx, cy, true);
      return;
    }
    if (e.key === '0') {
      e.preventDefault();
      reset();
      return;
    }
    if (e.key === 'Escape' && s0 > NEAR_HOME) {
      e.preventDefault();
      e.stopPropagation();
      reset();
      return;
    }
    if (s0 > NEAR_HOME && e.key.startsWith('Arrow')) {
      e.preventDefault();
      const dx = e.key === 'ArrowLeft' ? KEY_PAN : e.key === 'ArrowRight' ? -KEY_PAN : 0;
      const dy = e.key === 'ArrowUp' ? KEY_PAN : e.key === 'ArrowDown' ? -KEY_PAN : 0;
      glide(s0, x.get() + dx, y.get() + dy);
      return;
    }
    // Gallery navigation when not zoomed
    if (s0 <= NEAR_HOME) {
      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
        return;
      }
    }
  };

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const content = contentRef.current;
      onContent.current = content ? content.contains(e.target as Node) : false;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.current = {
        id: e.pointerId,
        from: { x: e.clientX, y: e.clientY },
        x: x.get(),
        y: y.get(),
      };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const held = drag.current;
      if (!held || held.id !== e.pointerId) return;
      const dx = e.clientX - held.from.x;
      const dy = e.clientY - held.from.y;
      const s = scale.get();
      if (s <= 1) {
        const d = Math.hypot(dx, dy);
        const dragScale = Math.max(0.85, 1 - d / 1200);
        scale.set(dragScale);
        x.set(dx * 0.7);
        y.set(dy * 0.7);
        return;
      }
      const { mx, my } = limit(s);
      x.set(clamp(held.x + dx, -mx, mx));
      y.set(clamp(held.y + dy, -my, my));
    },
    onPointerUp: release,
    onPointerCancel: cancel,
    onKeyDown,
  };

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.preventDefault();
      zoomAt(scale.get() * Math.exp(-e.deltaY / WHEEL_RATE), e.clientX, e.clientY, false);
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
  }, [disabled, scale, zoomAt]);

  useEffect(() => {
    const bail = () => {
      drag.current = null;
    };
    window.addEventListener('blur', bail);
    return () => {
      window.removeEventListener('blur', bail);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return {
    frameRef,
    contentRef,
    bind,
    scale,
    x,
    y,
    step,
    steps: cells,
    zoom: 1 + (step / cells) * (top - 1),
    settledZoom: 1 + (settled / cells) * (top - 1),
    zoomed: step > 0,
    reset,
    zoomAt,
  };
}
