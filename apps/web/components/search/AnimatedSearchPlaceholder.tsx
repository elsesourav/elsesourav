'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export interface AnimatedSearchPlaceholderProps {
  prefix?: string;
  words?: string[];
  interval?: number;
  className?: string;
  showEllipsis?: boolean;
}

const DEFAULT_WORDS = ['apps', 'updates', 'tools', 'articles', 'projects', 'experiments'];

/**
 * AnimatedSearchPlaceholder
 * Displays a constant prefix (e.g. "Search ") with rotating suffix words
 * that slide in smoothly from bottom to top in an infinite loop.
 * Fully accessible with automatic prefers-reduced-motion fallback.
 */
export function AnimatedSearchPlaceholder({
  prefix = 'Search ',
  words = DEFAULT_WORDS,
  interval = 2400,
  className = '',
  showEllipsis = true,
}: AnimatedSearchPlaceholderProps) {
  const [index, setIndex] = React.useState(0);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (shouldReduceMotion || words.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval, shouldReduceMotion]);

  const currentWord = words[index] ?? words[0];

  return (
    <span
      className={`inline-flex items-center select-none pointer-events-none leading-none ${className}`}
      aria-hidden="true"
    >
      <span className="whitespace-pre shrink-0">{prefix}</span>
      <span className="relative inline-flex h-[1.4em] overflow-hidden items-center">
        {shouldReduceMotion ? (
          <span className="whitespace-nowrap">{currentWord}{showEllipsis ? '...' : ''}</span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={currentWord}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{
                y: { type: 'spring', stiffness: 320, damping: 30 },
                opacity: { duration: 0.22 },
              }}
              className="inline-block whitespace-nowrap will-change-transform"
            >
              {currentWord}{showEllipsis ? '...' : ''}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </span>
  );
}
