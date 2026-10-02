'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export type AmbientBackgroundVariant =
  'home' | 'apps' | 'project' | 'notes' | 'about' | 'help' | 'minimal';

export interface AmbientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AmbientBackgroundVariant;
  enableNoise?: boolean;
  enableMotion?: boolean;
  enablePointerGlow?: boolean;
}

/**
 * AmbientBackground
 *
 * Full-screen, atmospheric, hardware-accelerated background system.
 * Delivers deep visual atmosphere, theme responsiveness (Dark / Light),
 * and page-specific personality across all screen sizes.
 *
 * Stacking: fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none.
 */
export function AmbientBackground({
  variant = 'home',
  enableNoise = true,
  enableMotion = true,
  enablePointerGlow = true,
  className,
  ...props
}: AmbientBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pointerPos, setPointerPos] = React.useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Desktop Pointer Ambient Glow (RAF-throttled, zero click interception, disabled on mobile/touch & reduced motion)
  React.useEffect(() => {
    if (!enablePointerGlow) return;

    // Check for fine pointer and lack of reduced-motion preference
    const mediaHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!mediaHover.matches || mediaReduced.matches) return;

    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setPointerPos({ x: latestX, y: latestY, active: true });
          rafId = null;
        });
      }
    };

    const handlePointerLeave = () => {
      setPointerPos((prev) => ({ ...prev, active: false }));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [enablePointerGlow]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[hsl(var(--background))] transition-colors duration-500',
        className
      )}
      {...props}
    >
      {/* =========================================================================
          1. Base Atmosphere Gradient Mesh (Continuous full-page multi-radial shading)
          ========================================================================= */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-50 pointer-events-none"
        style={{
          background:
            'radial-gradient(110% 70% at 50% 0%, var(--ambient-glow-1) 0%, transparent 60%), radial-gradient(60% 45% at 80% 20%, var(--ambient-glow-3) 0%, transparent 55%), radial-gradient(50% 35% at 15% 55%, var(--ambient-glow-2) 0%, transparent 50%)',
        }}
      />

      {/* =========================================================================
          2. Page-Specific Ambient Glow Fields
          ========================================================================= */}

      {/* --- HOMEPAGE VARIANT --- */}
      {variant === 'home' && (
        <>
          {/* Upper-right soft cosmic aura directly behind the orb */}
          <div
            className={cn(
              'absolute top-[6%] right-[6%] sm:right-[10%] w-[380px] sm:w-[580px] lg:w-[720px] h-[380px] sm:h-[580px] lg:h-[720px] rounded-full blur-[100px] sm:blur-[140px] opacity-75 dark:opacity-65',
              enableMotion && 'animate-ambient-drift-2'
            )}
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-1) 0%, var(--ambient-glow-3) 40%, transparent 70%)',
            }}
          />

          {/* Gentle top-left headline ambient wash */}
          <div
            className="absolute -top-24 left-[10%] w-[320px] sm:w-[500px] h-[260px] sm:h-[400px] rounded-full blur-[90px] sm:blur-[130px] opacity-50 dark:opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at center, var(--ambient-glow-2) 0%, transparent 65%)',
            }}
          />

          {/* Subtle mid-page left-side accent for featured apps */}
          <div
            className="absolute top-[48%] -left-20 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full blur-[100px] sm:blur-[140px] opacity-40 dark:opacity-35"
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-2) 0%, transparent 65%)',
            }}
          />

          {/* Subtle lower-page right-side accent for updates */}
          <div
            className="absolute top-[72%] -right-20 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full blur-[110px] sm:blur-[150px] opacity-40 dark:opacity-35"
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-3) 0%, transparent 65%)',
            }}
          />
        </>
      )}

      {/* --- APPS CATALOG VARIANT --- */}
      {variant === 'apps' && (
        <>
          {/* Technical upper ambient horizon */}
          <div
            className={cn(
              'absolute -top-24 sm:-top-36 left-1/2 -translate-x-1/2 w-[340px] sm:w-[800px] lg:w-[1150px] h-[240px] sm:h-[480px] lg:h-[620px] rounded-full blur-[60px] sm:blur-[110px] lg:blur-[140px] opacity-90 dark:opacity-85',
              enableMotion && 'animate-ambient-drift-1'
            )}
            style={{
              background:
                'radial-gradient(ellipse at center, var(--ambient-glow-1) 0%, var(--ambient-glow-2) 52%, transparent 76%)',
            }}
          />

          {/* Mid-page subtle matrix glow */}
          <div
            className="hidden sm:block absolute top-1/2 -left-24 w-[450px] h-[450px] rounded-full blur-[120px] opacity-50 dark:opacity-40"
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-2) 0%, transparent 65%)',
            }}
          />
        </>
      )}

      {/* --- PROJECT DETAIL VARIANT --- */}
      {variant === 'project' && (
        <>
          {/* Product showcase focused upper aura */}
          <div
            className={cn(
              'absolute -top-20 sm:-top-32 left-1/2 -translate-x-1/2 w-[340px] sm:w-[750px] lg:w-[1050px] h-[250px] sm:h-[460px] lg:h-[580px] rounded-full blur-[60px] sm:blur-[100px] lg:blur-[130px] opacity-95 dark:opacity-90',
              enableMotion && 'animate-ambient-drift-1'
            )}
            style={{
              background:
                'radial-gradient(ellipse at center, var(--ambient-glow-1) 0%, var(--ambient-glow-3) 45%, transparent 72%)',
            }}
          />

          {/* Right edge secondary depth accent */}
          <div
            className="hidden md:block absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full blur-[110px] opacity-60 dark:opacity-50"
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-2) 0%, transparent 65%)',
            }}
          />
        </>
      )}

      {/* --- NOTES / EDITORIAL VARIANT --- */}
      {variant === 'notes' && (
        <>
          {/* Calm, restful reading atmosphere centered at top */}
          <div
            className="absolute -top-20 sm:-top-32 left-1/2 -translate-x-1/2 w-[320px] sm:w-[700px] lg:w-[950px] h-[220px] sm:h-[420px] lg:h-[520px] rounded-full blur-[60px] sm:blur-[110px] lg:blur-[140px] opacity-75 dark:opacity-70"
            style={{
              background:
                'radial-gradient(ellipse at center, var(--ambient-glow-1) 0%, var(--ambient-glow-2) 40%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* --- ABOUT / PERSONAL STORY VARIANT --- */}
      {variant === 'about' && (
        <>
          {/* Warm, personal ambient highlight */}
          <div
            className={cn(
              'absolute -top-16 sm:-top-28 right-1/4 translate-x-1/4 w-[340px] sm:w-[720px] lg:w-[1000px] h-[240px] sm:h-[450px] lg:h-[560px] rounded-full blur-[60px] sm:blur-[110px] lg:blur-[140px] opacity-85 dark:opacity-80',
              enableMotion && 'animate-ambient-drift-1'
            )}
            style={{
              background:
                'radial-gradient(ellipse at center, var(--ambient-glow-1) 0%, var(--ambient-glow-4) 40%, var(--ambient-glow-3) 65%, transparent 78%)',
            }}
          />

          {/* Left subtle secondary warmth */}
          <div
            className="hidden md:block absolute top-1/2 -left-20 w-[420px] h-[420px] rounded-full blur-[120px] opacity-50 dark:opacity-45"
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-4) 0%, transparent 65%)',
            }}
          />
        </>
      )}

      {/* --- HELP / DOCUMENTATION VARIANT --- */}
      {variant === 'help' && (
        <>
          {/* Restrained, crisp diffuse glow */}
          <div
            className="absolute -top-20 sm:-top-32 left-1/2 -translate-x-1/2 w-[320px] sm:w-[680px] lg:w-[900px] h-[220px] sm:h-[380px] lg:h-[480px] rounded-full blur-[55px] sm:blur-[95px] lg:blur-[120px] opacity-65 dark:opacity-60"
            style={{
              background:
                'radial-gradient(circle at center, var(--ambient-glow-1) 0%, transparent 65%)',
            }}
          />
        </>
      )}

      {/* --- MINIMAL VARIANT (Auth / Modal / Utility) --- */}
      {variant === 'minimal' && (
        <div
          className="absolute -top-12 sm:-top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[350px] rounded-full blur-[50px] sm:blur-[90px] opacity-55 dark:opacity-50"
          style={{
            background:
              'radial-gradient(circle at center, var(--ambient-glow-1) 0%, transparent 60%)',
          }}
        />
      )}

      {/* =========================================================================
          3. Desktop Pointer Ambient Glow (Lightweight RAF, non-intrusive)
          ========================================================================= */}
      {enablePointerGlow && pointerPos.active && (
        <div
          className="hidden md:block absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full blur-[80px] transition-opacity duration-500 ease-out"
          style={{
            left: `${pointerPos.x}px`,
            top: `${pointerPos.y}px`,
            background:
              'radial-gradient(circle at center, var(--ambient-pointer-glow) 0%, transparent 70%)',
            opacity: pointerPos.active ? 1 : 0,
          }}
        />
      )}

      {/* =========================================================================
          4. Micro-Texture Noise Overlay (Procedural SVG data-URI, zero HTTP payload)
          ========================================================================= */}
      {enableNoise && (
        <div
          className="absolute inset-0 bg-repeat pointer-events-none"
          style={{
            opacity: 'var(--ambient-noise-opacity)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
    </div>
  );
}

export default AmbientBackground;
