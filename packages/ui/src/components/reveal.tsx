'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode;
  readonly direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  readonly distance?: number;
  readonly delay?: number;
  readonly duration?: number;
  readonly threshold?: number;
  readonly once?: boolean;
  readonly as?: React.ElementType;
  readonly className?: string;
}

export function useScrollReveal(options: {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
} = {}) {
  const { threshold = 0.12, once = true, rootMargin = '0px 0px -30px 0px' } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsRevealed(true);
      return;
    }

    // Fallback if IntersectionObserver is unavailable
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, rootMargin]);

  return { ref, isRevealed };
}

export function Reveal({
  children,
  direction = 'up',
  distance = 14,
  delay = 0,
  duration = 0.38,
  threshold = 0.12,
  once = true,
  as: Component = 'div',
  className,
  style,
  ...props
}: RevealProps) {
  const { ref, isRevealed } = useScrollReveal({ threshold, once });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTransform = () => {
    if (!isMounted || isRevealed) return 'none';
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'fade':
      default:
        return 'none';
    }
  };

  const dynamicStyle: React.CSSProperties = {
    ...style,
    opacity: !isMounted || isRevealed ? 1 : 0,
    transform: getTransform(),
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}s`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}s`,
    willChange: isMounted && !isRevealed ? 'opacity, transform' : 'auto',
  };

  return (
    <Component
      ref={ref}
      className={cn('reveal-container', className)}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface RevealGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode;
  readonly staggerDelay?: number;
  readonly baseDelay?: number;
  readonly direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  readonly distance?: number;
  readonly duration?: number;
  readonly as?: React.ElementType;
  readonly className?: string;
}

export function RevealGroup({
  children,
  staggerDelay = 0.06,
  baseDelay = 0,
  direction = 'up',
  distance = 14,
  duration = 0.38,
  as: Component = 'div',
  className,
  ...props
}: RevealGroupProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <Component className={className} {...props}>
      {childrenArray.map((child, index) => {
        const itemDelay = baseDelay + Math.min(index * staggerDelay, 0.3);
        return (
          <Reveal
            key={index}
            direction={direction}
            distance={distance}
            delay={itemDelay}
            duration={duration}
          >
            {child}
          </Reveal>
        );
      })}
    </Component>
  );
}
