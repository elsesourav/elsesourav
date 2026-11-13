'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { AdminMediaItem, MediaDomain, MediaFolder, MediaType } from '@elsesourav/types';
import { Card, Button, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import { uploadAdminImageFile } from '../utils/upload-client';
import { Upload, X, AlertCircle, ClipboardPaste, HardDrive, Sparkles } from 'lucide-react';

const FOLDER_ITEMS = [
  { value: 'general', label: 'general (General application media)' },
  { value: 'apps', label: 'apps (App icons & banners)' },
  { value: 'blog', label: 'blog (Devlog post covers)' },
  { value: 'help', label: 'help (Knowledge base tutorial diagrams)' },
  { value: 'users', label: 'users (User profile avatars)' },
];

const PURPOSE_ITEMS = [
  { value: 'generic', label: 'Generic Asset' },
  { value: 'app_icon', label: 'App Icon' },
  { value: 'app_screenshot', label: 'App Screenshot / Banner' },
  { value: 'blog_cover', label: 'Blog Cover' },
  { value: 'help_image', label: 'Help Guide Illustration' },
  { value: 'avatar', label: 'User Avatar' },
];

interface AdminMediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (item: AdminMediaItem) => void;
}

export function AdminMediaUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: AdminMediaUploadModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState<MediaFolder>('general');
  const [uploadType, setUploadType] = React.useState<MediaType>('generic');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const uploadFile = React.useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(20);

      try {
        setUploadProgress(40);
        const res = await uploadAdminImageFile(file, uploadFolder);

        if (!res.success || !res.url) {
          throw new Error(res.error || 'Upload failed');
        }

        setUploadProgress(100);

        const newItem: AdminMediaItem = {
          id: res.publicId || file.name,
          publicId: res.publicId || file.name,
          secureUrl: res.url,
          domain: uploadFolder as MediaDomain,
          format: file.type.split('/')[1] || 'image',
          bytes: file.size,
          createdAt: Date.now(),
          isReferenced: false,
          references: [],
        };

        onUploadSuccess(newItem);
        onClose();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Failed to upload asset');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [uploadFolder, onUploadSuccess, onClose]
  );

  // Global paste handler while modal is open
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            e.stopPropagation();
            void uploadFile(file);
            return;
          }
        }
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
  }, [isOpen, isUploading, uploadFile, onClose]);

  if (!isOpen || !mounted) return null;
  const targetHost = typeof document !== 'undefined' ? document.body : null;
  if (!targetHost) return null;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void uploadFile(file);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const ext = imageType.split('/')[1] || 'png';
            const file = new File([blob], `clipboard-${Date.now()}.${ext}`, { type: imageType });
            await uploadFile(file);
            return;
          }
        }
        setUploadError('No image found in clipboard. Please copy an image first.');
      } else {
        setUploadError('Direct clipboard reading not supported. Press ⌘V / Ctrl+V to paste.');
      }
    } catch {
      setUploadError('Clipboard access denied. Press ⌘V / Ctrl+V to paste directly.');
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

          {/* Device & Clipboard Buttons */}
          <div className="space-y-2 pt-1">
            <label className="text-zinc-700 dark:text-zinc-300 block font-medium">
              Choose Image Source
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              disabled={isUploading}
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all font-semibold text-zinc-800 dark:text-zinc-200 text-xs text-center cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-indigo-500" />
                <span>From Device</span>
              </button>

              <button
                type="button"
                onClick={handlePasteClipboard}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all font-semibold text-zinc-800 dark:text-zinc-200 text-xs text-center cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4 text-emerald-500" />
                <span className="flex items-center gap-1">
                  <span>From Clipboard</span>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center pt-0.5">
              Or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold">⌘V</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold">Ctrl+V</kbd> to paste directly
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                <span>Uploading to Media Library...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
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
