import { cn } from "@/lib/cn";
import type { LabelHTMLAttributes } from "react";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-semibold uppercase tracking-wide text-[#55607a]",
        className,
      )}
      {...props}
    />
  );
}
