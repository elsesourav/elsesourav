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
    <div className="flex items-center gap-2" aria-label="Share this article">
      <ShareButton
        title={title}
        text={excerpt}
        canonicalPathOrUrl={url}
        size="sm"
        label="Share Note"
        className="h-8 px-3 text-xs border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800"
      />
    </div>
  );
}
