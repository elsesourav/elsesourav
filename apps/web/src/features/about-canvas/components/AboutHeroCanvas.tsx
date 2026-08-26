"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadImageData } from "../image/image-loader";
import { loadWasmEngine } from "../wasm/wasm-loader";
import type { IEngineModule } from "../wasm/interfaces";
import { WebGLParticleRenderer } from "../engine/renderer";
import { usePointer } from "../hooks/usePointer";
import { DEFAULT_CANVAS_CONFIG } from "../config/defaults";

interface AboutHeroCanvasProps {
  imageUrl: string;
  width?: number;
  height?: number;
  className?: string;
  chunkSize?: number;
  alphaThreshold?: number;
}

export function AboutHeroCanvas({
  imageUrl,
  width = 600,
  height = 600,
  className = "",
  chunkSize = DEFAULT_CANVAS_CONFIG.chunkSize,
  alphaThreshold = DEFAULT_CANVAS_CONFIG.alphaThreshold,
}: AboutHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = usePointer(containerRef, width, height);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      setError("WebGL2 is not supported by your browser");
      return;
    }

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

    const init = async () => {
      try {
        const imageData = await loadImageData(imageUrl, width, height);
        if (isCancelled) return;

        // Center the image in the canvas
        const offsetX = (width - imageData.width) / 2;
        const offsetY = (height - imageData.height) / 2;

        engine = await loadWasmEngine();
        if (isCancelled) {
          engine.destroy();
          return;
        }

        engine.init(
          imageData,
          chunkSize,
          alphaThreshold,
          offsetX,
          offsetY
        );
        setIsLoaded(true);

        const loop = (time: number) => {
          if (isCancelled) return;
          const dt = time - lastTime;
          lastTime = time;

          if (engine) {
            engine.update(pointerRef.current, dt);
            renderer.render(engine, chunkSize);
          }

          animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
      } catch (err) {
        if (isCancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load canvas image",
        );
        console.error(err);
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
  }, [imageUrl, width, height, chunkSize, alphaThreshold, pointerRef]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block max-w-full ${className}`}
      style={{ 
        width: "100%", 
        maxWidth: width,
        aspectRatio: `${width} / ${height}`,
        touchAction: "none" 
      }}
    >
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-active/20 rounded-xl animate-pulse">
          <span className="text-sm font-medium text-text-muted">
            Loading Engine...
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <img 
            src={imageUrl} 
            alt="Profile Fallback" 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
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
