'use client';

import * as React from 'react';
import { ShareButton } from '@/components/share/ShareButton';

interface BlogShareButtonsProps {
  title: string;
  url: string;
  excerpt?: string;
}

export function BlogShareButtons({ title, url, excerpt }: BlogShareButtonsProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Share this note">
      <ShareButton
        title={title}
        text={excerpt}
        canonicalPathOrUrl={url}
        size="sm"
        label="Share Note"
        className="h-8 px-3 text-xs border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] hover:bg-[hsl(var(--surface-elevated))] text-[hsl(var(--foreground))]"
      />
    </div>
  );
}
