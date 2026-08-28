'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge, Button } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { LibraryItem } from '@elsesourav/types';
import { toggleSaveAppAction } from '../actions/library.actions';
import { Sparkles, Trash2, ArrowUpRight } from 'lucide-react';

interface LibraryAppCardProps {
  item: LibraryItem;
  onRemove?: (appId: string) => void;
}

export function LibraryAppCard({ item, onRemove }: LibraryAppCardProps) {
  const { app } = item;
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 96) : null;
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRemoving(true);
    try {
      const res = await toggleSaveAppAction(app.id);
      if (res.success && !res.isSaved) {
        onRemove?.(app.id);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const addedDate = new Date(item.addedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/80 p-5 rounded-2xl transition-all flex flex-col justify-between h-full backdrop-blur-sm group">
      <div className="space-y-3">
        {/* Top Icon & Info */}
        <div className="flex items-start gap-3.5">
          <Link href={`/apps/${app.slug}`} className="shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <Sparkles className="w-6 h-6 text-indigo-400" />
              )}
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={`/apps/${app.slug}`}>
              <h3 className="font-semibold text-base text-zinc-100 hover:text-white transition-colors truncate">
                {app.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 pt-0.5">
              <Badge variant="info" className="text-[10px] px-1.5 py-0">
                {app.primaryCategory}
              </Badge>
              <span className="text-[10px] text-zinc-500">Saved {addedDate}</span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {app.shortDescription}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/60">
        <Link href={`/apps/${app.slug}`}>
          <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 gap-1 p-0 h-auto">
            <span>Open App</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-xs text-zinc-500 hover:text-rose-400 gap-1 p-1 h-auto"
          title="Remove from Library"
          aria-label={`Remove ${app.name} from Library`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
