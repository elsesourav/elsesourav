'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { Bookmark, Check } from 'lucide-react';

interface SaveAppButtonProps {
  appId: string;
  appSlug: string;
  initialIsSaved?: boolean;
  isAuthenticated?: boolean;
}

export function SaveAppButton({
  appId,
  appSlug,
  initialIsSaved = false,
  isAuthenticated = false,
}: SaveAppButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = React.useState(initialIsSaved);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/apps/${encodeURIComponent(appSlug)}`);
      return;
    }

    setIsLoading(true);
    try {
      // Optimistic toggle
      setIsSaved((prev) => !prev);
      // Future: Call library API endpoint
    } catch {
      setIsSaved((prev) => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`border-zinc-800 text-sm gap-1.5 transition-all ${
        isSaved
          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
          : 'bg-zinc-800/80 text-zinc-300 hover:text-white'
      }`}
      aria-label={isSaved ? 'Remove from library' : 'Save to library'}
    >
      {isSaved ? (
        <>
          <Check className="w-4 h-4 text-indigo-400" />
          <span>In Library</span>
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <span>Save to Library</span>
        </>
      )}
    </Button>
  );
}
