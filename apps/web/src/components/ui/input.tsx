import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#6f788c]",
        "focus-visible:border-[#1f5ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5ed4]/20",
        className,
      )}
      {...props}
    />
  );
}
