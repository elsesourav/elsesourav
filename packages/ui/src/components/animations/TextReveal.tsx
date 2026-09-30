'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface TextRevealProps {
  children: string;
  type?: 'words' | 'chars' | 'lines';
  stagger?: number;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'rotate';
  once?: boolean;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
}

/**
 * TextReveal - 100% Standalone (Zero dependencies)
 * Animates text words or characters on scroll using native IntersectionObserver and 3D transforms.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  type = 'words',
  stagger = 0.04,
  duration = 0.8,
  delay = 0,
  direction = 'up',
  once = true,
  className = '',
  wordClassName = '',
  charClassName = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'down':
        return 'translate3d(0, -110%, 0) rotateX(-20deg)';
      case 'rotate':
        return 'translate3d(0, 100%, 0) rotateX(90deg)';
      case 'up':
      default:
        return 'translate3d(0, 110%, 0) rotateX(25deg)';
    }
  };

  const initialTransform = getInitialTransform();

  if (type === 'chars') {
    const words = children.split(' ');
    let globalCharIndex = 0;

    return (
      <span
        ref={containerRef}
        className={`inline-block overflow-hidden ${className}`}
        style={{ perspective: '1000px' }}
      >
        {words.map((word, wIdx) => (
          <span key={wIdx} className={`inline-block whitespace-nowrap mr-[0.25em] ${wordClassName}`}>
            {word.split('').map((char, cIdx) => {
              const itemDelay = delay + globalCharIndex * stagger;
              globalCharIndex++;

              return (
                <span
                  key={cIdx}
                  className={`inline-block transition-all ${charClassName}`}
                  style={{
                    display: 'inline-block',
                    transform: isVisible ? 'translate3d(0, 0, 0) rotateX(0deg)' : initialTransform,
                    opacity: isVisible ? 1 : 0,
                    transitionDuration: `${duration}s`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${itemDelay}s`,
                    willChange: 'transform, opacity',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    );
  }

  // Default: words
  const words = children.split(' ');

  return (
    <span
      ref={containerRef}
      className={`inline-block overflow-hidden ${className}`}
      style={{ perspective: '1000px' }}
    >
      {words.map((word, idx) => {
        const itemDelay = delay + idx * stagger;

        return (
          <span
            key={idx}
            className={`inline-block mr-[0.25em] whitespace-nowrap overflow-hidden align-top ${wordClassName}`}
          >
            <span
              className="inline-block transition-all"
              style={{
                transform: isVisible ? 'translate3d(0, 0, 0) rotateX(0deg)' : initialTransform,
                opacity: isVisible ? 1 : 0,
                transitionDuration: `${duration}s`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: `${itemDelay}s`,
                willChange: 'transform, opacity',
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export default TextReveal;
