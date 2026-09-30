'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number; // Maximum translation in px
  radius?: number; // Distance in px where magnet activates
  ease?: number; // Lerp speed (0 to 1)
  className?: string;
  onClick?: () => void;
  as?: React.ElementType;
}

/**
 * MagneticButton - 100% Standalone (Zero dependencies)
 * Pulls towards the cursor with spring physics and returns smoothly to center.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 30,
  radius = 120,
  ease = 0.15,
  className = '',
  onClick,
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (dist < radius) {
        isHovered.current = true;
        const normX = (e.clientX - centerX) / radius;
        const normY = (e.clientY - centerY) / radius;
        targetPos.current = {
          x: normX * strength,
          y: normY * strength,
        };
      } else if (isHovered.current) {
        isHovered.current = false;
        targetPos.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth lerp loop via requestAnimationFrame
    const update = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      // Only update state if there is noticeable difference to avoid redundant renders
      if (
        Math.abs(targetPos.current.x - currentPos.current.x) > 0.05 ||
        Math.abs(targetPos.current.y - currentPos.current.y) > 0.05
      ) {
        setPos({ x: currentPos.current.x, y: currentPos.current.y });
      } else if (!isHovered.current && (currentPos.current.x !== 0 || currentPos.current.y !== 0)) {
        currentPos.current = { x: 0, y: 0 };
        setPos({ x: 0, y: 0 });
      }

      animFrameId.current = requestAnimationFrame(update);
    };

    animFrameId.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [radius, strength, ease]);

  return (
    <Component
      ref={ref}
      onClick={onClick}
      className={`inline-block cursor-pointer will-change-transform ${className}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: isHovered.current ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {children}
    </Component>
  );
};

export default MagneticButton;
