'use client';

import * as React from 'react';
import { Button, Input } from '@elsesourav/ui';
import { MediaPickerModal } from './MediaPickerModal';
import { adminUploadImageFileAction } from '../actions/admin-media-actions';
import type { MediaDomain, MediaFolder } from '@elsesourav/types';
import { Image as ImageIcon, Upload, FolderOpen, X, Loader2, ExternalLink } from 'lucide-react';

export interface ImageInputWithLibraryProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  folder?: MediaFolder;
  defaultCategory?: MediaDomain;
  previewShape?: 'circle' | 'square' | 'banner';
  className?: string;
}

export function ImageInputWithLibrary({
  value,
  onChange,
  label,
  placeholder = 'https://... or select from library',
  required = false,
  folder = 'general',
  defaultCategory = 'general',
  previewShape = 'square',
  className = '',
}: ImageInputWithLibraryProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await adminUploadImageFileAction(formData);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setUploadError(res.error || 'Upload failed');
      }
    } catch {
      setUploadError('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const previewClasses = {
    circle:
      'w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
    square:
      'w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
    banner:
      'w-20 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
  }[previewShape];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-300">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex items-center gap-3">
        {/* Preview Thumbnail */}
        <div className={previewClasses}>
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-zinc-600" />
          )}
        </div>

        {/* Input & Action Buttons */}
        <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 flex-1 min-w-[200px]"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs rounded-xl border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 gap-1.5 h-9 px-3 shrink-0"
              title="Upload image file"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Upload</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs rounded-xl border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 gap-1.5 h-9 px-3 shrink-0"
              title="Select from Media Library"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Media Library</span>
            </Button>
          </div>
        </div>
      </div>

      {uploadError && <p className="text-[11px] text-rose-400">{uploadError}</p>}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => onChange(url)}
        currentValue={value}
        defaultCategory={defaultCategory}
        title={`Select ${label || 'Image'}`}
      />
    </div>
  );
}
