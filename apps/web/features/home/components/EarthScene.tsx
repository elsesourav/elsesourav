'use client';

import * as React from 'react';
import { MOBILE_ROCKS, ROCKS } from './earth-scene.constants';
import { LaptopLiveCanvas } from './LaptopLiveCanvas';

export interface EarthSceneProps {
  isSceneActive?: boolean;
  isMobileCompact?: boolean;
  isMobileBackdrop?: boolean;
}

export function EarthScene({
  isSceneActive = true,
  isMobileCompact = false,
  isMobileBackdrop = false,
}: EarthSceneProps) {
  return (
    <div
      className={`relative isolate w-full flex items-center justify-center select-none ${
        isMobileCompact
          ? 'h-auto py-1 overflow-visible'
          : isMobileBackdrop
          ? 'h-full min-h-[280px] overflow-visible'
          : 'h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] overflow-hidden sm:overflow-visible'
      } ${!isSceneActive ? 'hero-scene-paused' : ''}`}
    >
      {/* Subtle warm planetary ambient light behind the island */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] pointer-events-none rounded-full blur-3xl opacity-35"
        style={{
          background:
            'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(249,115,22,0.18) 40%, rgba(139,92,246,0.08) 70%, transparent 85%)',
        }}
      />

      {/* Coordinate Stage (Proportionally scaled for mobile compact or full desktop) */}
      <div
        className={`relative w-full pointer-events-none ${
          isMobileCompact
            ? 'max-w-[210px] xs:max-w-[240px] sm:max-w-[270px]'
            : 'max-w-[420px] sm:max-w-[480px] lg:max-w-[500px] xl:max-w-[540px]'
        }`}
        style={{ aspectRatio: '1024 / 888' }}
      >
        {/* ── Realistic Cloud Mist & Fog Layer (Drifting mist on desktop, static ambient on mobile) ── */}
        {!isMobileCompact ? (
          <>
            <div
              aria-hidden="true"
              className="hero-island-fog-1 absolute pointer-events-none rounded-full blur-2xl z-[1]"
              style={{
                left: '20%',
                top: '62%',
                width: '64%',
                height: '24%',
                background:
                  'linear-gradient(90deg, rgba(236,72,153,0.14) 0%, rgba(251,146,60,0.20) 45%, rgba(167,139,250,0.14) 85%, transparent 100%)',
              }}
            />
            <div
              aria-hidden="true"
              className="hero-island-fog-2 absolute pointer-events-none rounded-full blur-xl z-[2]"
              style={{
                left: '28%',
                top: '70%',
                width: '48%',
                height: '20%',
                background:
                  'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, rgba(244,114,182,0.12) 50%, transparent 80%)',
              }}
            />
            <div
              aria-hidden="true"
              className="hero-island-shadow absolute pointer-events-none rounded-[50%] z-[1]"
              style={{
                left: '30%',
                top: '78%',
                width: '50%',
                height: '18%',
                background:
                  'radial-gradient(ellipse at center, rgba(12, 8, 24, 0.72) 0%, rgba(20, 14, 38, 0.42) 45%, transparent 75%)',
                filter: 'blur(14px)',
                transform: 'rotate(-4deg)',
              }}
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute pointer-events-none rounded-[50%] z-[1]"
            style={{
              left: '30%',
              top: '78%',
              width: '50%',
              height: '18%',
              background:
                'radial-gradient(ellipse at center, rgba(12, 8, 24, 0.52) 0%, transparent 75%)',
              transform: 'rotate(-4deg)',
            }}
          />
        )}

        {/* ── Main Floating Island ── */}
        <div
          className="hero-main-island absolute z-[3]"
          style={{
            left: '13.48%',
            top: '1.91%',
            width: '82.62%',
            filter: isMobileCompact
              ? 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.35))'
              : 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.45)) drop-shadow(0 8px 20px rgba(244, 114, 182, 0.15))',
          }}
        >
          <img
            src="/hero/parts/island-main.webp"
            alt="Floating digital sanctuary island"
            className="w-full h-auto object-contain select-none pointer-events-none"
            loading="eager"
            draggable={false}
          />

          {/* ── Dynamic Live Laptop Display (Split-View Coding & Real-time Preview on Desktop and Mobile) ── */}
          {!isMobileBackdrop && (
            <div
              className="block absolute z-[4] pointer-events-none"
              style={{
                left: '40.6%',
                top: '28%',
                width: '24.7%',
                height: '16%',
                transformOrigin: '0 0',
                transform: 'rotate(6.2deg)',
                overflow: 'hidden',
                borderRadius: '2.5px',
                boxShadow: 'inset 0 0 3px rgba(0, 0, 0, 0.9), 0 0 10px rgba(99, 102, 241, 0.12)',
              }}
            >
              <LaptopLiveCanvas isSceneActive={isSceneActive} isMobile={isMobileCompact} />
            </div>
          )}
        </div>

        {/* ── Floating Rocks (6 strategic rocks on mobile, full 27 constellation on desktop) ── */}
        {(isMobileCompact ? MOBILE_ROCKS : ROCKS).map((rock, idx) => (
          <div
            key={rock.id}
            className={`hero-rock hero-rock-${idx % 2 === 0 ? 'a' : 'b'} absolute z-[4]`}
            style={
              {
                left: `${rock.left}%`,
                top: `${rock.top}%`,
                width: `${rock.width}%`,
                animationDuration: `${rock.dur}s`,
                animationDelay: `${rock.delay}s`,
                '--rock-dist': `${rock.dist}px`,
                '--rock-rot': `${rock.rot}deg`,
                filter: isMobileCompact ? undefined : 'drop-shadow(0 8px 14px rgba(0, 0, 0, 0.4))',
              } as React.CSSProperties
            }
          >
            <img
              src={rock.src}
              alt=""
              className="w-full h-auto object-contain pointer-events-none select-none"
              loading={isMobileBackdrop || isMobileCompact ? 'lazy' : 'eager'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <style>{`
        .hero-main-island {
          animation: heroMainIslandFloat 6.8s ease-in-out infinite;
          will-change: transform;
        }

        .hero-island-shadow {
          animation: heroIslandShadowPulse 6.8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .hero-island-fog-1 {
          animation: heroFogDrift1 8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .hero-island-fog-2 {
          animation: heroFogDrift2 6.5s ease-in-out infinite 1s;
          will-change: transform, opacity;
        }

        @keyframes heroMainIslandFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        /* Shadow softens and shrinks slightly when island floats up, deepens when it descends */
        @keyframes heroIslandShadowPulse {
          0%, 100% {
            transform: rotate(-4deg) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: rotate(-4deg) scale(0.92);
            opacity: 0.65;
          }
        }

        @keyframes heroFogDrift1 {
          0%, 100% {
            transform: translateX(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateX(10px) scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes heroFogDrift2 {
          0%, 100% {
            transform: translateX(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateX(-8px) scale(1.06);
            opacity: 0.85;
          }
        }

        .hero-rock-a {
          animation-name: heroRockFloatA;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-fill-mode: both;
          will-change: transform;
        }

        .hero-rock-b {
          animation-name: heroRockFloatB;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-fill-mode: both;
          will-change: transform;
        }

        @keyframes heroRockFloatA {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(calc(var(--rock-dist, 12px) * -1)) rotate(var(--rock-rot, 2deg));
          }
        }

        @keyframes heroRockFloatB {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(var(--rock-dist, 12px)) rotate(calc(var(--rock-rot, -2deg) * -1));
          }
        }

        /* Pauses all animations cleanly in place during tab blur, off-screen scroll, or warmup */
        .hero-scene-paused .hero-main-island,
        .hero-scene-paused .hero-island-shadow,
        .hero-scene-paused .hero-island-fog-1,
        .hero-scene-paused .hero-island-fog-2,
        .hero-scene-paused .hero-rock,
        .hero-scene-paused .hero-rock-a,
        .hero-scene-paused .hero-rock-b {
          animation-play-state: paused !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-main-island,
          .hero-island-shadow,
          .hero-island-fog-1,
          .hero-island-fog-2,
          .hero-rock-a,
          .hero-rock-b {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
