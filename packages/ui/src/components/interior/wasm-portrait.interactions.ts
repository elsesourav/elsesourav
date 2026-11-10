import React, { useRef, useCallback } from 'react';
import type { WasmPortraitBridge } from './wasm-portrait.bridge';

export interface UsePortraitInteractionsOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  bridgeRef: React.RefObject<WasmPortraitBridge | null>;
}

export function usePortraitInteractions({
  containerRef,
  bridgeRef,
}: UsePortraitInteractionsOptions) {
  const isTouchingRef = useRef(false);
  const lastTouchPosRef = useRef({ x: 0, y: 0 });
  const lastTouchEndTimeRef = useRef(0);

  const getCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: 1 - ((clientY - rect.top) / rect.height) * 2,
      };
    },
    [containerRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!bridgeRef.current) return;
      const coords = getCoords(e.clientX, e.clientY);
      if (!coords) return;
      if (e.pointerType === 'touch') {
        isTouchingRef.current = true;
        lastTouchPosRef.current = coords;
        // Mobile touch start: hover displacement ONLY (never trigger click blast on down)
        bridgeRef.current.setPointer(coords.x, coords.y, false);
      } else {
        bridgeRef.current.setPointer(coords.x, coords.y, true);
      }
    },
    [bridgeRef, getCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!bridgeRef.current) return;
      const coords = getCoords(e.clientX, e.clientY);
      if (!coords) return;
      if (e.pointerType === 'touch') {
        if (isTouchingRef.current) {
          lastTouchPosRef.current = coords;
          // Mobile touch drag: smooth hover displacement ONLY
          bridgeRef.current.setPointer(coords.x, coords.y, false);
        }
      } else {
        bridgeRef.current.setPointer(coords.x, coords.y, false);
      }
    },
    [bridgeRef, getCoords]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!bridgeRef.current) return;
      const coords = getCoords(e.clientX, e.clientY) || lastTouchPosRef.current;
      if (e.pointerType === 'touch' || isTouchingRef.current) {
        isTouchingRef.current = false;
        lastTouchEndTimeRef.current = performance.now();
        // On touch release, always trigger burst!
        bridgeRef.current.burst(coords.x, coords.y);
      }
      bridgeRef.current.setPointer(-999, -999, false);
    },
    [bridgeRef, getCoords]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!bridgeRef.current) return;
      if (isTouchingRef.current) {
        isTouchingRef.current = false;
        lastTouchEndTimeRef.current = performance.now();
        const { x, y } = lastTouchPosRef.current;
        bridgeRef.current.burst(x, y);
      }
      bridgeRef.current.setPointer(-999, -999, false);
    },
    [bridgeRef]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!bridgeRef.current || performance.now() - lastTouchEndTimeRef.current < 450) return;
      const coords = getCoords(e.clientX, e.clientY);
      if (coords) bridgeRef.current.burst(coords.x, coords.y);
    },
    [bridgeRef, getCoords]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerLeave,
    handlePointerUp,
    handleClick,
  };
}
