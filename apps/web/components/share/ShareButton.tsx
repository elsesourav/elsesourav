'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { Share2, Check } from 'lucide-react';
import { toAbsoluteUrl } from '@elsesourav/config';

export interface ShareButtonProps {
  title: string;
  text?: string;
  canonicalPathOrUrl: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  iconOnly?: boolean;
}

export function ShareButton({
  title,
  text,
  canonicalPathOrUrl,
  variant = 'outline',
  size = 'md',
  className = '',
  label = 'Share',
  iconOnly = false,
}: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const canonicalUrl = React.useMemo(() => toAbsoluteUrl(canonicalPathOrUrl), [canonicalPathOrUrl]);

  const handleShare = async () => {
    // 1. Prefer native Web Share API on supported devices (Mobile & Modern Desktop)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: text ? text.slice(0, 200) : title,
          url: canonicalUrl,
        });
        return;
      } catch (err) {
        // If user cancelled the native share sheet, gracefully exit without error
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fall through to clipboard copy if Web Share failed
      }
    }

    // 2. Fallback to clipboard Copy Link
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(canonicalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Fallback for restricted clipboard contexts
      try {
        const textarea = document.createElement('textarea');
        textarea.value = canonicalUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // Ignore clipboard failure
      }
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleShare}
      className={`min-h-[44px] sm:min-h-[40px] gap-2 active:scale-[0.98] transition-colors ${
        copied
          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
      } ${className}`}
      aria-label={copied ? 'Link copied to clipboard' : `Share ${title}`}
      title={copied ? 'Link copied!' : 'Share or copy canonical link'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-emerald-400" aria-live="polite">
            Link copied
          </span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-zinc-400 shrink-0" />
          {!iconOnly && <span className="text-xs sm:text-sm font-medium">{label}</span>}
        </>
      )}
    </Button>
  );
}
