'use client';

import { useState, useCallback, useId } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppStarRatingProps {
  /** Current rating value (1–5), or 0 for no selection */
  value: number;
  /** Called when user selects a star */
  onChange?: (rating: number) => void;
  /** Whether the stars are interactive */
  readonly?: boolean;
  /** Size of star icons */
  size?: 'sm' | 'md' | 'lg';
  /** Show numeric label next to stars */
  showLabel?: boolean;
}

const SIZE_MAP = {
  sm: { icon: 14, gap: 'gap-0.5' },
  md: { icon: 20, gap: 'gap-1' },
  lg: { icon: 28, gap: 'gap-1.5' },
} as const;

const STAR_LABELS = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'] as const;

export function AppStarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}: AppStarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const uniqueId = useId();
  const config = SIZE_MAP[size];
  const displayValue = hoverValue || value;

  const handleClick = useCallback(
    (star: number) => {
      if (!readonly && onChange) {
        onChange(star);
      }
    },
    [readonly, onChange]
  );

  return (
    <div className="inline-flex items-center" role="group" aria-label="Star rating">
      <div className={`inline-flex items-center ${config.gap}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          const isInteractive = !readonly && onChange;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              aria-label={`Rate ${star} out of 5: ${STAR_LABELS[star - 1]}`}
              aria-pressed={star <= value}
              id={`${uniqueId}-star-${star}`}
              className={`
                relative transition-all duration-150
                ${
                  isInteractive
                    ? 'cursor-pointer hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm'
                    : 'cursor-default'
                }
                ${readonly ? 'pointer-events-none' : ''}
              `}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readonly && setHoverValue(star)}
              onMouseLeave={() => !readonly && setHoverValue(0)}
              onFocus={() => !readonly && setHoverValue(star)}
              onBlur={() => !readonly && setHoverValue(0)}
            >
              <motion.div
                animate={{
                  scale: isFilled ? 1 : 0.9,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Star
                  size={config.icon}
                  className={`transition-colors duration-150 ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                      : 'text-[hsl(var(--muted-foreground))]/40'
                  }`}
                />
              </motion.div>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {showLabel && displayValue > 0 && (
          <motion.span
            key={displayValue}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.15 }}
            className="ml-2 text-xs font-medium text-[hsl(var(--muted-foreground))]"
          >
            {STAR_LABELS[displayValue - 1]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
