'use client';

import * as React from 'react';
import { Button } from '../button';
import { loadImageElement, getCroppedCanvas, canvasToFile } from './crop-utils';
import type { ImageCropperModalProps, CropArea } from './types';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Loader2 } from 'lucide-react';

export function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round',
  targetWidth = 512,
  targetHeight = 512,
  mimeType = 'image/webp',
  quality = 0.92,
  title = 'Crop & Adjust Image',
  fileName = 'cropped-image.webp',
}: ImageCropperModalProps) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasPreviewRef = React.useRef<HTMLCanvasElement>(null);

  // Load image whenever imageSrc changes
  React.useEffect(() => {
    if (!isOpen || !imageSrc) return;
    let isCancelled = false;
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    loadImageElement(imageSrc)
      .then((img) => {
        if (!isCancelled) setImage(img);
      })
      .catch((err) => {
        console.error('Failed to load image for cropping:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, imageSrc]);

  // Handle pointer down for drag
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle pointer move for drag
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // Handle pointer up
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Calculate crop rectangle in original image coordinate space
  const calculateCropArea = React.useCallback((): CropArea | null => {
    if (!image || !containerRef.current) return null;

    const container = containerRef.current.getBoundingClientRect();
    const maskSize = Math.min(container.width * 0.85, container.height * 0.85);
    const maskWidth = maskSize;
    const maskHeight = maskSize / aspectRatio;

    // Base scale to fit image into container
    const fitScale = Math.min(maskWidth / image.naturalWidth, maskHeight / image.naturalHeight);
    const currentScale = fitScale * zoom;

    // Viewport center
    const displayedWidth = image.naturalWidth * currentScale;
    const displayedHeight = image.naturalHeight * currentScale;

    const imgCenterX = container.width / 2 + offset.x;
    const imgCenterY = container.height / 2 + offset.y;

    const imgLeft = imgCenterX - displayedWidth / 2;
    const imgTop = imgCenterY - displayedHeight / 2;

    const maskLeft = (container.width - maskWidth) / 2;
    const maskTop = (container.height - maskHeight) / 2;

    const cropX = Math.max(0, (maskLeft - imgLeft) / currentScale);
    const cropY = Math.max(0, (maskTop - imgTop) / currentScale);
    const cropWidth = Math.min(image.naturalWidth, maskWidth / currentScale);
    const cropHeight = Math.min(image.naturalHeight, maskHeight / currentScale);

    return {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    };
  }, [image, zoom, offset, aspectRatio]);

  // Execute crop and submit
  const handleConfirm = async () => {
    if (!image) return;
    const crop = calculateCropArea();
    if (!crop) return;

    try {
      setIsProcessing(true);
      const canvas = getCroppedCanvas(image, crop, targetWidth, targetHeight);
      const file = await canvasToFile(canvas, fileName, mimeType, quality);
      await onCropComplete(file);
      onClose();
    } catch (err) {
      console.error('Error applying crop:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div>
            <h3 id="cropper-dialog-title" className="text-sm sm:text-base font-bold text-zinc-100">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Drag to reposition · Target: {targetWidth} × {targetHeight} px
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Viewport Canvas */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-64 sm:h-72 rounded-xl sm:rounded-2xl bg-zinc-900/90 overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
        >
          {image ? (
            <img
              src={image.src}
              alt="Crop target"
              draggable={false}
              className="pointer-events-none absolute max-w-none transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading image...</span>
            </div>
          )}

          {/* Mask Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ${
                cropShape === 'round' ? 'rounded-full' : 'rounded-2xl'
              }`}
              style={{
                width: '220px',
                height: `${220 / aspectRatio}px`,
              }}
            />
          </div>
        </div>

        {/* Controls: Zoom slider & reset */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            aria-label="Zoom out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            aria-label="Zoom level"
          />

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            aria-label="Zoom in"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            aria-label="Reset zoom and position"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            title="Reset position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/80">
          <Button variant="ghost" size="xs" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={handleConfirm}
            disabled={!image || isProcessing}
            leftIcon={
              isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )
            }
          >
            {isProcessing ? 'Processing...' : 'Apply Crop & Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
