"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { useEffect } from "react";

const widthClassName = {
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
} as const;

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = "lg",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: keyof typeof widthClassName;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-auto rounded-2xl border border-black/10 bg-white shadow-[0_30px_60px_-35px_rgba(20,23,31,0.75)]",
          widthClassName[width],
        )}
      >
        <header className="border-b border-black/10 px-4 py-3 sm:px-5">
          <h2 className="text-lg font-semibold text-[#121b2f]">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[#586177]">{description}</p>
          ) : null}
        </header>
        <div className="px-4 py-4 sm:px-5">{children}</div>
        {footer ? (
          <footer className="border-t border-black/10 px-4 py-3 sm:px-5">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
