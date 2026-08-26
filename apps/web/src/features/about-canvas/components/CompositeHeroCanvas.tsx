"use client";

import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_CANVAS_CONFIG } from "../config/defaults";
import { WebGLParticleRenderer } from "../engine/renderer";
import { usePointer } from "../hooks/usePointer";
import type { IEngineModule } from "../wasm/interfaces";
import { loadWasmEngine } from "../wasm/wasm-loader";

interface CompositeHeroCanvasProps {
  children: React.ReactNode;
  className?: string;
  chunkSize?: number;
  alphaThreshold?: number;
  glowDuration?: number;
  glowStrength?: number;
  glowColor?: [number, number, number];
  waveSpeed?: number;
  glowProbability?: number;
  interactionRadius?: number;
  repelForce?: number;
  returnSpeed?: number;
}

export function CompositeHeroCanvas({
  children,
  className = "",
  chunkSize = DEFAULT_CANVAS_CONFIG.chunkSize,
  alphaThreshold = DEFAULT_CANVAS_CONFIG.alphaThreshold,
  glowDuration = DEFAULT_CANVAS_CONFIG.glowDuration,
  glowStrength = DEFAULT_CANVAS_CONFIG.glowStrength,
  glowColor = DEFAULT_CANVAS_CONFIG.glowColor,
  waveSpeed = DEFAULT_CANVAS_CONFIG.waveSpeed,
  glowProbability = DEFAULT_CANVAS_CONFIG.glowProbability,
  interactionRadius = DEFAULT_CANVAS_CONFIG.interactionRadius,
  repelForce = DEFAULT_CANVAS_CONFIG.repelForce,
  returnSpeed = DEFAULT_CANVAS_CONFIG.returnSpeed,
}: CompositeHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [logicalSize, setLogicalSize] = useState({ width: 0, height: 0 });
  const pointerRef = usePointer(
    containerRef,
    logicalSize.width,
    logicalSize.height,
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a resize observer to trigger re-renders when the container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      // Debounce the resize to prevent stuttering
      timeoutId = setTimeout(() => {
        if (entries[0]) {
          const rect = entries[0].contentRect;
          if (rect.width > 0 && rect.height > 0) {
            setLogicalSize({
              width: Math.floor(rect.width),
              height: Math.floor(rect.height),
            });
          }
        }
      }, 500);
    });

    observer.observe(container);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (
      !container ||
      !canvas ||
      logicalSize.width === 0 ||
      logicalSize.height === 0
    )
      return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      setError("WebGL2 is not supported by your browser");
      return;
    }

    const { width, height } = logicalSize;

    // Handle high DPI displays for crisp rendering
    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const renderer = new WebGLParticleRenderer(gl);

    let isCancelled = false;
    let animationFrameId: number;
    let engine: IEngineModule | null = null;
    let lastTime = performance.now();

    // Glow Effect State
    let wasHovering = false;
    let glowStartTime = -1;
    let glowCenter = { x: 0, y: 0 };
    
    // Trail State
    const TRAIL_MAX = 20;
    const trailData = new Float32Array(TRAIL_MAX * 3);
    const trailTimestamps = new Float64Array(TRAIL_MAX);
    let trailIndex = 0;
    let trailCount = 0;

    const init = async () => {
      try {
        setIsLoaded(false);

        // Find all images tagged as canvas sources
        const images = Array.from(
          container.querySelectorAll<HTMLImageElement>(
            "img.canvas-image-source",
          ),
        );

        // Wait for all images to fully load
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", reject, { once: true });
            });
          }),
        );

        if (isCancelled) return;

        // Create an offscreen 2D canvas to composite the images
        const offCanvas = document.createElement("canvas");
        offCanvas.width = width * dpr;
        offCanvas.height = height * dpr;
        const ctx = offCanvas.getContext("2d", { willReadFrequently: true });

        if (!ctx)
          throw new Error("Failed to get 2D context for offscreen canvas");

        // Clear background (transparent)
        ctx.clearRect(0, 0, width * dpr, height * dpr);
        ctx.scale(dpr, dpr);

        const containerRect = container.getBoundingClientRect();

        // Draw each image onto the offscreen canvas at its relative position
        images.forEach((img) => {
          const imgRect = img.getBoundingClientRect();
          // Skip if the image has zero dimensions
          if (imgRect.width === 0 || imgRect.height === 0) return;

          const x = imgRect.left - containerRect.left;
          const y = imgRect.top - containerRect.top;

          ctx.drawImage(img, x, y, imgRect.width, imgRect.height);
        });

        // Extract the combined pixel data
        const imageData = ctx.getImageData(0, 0, width * dpr, height * dpr);

        engine = await loadWasmEngine();
        if (isCancelled) {
          engine.destroy();
          return;
        }

        // Initialize the engine with the combined image data
        engine.init(
          imageData,
          chunkSize,
          alphaThreshold,
          0, // offsetX is 0 because the image data covers the entire container
          0  // offsetY is 0
        );
        
        // Apply physics configuration
        engine.setPhysicsConfig(interactionRadius, repelForce, returnSpeed);

        setIsLoaded(true);

        const loop = (time: number) => {
          if (isCancelled) return;
          const dt = time - lastTime;
          lastTime = time;

          if (engine) {
            const pointer = pointerRef.current;
            
            // Track hover transitions for the glow wave
            if (pointer.isActive && !wasHovering) {
              glowStartTime = time;
              glowCenter = { x: pointer.x * dpr, y: pointer.y * dpr };
            }
            wasHovering = pointer.isActive;

            // Update Trail
            if (pointer.isActive) {
              const px = pointer.x * dpr;
              const py = pointer.y * dpr;
              let dx = 100;
              let dy = 100;
              if (trailCount > 0) {
                const lastIdx = (trailIndex - 1 + TRAIL_MAX) % TRAIL_MAX;
                dx = px - trailData[lastIdx * 3 + 0];
                dy = py - trailData[lastIdx * 3 + 1];
              }
              // Only add a new trail point if the mouse moved a bit to save array space
              if (dx * dx + dy * dy > 4.0) {
                trailData[trailIndex * 3 + 0] = px;
                trailData[trailIndex * 3 + 1] = py;
                trailTimestamps[trailIndex] = time;
                trailIndex = (trailIndex + 1) % TRAIL_MAX;
                if (trailCount < TRAIL_MAX) trailCount++;
              }
            }
            
            // Update ages for shader
            for (let i = 0; i < trailCount; i++) {
              trailData[i * 3 + 2] = time - trailTimestamps[i];
            }

            const glowTime = glowStartTime > 0 ? time - glowStartTime : 0;

            engine.update(
              {
                x: pointer.x * dpr,
                y: pointer.y * dpr,
                isActive: pointer.isActive,
              },
              dt
            );
            
            renderer.render(engine, chunkSize, {
              center: glowCenter,
              time: glowTime,
              duration: glowDuration,
              strength: glowStrength,
              color: glowColor,
              waveSpeed: waveSpeed,
              glowProbability: glowProbability,
              trail: trailData,
              trailCount: trailCount,
            });
          }

          animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
      } catch (err) {
        if (isCancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize composite canvas",
        );
        console.error("CompositeHeroCanvas Error:", err);
      }
    };

    init();

    return () => {
      isCancelled = true;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (engine) {
        engine.destroy();
      }
      renderer.destroy();
    };
  }, [logicalSize, chunkSize, alphaThreshold, pointerRef]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className} ${isLoaded ? "canvas-active" : ""}`}
      style={{ touchAction: "none" }}
    >
      <style>{`
        /* Hide the original images when the canvas is active, but keep their hitboxes */
        .canvas-active img.canvas-image-source {
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
      `}</style>

      {/* The actual DOM content (Text, Links, and our target Images) */}
      <div className="relative z-10">{children}</div>

      {/* The WebGL Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      />
    </div>
  );
}
