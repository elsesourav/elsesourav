'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { Share2, Copy, Check } from 'lucide-react';

interface BlogShareButtonsProps {
  title: string;
  url: string;
}

export function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;

  return (
    <div className="flex items-center gap-2" aria-label="Share this article">
      <span className="text-xs text-zinc-400 font-medium mr-1 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5 text-zinc-500" /> Share:
      </span>

      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
        aria-label="Share on X (Twitter)"
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">Post</span>
        </Button>
      </a>

      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
        aria-label="Share on LinkedIn"
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
        >
          <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          <span className="hidden sm:inline">LinkedIn</span>
        </Button>
      </a>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 px-2.5 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
        aria-label="Copy link to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </Button>
    </div>
  );
}
