'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { AdminScreenshotItemRow } from './AdminScreenshotItemRow';
import { MediaPickerModal } from '@/features/admin/media/components/MediaPickerModal';
import { uploadMultipleAdminImageFiles } from '@/features/admin/media/utils/upload-client';
import { inspectUrlDimensions, type ImageDimensionInfo } from '@/features/admin/media/utils/image-dimensions';
import {
  Images,
  Plus,
  Upload,
  HardDrive,
  FolderOpen,
  ClipboardPaste,
  Sparkles,
  Loader2,
  Smartphone,
  Monitor,
  AlertCircle,
} from 'lucide-react';

export interface AdminAppScreenshotsManagerProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
}

type FilterView = 'all' | 'desktop' | 'mobile';

export function AdminAppScreenshotsManager({
  screenshots,
  onChange,
}: AdminAppScreenshotsManagerProps) {
  const [filterView, setFilterView] = React.useState<FilterView>('all');
  const [dimensionsMap, setDimensionsMap] = React.useState<Record<string, ImageDimensionInfo>>({});
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadQueue, setUploadQueue] = React.useState<{ current: number; total: number; percent: number } | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Inspect dimensions for all screenshots to enable filter tabs & ratio badges
  React.useEffect(() => {
    let cancelled = false;

    screenshots.forEach((url) => {
      if (!url || dimensionsMap[url]) return;
      void inspectUrlDimensions(url).then((info) => {
        if (!cancelled) {
          setDimensionsMap((prev) => ({ ...prev, [url]: info }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [screenshots, dimensionsMap]);

  // Compute counts for Desktop and Mobile
  const { desktopCount, mobileCount } = React.useMemo(() => {
    let d = 0;
    let m = 0;
    for (const url of screenshots) {
      const dim = dimensionsMap[url];
      if (dim?.isPortrait) {
        m++;
      } else {
        d++;
      }
    }
    return { desktopCount: d, mobileCount: m };
  }, [screenshots, dimensionsMap]);

  // Filtered list indices
  const filteredIndices = React.useMemo(() => {
    return screenshots
      .map((url, originalIdx) => ({ url, originalIdx }))
      .filter(({ url }) => {
        if (filterView === 'all') return true;
        const dim = dimensionsMap[url];
        if (filterView === 'mobile') return dim?.isPortrait === true;
        if (filterView === 'desktop') return !dim || dim.isPortrait === false;
        return true;
      });
  }, [screenshots, filterView, dimensionsMap]);

  const handleUploadFiles = async (rawFiles: File[]) => {
    const validFiles = rawFiles.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setUploadError('Please select valid image files (PNG, JPG, WebP, SVG)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadQueue({ current: 0, total: validFiles.length, percent: 5 });

    try {
      const batchRes = await uploadMultipleAdminImageFiles(
        validFiles,
        'apps',
        (completed, total) => {
          setUploadQueue({
            current: completed,
            total,
            percent: Math.min(100, Math.round((completed / total) * 100)),
          });
        }
      );

      if (!batchRes.success || batchRes.urls.length === 0) {
        const firstErr = batchRes.results[0]?.error;
        throw new Error(firstErr || 'Failed to upload screenshots');
      }

      // Append new URLs
      onChange([...screenshots, ...batchRes.urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload screenshots');
    } finally {
      setIsUploading(false);
      setUploadQueue(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    void handleUploadFiles(Array.from(fileList));
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        const files: File[] = [];

        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const ext = imageType.split('/')[1] || 'png';
            files.push(new File([blob], `clipboard-shot-${Date.now()}-${files.length}.${ext}`, {
              type: imageType,
            }));
          }
        }

        if (files.length > 0) {
          await handleUploadFiles(files);
          return;
        }

        setUploadError('No image found in clipboard. Copy an image first.');
      } else {
        setUploadError('Direct clipboard reading not supported. Press ⌘V / Ctrl+V to paste.');
      }
    } catch {
      setUploadError('Clipboard access denied. Press ⌘V / Ctrl+V to paste directly.');
    }
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
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Screenshots &amp; Showcase Gallery
          </h4>
        </div>

        {/* Ratio & Device Statistics Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {screenshots.length} {screenshots.length === 1 ? 'image' : 'images'}
          </span>
          {desktopCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              <Monitor className="w-3 h-3" />
              <span>{desktopCount} Desktop (16:9)</span>
            </span>
          )}
          {mobileCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              <Smartphone className="w-3 h-3" />
              <span>{mobileCount} Mobile (3:4)</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Upload multiple application screenshots in desktop (16:9 / 21:9), mobile (3:4), or custom dimensions.
        These are automatically categorized and showcased in the public interactive carousel and lightbox.
      </p>

      {/* Multi-Image Upload Dropzone & Actions */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            void handleUploadFiles(Array.from(e.dataTransfer.files));
          }
        }}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all space-y-3 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          disabled={isUploading}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left space-y-0.5">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload Screenshots (Batch or Single)</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Drag &amp; drop multiple desktop &amp; mobile images, or select from device
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all font-semibold text-zinc-800 dark:text-zinc-200 text-xs cursor-pointer shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
              <span>Select Multiple</span>
            </button>

            <button
              type="button"
              onClick={handlePasteClipboard}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all font-semibold text-zinc-800 dark:text-zinc-200 text-xs cursor-pointer shadow-xs"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500" />
              <span>Paste Image</span>
              <Sparkles className="w-3 h-3 text-emerald-500" />
            </button>

            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition-all font-semibold text-xs cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Media Library</span>
            </button>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && uploadQueue && (
          <div className="space-y-1.5 pt-1 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20">
            <div className="flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>
                  Uploading {uploadQueue.current} of {uploadQueue.total} screenshots...
                </span>
              </span>
              <span className="font-mono text-[11px]">{uploadQueue.percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${uploadQueue.percent}%` }}
              />
            </div>
          </div>
        )}

        {uploadError && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs (All / Desktop / Mobile) if screenshots exist */}
      {screenshots.length > 0 && (
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterView('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterView === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              All ({screenshots.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterView('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                filterView === 'desktop'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3 h-3 text-indigo-400" />
              <span>Desktop ({desktopCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterView('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                filterView === 'mobile'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Mobile ({mobileCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Existing Screenshots List */}
      {screenshots.length > 0 ? (
        <div className="space-y-3">
          {filteredIndices.map(({ url, originalIdx }) => (
            <AdminScreenshotItemRow
              key={`${url}-${originalIdx}`}
              url={url}
              index={originalIdx}
              total={screenshots.length}
              onUpdate={(newUrl) => handleUpdateScreenshot(originalIdx, newUrl)}
              onRemove={() => handleRemoveScreenshot(originalIdx)}
              onMoveUp={() => handleMoveUp(originalIdx)}
              onMoveDown={() => handleMoveDown(originalIdx)}
            />
          ))}
          {filteredIndices.length === 0 && (
            <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No screenshots matching the selected filter ({filterView}).
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10">
          No screenshots added yet. Upload desktop (16:9) or mobile (3:4) screenshots above.
        </div>
      )}

      {/* Media Picker Modal for Appending from Library */}
      <MediaPickerModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(selectedUrl) => {
          if (selectedUrl) {
            onChange([...screenshots, selectedUrl]);
          }
          setIsLibraryOpen(false);
        }}
        defaultCategory="apps"
        title="Add Screenshot from Media Library"
      />
    </div>
  );
}
