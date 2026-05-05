import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

type FluidGlassProps = {
  mode?: "lens" | "bar" | "cube";
  lensProps?: Record<string, number>;
  barProps?: Record<string, number>;
  cubeProps?: Record<string, number>;
  scale?: number;
  ior?: number;
  thickness?: number;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  className?: string;
  style?: CSSProperties;
};

export default function FluidGlass({
  mode = "lens",
  lensProps,
  barProps,
  cubeProps,
  scale,
  ior,
  thickness,
  transmission,
  roughness,
  chromaticAberration,
  anisotropy,
  className,
  style,
}: FluidGlassProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[inherit] bg-[color-mix(in_srgb,var(--background)_60%,white_40%)] backdrop-blur-2xl saturate-150",
        className,
      )}
      style={style}
      data-mode={mode}
      data-scale={scale}
      data-ior={ior}
      data-thickness={thickness}
      data-transmission={transmission}
      data-roughness={roughness}
      data-chromatic-aberration={chromaticAberration}
      data-anisotropy={anisotropy}
      data-lens-props={lensProps ? JSON.stringify(lensProps) : undefined}
      data-bar-props={barProps ? JSON.stringify(barProps) : undefined}
      data-cube-props={cubeProps ? JSON.stringify(cubeProps) : undefined}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_60%)]" />
      <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/45 blur-2xl" />
      <div className="absolute -bottom-10 right-6 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute inset-0 rounded-[inherit] border border-white/25" />
      <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.25)]" />
    </div>
  );
}
