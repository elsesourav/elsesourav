'use client';

import * as React from 'react';
import { Button, Input, ImageCropperModal } from '@elsesourav/ui';
import { MediaPickerModal } from './MediaPickerModal';
import { ImageUploadSourceModal } from './ImageUploadSourceModal';
import { uploadAdminImageFile } from '../utils/upload-client';
import type { MediaDomain, MediaFolder } from '@elsesourav/types';
import type { PresetRatioOption } from '@elsesourav/ui';
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
  aspectRatio?: number | string;
  targetWidth?: number;
  targetHeight?: number;
  allowedRatios?: PresetRatioOption[];
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
  aspectRatio,
  targetWidth,
  targetHeight,
  allowedRatios,
  className = '',
  fallbackUrl,
}: ImageInputWithLibraryProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = React.useState(false);
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

  // Determine crop parameters based on explicit aspectRatio prop or previewShape
  const cropConfig = React.useMemo(() => {
    if (aspectRatio) {
      let numericRatio = 1.0;
      if (typeof aspectRatio === 'number') {
        numericRatio = aspectRatio;
      } else if (aspectRatio === '21:9') {
        numericRatio = 21 / 9;
      } else if (aspectRatio === '16:9') {
        numericRatio = 16 / 9;
      } else if (aspectRatio === '3:4') {
        numericRatio = 3 / 4;
      } else if (aspectRatio === '4:3') {
        numericRatio = 4 / 3;
      } else if (typeof aspectRatio === 'string' && (aspectRatio.includes(':') || aspectRatio.includes('/'))) {
        const parts = aspectRatio.split(/[:/]/);
        const num = parseFloat(parts[0] || '1');
        const den = parseFloat(parts[1] || '1');
        numericRatio = den !== 0 ? num / den : 1.0;
      } else {
        const parsed = parseFloat(String(aspectRatio));
        if (!isNaN(parsed) && parsed > 0) numericRatio = parsed;
      }

      const isWideBanner = numericRatio >= 2.0;
      const isPortrait = numericRatio < 1.0;

      return {
        aspectRatio: numericRatio,
        cropShape: previewShape === 'circle' ? ('round' as const) : ('rect' as const),
        width: targetWidth || (isWideBanner ? 2520 : isPortrait ? 900 : 1200),
        height: targetHeight || (isWideBanner ? 1080 : isPortrait ? 1200 : Math.round(1200 / numericRatio)),
      };
    }

    switch (previewShape) {
      case 'circle':
        return {
          aspectRatio: 1.0,
          cropShape: 'round' as const,
          width: targetWidth || 512,
          height: targetHeight || 512,
        };
      case 'portrait':
        return {
          aspectRatio: 3 / 4,
          cropShape: 'rect' as const,
          width: targetWidth || 900,
          height: targetHeight || 1200,
        };
      case 'banner':
        return {
          aspectRatio: 16 / 9,
          cropShape: 'rect' as const,
          width: targetWidth || 1200,
          height: targetHeight || 675,
        };
      case 'square':
      default:
        return {
          aspectRatio: 1.0,
          cropShape: 'rect' as const,
          width: targetWidth || 512,
          height: targetHeight || 512,
        };
    }
  }, [previewShape, aspectRatio, targetWidth, targetHeight]);

  // Direct upload handler when image matches required ratio or user confirms crop
  const directUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadAdminImageFile(fileToUpload, folder);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setUploadError(res.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Direct clipboard paste listener: intercepts pasted screenshots / images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          e.stopPropagation();
          processSelectedFile(file);
          return;
        }
      }
    }
  };

  // Drag and drop listener: allows dropping image files directly
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        processSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Process selected file (from device picker or clipboard paste) with smart aspect ratio detection
  const processSelectedFile = (file: File) => {
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
  };

  // Handle file picker selection with smart aspect ratio detection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
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

      <div
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col sm:flex-row sm:items-center gap-3"
      >
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
          title={displayImage ? 'Click to crop image' : 'Paste or drop image here'}
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
            onPaste={handlePaste}
            placeholder={effectivePlaceholder}
            required={required}
            className="bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-xs rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-w-[140px] flex-1"
          />

          <div className="flex items-center gap-1.5 shrink-0 justify-end flex-wrap sm:flex-nowrap">
            {/* Upload Button: Shows Upload from Device or Paste from Clipboard */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSourceModalOpen(true)}
              disabled={isUploading}
              className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5 h-9 px-3 shrink-0 justify-center whitespace-nowrap transition-colors"
              title="Upload image from device or clipboard"
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

      {/* Upload Source Modal (Device vs Clipboard) */}
      <ImageUploadSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSelectFile={processSelectedFile}
        title={`Upload ${label || 'Image'}`}
        description="Select from your device or paste directly from clipboard"
      />

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
          cropShape={cropConfig.cropShape}
          targetWidth={cropConfig.width}
          targetHeight={cropConfig.height}
          allowedRatios={allowedRatios}
          title={`Crop ${label || 'Image'}`}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
