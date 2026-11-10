'use client';

import * as React from 'react';
import type { AdminMediaItem, MediaDomain, MediaFolder, MediaType } from '@elsesourav/types';
import { Card, Button, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import { adminUploadImageFileAction } from '../actions/admin-media-actions';
import { Upload, X, AlertCircle } from 'lucide-react';

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
  const [uploadFolder, setUploadFolder] = React.useState<MediaFolder>('general');
  const [uploadType, setUploadType] = React.useState<MediaType>('generic');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadFolder);

      setUploadProgress(50);
      const res = await adminUploadImageFileAction(formData);

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
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Upload to Media Library</h3>
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
            <label className="text-zinc-700 dark:text-zinc-300 block font-medium">Target Storage Folder</label>
            <Dropdown
              items={FOLDER_ITEMS}
              value={uploadFolder}
              onChange={(val) => setUploadFolder(val as MediaFolder)}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-700 dark:text-zinc-300 block font-medium">Media Purpose</label>
            <Dropdown
              items={PURPOSE_ITEMS}
              value={uploadType}
              onChange={(val) => setUploadType(val as MediaType)}
              className="w-full"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-zinc-700 dark:text-zinc-300 block font-medium">Select Image File</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              disabled={isUploading}
              onChange={handleDirectUpload}
              className="w-full text-xs text-zinc-600 dark:text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
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
    </div>
  );
}
