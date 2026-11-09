'use client';

import * as React from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { ImageCropperModal } from './ImageCropperModal';
import type { ImageUploadWithCropProps } from './types';
import { Upload, Crop, X, Loader2, Image as ImageIcon } from 'lucide-react';

export function ImageUploadWithCrop({
  value,
  onChange,
  onUploadFile,
  label,
  helperText,
  placeholder = 'Image URL or upload/crop',
  required = false,
  aspectRatio = 1,
  cropShape = 'round',
  targetWidth = 512,
  targetHeight = 512,
  mimeType = 'image/webp',
  quality = 0.92,
  previewShape = 'circle',
  className = '',
  disabled = false,
}: ImageUploadWithCropProps) {
  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = React.useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string>('image.webp');
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }
    setErrorMessage(null);
    setSelectedFileName(file.name.replace(/\.[^/.]+$/, '') + '.webp');

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setCropperOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (onUploadFile) {
      try {
        setIsUploading(true);
        setErrorMessage(null);
        const res = await onUploadFile(croppedFile);
        if (res.success && res.url) {
          onChange(res.url);
        } else {
          setErrorMessage(res.error || 'Upload failed');
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    } else {
      // In-memory fallback if no upload handler provided
      const dataUrl = URL.createObjectURL(croppedFile);
      onChange(dataUrl);
    }
  };

  const previewClasses = {
    circle:
      'w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
    square:
      'w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
    banner:
      'w-20 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
    portrait:
      'w-10 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 flex items-center justify-center',
  }[previewShape];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Label & Header */}
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

      {/* Main Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 min-w-[140px] flex-1"
          />

          <div className="flex items-center gap-1.5 shrink-0 justify-end">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              leftIcon={
                isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )
              }
              className="rounded-xl border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 h-9 px-3"
            >
              {isUploading ? 'Uploading...' : 'Upload & Crop'}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setSelectedImageSrc(value);
                  setCropperOpen(true);
                }}
                disabled={disabled || isUploading}
                leftIcon={<Crop className="w-3.5 h-3.5" />}
                className="rounded-xl text-zinc-400 hover:text-zinc-100 h-9 px-2.5"
                title="Re-crop image"
              >
                Crop
              </Button>
            )}
          </div>
        </div>
      </div>

      {helperText && <p className="text-[11px] text-zinc-500">{helperText}</p>}
      {errorMessage && <p className="text-[11px] text-rose-400 font-medium">{errorMessage}</p>}

      {/* Interactive Crop Modal */}
      {selectedImageSrc && (
        <ImageCropperModal
          isOpen={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            if (selectedImageSrc && selectedImageSrc.startsWith('blob:')) {
              URL.revokeObjectURL(selectedImageSrc);
            }
            setSelectedImageSrc(null);
          }}
          imageSrc={selectedImageSrc}
          fileName={selectedFileName}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          targetWidth={targetWidth}
          targetHeight={targetHeight}
          mimeType={mimeType}
          quality={quality}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
