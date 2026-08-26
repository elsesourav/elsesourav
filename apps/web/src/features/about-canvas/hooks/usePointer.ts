import { useEffect, useRef } from "react";
import type { PointerState } from "../types/particle";

export function usePointer(
  containerRef: React.RefObject<HTMLElement | null>,
  logicalWidth: number,
  logicalHeight: number
) {
  // Use a ref to hold pointer state so we don't trigger React re-renders
  const pointerRef = useRef<PointerState>({
    x: -1000,
    y: -1000,
    isActive: false,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const scaleX = logicalWidth / rect.width;
      const scaleY = logicalHeight / rect.height;
      pointerRef.current.x = (e.clientX - rect.left) * scaleX;
      pointerRef.current.y = (e.clientY - rect.top) * scaleY;
      pointerRef.current.isActive = true;
    };

    const handlePointerLeave = () => {
      pointerRef.current.isActive = false;
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [containerRef, logicalWidth, logicalHeight]);

  return pointerRef;
}
