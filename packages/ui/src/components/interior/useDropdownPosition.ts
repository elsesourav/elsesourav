'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef, type RefObject } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface DropdownPosition {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
  transformOrigin: string;
}

export interface UseDropdownPositionOptions {
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  isFullWidth?: boolean;
  minWidth?: number;
  margin?: number;
  offset?: number;
  onScrollOffscreen?: () => void;
}

function isSamePosition(a: DropdownPosition | null, b: DropdownPosition | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.left === b.left &&
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.width === b.width &&
    a.maxHeight === b.maxHeight &&
    a.placement === b.placement &&
    a.transformOrigin === b.transformOrigin
  );
}

/**
 * Calculates adaptive floating coordinates for dropdown menus.
 * Automatically flips above/below depending on viewport clearance,
 * auto-aligns right when near screen edges, and clamps horizontally
 * to prevent cut-off on compact displays.
 */
export function useDropdownPosition({
  triggerRef,
  isOpen,
  isFullWidth = false,
  minWidth = 200,
  margin = 8,
  offset = 6,
  onScrollOffscreen,
}: UseDropdownPositionOptions) {
  const onScrollOffscreenRef = useRef(onScrollOffscreen);
  onScrollOffscreenRef.current = onScrollOffscreen;

  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const calculatePosition = useCallback((): DropdownPosition | null => {
    if (!isOpen || !triggerRef.current || typeof window === 'undefined') {
      return null;
    }

    const rawRect = triggerRef.current.getBoundingClientRect();
    const isZeroRect = rawRect.width === 0 && rawRect.height === 0;
    const rect = isZeroRect
      ? {
          left: 0,
          top: 0,
          right: minWidth,
          bottom: 40,
          width: minWidth,
          height: 40,
        }
      : rawRect;

    const vw =
      (typeof document !== 'undefined' && document.documentElement.clientWidth) ||
      window.innerWidth ||
      1024;
    const vh =
      (typeof document !== 'undefined' && document.documentElement.clientHeight) ||
      window.innerHeight ||
      768;

    if (!isZeroRect && (rawRect.bottom < -60 || rawRect.top > vh + 60)) {
      onScrollOffscreenRef.current?.();
    }

    // Determine target width
    const targetWidth = isFullWidth ? rect.width : Math.max(rect.width, minWidth);
    const menuWidth = Math.min(targetWidth, Math.max(160, vw - margin * 2));

    // Horizontal alignment & viewport clamping:
    // If aligning to trigger's left edge causes right overflow, align to trigger's right edge
    const wouldOverflowRight = rect.left + menuWidth > vw - margin;
    const isTriggerOnRightSide = rect.left + rect.width / 2 > vw / 2;

    let idealLeft: number;
    let originX: 'left' | 'right' = 'left';

    if (wouldOverflowRight || (isTriggerOnRightSide && rect.right - menuWidth >= margin)) {
      idealLeft = rect.right - menuWidth;
      originX = 'right';
    } else {
      idealLeft = rect.left;
      originX = 'left';
    }

    // Strict clamp between margin and (vw - menuWidth - margin)
    const left = Math.max(margin, Math.min(idealLeft, Math.max(margin, vw - menuWidth - margin)));

    // Vertical placement (Auto-flip if space below is insufficient):
    const spaceBelow = vh - rect.bottom - margin - offset;
    const spaceAbove = rect.top - margin - offset;

    let placement: 'bottom' | 'top' = 'bottom';
    let top: number | undefined;
    let bottom: number | undefined;
    let maxHeight: number;

    if (spaceBelow < 180 && spaceAbove > spaceBelow) {
      // Flip to open above
      placement = 'top';
      bottom = vh - rect.top + offset;
      maxHeight = Math.min(260, Math.max(120, spaceAbove));
    } else {
      // Open below
      placement = 'bottom';
      top = rect.bottom + offset;
      maxHeight = Math.min(260, Math.max(120, spaceBelow));
    }

    const transformOrigin = `${placement} ${originX}`;

    return {
      left,
      top,
      bottom,
      width: menuWidth,
      maxHeight,
      placement,
      transformOrigin,
    };
  }, [isOpen, triggerRef, isFullWidth, minWidth, margin, offset]);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    const update = () => {
      const next = calculatePosition();
      if (next) {
        setPosition((prev) => (isSamePosition(prev, next) ? prev : next));
      }
    };

    update();

    let rafId: number;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('scroll', handleUpdate, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpen, calculatePosition]);

  return position;
}
