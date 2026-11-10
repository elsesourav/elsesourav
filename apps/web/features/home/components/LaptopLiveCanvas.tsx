'use client';

import * as React from 'react';
import { SNIPPETS, drawEditor } from './laptopCanvasRenderer';

export interface LaptopLiveCanvasProps {
  isSceneActive?: boolean;
  isMobile?: boolean;
}

function generateShuffledDeck(count: number, avoidFirst?: number): number[] {
  const deck = Array.from({ length: count }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i]!;
    deck[i] = deck[j]!;
    deck[j] = temp;
  }
  // Ensure the very first item does not repeat avoidFirst if there are multiple options
  if (avoidFirst !== undefined && deck[0] === avoidFirst && count > 1) {
    const swapTarget = Math.floor(Math.random() * (count - 1)) + 1;
    const temp = deck[0]!;
    deck[0] = deck[swapTarget]!;
    deck[swapTarget] = temp;
  }
  return deck;
}

export function LaptopLiveCanvas({
  isSceneActive = true,
  isMobile = false,
}: LaptopLiveCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isSceneActiveRef = React.useRef(isSceneActive);
  isSceneActiveRef.current = isSceneActive;
  const isMobileRef = React.useRef(isMobile);
  isMobileRef.current = isMobile;

  // Deck of non-repeating randomized snippet indices
  const deckRef = React.useRef<number[]>([]);

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

  // Function to pull the next random snippet without back-to-back repetitions
  const getNextSnippet = React.useCallback((): number => {
    const lastSnippet = stateRef.current.snippetIdx;
    if (deckRef.current.length === 0) {
      deckRef.current = generateShuffledDeck(SNIPPETS.length, lastSnippet);
    }
    return deckRef.current.shift() ?? 0;
  }, []);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Internal resolution (320x198 on mobile for CPU efficiency, 420x260 on desktop for retina)
    const W = isMobileRef.current ? 320 : 420;
    const H = isMobileRef.current ? 198 : 260;
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
      const mobile = isMobileRef.current;

      if (!s.isHolding && !s.isErasing) {
        // Typing phase: natural randomized bursts (1-3 chars per tick)
        const burst = mobile
          ? Math.random() < 0.35 ? 3 : 2
          : Math.random() < 0.25 ? 3 : Math.floor(Math.random() * 2) + 1;
        s.charIdx += burst;
        if (s.charIdx >= currentFullText.length) {
          s.charIdx = currentFullText.length;
          s.isHolding = true;
          paint();

          // After 550-800ms, trigger the live micro-interaction (dynamic game/app UI!)
          const interactionDelay = 550 + Math.floor(Math.random() * 250);
          timerRef.current = setTimeout(() => {
            if (isDestroyed || !isSceneActiveRef.current) return;
            s.isInteracted = true;
            paint();

            // Hold finished interactive demo for 2.6s - 3.4s
            const holdDuration = 2600 + Math.floor(Math.random() * 800);
            timerRef.current = setTimeout(() => {
              s.isErasing = true;
              s.isHolding = false;
              s.isInteracted = false;
              tick();
            }, holdDuration);
          }, interactionDelay);
          return;
        }

        paint();
        // Variable typing speed rhythm (65-85ms on mobile, 45-65ms on desktop)
        const typeSpeed = mobile
          ? 68 + Math.floor(Math.random() * 20)
          : 48 + Math.floor(Math.random() * 18);
        timerRef.current = setTimeout(tick, typeSpeed);
      } else if (s.isErasing) {
        // Pick next random snippet from shuffled deck (guaranteed non-repeating back-to-back)
        s.snippetIdx = getNextSnippet();
        s.charIdx = 0;
        s.isHolding = false;
        s.isErasing = false;
        s.isInteracted = false;
        paint();
        // Short randomized pause before starting to type next code (200-340ms)
        const nextDelay = 200 + Math.floor(Math.random() * 140);
        timerRef.current = setTimeout(tick, nextDelay);
      }
    };

    tickRef.current = tick;

    const s = stateRef.current;
    if (!s.isInitialized) {
      // Pick starting snippet fully randomly on first load
      deckRef.current = generateShuffledDeck(SNIPPETS.length);
      s.snippetIdx = deckRef.current.shift() ?? 0;
      s.isInitialized = true;
      paint();
      timerRef.current = setTimeout(tick, 350);
    } else {
      paint();
      if (isSceneActiveRef.current && !timerRef.current) {
        timerRef.current = setTimeout(tick, 100);
      }
    }

    return () => {
      isDestroyed = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [getNextSnippet]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-full h-full object-cover select-none pointer-events-none"
    />
  );
}
