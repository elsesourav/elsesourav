import { cn } from "@/lib/cn";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#6f788c]",
        "focus-visible:border-[#1f5ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5ed4]/20",
        className,
      )}
      {...props}
    />
  );
});
