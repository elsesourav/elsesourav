'use client';

import * as React from 'react';
import { Button, IconButton } from '@elsesourav/ui';
import { BlurUpImage } from '@elsesourav/ui/interior';
import { inspectUrlDimensions, type ImageDimensionInfo } from '@/features/admin/media/utils/image-dimensions';
import { MediaPickerModal } from '@/features/admin/media/components/MediaPickerModal';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  FolderOpen,
  Smartphone,
  Monitor,
  Square,
  ExternalLink,
} from 'lucide-react';

export interface AdminScreenshotItemRowProps {
  url: string;
  index: number;
  total: number;
  onUpdate: (newUrl: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function AdminScreenshotItemRow({
  url,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: AdminScreenshotItemRowProps) {
  const [dimInfo, setDimInfo] = React.useState<ImageDimensionInfo | null>(null);
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputUrl, setInputUrl] = React.useState(url);

  React.useEffect(() => {
    setInputUrl(url);
    if (!url) return;
    let cancelled = false;

    void inspectUrlDimensions(url).then((info) => {
      if (!cancelled) setDimInfo(info);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const isPortrait = dimInfo?.isPortrait ?? false;
  const orientationLabel = dimInfo?.label ?? 'Detecting...';

  const handleCommitEdit = () => {
    setIsEditing(false);
    if (inputUrl.trim() && inputUrl.trim() !== url) {
      onUpdate(inputUrl.trim());
    }
  };

  return (
    <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Index & Reorder Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          #{index + 1}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move earlier"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move later"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Ratio-Aware Thumbnail Preview */}
      <div className="shrink-0 flex items-center justify-center">
        <div
          className={`relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-xs transition-all ${
            isPortrait
              ? 'w-12 sm:w-14 aspect-[9/16] ring-1 ring-emerald-500/20'
              : 'w-24 sm:w-28 aspect-[16/9] ring-1 ring-indigo-500/20'
          }`}
          title={`${orientationLabel} - ${url}`}
        >
          <BlurUpImage
            src={url}
            alt={`Screenshot ${index + 1}`}
            fill
            objectFit="cover"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Content & Metadata Area */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Orientation Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
              isPortrait
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            {isPortrait ? (
              <Smartphone className="w-3 h-3 text-emerald-500" />
            ) : dimInfo?.orientation === 'square' ? (
              <Square className="w-3 h-3 text-indigo-500" />
            ) : (
              <Monitor className="w-3 h-3 text-indigo-500" />
            )}
            <span>{orientationLabel}</span>
          </span>

          {dimInfo && (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              {dimInfo.width}×{dimInfo.height}px
            </span>
          )}
        </div>

        {/* Editable or Display URL */}
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              onBlur={handleCommitEdit}
              autoFocus
              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none ring-2 ring-indigo-500/30"
              placeholder="Paste image URL..."
            />
            <Button type="button" size="xs" onClick={handleCommitEdit}>
              Save
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate hover:text-indigo-600 dark:hover:text-indigo-400 text-left max-w-full"
              title="Click to edit URL directly"
            >
              {url}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons: Replace & Remove */}
      <div className="flex items-center gap-1.5 shrink-0 justify-end pt-1 sm:pt-0">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setIsPickerOpen(true)}
          className="text-xs rounded-xl h-7 px-2.5 gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Replace image with another from library"
        >
          <FolderOpen className="w-3 h-3 text-indigo-500" />
          <span>Replace</span>
        </Button>

        <IconButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
          aria-label="Remove screenshot"
          icon={<Trash2 className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Media Picker Modal for Replacing Image */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(newUrl) => {
          onUpdate(newUrl);
          setIsPickerOpen(false);
        }}
        currentValue={url}
        defaultCategory="apps"
        title="Replace Screenshot"
      />
    </div>
  );
}
