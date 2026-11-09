'use client';

import * as React from 'react';
import {
  LOGO_PIXEL_DATA,
  toLightweightPixels,
  type LogoPixelTuple,
} from './logoPixelData';
import {
  getAdaptiveParticleStep,
  createParticlesFromPixels,
  FrameBenchmark,
  type LoadingParticle,
} from './loadingEngine';

export interface CanvasLogoLoaderProps {
  /** Visual diameter of the assembled logo ring in CSS pixels (default: 240) */
  size?: number;
  /** Duration in milliseconds for the initial flight convergence (default: 520) */
  durationMs?: number;
  /** Custom pre-sampled pixel data tuples [x, y, r, g, b, a] */
  pixelData?: readonly LogoPixelTuple[];
  /** Optional custom logo image / SVG URL (kept for prop compatibility) */
  logoUrl?: string;
  /** Whether the canvas spans the full screen display (default: false) */
  fullScreen?: boolean;
  /** Whether the animation is currently active (if false, pause RAF and clear canvas) */
  active?: boolean;
  /** Callback fired once particles assemble and sequence finishes */
  onComplete?: () => void;
  /** Optional extra CSS classes for the canvas container */
  className?: string;
}

export function CanvasLogoLoader({
  size = 240,
  durationMs = 520,
  pixelData,
  fullScreen = false,
  active = true,
  onComplete,
  className = '',
}: CanvasLogoLoaderProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Authoritative lightweight pixel points matrix (synchronous, 0ms latency, zero runtime fetch)
  const activePixels = React.useMemo(() => {
    if (pixelData && pixelData.length > 0) {
      return toLightweightPixels(pixelData);
    }
    return LOGO_PIXEL_DATA;
  }, [pixelData]);

  // Persistent animation refs
  const particlesRef = React.useRef<LoadingParticle[]>([]);
  const startTimeRef = React.useRef<number>(0);
  const hasCompletedRef = React.useRef<boolean>(false);
  const initializedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!active) {
      // Animation paused; clear canvas and reset flight clock
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      startTimeRef.current = 0;
      hasCompletedRef.current = false;
      initializedRef.current = false;
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const { step: particleStep } = getAdaptiveParticleStep();
    const benchmark = new FrameBenchmark();

    let viewWidth = fullScreen && typeof window !== 'undefined' ? window.innerWidth : size;
    let viewHeight = fullScreen && typeof window !== 'undefined' ? window.innerHeight : size;

    canvas.width = viewWidth * dpr;
    canvas.height = viewHeight * dpr;

    let cx = (viewWidth * dpr) / 2;
    let cy = (viewHeight * dpr) / 2;

    const logoDisplaySize = size * 0.44 * dpr;
    const pixelUnit = logoDisplaySize / 64;
    const ringRadius = size * 0.38 * dpr;
    const ringWidth = Math.max(2, 2.2 * dpr);

    // Instantiate particles with origins strictly outside the viewport
    particlesRef.current = createParticlesFromPixels(
      activePixels,
      cx,
      cy,
      pixelUnit,
      viewWidth * dpr,
      viewHeight * dpr,
      dpr,
      particleStep,
      durationMs,
      prefersReducedMotion
    );
    initializedRef.current = true;
    startTimeRef.current = 0;
    hasCompletedRef.current = false;

    // Laser beam sweep coordinates
    const minDiag = cx + cy - logoDisplaySize * 0.7;
    const maxDiag = cx + cy + logoDisplaySize * 0.7;
    const diagSpan = Math.max(1, maxDiag - minDiag);

    const handleResize = () => {
      if (!canvas || !fullScreen) return;
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;
      canvas.width = viewWidth * dpr;
      canvas.height = viewHeight * dpr;
      const newCx = (viewWidth * dpr) / 2;
      const newCy = (viewHeight * dpr) / 2;
      const shiftX = newCx - cx;
      const shiftY = newCy - cy;
      cx = newCx;
      cy = newCy;

      for (const p of particlesRef.current) {
        p.targetX += shiftX;
        p.targetY += shiftY;
        p.startX += shiftX;
        p.startY += shiftY;
        p.currentX += shiftX;
        p.currentY += shiftY;
        p.diagSum = p.targetX + p.targetY;
      }
    };

    if (fullScreen) {
      window.addEventListener('resize', handleResize);
    }

    let animationFrameId: number;

    const render = (currentTime: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const isAssembled = elapsed >= durationMs;
      const isDowngraded = benchmark.recordFrame(currentTime);

      // Strictly transparent canvas background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ─── 1. OUTER ROTATING ENERGY RING ───
      const ringRotation = (elapsed * 0.0028) % (Math.PI * 2);

      // Ambient background orbital track
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.lineWidth = ringWidth;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.stroke();

      // Glowing active arc
      const progress = Math.min(1, elapsed / durationMs);
      const arcSweep = isAssembled
        ? Math.PI * (0.8 + 0.3 * Math.sin(elapsed * 0.0035))
        : Math.PI * (0.35 + 1.25 * Math.sin(progress * Math.PI * 0.5));
      const startAngle = ringRotation;
      const endAngle = startAngle + arcSweep;

      ctx.save();
      if (!isDowngraded) {
        ctx.shadowBlur = 8 * dpr;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.45)';
      }

      const ringGrad = ctx.createLinearGradient(
        cx + Math.cos(startAngle) * ringRadius,
        cy + Math.sin(startAngle) * ringRadius,
        cx + Math.cos(endAngle) * ringRadius,
        cy + Math.sin(endAngle) * ringRadius
      );
      ringGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      ringGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.85)');
      ringGrad.addColorStop(1, 'rgba(168, 85, 247, 0.95)');

      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = ringWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Orbital satellite node on the leading tip
      const headX = cx + Math.cos(endAngle) * ringRadius;
      const headY = cy + Math.sin(endAngle) * ringRadius;
      ctx.save();
      if (!isDowngraded) {
        ctx.shadowBlur = 10 * dpr;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
      }
      ctx.beginPath();
      ctx.arc(headX, headY, ringWidth * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.restore();

      // ─── 2. REPEATING GLOW & SHIMMER PHASE ───
      const particleBaseSize = pixelUnit * 3.4;
      const postAssemblyElapsed = Math.max(0, elapsed - durationMs);
      const glowCycleDuration = 2000;
      const cycleTime = postAssemblyElapsed % glowCycleDuration;

      let sweepPos = -999;
      let sweepActive = false;
      const sweepDuration = 600;

      if (isAssembled && cycleTime <= sweepDuration) {
        sweepActive = true;
        const sweepFactor = cycleTime / sweepDuration;
        sweepPos = minDiag + sweepFactor * diagSpan;
      }

      // ─── 3. LOGO PARTICLES INTERPOLATION & RENDER ───
      const particles = particlesRef.current;
      const particleCount = particles.length;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        if (!p) continue;

        if (prefersReducedMotion || isAssembled) {
          p.currentX = p.targetX;
          p.currentY = p.targetY;
          p.currentAlpha = p.targetAlpha;
        } else if (elapsed <= p.delayMs) {
          p.currentX = p.startX;
          p.currentY = p.startY;
          p.currentAlpha = 0;
        } else {
          // Smooth parametric cubic ease-out: pure continuous motion, zero sudden pop
          const t = Math.min(1, Math.max(0, (elapsed - p.delayMs) / p.flightDurationMs));
          const ease = 1 - Math.pow(1 - t, 3);
          p.currentX = p.startX + (p.targetX - p.startX) * ease;
          p.currentY = p.startY + (p.targetY - p.startY) * ease;
          p.currentAlpha = p.startAlpha + (p.targetAlpha - p.startAlpha) * ease;
        }

        const renderX = p.currentX;
        let renderY = p.currentY;
        let r = p.r;
        let g = p.g;
        let b = p.b;
        let pSize = particleBaseSize;

        // Post-assembly breathing float & repeating beam shimmer wave
        if (isAssembled && !prefersReducedMotion) {
          const breath = Math.sin(postAssemblyElapsed * 0.0035 + p.targetX * 0.04) * (0.6 * dpr);
          renderY += breath;

          if (sweepActive) {
            const distToBeam = Math.abs(p.diagSum - sweepPos);
            const beamRadius = 24 * dpr;
            if (distToBeam < beamRadius) {
              const intensity = 1 - distToBeam / beamRadius;
              r = Math.min(255, Math.round(r + (255 - r) * intensity * 0.9));
              g = Math.min(255, Math.round(g + (255 - g) * intensity * 0.95));
              b = 255;
              pSize = particleBaseSize * (1 + intensity * 0.25);
            }
          }
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, p.currentAlpha))})`;
        ctx.fillRect(renderX - pSize / 2, renderY - pSize / 2, pSize, pSize);
      }

      // ─── 4. REPEATING SHOCKWAVE PULSE RING ───
      if (isAssembled && !prefersReducedMotion && !isDowngraded) {
        const pulseStart = sweepDuration;
        const pulseDuration = 600;
        if (cycleTime >= pulseStart && cycleTime <= pulseStart + pulseDuration) {
          const pulseFactor = (cycleTime - pulseStart) / pulseDuration;
          const pulseRadius = ringRadius + pulseFactor * 20 * dpr;
          const pulseAlpha = (1 - pulseFactor) * 0.3;

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${pulseAlpha})`;
          ctx.lineWidth = Math.max(1, (1 - pulseFactor) * 2 * dpr);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Completion callback
      if (isAssembled && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (fullScreen) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [size, durationMs, fullScreen, active, activePixels]);

  return (
    <div
      className={
        fullScreen
          ? `fixed inset-0 top-0 left-0 w-screen h-screen pointer-events-none z-0 ${className}`
          : `relative flex items-center justify-center ${className}`
      }
      style={fullScreen ? undefined : { width: size, height: size }}
      role="img"
      aria-label="Lightweight dynamic logo loading animation"
    >
      <canvas
        ref={canvasRef}
        className={fullScreen ? 'fixed inset-0 top-0 left-0 w-screen h-screen pointer-events-none' : ''}
        style={{
          width: fullScreen ? '100vw' : size,
          height: fullScreen ? '100vh' : size,
          display: 'block',
        }}
      />
    </div>
  );
}
