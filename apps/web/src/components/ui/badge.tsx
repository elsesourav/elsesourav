import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClassName: Record<BadgeTone, string> = {
  neutral: "border-black/15 bg-[#f6f8fc] text-[#3f4757]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold",
        toneClassName[tone],
        className,
      )}
      {...props}
    />
  );
}
