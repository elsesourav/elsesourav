'use client';

import * as React from 'react';

interface StarPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  isBright: boolean;
  glowRadius: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
  thickness: number;
  isBig: boolean;
}

export interface StarsCanvasProps {
  isSceneActive?: boolean;
}

export function StarsCanvas({ isSceneActive = true }: StarsCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isSceneActiveRef = React.useRef(isSceneActive);
  isSceneActiveRef.current = isSceneActive;
  const startLoopRef = React.useRef<() => void>(() => {});
  const stopLoopRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    isSceneActiveRef.current = isSceneActive;
    if (!isSceneActive) {
      stopLoopRef.current();
    } else {
      startLoopRef.current();
    }
  }, [isSceneActive]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    let isRunning = false;
    let isIntersecting = true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;

    // Mouse parallax tracking for responsive cosmic movement
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      targetParallaxX = normX * 16;
      targetParallaxY = normY * 10;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const stars: StarPoint[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      isMobile = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Mobile optimization: generate far fewer stars for fast load & low battery drain
      const starCount = isMobile
        ? Math.min(55, Math.floor((width * height) / 9500) || 40)
        : Math.min(220, Math.floor((width * height) / 3800) || 120);

      if (stars.length === 0 || Math.abs(stars.length - starCount) > 25) {
        stars.length = 0;
        for (let i = 0; i < starCount; i++) {
          const isBright = !isMobile && Math.random() < 0.16;
          stars.push({
            x: Math.random(),
            y: Math.random() * 0.74,
            vx: (Math.random() - 0.5) * (isMobile ? 0.00006 : 0.00012),
            vy: (Math.random() - 0.5) * (isMobile ? 0.00004 : 0.00008),
            r: isBright ? Math.random() * 1.5 + 1.2 : Math.random() * 1.1 + 0.4,
            baseAlpha: isBright ? Math.random() * 0.35 + 0.65 : Math.random() * 0.5 + 0.25,
            twinkleSpeed: Math.random() * 2.0 + 0.6,
            twinkleOffset: Math.random() * Math.PI * 2,
            isBright,
            glowRadius: isBright ? Math.random() * 5 + 4 : 0,
          });
        }
      }
      if (isMobile) {
        draw(0);
      }
    };

    // Dynamic shooting stars pool (Big & Small variations)
    const shootingStars: ShootingStar[] = [];
    let shootingStarCooldownMs = 1200 + Math.random() * 2000;
    let lastTime = 0;
    let accumulatedTime = 0;

    const spawnShootingStar = () => {
      const isBig = !isMobile && Math.random() < 0.28;
      const angle = (Math.random() * 30 + 15) * (Math.PI / 180);

      shootingStars.push({
        x: Math.random() * width * 0.9,
        y: Math.random() * height * 0.32,
        length: isBig ? Math.random() * 120 + 140 : Math.random() * 55 + 45,
        speed: isBig ? Math.random() * 4.5 + 5.5 : Math.random() * 3.5 + 3.0,
        angle,
        alpha: 1,
        life: 0,
        maxLife: isBig ? Math.random() * 35 + 40 : Math.random() * 28 + 22,
        thickness: isBig ? Math.random() * 1.6 + 2.0 : Math.random() * 0.7 + 0.8,
        isBig,
      });

      // Occasional double meteor on desktop only
      if (!isMobile && !isBig && Math.random() < 0.35) {
        setTimeout(
          () => {
            if (!isRunning) return;
            shootingStars.push({
              x: Math.random() * width * 0.85,
              y: Math.random() * height * 0.28,
              length: Math.random() * 45 + 35,
              speed: Math.random() * 3.0 + 3.8,
              angle: angle + (Math.random() - 0.5) * 0.1,
              alpha: 1,
              life: 0,
              maxLife: 26,
              thickness: 0.85,
              isBig: false,
            });
          },
          Math.random() * 350 + 150
        );
      }
    };

    const draw = (time: number) => {
      if (!isRunning && !isMobile) return;

      if (lastTime === 0) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      accumulatedTime += dt;

      ctx.clearRect(0, 0, width, height);
      const t = accumulatedTime;

      // Smooth parallax on desktop
      if (!isMobile) {
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;
      }

      // ── 1. Draw Moving & Glowing Stars ──
      for (const star of stars) {
        if (!prefersReduced) {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0) star.x = 1;
          if (star.x > 1) star.x = 0;
          if (star.y < 0) star.y = 0.74;
          if (star.y > 0.74) star.y = 0;
        }

        const screenX = star.x * width + currentParallaxX * (star.isBright ? 1.2 : 0.6);
        const screenY = star.y * height + currentParallaxY * (star.isBright ? 1.2 : 0.6);

        const pulse = prefersReduced
          ? 1
          : 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const currentAlpha = star.baseAlpha * pulse;

        // Draw radial glow for bright stars
        if (star.isBright && star.glowRadius > 0 && currentAlpha > 0.4) {
          const glowGrad = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            star.glowRadius * pulse
          );
          glowGrad.addColorStop(0, `rgba(196, 181, 253, ${currentAlpha * 0.6})`);
          glowGrad.addColorStop(0.5, `rgba(167, 139, 250, ${currentAlpha * 0.22})`);
          glowGrad.addColorStop(1, 'rgba(167, 139, 250, 0)');

          ctx.beginPath();
          ctx.arc(screenX, screenY, star.glowRadius * pulse, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          if (currentAlpha > 0.75) {
            const flareLen = star.r * 2.6;
            ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.55})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(screenX - flareLen, screenY);
            ctx.lineTo(screenX + flareLen, screenY);
            ctx.moveTo(screenX, screenY - flareLen);
            ctx.lineTo(screenX, screenY + flareLen);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      }

      // ── 2. Spawn Random Shooting Stars (Big & Small) ──
      shootingStarCooldownMs -= dt * 1000;
      if (!prefersReduced && shootingStarCooldownMs <= 0) {
        spawnShootingStar();
        // Longer interval on mobile, faster on desktop
        const baseInterval = isMobile ? 3800 : 1300;
        const randInterval = isMobile ? 4000 : 2200;
        shootingStarCooldownMs = baseInterval + Math.random() * randInterval;
      }

      // ── 3. Render Shooting Stars ──
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]!;
        s.life++;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        const progress = s.life / s.maxLife;
        s.alpha = 1 - progress;

        if (s.life >= s.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length * (1 - progress * 0.35);
        const tailY = s.y - Math.sin(s.angle) * s.length * (1 - progress * 0.35);

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        if (s.isBig) {
          grad.addColorStop(0.4, `rgba(167, 139, 250, ${s.alpha * 0.35})`);
          grad.addColorStop(0.75, `rgba(196, 181, 253, ${s.alpha * 0.7})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha * 0.98})`);
        } else {
          grad.addColorStop(0.6, `rgba(224, 231, 255, ${s.alpha * 0.4})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha * 0.9})`);
        }

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (s.isBig) {
          const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10);
          headGlow.addColorStop(0, `rgba(255, 255, 255, ${s.alpha * 0.95})`);
          headGlow.addColorStop(0.5, `rgba(196, 181, 253, ${s.alpha * 0.5})`);
          headGlow.addColorStop(1, 'rgba(167, 139, 250, 0)');
          ctx.beginPath();
          ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = headGlow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thickness + (s.isBig ? 1.5 : 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * 0.95})`;
        ctx.fill();
      }

      if (isMobile) {
        // Mobile optimization: static celestial paint once, 0 ongoing loop
        return;
      }

      if (isRunning) {
        animId = requestAnimationFrame(draw);
      }
    };

    // ── Zero-Overhead Background Tab & Visibility Control ──
    const startLoop = () => {
      if (isMobile) {
        draw(0);
        return;
      }
      if (!isRunning && isIntersecting && !document.hidden && isSceneActiveRef.current) {
        isRunning = true;
        lastTime = 0;
        animId = requestAnimationFrame(draw);
      }
    };

    const stopLoop = () => {
      if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(animId);
      }
    };

    startLoopRef.current = startLoop;
    stopLoopRef.current = stopLoop;

    resize();
    window.addEventListener('resize', resize);

    startLoop();

    const onVis = () => {
      if (isMobile) return;
      if (document.hidden) {
        stopLoop();
      } else if (isIntersecting && isSceneActiveRef.current) {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    const io = new IntersectionObserver(
      ([e]) => {
        isIntersecting = e?.isIntersecting ?? true;
        if (isIntersecting && !document.hidden && isSceneActiveRef.current) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
      aria-hidden="true"
    />
  );
}
