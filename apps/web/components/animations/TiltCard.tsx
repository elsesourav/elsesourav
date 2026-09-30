'use client';

import React, { useRef, useState } from 'react';

export interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number; // Maximum tilt angle in degrees
  perspective?: number; // Perspective distance in px
  scale?: number; // Scale on hover
  glare?: boolean; // Enable reflection glare effect
  glareOpacity?: number; // Maximum glare opacity
  className?: string;
  onClick?: () => void;
}

/**
 * TiltCard - 100% Standalone (Zero dependencies)
 * Interactive 3D perspective tilt with realistic specular glare reflection.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 12,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  glareOpacity = 0.25,
  className = '',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1; // -1 to 1
    const normY = (y / rect.height) * 2 - 1; // -1 to 1

    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    setTransform(`perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`);

    if (glare) {
      setGlarePos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: glareOpacity,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    if (glare) {
      setGlarePos((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden cursor-pointer will-change-transform ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}

      {glare && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
};

export default TiltCard;
