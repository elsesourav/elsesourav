'use client';

import React from 'react';

export interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number; // In seconds
  distance?: number; // In px
  delay?: number; // In seconds
  className?: string;
  rotate?: number; // Subtle tilt oscillation in degrees
}

/**
 * FloatingElement - 100% Standalone (Zero dependencies)
 * Adds an effortless, premium levitation float effect to cards, badges, and icons.
 */
export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  duration = 4,
  distance = 12,
  delay = 0,
  className = '',
  rotate = 2,
}) => {
  return (
    <div
      className={`inline-block will-change-transform ${className}`}
      style={{
        animation: `floating-levitate ${duration}s ease-in-out ${delay}s infinite alternate`,
      }}
    >
      {children}

      <style>{`
        @keyframes floating-levitate {
          0% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(0, -${distance}px, 0) rotate(${rotate}deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingElement;
