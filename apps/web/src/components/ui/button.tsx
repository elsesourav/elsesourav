import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonTone = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const toneClassName: Record<ButtonTone, string> = {
  primary:
    "border-transparent bg-[#14171f] text-white hover:bg-[#0f1219] disabled:bg-[#495067]",
  secondary:
    "border-black/20 bg-white text-[#14171f] hover:bg-[#f6f8fc] disabled:text-[#7a8195]",
  danger:
    "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:text-red-300",
  ghost:
    "border-transparent bg-transparent text-[#1f5ed4] hover:bg-[#edf3ff] disabled:text-[#8ba5d9]",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export function Button({
  tone = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-lg border font-medium transition disabled:cursor-not-allowed",
        toneClassName[tone],
        sizeClassName[size],
        className,
      )}
      {...props}
    />
  );
}
