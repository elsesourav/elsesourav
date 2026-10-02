'use client';

import * as React from 'react';
import { ROCKS } from './earth-scene.constants';
import { LaptopLiveCanvas } from './LaptopLiveCanvas';
import { useProgressiveImage } from './useProgressiveImage';

export interface EarthSceneProps {
  isSceneActive?: boolean;
  isMobileBackdrop?: boolean;
}

export function EarthScene({ isSceneActive = true, isMobileBackdrop = false }: EarthSceneProps) {
  // On mobile backdrop, avoid downloading the 172KB high-res image; load only lightweight thumb with blur
  const [isIslandLoaded, markIslandLoaded] = useProgressiveImage(
    isMobileBackdrop ? '' : '/hero/parts/island-main.webp'
  );
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (isMobileBackdrop) {
      setIsReady(true);
      return;
    }
    if (isIslandLoaded) {
      const timer = setTimeout(() => setIsReady(true), 60);
      return () => clearTimeout(timer);
    }
  }, [isIslandLoaded, isMobileBackdrop]);

  return (
    <div
      className={`relative isolate w-full h-full ${
        isMobileBackdrop
          ? 'min-h-[280px] flex items-center justify-center select-none overflow-visible'
          : 'min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex items-center justify-center select-none overflow-hidden sm:overflow-visible'
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

      {/* Compact Coordinate Stage (Small, elegant proportions) */}
      <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[500px] xl:max-w-[540px] aspect-[1024/888] pointer-events-none">
        {/* ── Realistic Cloud Mist & Fog Layer 1 (Drifting sunset mist) ── */}
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

        {/* ── Realistic Cloud Mist & Fog Layer 2 (Warm ambient wisp hugging crags) ── */}
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

        {/* ── Realistic Deep Altitude Cast Shadow beneath island crag ── */}
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

        {/* ── Main Floating Island with Progressive Low-to-High Image Loading ── */}
        <div
          className="hero-main-island absolute z-[3]"
          style={{
            left: '13.48%',
            top: '1.91%',
            width: '82.62%',
            filter: isMobileBackdrop
              ? 'blur(2.5px) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.45)) drop-shadow(0 6px 15px rgba(244, 114, 182, 0.18))'
              : 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.45)) drop-shadow(0 8px 20px rgba(244, 114, 182, 0.15))',
          }}
        >
          {/* Low-Quality Lightweight Placeholder (3.6 KB) - On mobile, this is the only image used with blur */}
          <img
            src="/hero/parts/island-main-thumb.webp"
            alt=""
            aria-hidden="true"
            className={`w-full h-auto object-contain ${
              isMobileBackdrop
                ? 'opacity-100'
                : `transition-all duration-700 ease-out ${isReady ? 'opacity-0 blur-0' : 'opacity-100 blur-[6px]'}`
            }`}
            draggable={false}
          />

          {/* High-Quality Progressive WebP Image (172 KB) - Only loaded & rendered on iPad & Desktop */}
          {!isMobileBackdrop && (
            <img
              src="/hero/parts/island-main.webp"
              alt="Floating digital sanctuary island"
              className={`absolute inset-0 w-full h-auto object-contain transition-opacity duration-700 ease-out ${
                isReady ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
              onLoad={markIslandLoaded}
              draggable={false}
            />
          )}

          {/* ── Dynamic Live Laptop Display (Split-View Coding & Real-time Preview on Desktop only) ── */}
          {!isMobileBackdrop && (
            <div
              className={`hidden md:block absolute z-[4] pointer-events-none transition-opacity duration-700 ease-out ${
                isReady ? 'opacity-100' : 'opacity-0'
              }`}
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
              <LaptopLiveCanvas isSceneActive={isSceneActive} />
            </div>
          )}
        </div>

        {/* ── 27 Floating Rocks with Individualized Float Timings & Amplitudes (WebP: ~37KB total) ── */}
        {ROCKS.map((rock, idx) => (
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
                filter: isMobileBackdrop
                  ? 'blur(2px) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
                  : 'drop-shadow(0 8px 14px rgba(0, 0, 0, 0.4))',
              } as React.CSSProperties
            }
          >
            <img
              src={rock.src}
              alt=""
              className={`w-full h-auto object-contain transition-all duration-700 ease-out ${
                isMobileBackdrop
                  ? 'opacity-85'
                  : isReady
                    ? 'blur-0 opacity-100 scale-100'
                    : 'blur-[6px] opacity-75 scale-95'
              }`}
              loading={isMobileBackdrop ? 'lazy' : 'eager'}
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
