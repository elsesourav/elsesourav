'use client';

import React, { useRef, useState, useEffect } from 'react';

export type SmoothRevealVariant =
  | 'curtain-left'
  | 'curtain-right'
  | 'curtain-up'
  | 'curtain-down'
  | 'circle'
  | 'scale';

export interface SmoothRevealProps {
  children: React.ReactNode;
  variant?: SmoothRevealVariant;
  duration?: number;
  delay?: number;
  easing?: string;
  once?: boolean;
  className?: string;
}

/**
 * SmoothReveal - 100% Standalone (Zero dependencies)
 * CSS clip-path masks and expansions for images, banners, and hero blocks.
 */
export const SmoothReveal: React.FC<SmoothRevealProps> = ({
  children,
  variant = 'curtain-right',
  duration = 0.9,
  delay = 0,
  easing = 'cubic-bezier(0.77, 0, 0.175, 1)',
  once = true,
  className = '',
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const getClipPath = () => {
    if (isVisible) {
      if (variant === 'circle') return 'circle(150% at 50% 50%)';
      return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
    }

    switch (variant) {
      case 'curtain-right':
        return 'polygon(0 0, 0 0, 0 100%, 0 100%)';
      case 'curtain-left':
        return 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
      case 'curtain-down':
        return 'polygon(0 0, 100% 0, 100% 0, 0 0)';
      case 'curtain-up':
        return 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)';
      case 'circle':
        return 'circle(0% at 50% 50%)';
      case 'scale':
        return 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)';
      default:
        return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
    }
  };

  return (
    <div
      ref={ref}
      className={`overflow-hidden will-change-[clip-path,transform] ${className}`}
      style={{
        clipPath: getClipPath(),
        transform: !isVisible && variant === 'scale' ? 'scale(0.92)' : 'scale(1)',
        opacity: !isVisible && variant === 'scale' ? 0 : 1,
        transitionProperty: 'clip-path, transform, opacity',
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: easing,
      }}
    >
      {children}
    </div>
  );
};

export default SmoothReveal;
