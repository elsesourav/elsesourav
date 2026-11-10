export type CropShape = 'round' | 'rect';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PresetRatioOption {
  id: string;
  label: string;
  ratio: number | null;
}

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc?: string;
  initialImageUrl?: string;
  onCropComplete: (croppedFile: File, dataUrl?: string) => void | Promise<void>;
  aspectRatio?: number | null | string;
  lockRatio?: boolean;
  allowedRatios?: PresetRatioOption[];
  cropShape?: CropShape;
  targetWidth?: number;
  targetHeight?: number;
  mimeType?: 'image/webp' | 'image/png' | 'image/jpeg';
  quality?: number;
  title?: string;
  fileName?: string;
}

export interface ImageUploadWithCropProps {
  value: string;
  onChange: (url: string) => void;
  onUploadFile?: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  label?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  aspectRatio?: number | null | string;
  allowedRatios?: PresetRatioOption[];
  cropShape?: CropShape;
  targetWidth?: number;
  targetHeight?: number;
  mimeType?: 'image/webp' | 'image/png' | 'image/jpeg';
  quality?: number;
  previewShape?: 'circle' | 'square' | 'banner' | 'portrait';
  className?: string;
  disabled?: boolean;
  fallbackUrl?: string;
}
