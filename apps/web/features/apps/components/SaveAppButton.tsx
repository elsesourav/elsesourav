'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { toggleSaveAppAction } from '@/features/library/actions/library.actions';

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
    const previousState = isSaved;
    setIsSaved(!previousState); // Optimistic update

    try {
      const result = await toggleSaveAppAction(appId);
      if (!result.success) {
        setIsSaved(previousState); // Rollback on error
      } else {
        setIsSaved(result.isSaved);
      }
    } catch {
      setIsSaved(previousState); // Rollback on failure
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
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
      ) : isSaved ? (
        <Check className="w-4 h-4 text-indigo-400" />
      ) : (
        <Bookmark className="w-4 h-4 text-indigo-400" />
      )}
      <span>{isSaved ? 'In Library' : 'Save to Library'}</span>
    </Button>
  );
}
