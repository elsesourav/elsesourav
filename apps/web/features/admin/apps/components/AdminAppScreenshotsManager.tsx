'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Images, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface AdminAppScreenshotsManagerProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
}

export function AdminAppScreenshotsManager({
  screenshots,
  onChange,
}: AdminAppScreenshotsManagerProps) {
  const [newImageUrl, setNewImageUrl] = React.useState('');

  const handleAddScreenshot = (url: string) => {
    if (!url.trim()) return;
    onChange([...screenshots, url.trim()]);
    setNewImageUrl('');
  };

  const handleUpdateScreenshot = (index: number, newUrl: string) => {
    if (!newUrl.trim()) {
      handleRemoveScreenshot(index);
      return;
    }
    const updated = [...screenshots];
    updated[index] = newUrl.trim();
    onChange(updated);
  };

  const handleRemoveScreenshot = (index: number) => {
    const updated = screenshots.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...screenshots];
    const temp = updated[index - 1]!;
    updated[index - 1] = updated[index]!;
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= screenshots.length - 1) return;
    const updated = [...screenshots];
    const temp = updated[index + 1]!;
    updated[index + 1] = updated[index]!;
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Screenshots &amp; Showcase Gallery
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {screenshots.length} {screenshots.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Upload multiple application screenshots in desktop (16:9 / 21:9), mobile (9:16 / 3:4), or custom dimensions.
        These will be showcased in the public interactive carousel and lightbox viewer.
      </p>

      {/* Existing Screenshots List */}
      {screenshots.length > 0 && (
        <div className="space-y-3">
          {screenshots.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  #{idx + 1}
                </span>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move earlier in showcase"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === screenshots.length - 1}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move later in showcase"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <ImageInputWithLibrary
                  value={url}
                  onChange={(val) => handleUpdateScreenshot(idx, val)}
                  folder="apps"
                  defaultCategory="apps"
                  previewShape="banner"
                  placeholder="Screenshot URL or upload/select from library"
                />
              </div>

              <div className="flex justify-end shrink-0 sm:pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveScreenshot(idx)}
                  className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 h-8 px-2"
                  title="Remove screenshot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Remove</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Screenshot Slot */}
      <div className="p-3.5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <Plus className="w-3.5 h-3.5 text-indigo-500" />
          <span>Add Another Showcase Image / Screenshot</span>
        </div>
        <ImageInputWithLibrary
          label="New Screenshot"
          value={newImageUrl}
          onChange={(url) => {
            if (url) handleAddScreenshot(url);
          }}
          folder="apps"
          defaultCategory="apps"
          previewShape="banner"
          placeholder="Upload or choose from library to append to gallery"
        />
      </div>
    </div>
  );
}
