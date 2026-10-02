'use client';

import * as React from 'react';

interface FogPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  phase: number;
  pulseSpeed: number;
}

interface SunlitMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  pulse: number;
  isGolden: boolean;
}

export interface DaylightFogCanvasProps {
  isSceneActive?: boolean;
}

export function DaylightFogCanvas({ isSceneActive = true }: DaylightFogCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isSceneActiveRef = React.useRef(isSceneActive);
  isSceneActiveRef.current = isSceneActive;
  const startRef = React.useRef<() => void>(() => {});
  const stopRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    isSceneActiveRef.current = isSceneActive;
    if (!isSceneActive) {
      stopRef.current();
    } else {
      startRef.current();
    }
  }, [isSceneActive]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isRunning = false;
    let isIntersecting = true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;

    // Mouse parallax tracking
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
      const normY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
      targetParallaxX = normX * 18;
      targetParallaxY = normY * 12;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let fogPuffs: FogPuff[] = [];
    let sunlitMotes: SunlitMote[] = [];

    const initAtmosphere = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      isMobile = width < 768;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      const puffCount = isMobile ? 8 : 15;
      fogPuffs = [];
      for (let i = 0; i < puffCount; i++) {
        fogPuffs.push({
          x: Math.random() * width,
          // Concentrate mostly on bottom half and mid cloud layer
          y: height * 0.35 + Math.random() * (height * 0.65),
          vx: -(0.18 + Math.random() * 0.22), // Drift smoothly right-to-left
          vy: (Math.random() - 0.5) * 0.08,
          r: (isMobile ? 120 : 180) + Math.random() * (isMobile ? 140 : 260),
          baseAlpha: 0.035 + Math.random() * 0.065,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
        });
      }

      const moteCount = isMobile ? 14 : 32;
      sunlitMotes = [];
      for (let i = 0; i < moteCount; i++) {
        sunlitMotes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -(0.15 + Math.random() * 0.25),
          vy: -(0.1 + Math.random() * 0.3),
          r: 1.2 + Math.random() * 2.2,
          alpha: 0.2 + Math.random() * 0.5,
          pulse: Math.random() * Math.PI * 2,
          isGolden: Math.random() > 0.4,
        });
      }
    };

    const drawSunlightBeams = (w: number, h: number) => {
      // Golden sunlight shafts emanating from top-right horizon
      const sunX = w * 0.88;
      const sunY = h * 0.18;
      const grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, w * 0.75);
      grad.addColorStop(0, 'rgba(255, 235, 185, 0.14)');
      grad.addColorStop(0.35, 'rgba(255, 220, 160, 0.06)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.667, 2.5);
      lastTime = time;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Smooth parallax dampening
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05 * dt;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05 * dt;

      // 1. Ambient Golden Sunlight Shafts from the right
      drawSunlightBeams(width, height);

      // 2. Volumetric Soft Day Cloud Mist Puffs
      ctx.save();
      ctx.translate(currentParallaxX * 0.4, currentParallaxY * 0.4);

      for (let i = 0; i < fogPuffs.length; i++) {
        const p = fogPuffs[i]!;
        if (!prefersReduced) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.phase += p.pulseSpeed * dt;

          if (p.x < -p.r) {
            p.x = width + p.r;
            p.y = height * 0.35 + Math.random() * (height * 0.65);
          }
        }

        const currentRadius = p.r * (1 + Math.sin(p.phase) * 0.1);
        const currentAlpha = p.baseAlpha * (1 + Math.sin(p.phase * 0.7) * 0.25);

        const fogGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);
        // Slightly warm daylight ivory in center, fading to pristine transparent edge
        fogGrad.addColorStop(0, `rgba(255, 250, 240, ${currentAlpha})`);
        fogGrad.addColorStop(0.45, `rgba(255, 255, 255, ${currentAlpha * 0.75})`);
        fogGrad.addColorStop(0.8, `rgba(255, 255, 255, ${currentAlpha * 0.25})`);
        fogGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = fogGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Sunlit Micro Droplets / Golden Mist Particles
      ctx.save();
      ctx.translate(currentParallaxX * 0.8, currentParallaxY * 0.8);

      for (let i = 0; i < sunlitMotes.length; i++) {
        const m = sunlitMotes[i]!;
        if (!prefersReduced) {
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.pulse += 0.025 * dt;

          if (m.x < -10) m.x = width + 10;
          if (m.y < -10) m.y = height + 10;
        }

        const opacity = m.alpha * (0.6 + Math.sin(m.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);

        if (m.isGolden) {
          ctx.fillStyle = `rgba(255, 225, 160, ${opacity})`;
          ctx.shadowColor = 'rgba(255, 200, 100, 0.4)';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx.shadowBlur = 3;
        }

        ctx.fill();
      }
      ctx.restore();

      ctx.restore();

      if (isRunning && !prefersReduced) {
        animId = requestAnimationFrame(render);
      }
    };

    const start = () => {
      if (isRunning || !isIntersecting || document.hidden || !isSceneActiveRef.current) return;
      isRunning = true;
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    };

    const stop = () => {
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    startRef.current = start;
    stopRef.current = stop;

    // Pause when tab not visible
    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0]?.isIntersecting ?? false;
        if (isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initAtmosphere();
        if (prefersReduced) render(performance.now());
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    initAtmosphere();
    if (prefersReduced) {
      render(performance.now());
    } else {
      start();
    }

    return () => {
      stop();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[1] w-full h-full pointer-events-none select-none"
    />
  );
}
