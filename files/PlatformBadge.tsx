import type { ComponentType } from "react";
import { Globe, Smartphone, Tv } from "lucide-react";
import { AndroidIcon, AppleIcon, WindowsIcon } from "./icons";
import { cn } from "./utils";
import type { Platform } from "./types";

const PLATFORMS: Record<Platform, { label: string; Icon: ComponentType<{ className?: string }> }> = {
  ios: { label: "iOS", Icon: Smartphone },
  android: { label: "Android", Icon: AndroidIcon },
  web: { label: "Web", Icon: Globe },
  windows: { label: "Windows", Icon: WindowsIcon },
  mac: { label: "Mac", Icon: AppleIcon },
  "android-tv": { label: "Android TV", Icon: Tv },
};

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  const { label, Icon } = PLATFORMS[platform];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium leading-none text-slate-600",
        "transition-colors duration-300 group-hover:bg-slate-200/70",
        "dark:bg-white/[0.06] dark:text-slate-300 dark:group-hover:bg-white/10",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

export function PlatformList({
  platforms,
  max,
  className,
}: {
  platforms: Platform[];
  /** Collapse extras into a "+N" pill */
  max?: number;
  className?: string;
}) {
  const visible = max ? platforms.slice(0, max) : platforms;
  const hidden = platforms.length - visible.length;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((p) => (
        <PlatformBadge key={p} platform={p} />
      ))}
      {hidden > 0 && (
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium leading-none text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
          +{hidden}
        </span>
      )}
    </div>
  );
}
