'use client';

import * as React from 'react';
import { SNIPPETS, drawEditor } from './laptopCanvasRenderer';

export interface LaptopLiveCanvasProps {
  isSceneActive?: boolean;
}

export function LaptopLiveCanvas({ isSceneActive = true }: LaptopLiveCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isSceneActiveRef = React.useRef(isSceneActive);
  isSceneActiveRef.current = isSceneActive;

  // Preserve exact typing position, active demo, and interaction state across tab blur
  const stateRef = React.useRef({
    snippetIdx: 0,
    charIdx: 0,
    isHolding: false,
    isErasing: false,
    isInteracted: false,
    isInitialized: false,
  });

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const tickRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    isSceneActiveRef.current = isSceneActive;
    if (!isSceneActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      if (!timerRef.current && stateRef.current.isInitialized) {
        timerRef.current = setTimeout(() => {
          tickRef.current();
        }, 120);
      }
    }
  }, [isSceneActive]);

  React.useEffect(() => {
    if (window.innerWidth < 768) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina internal resolution (420x260 matches the 1.615 aspect ratio of MacBook screen)
    const W = 420;
    const H = 260;
    canvas.width = W;
    canvas.height = H;

    let isDestroyed = false;

    const paint = () => {
      const s = stateRef.current;
      const current = SNIPPETS[s.snippetIdx]!;
      const text = s.isHolding
        ? current.lines.join('\n')
        : current.lines.join('\n').slice(0, Math.max(1, s.charIdx));
      drawEditor(ctx, W, H, text, current.filename, s.snippetIdx, s.isHolding, s.isInteracted);
    };

    const tick = () => {
      if (isDestroyed || !isSceneActiveRef.current) return;

      const s = stateRef.current;
      const current = SNIPPETS[s.snippetIdx]!;
      const currentFullText = current.lines.join('\n');

      if (!s.isHolding && !s.isErasing) {
        // Typing phase: add 1-2 chars per tick
        s.charIdx += Math.floor(Math.random() * 2) + 1;
        if (s.charIdx >= currentFullText.length) {
          s.charIdx = currentFullText.length;
          s.isHolding = true;
          paint();

          // After 700ms, trigger the live micro-interaction (adds dynamic UI content!)
          timerRef.current = setTimeout(() => {
            if (isDestroyed || !isSceneActiveRef.current) return;
            s.isInteracted = true;
            paint();

            // Hold finished interactive demo for 2.8s with ZERO redraws
            timerRef.current = setTimeout(() => {
              s.isErasing = true;
              s.isHolding = false;
              s.isInteracted = false;
              tick();
            }, 2800);
          }, 700);
          return;
        }

        paint();
        timerRef.current = setTimeout(tick, 55);
      } else if (s.isErasing) {
        // Transition to next demo
        s.snippetIdx = (s.snippetIdx + 1) % SNIPPETS.length;
        s.charIdx = 0;
        s.isHolding = false;
        s.isErasing = false;
        s.isInteracted = false;
        paint();
        timerRef.current = setTimeout(tick, 350);
      }
    };

    tickRef.current = tick;

    // Paint initial frame or resume cleanly
    paint();

    const s = stateRef.current;
    if (!s.isInitialized) {
      s.isInitialized = true;
      timerRef.current = setTimeout(tick, 400);
    } else if (isSceneActiveRef.current && !timerRef.current) {
      timerRef.current = setTimeout(tick, 100);
    }

    return () => {
      isDestroyed = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-full h-full object-cover select-none pointer-events-none"
    />
  );
}
