'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface ScrollTriggerFadeProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'blur' | 'none';
  distance?: number;
  duration?: number;
  delay?: number;
  easing?: string;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  blur?: boolean;
  className?: string;
  as?: React.ElementType;
}

/**
 * ScrollTriggerFade - 100% Standalone (Zero dependencies)
 * Directional fade, slide, zoom, and blur in when entering the viewport.
 */
export const ScrollTriggerFade: React.FC<ScrollTriggerFadeProps> = ({
  children,
  direction = 'up',
  distance = 36,
  duration = 0.7,
  delay = 0,
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
  once = true,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  blur = false,
  className = '',
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(el);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';

    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'zoom':
        return 'scale(0.88)';
      case 'none':
      case 'blur':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const getFilter = () => {
    if (isVisible) return 'blur(0px)';
    if (direction === 'blur' || blur) return 'blur(10px)';
    return 'none';
  };

  return (
    <Component
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        filter: getFilter(),
        transitionProperty: 'transform, opacity, filter',
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: easing,
      }}
    >
      {children}
    </Component>
  );
};

export default ScrollTriggerFade;
