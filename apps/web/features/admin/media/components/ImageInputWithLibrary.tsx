'use client';

import * as React from 'react';
import { Button, Input, ImageCropperModal } from '@elsesourav/ui';
import { MediaPickerModal } from './MediaPickerModal';
import { adminUploadImageFileAction } from '../actions/admin-media-actions';
import type { MediaDomain, MediaFolder } from '@elsesourav/types';
import { Image as ImageIcon, Upload, FolderOpen, X, Loader2, Crop } from 'lucide-react';

export interface ImageInputWithLibraryProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  folder?: MediaFolder;
  defaultCategory?: MediaDomain;
  previewShape?: 'circle' | 'square' | 'banner' | 'portrait';
  className?: string;
  fallbackUrl?: string;
}

export function ImageInputWithLibrary({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  folder = 'general',
  defaultCategory = 'general',
  previewShape = 'square',
  className = '',
  fallbackUrl,
}: ImageInputWithLibraryProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Cropper states
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [cropperSrc, setCropperSrc] = React.useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = React.useState<string>('image.webp');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const displayImage = value || fallbackUrl;
  const effectivePlaceholder =
    placeholder || (fallbackUrl ? 'Default asset active (upload to override)' : 'https://... or select from library');

  // Determine crop parameters based on previewShape
  const cropConfig = React.useMemo(() => {
    switch (previewShape) {
      case 'circle':
        return {
          aspectRatio: 1.0,
          cropShape: 'round' as const,
          width: 512,
          height: 512,
          allowedRatios: [{ id: '1:1', label: '1:1 Square', ratio: 1.0 }],
        };
      case 'portrait':
        return {
          aspectRatio: 3 / 4,
          cropShape: 'rect' as const,
          width: 600,
          height: 800,
          allowedRatios: [
            { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
            { id: '1:1', label: '1:1 Square', ratio: 1.0 },
          ],
        };
      case 'banner':
        return {
          aspectRatio: 16 / 9,
          cropShape: 'rect' as const,
          width: 1200,
          height: 675,
          allowedRatios: [
            { id: '16:9', label: '16:9 Banner', ratio: 16 / 9 },
            { id: '21:9', label: '21:9 Ultrawide', ratio: 21 / 9 },
          ],
        };
      case 'square':
      default:
        return {
          aspectRatio: 1.0,
          cropShape: 'rect' as const,
          width: 512,
          height: 512,
          allowedRatios: [{ id: '1:1', label: '1:1 Square', ratio: 1.0 }],
        };
    }
  }, [previewShape]);

  // Direct upload handler when image matches required ratio or user confirms crop
  const directUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);
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
    }
  };

  // Handle file picker selection with smart aspect ratio detection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file');
      return;
    }

    setUploadError(null);
    setCropperFileName(file.name.replace(/\.[^/.]+$/, '') + '.webp');
    const objectUrl = URL.createObjectURL(file);

    // Inspect image dimensions: if it doesn't match required ratio, automatically open cropper
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const targetRatio = cropConfig.aspectRatio;

      // Check if ratio matches within 5% tolerance
      const isRatioMatched = Math.abs(imgRatio - targetRatio) <= 0.05;

      if (!isRatioMatched) {
        // Automatically open the crop modal so the user can easily frame and crop it
        setCropperSrc(objectUrl);
        setIsCropperOpen(true);
      } else {
        // Image already matches target ratio perfectly: directly upload it
        directUpload(file);
      }
    };
    img.onerror = () => {
      directUpload(file);
    };

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    await directUpload(croppedFile);
  };

  const previewClasses = {
    circle:
      'w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center',
    square:
      'w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center',
    banner:
      'w-20 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center',
    portrait:
      'w-10 h-13 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center',
  }[previewShape];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header with Label and Optional Actions */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          {displayImage && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setCropperSrc(displayImage);
                setCropperFileName('cropped.webp');
                setIsCropperOpen(true);
              }}
              className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors h-6 px-1.5 rounded-lg"
              title="Crop image"
            >
              <Crop className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
              <span>Crop</span>
            </Button>
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange('')}
              className="text-[11px] text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors h-6 px-1.5 rounded-lg"
            >
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Preview Thumbnail with Click to Crop */}
        <div
          className={`${previewClasses} relative group ${displayImage ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (displayImage) {
              setCropperSrc(displayImage);
              setCropperFileName('cropped.webp');
              setIsCropperOpen(true);
            }
          }}
          title={displayImage ? 'Click to crop image' : undefined}
        >
          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt="Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Crop className="w-3.5 h-3.5 text-cyan-300" />
              </div>
            </>
          ) : (
            <ImageIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
          )}
        </div>

        {/* Input & Action Buttons */}
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 min-w-0">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={effectivePlaceholder}
            required={required}
            className="bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-xs rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-w-[140px] flex-1"
          />

          <div className="flex items-center gap-1.5 shrink-0 justify-end flex-wrap sm:flex-nowrap">
            {/* Standard Normal Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5 h-9 px-3 shrink-0 justify-center whitespace-nowrap transition-colors"
              title="Upload image file"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <Upload className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="whitespace-nowrap">Upload</span>
            </Button>

            {/* Media Library Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs rounded-xl border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 gap-1.5 h-9 px-3 shrink-0 justify-center whitespace-nowrap transition-colors"
              title="Select from Media Library"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap">Media Library</span>
            </Button>
          </div>
        </div>
      </div>

      {uploadError && <p className="text-[11px] text-rose-400 font-medium">{uploadError}</p>}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => onChange(url)}
        currentValue={value}
        defaultCategory={defaultCategory}
        title={`Select ${label || 'Image'}`}
      />

      {/* Interactive Resizable Image Crop Modal */}
      {cropperSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            if (cropperSrc && cropperSrc.startsWith('blob:')) {
              URL.revokeObjectURL(cropperSrc);
            }
            setCropperSrc(null);
          }}
          imageSrc={cropperSrc}
          fileName={cropperFileName}
          aspectRatio={cropConfig.aspectRatio}
          allowedRatios={cropConfig.allowedRatios}
          cropShape={cropConfig.cropShape}
          targetWidth={cropConfig.width}
          targetHeight={cropConfig.height}
          title={`Crop ${label || 'Image'}`}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
