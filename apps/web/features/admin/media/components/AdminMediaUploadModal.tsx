'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { AdminMediaItem, MediaDomain, MediaFolder, MediaType } from '@elsesourav/types';
import { Card, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import { uploadMultipleAdminImageFiles } from '../utils/upload-client';
import { Upload, X, AlertCircle, ClipboardPaste, HardDrive, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

const FOLDER_ITEMS = [
  { value: 'general', label: 'general (General application media)' },
  { value: 'apps', label: 'apps (App icons & banners)' },
  { value: 'blog', label: 'blog (Devlog & update covers)' },
  { value: 'help', label: 'help (Knowledge base tutorial diagrams)' },
  { value: 'users', label: 'users (User profile avatars)' },
];

const PURPOSE_ITEMS = [
  { value: 'generic', label: 'Generic Asset' },
  { value: 'app_icon', label: 'App Icon' },
  { value: 'app_screenshot', label: 'App Screenshot / Banner' },
  { value: 'blog_cover', label: 'Update Cover' },
  { value: 'help_image', label: 'Help Guide Illustration' },
  { value: 'avatar', label: 'User Avatar' },
];

export interface AdminMediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (item: AdminMediaItem) => void;
  onBatchUploadSuccess?: (items: AdminMediaItem[]) => void;
}

export function AdminMediaUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  onBatchUploadSuccess,
}: AdminMediaUploadModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState<MediaFolder>('general');
  const [uploadType, setUploadType] = React.useState<MediaType>('generic');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadQueue, setUploadQueue] = React.useState<{ current: number; total: number; percent: number } | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const uploadFiles = React.useCallback(
    async (rawFiles: File[]) => {
      const validFiles = rawFiles.filter((f) => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setUploadError('Please select valid image files (PNG, JPG, WebP, SVG, GIF)');
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      setUploadQueue({ current: 0, total: validFiles.length, percent: 5 });

      try {
        const batchRes = await uploadMultipleAdminImageFiles(
          validFiles,
          uploadFolder,
          (completed, total) => {
            setUploadQueue({
              current: completed,
              total,
              percent: Math.min(100, Math.round((completed / total) * 100)),
            });
          }
        );

        if (!batchRes.success || batchRes.uploaded.length === 0) {
          const firstErr = batchRes.failed[0]?.error;
          throw new Error(firstErr || 'Failed to upload images');
        }

        const newItems: AdminMediaItem[] = batchRes.uploaded
          .filter((u): u is typeof u & { url: string } => Boolean(u.url))
          .map((u) => ({
            id: u.publicId || u.file.name,
            publicId: u.publicId || u.file.name,
            secureUrl: u.url,
            domain: uploadFolder as MediaDomain,
            format: u.file.type.split('/')[1] || 'image',
            bytes: u.file.size,
            createdAt: Date.now(),
            isReferenced: false,
            references: [],
          }));

        if (onBatchUploadSuccess) {
          onBatchUploadSuccess(newItems);
        } else if (newItems[0]) {
          onUploadSuccess(newItems[0]);
        }

        onClose();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Failed to upload assets');
      } finally {
        setIsUploading(false);
        setUploadQueue(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [uploadFolder, onUploadSuccess, onBatchUploadSuccess, onClose]
  );

  // Global paste handler while modal is open
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        void uploadFiles(pastedFiles);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUploading) {
        onClose();
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isUploading, uploadFiles, onClose]);

  if (!isOpen || !mounted) return null;
  const targetHost = typeof document !== 'undefined' ? document.body : null;
  if (!targetHost) return null;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    void uploadFiles(Array.from(fileList));
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
            files.push(new File([blob], `clipboard-${Date.now()}-${files.length}.${ext}`, { type: imageType }));
          }
        }
        if (files.length > 0) {
          await uploadFiles(files);
          return;
        }
        setUploadError('No image found in clipboard. Please copy an image first.');
      } else {
        setUploadError('Direct clipboard reading not supported. Press ⌘V / Ctrl+V to paste.');
      }
    } catch {
      setUploadError('Clipboard access denied. Press ⌘V / Ctrl+V to paste directly.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-media-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99990] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 id="upload-media-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Upload to Media Library
            </h3>
          </div>
          <IconButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close Upload Dialog"
            icon={<X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
            className="rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          />
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-700 dark:text-zinc-300 block font-medium">
              Target Storage Folder
            </label>
            <Dropdown
              items={FOLDER_ITEMS}
              value={uploadFolder}
              onChange={(val) => setUploadFolder(val as MediaFolder)}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-700 dark:text-zinc-300 block font-medium">
              Media Purpose
            </label>
            <Dropdown
              items={PURPOSE_ITEMS}
              value={uploadType}
              onChange={(val) => setUploadType(val as MediaType)}
              className="w-full"
            />
          </div>

          {/* Multiple File Dropzone & Selection */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all space-y-3 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              disabled={isUploading}
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="text-center space-y-1">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Drag &amp; drop multiple images here
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Supports single or batch upload (PNG, JPG, WebP, SVG)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all font-semibold text-zinc-800 dark:text-zinc-200 text-xs cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                <span>Select Multiple</span>
              </button>

              <button
                type="button"
                onClick={handlePasteClipboard}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all font-semibold text-zinc-800 dark:text-zinc-200 text-xs cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500" />
                <span className="flex items-center gap-1">
                  <span>Paste Images</span>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
              Or press <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold">⌘V</kbd> / <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold">Ctrl+V</kbd> to paste
            </p>
          </div>

          {isUploading && uploadQueue && (
            <div className="space-y-2 pt-1 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20">
              <div className="flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Uploading {uploadQueue.current} of {uploadQueue.total} assets...
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
        </div>
      </Card>
    </div>,
    targetHost
  );
}
