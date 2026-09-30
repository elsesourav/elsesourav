'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number; // E.g. -0.2 (slower) or 0.2 (faster)
  direction?: 'vertical' | 'horizontal';
  className?: string;
  as?: React.ElementType;
}

/**
 * ParallaxScroll - 100% Standalone (Zero dependencies)
 * Native requestAnimationFrame smooth parallax scrolling effect.
 */
export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  speed = 0.15,
  direction = 'vertical',
  className = '',
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (animFrameId.current) return;

      animFrameId.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) {
          animFrameId.current = null;
          return;
        }

        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Check if element is reasonably within view range
        if (rect.bottom >= -200 && rect.top <= windowHeight + 200) {
          const centerY = rect.top + rect.height / 2;
          const viewportCenter = windowHeight / 2;
          const diff = centerY - viewportCenter;
          setOffset(diff * speed);
        }

        animFrameId.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [speed]);

  const transform =
    direction === 'vertical'
      ? `translate3d(0, ${offset.toFixed(2)}px, 0)`
      : `translate3d(${offset.toFixed(2)}px, 0, 0)`;

  return (
    <Component
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform,
      }}
    >
      {children}
    </Component>
  );
};

export default ParallaxScroll;
