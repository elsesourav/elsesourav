import * as React from "react"
import { cn } from "@/lib/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2",
        variant === "default" && "border-transparent bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/80",
        variant === "secondary" && "border-transparent bg-surface-active text-text-primary hover:bg-surface-active/80",
        variant === "destructive" && "border-transparent bg-status-danger text-white hover:bg-status-danger/80",
        variant === "success" && "border-transparent bg-status-success-bg text-status-success hover:opacity-80",
        variant === "warning" && "border-transparent bg-status-warning-bg text-status-warning hover:opacity-80",
        variant === "info" && "border-transparent bg-status-info-bg text-status-info hover:opacity-80",
        variant === "outline" && "text-text-primary border-border-strong",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
