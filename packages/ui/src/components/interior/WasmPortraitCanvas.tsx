'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WasmPortraitBridge } from './wasm-portrait.bridge';
import { usePortraitInteractions } from './wasm-portrait.interactions';
import {
  parseMultiplier,
  parsePortraitCustomValues,
  detectDeviceCapability,
  detectAdaptiveResolution,
} from './wasm-portrait.utils';

export interface WasmPortraitCanvasProps {
  imageDarkSrc?: string;
  imageLightSrc?: string;
  alt?: string;
  className?: string;
  isDark?: boolean;
  effectsLevel?: 'high' | 'medium' | 'low';
  size?: number;
  lightIntensity?: number;
  simulationResolution?: number | string;
  particleDensity?: string | number;
  particleSize?: string | number;
  glowBrightness?: string | number;
  flightSpeed?: string | number;
  pathSpread?: string | number;
  showPathGuide?: boolean;
  // Advanced Customizations
  edgeAlgorithm?: string | number;
  edgeThreshold?: string | number;
  pinBottomEdge?: boolean | number;
  topParticleSize?: string | number;
  topParticleQuantity?: string | number;
  topParticleSpeed?: string | number;
  glowDistance?: string | number;
  backsideStars?: string | number;
  backsideHalo?: string | number;
  backsideOrbits?: string | number | boolean;
  backsideSpecks?: string | number;
  clickForce?: string | number;
  bounceSpeed?: string | number;
  clickRadius?: string | number;
  hoverSpeed?: string | number;
  hoverRadius?: string | number;
  clickSpeed?: string | number;
  introDuration?: string | number;
  introSpread?: string | number;
  introPattern?: string | number;
  imageAlgorithm?: string;
  disableFullscreenIntro?: boolean;
}

export function WasmPortraitCanvas({
  imageDarkSrc = '/about/souravbarui-dark.png',
  imageLightSrc = '/about/souravbarui-light.png',
  alt = 'Sourav Barui — Portrait',
  className = '',
  isDark = true,
  effectsLevel: _effectsLevel = 'high',
  size = 460,
  lightIntensity = 0.38,
  simulationResolution,
  particleDensity = '1.0x',
  particleSize = '1.0x',
  glowBrightness = '1.0x',
  flightSpeed = '1.0x',
  pathSpread = '2.4px',
  showPathGuide = false,
  edgeAlgorithm = 0,
  edgeThreshold = 28,
  pinBottomEdge = 1,
  topParticleSize = '1.0x',
  topParticleQuantity = '1.0x',
  topParticleSpeed = '1.0x',
  glowDistance = '8px',
  backsideStars = 32,
  backsideHalo = '1.0x',
  backsideOrbits = 2,
  backsideSpecks = '1.0x',
  clickForce = '1.0x',
  bounceSpeed = '1.0x',
  clickRadius = '80px',
  hoverSpeed = '1.0x',
  hoverRadius = '55px',
  clickSpeed = '1.0x',
  introDuration = '1.0s',
  introSpread = '1.0x',
  introPattern = 'vortex',
  imageAlgorithm = 'stepped',
  disableFullscreenIntro = false,
}: WasmPortraitCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const bridgeRef = useRef<WasmPortraitBridge | null>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const rawDensity = parseMultiplier(particleDensity);
  const rawSize = parseMultiplier(particleSize);
  const rawGlow = parseMultiplier(glowBrightness);
  const rawSpeed = parseMultiplier(flightSpeed);

  const { densityScale, glowScale } = detectDeviceCapability();
  const effectiveDensity = rawDensity * densityScale;
  const effectiveGlow = rawGlow * glowScale;

  const eff = parsePortraitCustomValues({
    edgeAlgorithm, edgeThreshold, pinBottomEdge, topParticleSize, topParticleQuantity,
    topParticleSpeed, backsideStars, backsideHalo, backsideOrbits, backsideSpecks,
    clickForce, bounceSpeed, glowDistance, clickRadius, hoverSpeed, hoverRadius,
    clickSpeed, introDuration, introSpread, introPattern,
  });

  const [isWasmActive, setIsWasmActive] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const effectiveDarkSrc = imageDarkSrc || '/about/souravbarui-dark.png';
  const effectiveLightSrc = imageLightSrc || '/about/souravbarui-light.png';
  const activeSrc = isDark ? effectiveDarkSrc : effectiveLightSrc;

  const getCardRect = useCallback((): DOMRect | null => {
    return containerRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const switchToCard = useCallback(() => {
    const canvas = canvasRef.current;
    const bridge = bridgeRef.current;
    const mount = canvasMountRef.current;
    if (!canvas || !bridge) return;

    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }

    if (mount && canvas.parentElement !== mount) {
      mount.appendChild(canvas);
    }

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '20';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';

    const currentSize = sizeRef.current;
    canvas.width = currentSize;
    canvas.height = currentSize;

    bridge.setFullscreenMode(false);
    bridge.resize(currentSize, currentSize);
  }, []);

  const switchToFullscreen = useCallback(() => {
    const canvas = canvasRef.current;
    const bridge = bridgeRef.current;
    if (!canvas || !bridge || typeof window === 'undefined') return;

    if (introTimerRef.current) clearTimeout(introTimerRef.current);

    if (canvas.parentElement !== document.body) {
      document.body.appendChild(canvas);
    }

    // Universal full-viewport overlay entrance for desktop, tablet, and mobile
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100%';
    canvas.style.zIndex = '99999';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    bridge.resize(w, h);
    bridge.setFullscreenMode(true, getCardRect);
    bridge.start();
    bridge.triggerEntrance(eff.effIntroDuration);

    const flightWait = Math.round(eff.effIntroDuration * 1000 + 100);
    introTimerRef.current = setTimeout(() => {
      switchToCard();
    }, flightWait);
  }, [getCardRect, switchToCard, eff.effIntroDuration]);

  const handleImageLoad = useCallback(() => {
    if (bridgeRef.current && imgRef.current) {
      bridgeRef.current.ingestImageElement(imgRef.current);
    }
  }, []);

  // Viewport scroll observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          const isFullyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.9;
          if (isFullyVisible) {
            bridgeRef.current?.start();
          } else {
            bridgeRef.current?.pause();
          }
        }
      },
      { rootMargin: '0px', threshold: [0, 0.25, 0.5, 0.75, 0.9, 0.98, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize Canvas & Bridge
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.createElement('canvas');
    canvas.id = 'wasm-portrait-canvas';
    canvas.setAttribute('data-testid', 'wasm-portrait-canvas');
    canvasRef.current = canvas;
    mount.appendChild(canvas);

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '20';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';

    canvas.width = size;
    canvas.height = size;

    const parsedSimRes =
      typeof simulationResolution === 'string'
        ? parseInt(simulationResolution, 10)
        : simulationResolution;
    const effectiveSimRes = parsedSimRes || detectAdaptiveResolution();

    const bridge = new WasmPortraitBridge({
      canvas,
      imageDarkSrc: effectiveDarkSrc,
      imageLightSrc: effectiveLightSrc,
      isDark,
      lightIntensity,
      simulationResolution: effectiveSimRes,
      particleDensity: effectiveDensity,
      particleSize: rawSize,
      glowBrightness: effectiveGlow,
      flightSpeed: rawSpeed,
      pathSpread,
      showPathGuide,
      edgeAlgorithm: eff.effAlgorithm,
      edgeThreshold: eff.effThreshold,
      pinBottomEdge: eff.effPinBottom,
      topParticleSize: eff.effTopSize,
      topParticleQuantity: eff.effTopQty,
      topParticleSpeed: eff.effTopSpeed,
      backsideStars: eff.effStars,
      backsideHalo: eff.effHalo,
      backsideOrbits: eff.effOrbits,
      backsideSpecks: eff.effSpecks,
      clickForce: eff.effClickForce,
      bounceSpeed: eff.effBounceSpeed,
      glowDistance: eff.effGlowDistance,
      clickRadius: eff.effClickRadius,
      hoverSpeed: eff.effHoverSpeed,
      hoverRadius: eff.effHoverRadius,
      clickSpeed: eff.effClickSpeed,
      introSpread: eff.effIntroSpread,
      introPattern: eff.effIntroPattern,
      imageAlgorithm,
      onLoaded: () => {
        setIsWasmActive(true);
        if (bridge && !bridge.isWebGLActive()) setHasWebGLError(true);
        if (!disableFullscreenIntro && !prefersReducedMotion && eff.effIntroDuration > 0.05) {
          switchToFullscreen();
        } else {
          switchToCard();
          if (!prefersReducedMotion && eff.effIntroDuration > 0.05) {
            bridge.triggerEntrance(eff.effIntroDuration);
          } else {
            bridge.triggerEntrance(0.01);
          }
        }
      },
    });

    bridge.start();
    bridgeRef.current = bridge;

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      bridge.ingestImageElement(imgRef.current);
    }

    return () => {
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
      bridge.dispose();
      bridgeRef.current = null;
      canvas.remove();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDarkSrc, effectiveLightSrc, simulationResolution]);

  // Synchronize dynamic settings
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.updateConfig({
        isDark, lightIntensity, particleDensity: effectiveDensity, particleSize: rawSize,
        glowBrightness: effectiveGlow, flightSpeed: rawSpeed, pathSpread, showPathGuide,
        edgeAlgorithm: eff.effAlgorithm, edgeThreshold: eff.effThreshold, pinBottomEdge: eff.effPinBottom,
        topParticleSize: eff.effTopSize, topParticleQuantity: eff.effTopQty, topParticleSpeed: eff.effTopSpeed,
        backsideStars: eff.effStars, backsideHalo: eff.effHalo, backsideOrbits: eff.effOrbits,
        backsideSpecks: eff.effSpecks, clickForce: eff.effClickForce, bounceSpeed: eff.effBounceSpeed,
        glowDistance: eff.effGlowDistance, clickRadius: eff.effClickRadius, hoverSpeed: eff.effHoverSpeed,
        hoverRadius: eff.effHoverRadius, clickSpeed: eff.effClickSpeed, introSpread: eff.effIntroSpread,
        introPattern: eff.effIntroPattern, imageAlgorithm,
      });
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        bridgeRef.current.ingestImageElement(imgRef.current);
      }
    }
  }, [
    isDark, lightIntensity, effectiveDensity, rawSize, effectiveGlow, rawSpeed, pathSpread,
    showPathGuide, imageAlgorithm, eff,
  ]);

  // Re-trigger entrance when intro duration, spread, or pattern is changed in settings
  const prevIntroRef = useRef({
    duration: eff.effIntroDuration,
    spread: eff.effIntroSpread,
    pattern: eff.effIntroPattern,
  });

  useEffect(() => {
    if (!bridgeRef.current || !isWasmActive) return;
    const prev = prevIntroRef.current;
    if (
      prev.duration !== eff.effIntroDuration ||
      prev.spread !== eff.effIntroSpread ||
      prev.pattern !== eff.effIntroPattern
    ) {
      prevIntroRef.current = {
        duration: eff.effIntroDuration,
        spread: eff.effIntroSpread,
        pattern: eff.effIntroPattern,
      };
      bridgeRef.current.triggerEntrance(eff.effIntroDuration);
    }
  }, [eff.effIntroDuration, eff.effIntroSpread, eff.effIntroPattern, isWasmActive]);

  // Expose global test bridge for Admin Studio simulation controls
  useEffect(() => {
    if (typeof window !== 'undefined' && bridgeRef.current) {
      (window as unknown as {
        __portraitBridge?: {
          burst: (x?: number, y?: number) => void;
          triggerEntrance: (duration?: number) => void;
        };
      }).__portraitBridge = {
        burst: (x = 0, y = 0) => bridgeRef.current?.burst(x, y),
        triggerEntrance: (d?: number) =>
          bridgeRef.current?.triggerEntrance(d ?? eff.effIntroDuration),
      };
    }
  }, [eff.effIntroDuration]);

  // Pointer & Touch interactions hook
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerLeave,
    handlePointerUp,
    handleClick,
  } = usePortraitInteractions({ containerRef, bridgeRef });

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onClick={handleClick}
      className={`relative select-none overflow-hidden touch-none cursor-pointer ${className}`}
      style={{ width: '100%', maxWidth: `${size}px`, aspectRatio: '1 / 1' }}
      aria-label={alt}
      role="img"
    >
      <img
        ref={imgRef}
        src={activeSrc}
        alt={alt}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-opacity duration-700 ${
          hasWebGLError ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        loading="eager"
        decoding="async"
      />

      {!isWasmActive && !hasWebGLError && (
        <div
          data-testid="portrait-loading-screen"
          className="absolute inset-0 z-15 flex flex-col items-center justify-center p-4 bg-zinc-950/70 dark:bg-zinc-950/85 backdrop-blur-xl rounded-2xl select-none transition-opacity duration-500"
        >
          <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-3.5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/25 to-purple-500/30 blur-lg animate-pulse" />
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-indigo-500/20 border-t-cyan-400 border-r-indigo-400 animate-spin" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono tracking-wider">
            Loading Portrait...
          </div>
        </div>
      )}

      <div ref={canvasMountRef} className="absolute inset-0 pointer-events-none z-20" />
    </div>
  );
}
