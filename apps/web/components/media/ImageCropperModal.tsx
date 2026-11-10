'use client';

import * as React from 'react';
import { ImageCropperModal as BaseImageCropperModal } from '@elsesourav/ui';

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatio?: '1:1' | '16:9' | '16:10' | 'free' | number;
  lockRatio?: boolean;
  title?: string;
  initialImageUrl?: string;
}

export function ImageCropperModal({
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = '1:1',
  lockRatio = false,
  title = 'Crop & Adjust Image',
  initialImageUrl,
}: ImageCropperModalProps) {
  return (
    <BaseImageCropperModal
      isOpen={isOpen}
      onClose={onClose}
      imageSrc={initialImageUrl}
      initialImageUrl={initialImageUrl}
      aspectRatio={aspectRatio}
      lockRatio={lockRatio}
      title={title}
      onCropComplete={(_file, dataUrl) => {
        if (dataUrl) {
          onCropComplete(dataUrl);
        } else {
          const reader = new FileReader();
          reader.onload = () => onCropComplete(reader.result as string);
          reader.readAsDataURL(_file);
        }
      }}
    />
  );
}
