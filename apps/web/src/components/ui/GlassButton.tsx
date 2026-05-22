"use client";

import React, { forwardRef, useId } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type GlassButtonVariant = "default" | "primary" | "secondary" | "danger";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  highContext?: boolean;
  variant?: GlassButtonVariant;
  /** Any valid CSS width value e.g. "120px", "100%". Defaults to fit-content. */
  width?: string | number;
  /** Any valid CSS height value e.g. "44px". Defaults to fit-content. */
  height?: string | number;
  /** CSS padding shorthand. Default: "0.5em 1em" */
  padding?: string | number;
  /** Overrides the variant background. Must be semi-transparent. */
  backgroundColor?: string;
  /** Blur radius. Default: "50px" */
  blurEffect?: string;
  /** Border-radius. Default: "20px" */
  borderRadius?: string | number;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * GlassButton
 *
 * Uses a real <button> element.
 *
 * The two fixes that make backdrop-filter work on a button:
 *
 * 1. backdrop-filter is declared in a <style> tag (not inline style).
 *    Inline `backdropFilter` on a <button> is silently ignored in Safari
 *    and some Chromium builds — the style tag bypasses this quirk.
 *
 * 2. ::before / ::after are real CSS pseudo-elements on the same <button>,
 *    also via the <style> tag. This avoids any child stacking-context trap.
 *    overflow:hidden on the button clips them to the border-radius shape.
 *
 * useId() gives each instance a unique class so the injected CSS is scoped.
 */
const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      className = "",
      variant = "default",
      highContext = false,
      width,
      height,
      padding = "0.5em 1em",
      backgroundColor,
      blurEffect = "20px",
      borderRadius = "20px",
      style,
      ...rest
    },
    ref,
  ) => {
    // ─────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────

    const VARIANT_BG: Record<GlassButtonVariant, string> = {
      default: `rgba(255, 255, 255, ${highContext ? 0.7 : 0.4})`,
      primary: `rgba(59,  130, 246, ${highContext ? 0.7 : 0.35})`,
      secondary: `rgba(107, 114, 128, ${highContext ? 0.7 : 0.35})`,
      danger: `rgba(239,  68,  68, ${highContext ? 0.7 : 0.35})`,
    };

    const uid = useId().replace(/:/g, "");
    const cls = `gbtn-${uid}`;
    const bg = backgroundColor ?? VARIANT_BG[variant];
    const br =
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

    return (
      <>
        <style>{`
          .${cls} {
            /* Fix 1: backdrop-filter in stylesheet beats inline-style quirks */
            backdrop-filter: blur(${blurEffect});
            -webkit-backdrop-filter: blur(${blurEffect});
          }

          /* Fix 2: real ::before — top horizontal shimmer (exact .glass-card match) */
          .${cls}::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.8),
              transparent
            );
            pointer-events: none;
          }

          /* Fix 2: real ::after — left vertical shimmer (exact .glass-card match) */
          .${cls}::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 1px;
            height: 100%;
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.8),
              transparent,
              rgba(255, 255, 255, 0.3)
            );
            pointer-events: none;
          }

          .${cls}:active:not(:disabled) {
            transform: scale(0.97);
          }
        `}</style>

        <button
          ref={ref}
          className={`${cls} ${className}`}
          style={
            {
              /* Layout */
              position: "relative" /* needed for ::before / ::after */,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width,
              height,
              padding,
              borderRadius: br,
              overflow:
                "hidden" /* clips ::before / ::after to border-radius */,
              boxSizing: "border-box",

              /* Glass surface — background must be semi-transparent */
              background: bg,

              /* Border & shadow — exact .glass-card values */
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: [
                "0 8px 32px rgba(0, 0, 0, 0.1)",
                "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                "inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
                "inset 0 0 0px 0px rgba(255, 255, 255, 0)",
              ].join(", "),

              /* Typography */
              fontSize: "inherit",
              color: "rgba(50, 50, 50, 1)",
              cursor: "pointer",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              transition: "transform 150ms ease",

              /* Reset browser button defaults */
              appearance: "none",

              ...style,
            } as React.CSSProperties
          }
          {...rest}
        >
          <div
            className={`w-full h-full absolute top-0 left-0`}
            style={{
              filter: "blur(10px)",
              background: backgroundColor
                ? backgroundColor
                : VARIANT_BG[variant],
            }}
          />

          {/* z-index:1 lifts content above ::before / ::after */}
          <span
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: "0.4em",
            }}
          >
            {children}
          </span>
        </button>
      </>
    );
  },
);

GlassButton.displayName = "GlassButton";

export default GlassButton;
