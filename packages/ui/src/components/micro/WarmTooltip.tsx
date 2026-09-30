'use client';

import React, {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionStyle
} from 'motion/react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const LEAN_SPRING = { stiffness: 260, damping: 22, mass: 0.4 };
const FULL_LEAN_SPEED = 1200;
const SIGN: Record<string, number> = { top: 1, bottom: -1, left: -1, right: 1 };
const ORIGIN: Record<string, string> = {
  top: 'center bottom',
  bottom: 'center top',
  left: 'right center',
  right: 'left center'
};
const SIZES: Record<string, { font: number; px: number; py: number }> = {
  sm: { font: 11.5, px: 8, py: 5 },
  md: { font: 12.5, px: 10, py: 6 },
  lg: { font: 13.5, px: 12, py: 7 }
};
const MARGIN = 8;
const HOLD_SLOP = 10;
const SWAP = 0.14;
const SWAP_SHIFT = 10;
const RISE = 4;
const GRACE = 80;

type Side = 'top' | 'bottom' | 'left' | 'right';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const horizontal = (side: Side): boolean => side === 'top' || side === 'bottom';

const anchorOf = (rect: DOMRect, side: Side, gap: number): [number, number] => {
  if (side === 'top') return [rect.left + rect.width / 2, rect.top - gap];
  if (side === 'bottom') return [rect.left + rect.width / 2, rect.bottom + gap];
  if (side === 'left') return [rect.left - gap, rect.top + rect.height / 2];
  return [rect.right + gap, rect.top + rect.height / 2];
};

const layoutOf = (
  x: number,
  y: number,
  width: number,
  height: number,
  side: Side
): { X: number; Y: number } => {
  if (typeof window === 'undefined') return { X: x, Y: y };
  if (horizontal(side)) {
    const X = clamp(x - width / 2, MARGIN, Math.max(MARGIN, window.innerWidth - MARGIN - width));
    return { X, Y: side === 'top' ? y - height : y };
  }
  const Y = clamp(y - height / 2, MARGIN, Math.max(MARGIN, window.innerHeight - MARGIN - height));
  return { X: side === 'left' ? x - width : x, Y };
};

interface LayerCustom {
  dir: number;
  across: boolean;
}

const LAYER = {
  enter: ({ dir, across }: LayerCustom) => ({
    opacity: dir === 0 ? 1 : 0,
    x: across ? 0 : SWAP_SHIFT * dir,
    y: across ? SWAP_SHIFT * dir : 0,
    filter: dir === 0 ? 'blur(0px)' : 'blur(3px)'
  }),
  show: { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' },
  exit: ({ dir, across }: LayerCustom) => ({
    opacity: 0,
    x: across ? 0 : -SWAP_SHIFT * dir,
    y: across ? -SWAP_SHIFT * dir : 0,
    filter: 'blur(3px)'
  })
};

export interface WarmTooltipPayload {
  id: string;
  trigger: HTMLElement | null;
  content: React.ReactNode;
  shortcut?: React.ReactNode;
  side: Side;
  gap: number;
  arrow: boolean;
  surfaceColor: string;
  inkColor: string;
  radius: number;
  font: number;
  px: number;
  py: number;
  popDuration: number;
  popScale: number;
  popBlur: number;
  warmWindow: number;
}

export interface WarmTooltipGroupContextValue {
  id: string;
  delay: number;
  warmWindow: number;
  activeId: string | null;
  isWarm: () => boolean;
  show: (payload: WarmTooltipPayload, mode: 'cold' | 'warm' | 'move' | 'instant') => void;
  hide: (tooltipId: string, instant: boolean) => void;
  reset: () => void;
}

const GroupContext = createContext<WarmTooltipGroupContextValue | null>(null);

export interface WarmTooltipGroupRef {
  reset: () => void;
}

export interface WarmTooltipGroupProps {
  delay?: number;
  warmWindow?: number;
  travel?: number;
  lean?: number;
  onWarmChange?: (warm: boolean) => void;
  children: React.ReactNode;
}

export const WarmTooltipGroup = forwardRef<WarmTooltipGroupRef, WarmTooltipGroupProps>(
  function WarmTooltipGroup(
    { delay = 400, warmWindow = 300, travel = 320, lean = 0, onWarmChange, children },
    ref
  ) {
    const reduce = useReducedMotion();
    const id = useId();
    const [current, setCurrent] = useState<WarmTooltipPayload | null>(null);
    const [state, setState] = useState<'open' | 'closed' | 'closing'>('closed');
    const st = useRef<{
      state: 'open' | 'closed' | 'closing';
      current: WarmTooltipPayload | null;
      mode: 'cold' | 'warm' | 'move' | 'instant';
      instant: boolean;
      warmUntil: number;
      warm: boolean;
      swap: LayerCustom;
      closeTimer: ReturnType<typeof setTimeout> | undefined;
      leaveTimer: ReturnType<typeof setTimeout> | undefined;
      warmTimer: ReturnType<typeof setTimeout> | undefined;
    }>({
      state: 'closed',
      current: null,
      mode: 'cold',
      instant: false,
      warmUntil: -Infinity,
      warm: false,
      swap: { dir: 0, across: false },
      closeTimer: undefined,
      leaveTimer: undefined,
      warmTimer: undefined
    });
    const textRef = useRef<HTMLSpanElement | null>(null);
    const api = useRef<{
      show: (payload: WarmTooltipPayload, mode: 'cold' | 'warm' | 'move' | 'instant') => void;
      hide: (tooltipId: string, instant: boolean) => void;
    }>({ show: () => {}, hide: () => {} });

    const ax = useMotionValue(0);
    const ay = useMotionValue(0);
    const w = useMotionValue(0);
    const h = useMotionValue(0);
    const presence = useMotionValue(0);
    const vx = useVelocity(ax);
    const vy = useVelocity(ay);
    const speed = useTransform([vx, vy], ([a = 0, b = 0]: number[]) =>
      st.current.current && !horizontal(st.current.current.side) ? b : a
    );
    const leanUnit = useSpring(
      useTransform(speed, [-FULL_LEAN_SPEED, 0, FULL_LEAN_SPEED], [1, 0, -1], { clamp: true }),
      LEAN_SPRING
    );
    const leanDeg = reduce ? 0 : lean;

    const place = useTransform([ax, ay, w, h], ([x = 0, y = 0, width = 0, height = 0]: number[]) => {
      const s = st.current.current ? st.current.current.side : 'top';
      const { X, Y } = layoutOf(x, y, width, height, s);
      return `translate(${X}px, ${Y}px)`;
    });
    const arrowAt = useTransform([ax, ay, w, h], ([x = 0, y = 0, width = 0, height = 0]: number[]) => {
      const s = st.current.current ? st.current.current.side : 'top';
      const { X, Y } = layoutOf(x, y, width, height, s);
      return horizontal(s) ? clamp(x - X, 10, width - 10) : clamp(y - Y, 10, height - 10);
    });
    const pop = useTransform([presence, leanUnit], ([p = 0, l = 0]: number[]) => {
      const c = st.current.current;
      const s = c ? c.side : 'top';
      if (reduce || !c) return 'none';
      const scale = c.popScale + (1 - c.popScale) * p;
      const sign = SIGN[s] ?? 1;
      const rise = (1 - p) * RISE * sign * (s === 'left' ? -1 : 1);
      const rotate = l * leanDeg * sign;
      const tx = horizontal(s) ? 0 : rise;
      const ty = horizontal(s) ? rise : 0;
      return `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`;
    });
    const blur = useTransform(presence, (p: number) => {
      const c = st.current.current;
      return reduce || !c ? 'none' : `blur(${c.popBlur * (1 - p)}px)`;
    });

    const isWarm = () => st.current.state !== 'closed' || now() < st.current.warmUntil;
    const notify = () => {
      const next = isWarm();
      if (next === st.current.warm) return;
      st.current.warm = next;
      onWarmChange?.(next);
    };

    const finishClose = () => {
      st.current.state = 'closed';
      st.current.current = null;
      setState('closed');
      setCurrent(null);
      notify();
    };

    api.current.show = (payload, mode) => {
      clearTimeout(st.current.closeTimer);
      clearTimeout(st.current.leaveTimer);
      const prev = st.current.current;
      const fresh = st.current.state === 'closed';
      if (prev && prev.id !== payload.id && prev.trigger && payload.trigger) {
        const [px, py] = anchorOf(prev.trigger.getBoundingClientRect(), prev.side, prev.gap);
        const [nx, ny] = anchorOf(payload.trigger.getBoundingClientRect(), payload.side, payload.gap);
        const across = !horizontal(payload.side);
        st.current.swap = { dir: Math.sign(across ? ny - py : nx - px) || 1, across };
      } else {
        st.current.swap = { dir: 0, across: !horizontal(payload.side) };
      }
      st.current.mode = fresh ? mode : mode === 'instant' ? 'instant' : 'move';
      st.current.instant = mode === 'instant';
      st.current.current = payload;
      st.current.state = 'open';
      setCurrent(payload);
      setState('open');
      notify();
    };

    const beginClose = (instantClose: boolean) => {
      const c = st.current.current;
      if (!c || st.current.state !== 'open') return;
      st.current.state = 'closing';
      setState('closing');
      st.current.warmUntil = now() + c.warmWindow;
      clearTimeout(st.current.warmTimer);
      st.current.warmTimer = setTimeout(notify, c.warmWindow + 1);
      if (instantClose) {
        presence.jump(0);
        finishClose();
        return;
      }
      const closeMs = Math.round(c.popDuration * 0.8);
      animate(presence, 0, { duration: closeMs / 1000, ease: EASE_OUT });
      st.current.closeTimer = setTimeout(finishClose, closeMs);
    };

    api.current.hide = (tooltipId, instantHide) => {
      const c = st.current.current;
      if (!c || c.id !== tooltipId || st.current.state !== 'open') return;
      clearTimeout(st.current.leaveTimer);
      if (instantHide || st.current.instant) {
        beginClose(true);
        return;
      }
      st.current.leaveTimer = setTimeout(() => beginClose(false), GRACE);
    };

    const group = useMemo<WarmTooltipGroupContextValue>(
      () => ({
        id,
        delay,
        warmWindow,
        activeId: current ? current.id : null,
        isWarm,
        show: (payload, mode) => api.current.show(payload, mode),
        hide: (tooltipId, instantHide) => api.current.hide(tooltipId, instantHide),
        reset: () => {
          if (st.current.current) api.current.hide(st.current.current.id, true);
          st.current.warmUntil = -Infinity;
          clearTimeout(st.current.warmTimer);
          notify();
        }
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id, delay, warmWindow, current]
    );
    useImperativeHandle(ref, () => ({ reset: group.reset }), [group]);

    useLayoutEffect(() => {
      const c = st.current.current;
      const text = textRef.current;
      if (!c || !text || !c.trigger || state !== 'open') return;
      const [tx, ty] = anchorOf(c.trigger.getBoundingClientRect(), c.side, c.gap);
      const tw = text.offsetWidth + c.px * 2;
      const th = text.offsetHeight + c.py * 2;
      const mode = st.current.mode;
      if (mode === 'move' && !reduce && travel > 0) {
        const spring = { type: 'spring' as const, duration: travel / 1000, bounce: 0.1 };
        animate(ax, tx, spring);
        animate(ay, ty, spring);
        animate(w, tw, spring);
        animate(h, th, spring);
        animate(presence, 1, { duration: 0.12, ease: EASE_OUT });
        return;
      }
      ax.jump(tx);
      ay.jump(ty);
      w.jump(tw);
      h.jump(th);
      if (mode === 'cold') {
        presence.jump(0);
        animate(presence, 1, { duration: c.popDuration / 1000, ease: EASE_OUT });
      } else {
        presence.jump(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, state]);

    useEffect(() => {
      if (state === 'closed') return undefined;
      let raf = 0;
      const follow = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const c = st.current.current;
          if (!c || !c.trigger) return;
          const [tx, ty] = anchorOf(c.trigger.getBoundingClientRect(), c.side, c.gap);
          ax.jump(tx);
          ay.jump(ty);
        });
      };
      const onHidden = () => {
        if (document.visibilityState === 'hidden' && st.current.current) {
          api.current.hide(st.current.current.id, true);
        }
      };
      window.addEventListener('scroll', follow, { capture: true, passive: true });
      window.addEventListener('resize', follow);
      document.addEventListener('visibilitychange', onHidden);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', follow, { capture: true });
        window.removeEventListener('resize', follow);
        document.removeEventListener('visibilitychange', onHidden);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    useEffect(
      () => () => {
        clearTimeout(st.current.closeTimer);
        clearTimeout(st.current.leaveTimer);
        clearTimeout(st.current.warmTimer);
      },
      []
    );

    const canPortal = typeof document !== 'undefined';
    const s = current ? current.side : 'top';
    const arrowStyle = horizontal(s) ? { left: arrowAt } : { top: arrowAt };

    return (
      <GroupContext.Provider value={group}>
        {children}
        {state !== 'closed' && current && canPortal
          ? createPortal(
              <motion.span
                id={id}
                role="tooltip"
                className="warm-tooltip"
                data-side={s}
                style={
                  {
                    transform: place,
                    width: w,
                    height: h,
                    '--wt-surface': current.surfaceColor,
                    '--wt-ink': current.inkColor,
                    '--wt-radius': `${current.radius}px`,
                    '--wt-font': `${current.font}px`,
                    '--wt-origin': ORIGIN[s]
                  } as MotionStyle & Record<string, unknown>
                }
              >
                <motion.span className="warm-tooltip__box" style={{ transform: pop, opacity: presence, filter: blur }}>
                  <AnimatePresence initial={false} custom={st.current.swap}>
                    <motion.span
                      key={current.id}
                      className="warm-tooltip__layer"
                      custom={st.current.swap}
                      variants={LAYER}
                      initial="enter"
                      animate="show"
                      exit="exit"
                      transition={{ duration: reduce ? 0 : SWAP, ease: EASE_OUT }}
                    >
                      <span
                        ref={el => {
                          if (el) textRef.current = el;
                        }}
                        className="warm-tooltip__text"
                      >
                        {current.content}
                        {current.shortcut ? <kbd className="warm-tooltip__kbd">{current.shortcut}</kbd> : null}
                      </span>
                    </motion.span>
                  </AnimatePresence>
                  {current.arrow ? (
                    <motion.span className="warm-tooltip__arrow" data-side={s} style={arrowStyle} aria-hidden="true" />
                  ) : null}
                </motion.span>
              </motion.span>,
              document.body
            )
          : null}
      </GroupContext.Provider>
    );
  }
);

interface TriggerProps {
  content: React.ReactNode;
  shortcut?: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  side: Side;
  delay?: number;
  warmWindow?: number;
  surfaceColor: string;
  inkColor: string;
  size: string;
  radius: number;
  gap: number;
  arrow: boolean;
  popDuration: number;
  popScale: number;
  popBlur: number;
  showFuse: boolean;
  longPress: number;
  disabled: boolean;
  className?: string;
}

function Trigger({
  content,
  shortcut,
  children,
  side,
  delay,
  warmWindow,
  surfaceColor,
  inkColor,
  size,
  radius,
  gap,
  arrow,
  popDuration,
  popScale,
  popBlur,
  showFuse,
  longPress,
  disabled,
  className = ''
}: TriggerProps) {
  const group = useContext(GroupContext);
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [fuse, setFuse] = useState<'idle' | 'arming'>('idle');
  const [pressing, setPressing] = useState<boolean>(false);
  const t = useRef<{
    open: ReturnType<typeof setTimeout> | undefined;
    press: ReturnType<typeof setTimeout> | undefined;
    press0: { x: number; y: number; id: number } | null;
    suppressClick: boolean;
  }>({ open: undefined, press: undefined, press0: null, suppressClick: false });
  const preset = SIZES[size] ?? SIZES.md ?? { font: 12.5, px: 10, py: 6 };
  const coldDelay = delay ?? group?.delay ?? 400;
  const active = group?.activeId === id;

  const payload = (): WarmTooltipPayload => ({
    id,
    trigger: triggerRef.current,
    content,
    shortcut,
    side,
    gap,
    arrow,
    surfaceColor,
    inkColor,
    radius,
    font: preset.font,
    px: preset.px,
    py: preset.py,
    popDuration,
    popScale,
    popBlur,
    warmWindow: warmWindow ?? group?.warmWindow ?? 300
  });

  const hide = (instantHide: boolean) => {
    clearTimeout(t.current.open);
    setFuse('idle');
    group?.hide(id, instantHide);
  };

  const arm = () => {
    if (!group) return;
    if (group.isWarm()) {
      group.show(payload(), 'warm');
      return;
    }
    setFuse('arming');
    t.current.open = setTimeout(() => {
      setFuse('idle');
      group.show(payload(), 'cold');
    }, coldDelay);
  };

  const cancelPress = () => {
    clearTimeout(t.current.press);
    if (!t.current.press0) return;
    t.current.press0 = null;
    setPressing(false);
    setFuse('idle');
  };

  useEffect(() => {
    if (disabled) {
      cancelPress();
      hide(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  useEffect(() => {
    if (!active) return undefined;
    const onOutside = (e: PointerEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        hide(false);
      }
    };
    document.addEventListener('pointerdown', onOutside, true);
    return () => document.removeEventListener('pointerdown', onOutside, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(
    () => () => {
      clearTimeout(t.current.open);
      clearTimeout(t.current.press);
    },
    []
  );

  const handlers = disabled
    ? {}
    : {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType !== 'touch' && e.buttons === 0) arm();
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType !== 'touch') hide(false);
        },
        onPointerDown: (e: React.PointerEvent<HTMLSpanElement>) => {
          if (e.pointerType === 'mouse') {
            hide(false);
            return;
          }
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
          t.current.press0 = { x: e.clientX, y: e.clientY, id: e.pointerId };
          setPressing(true);
          setFuse('arming');
          t.current.press = setTimeout(() => {
            t.current.suppressClick = true;
            t.current.press0 = null;
            setPressing(false);
            setFuse('idle');
            group?.show(payload(), 'cold');
          }, longPress);
        },
        onPointerMove: (e: React.PointerEvent) => {
          const p = t.current.press0;
          if (p && p.id === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > HOLD_SLOP) {
            cancelPress();
          }
        },
        onPointerUp: cancelPress,
        onPointerCancel: cancelPress,
        onContextMenu: (e: React.MouseEvent) => {
          if (t.current.press0) e.preventDefault();
        },
        onClickCapture: (e: React.MouseEvent) => {
          if (!t.current.suppressClick) return;
          t.current.suppressClick = false;
          e.preventDefault();
          e.stopPropagation();
        },
        onFocus: (e: React.FocusEvent) => {
          if ((e.target as HTMLElement).matches?.(':focus-visible')) {
            group?.show(payload(), 'instant');
          }
        },
        onBlur: () => hide(true),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') hide(true);
        }
      };

  const described = (children.props as { 'aria-describedby'?: string })['aria-describedby'];

  return (
    <span
      ref={triggerRef}
      className={`warm-tooltip__trigger${className ? ` ${className}` : ''}`}
      data-pressing={pressing ? '' : undefined}
      style={
        {
          '--wt-surface': surfaceColor,
          '--wt-fuse-ms': `${t.current.press0 ? longPress : coldDelay}ms`
        } as React.CSSProperties
      }
      {...handlers}
    >
      {cloneElement(children, { 'aria-describedby': active && group ? group.id : described })}
      {showFuse ? <span className="warm-tooltip__fuse" data-side={side} data-fuse={fuse} aria-hidden="true" /> : null}
    </span>
  );
}

export interface WarmTooltipProps {
  content: React.ReactNode;
  shortcut?: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  side?: Side;
  delay?: number;
  warmWindow?: number;
  surfaceColor?: string;
  inkColor?: string;
  size?: 'sm' | 'md' | 'lg' | string;
  radius?: number;
  gap?: number;
  arrow?: boolean;
  popDuration?: number;
  popScale?: number;
  popBlur?: number;
  showFuse?: boolean;
  longPress?: number;
  disabled?: boolean;
  className?: string;
  [key: string]: unknown;
}

export default function WarmTooltip({
  content,
  shortcut,
  children,
  side = 'top',
  delay,
  warmWindow,
  surfaceColor = '#f5f5f5',
  inkColor = '#18181b',
  size = 'md',
  radius = 8,
  gap = 8,
  arrow = true,
  popDuration = 160,
  popScale = 0.94,
  popBlur = 4,
  showFuse = false,
  longPress = 500,
  disabled = false,
  className = ''
}: WarmTooltipProps) {
  const context = useContext(GroupContext);
  const props: TriggerProps = {
    content,
    shortcut,
    children,
    side,
    delay,
    warmWindow,
    surfaceColor,
    inkColor,
    size,
    radius,
    gap,
    arrow,
    popDuration,
    popScale,
    popBlur,
    showFuse,
    longPress,
    disabled,
    className
  };
  if (context) return <Trigger {...props} />;
  return (
    <WarmTooltipGroup delay={delay} warmWindow={warmWindow}>
      <Trigger {...props} />
    </WarmTooltipGroup>
  );
}

export { WarmTooltip };
