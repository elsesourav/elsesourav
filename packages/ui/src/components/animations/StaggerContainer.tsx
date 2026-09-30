'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number; // Delay between items in seconds
  initialDelay?: number; // Initial delay in seconds
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  distance?: number;
  once?: boolean;
  className?: string;
  itemClassName?: string;
  as?: React.ElementType;
}

/**
 * StaggerContainer - 100% Standalone (Zero dependencies)
 * Staggers children entrance transitions when scrolled into view.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 30,
  once = true,
  className = '',
  itemClassName = '',
  as: Component = 'div',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
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
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'scale':
        return 'scale(0.9)';
      case 'none':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const initialTransform = getInitialTransform();

  return (
    <Component ref={containerRef} className={className}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;

        const delay = initialDelay + idx * staggerDelay;

        return (
          <div
            className={`transition-all ${itemClassName}`}
            style={{
              transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : initialTransform,
              opacity: isVisible ? 1 : 0,
              transitionDuration: `${duration}s`,
              transitionDelay: `${delay}s`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform, opacity',
            }}
          >
            {child}
          </div>
        );
      })}
    </Component>
  );
};

export default StaggerContainer;
