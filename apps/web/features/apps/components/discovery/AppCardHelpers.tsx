import * as React from 'react';
import type { AppPlatform } from '@elsesourav/types';
import {
  Apple,
  Compass,
  Cpu,
  Globe,
  Layers,
  Palette,
  Radio,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  Wrench,
} from 'lucide-react';

/* ─── Category → Fallback Icon ─── */
export function getCategoryFallbackIcon(category?: string) {
  const norm = (category || '').toLowerCase();
  if (norm.includes('ai') || norm.includes('ml') || norm.includes('neural'))
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  if (norm.includes('auto') || norm.includes('flow') || norm.includes('e-com'))
    return <Cpu className="w-5 h-5 text-emerald-400" />;
  if (norm.includes('hardware') || norm.includes('iot') || norm.includes('embedded'))
    return <Radio className="w-5 h-5 text-cyan-400" />;
  if (norm.includes('media') || norm.includes('design') || norm.includes('creative'))
    return <Palette className="w-5 h-5 text-rose-400" />;
  if (norm.includes('simul') || norm.includes('algo') || norm.includes('math'))
    return <Layers className="w-5 h-5 text-violet-400" />;
  if (norm.includes('util') || norm.includes('tool'))
    return <Wrench className="w-5 h-5 text-amber-400" />;
  if (norm.includes('terminal') || norm.includes('cli') || norm.includes('code'))
    return <Terminal className="w-5 h-5 text-indigo-400" />;
  return <Globe className="w-5 h-5 text-indigo-400" />;
}

/* ─── Platform Icon Helper ─── */
export const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  web: Globe,
  chrome: Compass,
  android: Smartphone,
  ios: Smartphone,
  macos: Apple,
  linux: Terminal,
  windows: Terminal,
  github: Terminal,
};

export function PlatformIcon({ platform }: { platform: AppPlatform }) {
  const Icon = PLATFORM_ICONS[platform] || Terminal;
  return <Icon className="w-3 h-3" />;
}

/* ─── Platform Label Helper ─── */
export const PLATFORM_LABELS: Record<string, string> = {
  web: 'Web',
  chrome: 'Chrome',
  android: 'Android',
  ios: 'iOS',
  macos: 'Mac',
  windows: 'Windows',
  linux: 'Linux',
  github: 'GitHub',
  download: 'Download',
  other: 'Other',
};

export function platformLabel(platform: AppPlatform): string {
  return PLATFORM_LABELS[platform] || platform;
}

/* ─── Compact Rating Count Formatter ─── */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/* ─── Star Rating Row ─── */
export function StarRating({
  value,
  count,
  size = 'sm',
}: {
  value: number;
  count?: number;
  size?: 'xs' | 'sm';
}) {
  const max = 5;
  const starCls = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textCls = size === 'xs' ? 'text-[11px]' : 'text-xs';

  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label={`Rated ${value.toFixed(1)} out of ${max}`}
    >
      <div className="flex items-center">
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(Math.max(value - i, 0), 1);
          return (
            <span key={i} className="relative inline-block">
              <Star
                className={`${starCls} shrink-0 fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700`}
              />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={`${starCls} max-w-none shrink-0 fill-amber-400 text-amber-400`} />
              </span>
            </span>
          );
        })}
      </div>
      <span className={`${textCls} font-semibold tabular-nums text-[hsl(var(--foreground))]`}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && count > 0 && (
        <span className={`${textCls} font-normal text-[hsl(var(--muted-foreground))]`}>
          ({formatCount(count)})
        </span>
      )}
    </div>
  );
}
