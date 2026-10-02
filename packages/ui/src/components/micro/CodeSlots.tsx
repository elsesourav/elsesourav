'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  motionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
  MotionValue,
} from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const WASH_IN = 0.3;
const WASH_OUT = 0.2;
const SINK_DELAY = 0.06;
const SINK_STEP = 0.03;
const CHECK_DELAY = 0.28;
const CHECK_RISE = 8;
const SINK_FADE = 0.6;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const digitsOf = (raw: unknown): string => String(raw ?? '').replace(/\D/g, '');
const toSlots = (raw: unknown, n: number): string[] => {
  const d = digitsOf(raw).slice(0, n);
  return Array.from({ length: n }, (_, i) => d[i] ?? '');
};
const firstEmptyOf = (slots: string[]): number => {
  const i = slots.indexOf('');
  return i === -1 ? slots.length - 1 : i;
};
const isFull = (slots: string[]): boolean => slots.every(Boolean);

export interface CodeSlotsProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  status?: 'idle' | 'success' | 'error' | string;
  mask?: boolean;
  caret?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  accentColor?: string;
  inkColor?: string;
  slotColor?: string;
  digitColor?: string;
  dangerColor?: string;
  slotSize?: number;
  gap?: number;
  radius?: number;
  bounce?: number;
  settle?: number;
  rise?: number;
  cascade?: number;
  ariaLabel?: string;
  className?: string;
}

export default function CodeSlots({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  status = 'idle',
  mask = false,
  caret = true,
  disabled = false,
  autoFocus = false,
  accentColor = 'var(--micro-fg, #f5f5f5)',
  inkColor = 'var(--micro-fg, #f5f5f5)',
  slotColor = 'var(--micro-bg-elevated, #27272a)',
  digitColor = 'var(--micro-bg, #18181b)',
  dangerColor = 'var(--micro-destructive, #ff3b30)',
  slotSize = 44,
  gap = 8,
  radius = 12,
  bounce = 0.2,
  settle = 0.3,
  rise = 8,
  cascade = 20,
  ariaLabel = 'One-time code',
  className = '',
}: CodeSlotsProps) {
  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [slots, setSlots] = useState<string[]>(() => toSlots(value ?? defaultValue, length));
  const [active, setActive] = useState<number>(() => firstEmptyOf(slots));
  const [focused, setFocused] = useState(false);
  const [veiled, setVeiled] = useState(status === 'success');
  const activeMv = useMotionValue<number>(active);
  const openMv = useMotionValue<number>(status === 'success' ? 1 : 0);
  const checkMv = useMotionValue<number>(status === 'success' ? 1 : 0);
  const glide = useRef<Set<number>>(new Set());
  const target = useRef<number[]>([]);
  const draining = useRef(false);
  const drainTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const statusRef = useRef(status);
  const emitted = useRef(digitsOf(value ?? defaultValue).slice(0, length));
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const live = useRef({ settle, bounce, cascade, reduce });
  live.current = { settle, bounce, cascade, reduce };

  const springs = useMemo(
    () => ({
      mvs: Array.from({ length }, (_, i) => motionValue(slotsRef.current[i] ? 1 : 0)),
      drops: Array.from({ length }, () => motionValue(statusRef.current === 'success' ? 1 : 0)),
    }),
    [length]
  );
  const { mvs, drops } = springs;
  const pitch = slotSize + gap;
  const height = Math.round(slotSize * 1.18);
  const washRadius = Math.min(radius, slotSize / 2);

  const drive = useCallback(
    (i: number, to: number, delayMs = 0) => {
      const mv = mvs[i];
      if (!mv) return;
      target.current[i] = to;
      const L = live.current;
      if (L.reduce) {
        mv.set(to);
        return;
      }
      animate(mv, to, {
        type: 'spring',
        duration: L.settle,
        bounce: L.bounce,
        delay: delayMs / 1000,
      });
    },
    [mvs]
  );

  const land = useCallback(
    (i: number, delayMs = 0) => {
      if (mvs[i] && mvs[i].get() > 0) mvs[i].set(0);
      drive(i, 1, delayMs);
    },
    [mvs, drive]
  );

  const moveActive = useCallback(
    (next: number, crossed: number[]) => {
      crossed.forEach((j) => glide.current.add(j));
      activeMv.set(next);
      setActive(next);
    },
    [activeMv]
  );

  const jumpActive = useCallback(
    (next: number) => {
      glide.current.clear();
      activeMv.set(next);
      setActive(next);
    },
    [activeMv]
  );

  const caretX = useTransform(() => {
    const a = activeMv.get();
    let x = a * pitch;
    for (let j = 0; j < mvs.length; j++) {
      const mv = mvs[j];
      if (!mv) continue;
      const h = clamp01(mv.get());
      if (!glide.current.has(j)) continue;
      const to = target.current[j];
      if (to === undefined || h === clamp01(to)) {
        glide.current.delete(j);
        continue;
      }
      x += j < a ? -(1 - h) * pitch : h * pitch;
    }
    return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch);
  });

  const caretTransform = useTransform(caretX, (x) => `translateX(${x}px)`);
  const washClip = useTransform(
    openMv,
    (o) => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`
  );
  const checkTransform = useTransform(
    checkMv,
    (c) => `translateY(${(1 - c) * CHECK_RISE}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`
  );
  const checkOpacity = useTransform(checkMv, clamp01);

  const commit = useCallback(
    (next: string[]) => {
      const prev = slotsRef.current;
      slotsRef.current = next;
      setSlots(next);
      const code = next.join('');
      emitted.current = code;
      onChange?.(code);
      if (!isFull(prev) && isFull(next)) onComplete?.(code);
    },
    [onChange, onComplete]
  );

  const insert = (raw: string, from = active) => {
    const digits = digitsOf(raw);
    if (!digits) return;
    const next = [...slotsRef.current];
    const crossed: number[] = [];
    const step = reduce ? 0 : cascade;
    let i = from;
    for (const ch of digits) {
      if (i >= length) break;
      next[i] = ch;
      land(i, (i - from) * step);
      crossed.push(i);
      i += 1;
    }
    if (!crossed.length) return;
    commit(next);
    moveActive(Math.min(i, length - 1), crossed);
  };

  const clearSlot = (i: number, stepBack = false) => {
    if (!slotsRef.current[i]) {
      if (stepBack) jumpActive(i);
      return;
    }
    const next = [...slotsRef.current];
    next[i] = '';
    drive(i, 0);
    commit(next);
    if (stepBack) moveActive(i, [i]);
  };

  const busy = disabled || draining.current || status === 'success';

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (busy || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      e.preventDefault();
      insert(k);
    } else if (k === 'Backspace') {
      e.preventDefault();
      if (slots[active]) clearSlot(active);
      else if (active > 0) clearSlot(active - 1, true);
    } else if (k === 'Delete') {
      e.preventDefault();
      clearSlot(active);
    } else if (k === 'ArrowLeft') {
      e.preventDefault();
      jumpActive(Math.max(active - 1, 0));
    } else if (k === 'ArrowRight') {
      e.preventDefault();
      jumpActive(Math.min(active + 1, length - 1));
    } else if (k === 'Home') {
      e.preventDefault();
      jumpActive(0);
    } else if (k === 'End') {
      e.preventDefault();
      jumpActive(length - 1);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (busy) return;
    e.preventDefault();
    insert(e.clipboardData.getData('text'));
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (busy) return;
    const d = digitsOf(e.target.value);
    if (!d) return;
    insert(d, d.length === 1 ? active : 0);
  };

  const onRowMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    const row = rowRef.current;
    if (row && !draining.current && status !== 'success') {
      const rect = row.getBoundingClientRect();
      const zoom = rect.width / (row.offsetWidth || rect.width) || 1;
      const i = Math.floor((e.clientX - rect.left) / zoom / pitch);
      jumpActive(Math.max(0, Math.min(i, firstEmptyOf(slotsRef.current))));
    }
    inputRef.current?.focus();
  };

  useEffect(() => {
    glide.current.clear();
    target.current = [];
    const next = Array.from({ length }, (_, i) => slotsRef.current[i] ?? '');
    slotsRef.current = next;
    setSlots(next);
    jumpActive(firstEmptyOf(next));
    const code = next.join('');
    if (code !== emitted.current) {
      emitted.current = code;
      onChange?.(code);
    }
  }, [jumpActive, length, onChange]);

  useEffect(() => {
    if (value === undefined) return;
    const clean = digitsOf(value).slice(0, length);
    if (clean === emitted.current) return;
    emitted.current = clean;
    const prev = slotsRef.current;
    const next = toSlots(clean, length);
    const hidden = statusRef.current === 'success';
    const landing: number[] = [];
    const leaving: number[] = [];
    next.forEach((ch, i) => {
      if (ch === prev[i]) return;
      (ch ? landing : leaving).push(i);
    });
    const step = live.current.reduce || hidden ? 0 : live.current.cascade;
    landing.forEach((i, k) => land(i, k * step));
    leaving.reverse().forEach((i, k) => {
      if (hidden) {
        target.current[i] = 0;
        mvs[i]?.set(0);
        drops[i]?.set(0);
      } else drive(i, 0, k * step);
    });
    slotsRef.current = next;
    setSlots(next);
    moveActive(firstEmptyOf(next), [...landing, ...leaving]);
    if (!isFull(prev) && isFull(next)) onComplete?.(clean);
  }, [value, length, land, drive, moveActive, onComplete, mvs, drops]);

  useEffect(() => {
    const was = statusRef.current;
    const L = live.current;
    if (status === 'success') {
      setVeiled(true);
      if (L.reduce) {
        openMv.set(1);
        drops.forEach((d) => d.set(1));
        checkMv.set(1);
        return;
      }
      animate(openMv, 1, { duration: WASH_IN, ease: EASE_OUT });
      drops.forEach((d, k) =>
        animate(d, 1, {
          type: 'spring',
          duration: 0.3,
          bounce: 0,
          delay: SINK_DELAY + k * SINK_STEP,
        })
      );
      animate(checkMv, 1, { type: 'spring', duration: 0.35, bounce: L.bounce, delay: CHECK_DELAY });
      return;
    }
    if (was !== 'success') return;
    if (L.reduce) {
      openMv.set(0);
      checkMv.set(0);
      drops.forEach((d) => d.set(0));
      setVeiled(false);
      return;
    }
    animate(checkMv, 0, { duration: 0.15, ease: EASE_OUT });
    animate(openMv, 0, { duration: WASH_OUT, ease: EASE_OUT, delay: 0.06 }).then(() => {
      if (openMv.get() === 0) setVeiled(false);
    });
    drops.forEach((d) => animate(d, 0, { type: 'spring', duration: 0.3, bounce: 0, delay: 0.1 }));
  }, [status, drops, openMv, checkMv]);

  useEffect(() => {
    if (status !== 'error') return;
    const filled = slotsRef.current.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    if (!filled.length) return;
    filled.reverse();
    draining.current = true;
    const L = live.current;
    const step = L.reduce ? 0 : L.cascade;
    filled.forEach((i, k) => drive(i, 0, k * step));
    moveActive(
      0,
      slotsRef.current.map((_, j) => j)
    );
    clearTimeout(drainTimer.current);
    drainTimer.current = setTimeout(
      () => {
        draining.current = false;
        commit(Array.from({ length }, () => ''));
      },
      L.reduce ? 300 : (filled.length - 1) * step + L.settle * 1000
    );
  }, [status, commit, drive, length, moveActive]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => () => clearTimeout(drainTimer.current), []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const view = slots.length === length ? slots : Array.from({ length }, (_, i) => slots[i] ?? '');
  const showCaret =
    caret &&
    focused &&
    !disabled &&
    !veiled &&
    status !== 'success' &&
    (status === 'error' || !view[active]);

  return (
    <div
      className={`code-slots${className ? ` ${className}` : ''}`}
      style={
        {
          '--cs-accent': accentColor,
          '--cs-ink': inkColor,
          '--cs-slot': slotColor,
          '--cs-digit': digitColor,
          '--cs-danger': dangerColor,
          '--cs-size': `${slotSize}px`,
          '--cs-height': `${height}px`,
          '--cs-gap': `${gap}px`,
          '--cs-radius': `${Math.min(radius, slotSize / 2)}px`,
          '--cs-font': `${Math.round(slotSize * 0.5)}px`,
        } as React.CSSProperties
      }
    >
      <div
        ref={rowRef}
        className="code-slots__row"
        data-status={status}
        data-focused={focused ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        onMouseDown={onRowMouseDown}
      >
        <input
          ref={inputRef}
          className="code-slots__input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          value=""
          maxLength={length}
          aria-label={ariaLabel}
          aria-invalid={status === 'error'}
          aria-describedby={`${uid}-count`}
          disabled={disabled}
          readOnly={status === 'success'}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onChange={onInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {view.map((ch, i) => (
          <Slot
            key={i}
            mv={mvs[i] ?? motionValue(0)}
            drop={drops[i] ?? motionValue(0)}
            char={mask && ch ? '•' : ch}
            active={focused && i === active}
            rise={rise}
            sink={Math.round(height * 0.5)}
          />
        ))}
        <motion.span className="code-slots__wash" aria-hidden="true" style={{ clipPath: washClip }}>
          <motion.span
            className="code-slots__check"
            style={{ transform: checkTransform, opacity: checkOpacity }}
          >
            <HugeiconsIcon icon={Tick02Icon} size={Math.round(slotSize * 0.6)} strokeWidth={2.2} />
          </motion.span>
        </motion.span>
        <motion.span
          className="code-slots__caret"
          aria-hidden="true"
          data-show={showCaret ? '' : undefined}
          style={{ transform: caretTransform }}
        >
          <span key={active} className="code-slots__caret-line" />
        </motion.span>
      </div>
      <span id={`${uid}-count`} className="code-slots__sr" aria-live="polite">
        {status === 'success'
          ? 'Code accepted'
          : `${view.filter(Boolean).length} of ${length} digits entered`}
      </span>
    </div>
  );
}

interface SlotProps {
  mv: MotionValue<number>;
  drop: MotionValue<number>;
  char: string;
  active: boolean;
  rise: number;
  sink: number;
}

function Slot({ mv, drop, char, active, rise, sink }: SlotProps) {
  const [shown, setShown] = useState(char);
  if (char && char !== shown) setShown(char);
  const fill = useTransform(mv, (t) => `scale(${Math.max(t, 0)})`);
  const lift = useTransform([mv, drop], (latest: number[]) => {
    const [t = 0, d = 0] = latest;
    return `translateY(${(1 - t) * rise + Math.max(d, 0) * sink}px)`;
  });
  const ink = useTransform([mv, drop], (latest: number[]) => {
    const [t = 0, d = 0] = latest;
    return clamp01(t) * (1 - clamp01(d / SINK_FADE));
  });
  return (
    <span
      className="code-slots__slot"
      data-active={active ? '' : undefined}
      data-filled={char ? '' : undefined}
      aria-hidden="true"
    >
      <motion.span className="code-slots__fill" style={{ transform: fill }} />
      {shown ? (
        <motion.span className="code-slots__digit" style={{ transform: lift, opacity: ink }}>
          {shown}
        </motion.span>
      ) : null}
    </span>
  );
}

export { CodeSlots };
