'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive02Icon, Tick02Icon, Undo02Icon } from '@hugeicons/core-free-icons';

const LINE = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }];
const OUTLINE = [{ strokeDashoffset: 0 }, { strokeDashoffset: -1 }];
const SIZES = {
  sm: { height: 36, font: 13, icon: 14, px: 16 },
  md: { height: 44, font: 14, icon: 15, px: 20 },
  lg: { height: 52, font: 15, icon: 17, px: 24 },
} as const;

export type FuseButtonSize = 'sm' | 'md' | 'lg';
export type FusePhase = 'idle' | 'armed' | 'settled';
export type FuseStyle = 'outline' | 'line';
export type FuseCommitOn = 'press' | 'fuseEnd';
export type FuseSettle = 'reset' | 'stay';

export interface FuseButtonProps {
  label?: string;
  undoLabel?: string;
  doneLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  background?: string;
  fuseColor?: string;
  size?: FuseButtonSize;
  radius?: number;
  undoWindow?: number;
  fuse?: FuseStyle;
  fuseThickness?: number;
  crossfadeMs?: number;
  commitOn?: FuseCommitOn;
  pauseOnHover?: boolean;
  settle?: FuseSettle;
  disabled?: boolean;
  onCommit?: (trigger: FuseCommitOn) => void;
  onUndo?: () => void;
  onFuseEnd?: () => void;
  onPhaseChange?: (phase: FusePhase) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export default function FuseButton({
  label = 'Archive',
  undoLabel = 'Undo',
  doneLabel = 'Archived',
  icon,
  color = '#f5f5f5',
  background = '#27272a',
  fuseColor = '#f5a524',
  size = 'md',
  radius = 22,
  undoWindow = 4000,
  fuse = 'outline',
  fuseThickness = 1.5,
  crossfadeMs = 200,
  commitOn = 'press',
  pauseOnHover = true,
  settle = 'reset',
  disabled = false,
  onCommit,
  onUndo,
  onFuseEnd,
  onPhaseChange,
  className = '',
  type = 'button',
  style,
}: FuseButtonProps) {
  const [phase, setPhase] = useState<FusePhase>('idle');
  const [instant, setInstant] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const idleRef = useRef<HTMLButtonElement | null>(null);
  const undoRef = useRef<HTMLButtonElement | null>(null);
  const lineRef = useRef<HTMLElement | null>(null);
  const rimRef = useRef<SVGRectElement | null>(null);
  const anim = useRef<Animation | null>(null);
  const pause = useRef<{ hover: boolean; hidden: boolean; canHoverPause: boolean }>({
    hover: false,
    hidden: false,
    canHoverPause: false,
  });
  const lastInput = useRef<'pointer' | 'keyboard'>('pointer');
  const windowRef = useRef(undoWindow);
  const latest = useRef({ commitOn, settle, onCommit, onUndo, onFuseEnd, onPhaseChange });
  latest.current = { onCommit, onUndo, onFuseEnd, onPhaseChange, commitOn, settle };
  const statusId = useId();
  const preset = SIZES[size] || SIZES.md;

  const go = (next: FusePhase): void => {
    setInstant(lastInput.current === 'keyboard');
    setPhase(next);
    latest.current.onPhaseChange?.(next);
  };

  const syncPlayState = (): void => {
    const a = anim.current;
    if (!a) return;
    const { hover, hidden } = pause.current;
    if (hover || hidden) {
      if (a.playState === 'running') a.pause();
    } else if (a.playState === 'paused') {
      a.play();
    }
  };

  const light = (from = 0): void => {
    const el = fuse === 'outline' ? rimRef.current : lineRef.current;
    if (!el) return;
    anim.current?.cancel();
    const a = el.animate(fuse === 'outline' ? OUTLINE : LINE, {
      duration: windowRef.current,
      easing: 'linear',
      fill: 'forwards',
    });
    if (from) a.currentTime = from;
    a.onfinish = (): void => {
      const l = latest.current;
      l.onFuseEnd?.();
      if (l.commitOn === 'fuseEnd') l.onCommit?.('fuseEnd');
      lastInput.current = 'pointer';
      go(l.settle === 'stay' ? 'settled' : 'idle');
    };
    anim.current = a;
    syncPlayState();
  };

  const arm = (): void => {
    if (disabled || phase !== 'idle') return;
    windowRef.current = undoWindow;
    light();
    pause.current.canHoverPause = false;
    pause.current.hover = false;
    if (commitOn === 'press') onCommit?.('press');
    go('armed');
  };

  const undo = (): void => {
    if (phase !== 'armed') return;
    const a = anim.current;
    if (a) {
      a.onfinish = null;
      a.pause();
    }
    onUndo?.();
    go('idle');
  };

  useEffect(() => {
    const inside = rootRef.current?.contains(document.activeElement);
    if (phase === 'armed') undoRef.current?.focus({ preventScroll: true });
    else if (inside)
      (phase === 'idle' ? idleRef.current : rootRef.current)?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    const onVisibility = (): void => {
      pause.current.hidden = document.hidden;
      syncPlayState();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      anim.current?.cancel();
    };
  }, []);

  useEffect(() => {
    const a = anim.current;
    if (!a || phase !== 'armed') return;
    light(Number(a.currentTime) || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuse]);

  useEffect(() => {
    if (pauseOnHover) return;
    pause.current.hover = false;
    syncPlayState();
  }, [pauseOnHover]);

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>): void => {
    lastInput.current = 'pointer';
    const pressable = phase === 'armed' || (phase === 'idle' && !disabled);
    if (e.button === 0 && pressable && rootRef.current) rootRef.current.dataset.pressed = '';
  };
  const release = (): void => {
    if (rootRef.current) delete rootRef.current.dataset.pressed;
  };
  const handlePointerEnter = (e: React.PointerEvent<HTMLSpanElement>): void => {
    if (pauseOnHover && e.pointerType === 'mouse' && pause.current.canHoverPause) {
      pause.current.hover = true;
      syncPlayState();
    }
  };
  const handlePointerLeave = (e: React.PointerEvent<HTMLSpanElement>): void => {
    release();
    if (e.pointerType !== 'mouse') return;
    pause.current.canHoverPause = true;
    pause.current.hover = false;
    syncPlayState();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') lastInput.current = 'keyboard';
    if (e.key === 'Escape' && phase === 'armed') {
      e.preventDefault();
      lastInput.current = 'keyboard';
      undo();
    }
  };

  const actionIcon = icon ?? (
    <HugeiconsIcon icon={Archive02Icon} size={preset.icon} strokeWidth={1.8} />
  );
  const line = <i ref={lineRef} className="fuse-button__fuse" aria-hidden="true" />;

  return (
    <span
      ref={rootRef}
      tabIndex={-1}
      className={`fuse-button${className ? ` ${className}` : ''}`}
      data-phase={phase}
      data-fuse={fuse}
      data-instant={instant ? '' : undefined}
      aria-disabled={phase === 'settled' || undefined}
      style={
        {
          '--fb-ink': color,
          '--fb-bg': background,
          '--fb-fuse': fuseColor,
          '--fb-fuse-h': `${fuseThickness}px`,
          '--fb-radius': `${radius}px`,
          '--fb-fade': `${crossfadeMs}ms`,
          '--fb-h': `${preset.height}px`,
          '--fb-fs': `${preset.font}px`,
          '--fb-icon': `${preset.icon}px`,
          '--fb-px': `${preset.px}px`,
          ...style,
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={idleRef}
        type={type}
        className="fuse-button__face fuse-button__idle"
        disabled={disabled}
        inert={phase !== 'idle'}
        onClick={arm}
      >
        <span className="fuse-button__icon" aria-hidden="true">
          {actionIcon}
        </span>
        {label}
      </button>
      <button
        ref={undoRef}
        type="button"
        className="fuse-button__face fuse-button__undo"
        aria-describedby={statusId}
        aria-keyshortcuts="Escape"
        inert={phase !== 'armed'}
        onClick={undo}
      >
        <span className="fuse-button__icon fuse-button__icon--undo" aria-hidden="true">
          <HugeiconsIcon icon={Undo02Icon} size={preset.icon} strokeWidth={2} />
        </span>
        {undoLabel}
        {fuse !== 'outline' ? line : null}
      </button>
      <span className="fuse-button__face fuse-button__settled" inert={phase !== 'settled'}>
        <span className="fuse-button__icon" aria-hidden="true">
          <HugeiconsIcon icon={Tick02Icon} size={preset.icon} strokeWidth={2.2} />
        </span>
        {doneLabel}
      </span>
      {fuse === 'outline' ? (
        <svg className="fuse-button__rim" aria-hidden="true">
          <rect ref={rimRef} pathLength="1" />
        </svg>
      ) : null}
      <span className="fuse-button__status" id={statusId} role="status" aria-live="polite">
        {phase === 'idle' ? '' : doneLabel}
      </span>
    </span>
  );
}

export { FuseButton };
