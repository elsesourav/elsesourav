export type CropShape = 'round' | 'rect';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void | Promise<void>;
  aspectRatio?: number | null;
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
  aspectRatio?: number | null;
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
