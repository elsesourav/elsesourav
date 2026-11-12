'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button';
import { getCroppedCanvas, canvasToFile } from './crop-utils';
import type { ImageCropperModalProps } from './types';
import { useCropInteraction } from './useCropInteraction';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Loader2,
  Lock,
  Unlock,
  Maximize2,
  Crosshair,
} from 'lucide-react';

export function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  initialImageUrl,
  onCropComplete,
  aspectRatio = 1,
  allowedRatios,
  cropShape = 'rect',
  targetWidth = 512,
  targetHeight = 512,
  mimeType = 'image/webp',
  quality = 0.92,
  title = 'Crop & Resize Image',
  fileName = 'cropped-image.webp',
  container,
  zIndex = 99999,
}: ImageCropperModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [zoom, setZoom] = React.useState<number>(1.0);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgElementRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveSrc = imageSrc || initialImageUrl || '';

  const {
    image,
    crop,
    activeRatio,
    isLocked,
    effectiveRatios,
    hasRestrictedRatios,
    handleSelectPreset,
    toggleRatioLock,
    fitFullImage,
    centerCrop,
    handlePointerDown,
    getRenderedBoxStyle,
  } = useCropInteraction({
    isOpen,
    imageSrc: effectiveSrc,
    aspectRatio,
    allowedRatios,
    imgElementRef,
  });

  // Reset zoom whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
    }
  }, [isOpen]);

  // Lock document scroll while modal is open to avoid background page shifting
  React.useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Keyboard shortcut: Escape to close modal
  React.useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Execute Crop and Upload
  const handleConfirm = async () => {
    if (!image) return;

    try {
      setIsProcessing(true);
      const outW = targetWidth || crop.width;
      const outH = targetHeight || crop.height;
      const canvas = getCroppedCanvas(image, crop, outW, outH);
      const file = await canvasToFile(canvas, fileName, mimeType, quality);
      const dataUrl = canvas.toDataURL(mimeType, quality);
      await onCropComplete(file, dataUrl);
      onClose();
    } catch (err) {
      console.error('Error applying crop:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const targetHost = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!targetHost) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-dialog-title"
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-6 shadow-2xl flex flex-col space-y-3.5 max-h-[92vh] my-auto overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div>
            <h3
              id="cropper-dialog-title"
              className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{title}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Drag corners to resize · Drag box to reposition · Output: {targetWidth || crop.width} ×{' '}
              {targetHeight || crop.height} px
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Ratio & Quick Frame Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 mr-1">
              Ratios:
            </span>
            {effectiveRatios.map((preset) => {
              const isSelected = activeRatio === preset.ratio;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.ratio)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Quick Framing & Lock Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={fitFullImage}
              className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
              title="Expand crop frame to fit full image"
            >
              <Maximize2 className="w-3 h-3 text-cyan-500" />
              <span>Fit Full</span>
            </button>

            <button
              type="button"
              onClick={centerCrop}
              className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
              title="Center crop frame"
            >
              <Crosshair className="w-3 h-3 text-cyan-500" />
              <span>Center</span>
            </button>

            {!hasRestrictedRatios && (
              <button
                type="button"
                onClick={toggleRatioLock}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                  isLocked
                    ? 'border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                title={
                  isLocked
                    ? 'Aspect Ratio Locked (proportional scale)'
                    : 'Aspect Ratio Unlocked (free rectangle)'
                }
              >
                {isLocked ? (
                  <Lock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <Unlock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                )}
                <span>{isLocked ? 'Locked' : 'Free'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Viewport Canvas: Generous viewport with zoom support */}
        <div
          ref={containerRef}
          className="relative w-full h-[320px] sm:h-[400px] rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 overflow-hidden select-none flex items-center justify-center touch-none border border-zinc-200 dark:border-zinc-800/80"
        >
          {image ? (
            <div
              className="relative inline-block transition-transform duration-75"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Displayed Image */}
              <img
                ref={imgElementRef}
                src={image.src}
                alt="Crop preview"
                draggable={false}
                className="max-h-[300px] sm:max-h-[380px] max-w-full block select-none pointer-events-none"
              />

              {/* Dynamic Resizable Crop Box */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'move')}
                className={`absolute border-2 border-indigo-400 cursor-move box-border select-none ${
                  cropShape === 'round' ? 'rounded-full' : 'rounded-lg'
                }`}
                style={{
                  ...getRenderedBoxStyle(),
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
                }}
              >
                {/* Rule of Thirds 3x3 Grid */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '33.33% 33.33%',
                  }}
                />

                {/* 4 Corner Resize Handles */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-20 flex items-center justify-center"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-20 flex items-center justify-center"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-20 flex items-center justify-center"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-20 flex items-center justify-center"
                />

                {/* 4 Edge Midpoint Handles */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'n')}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-white/95 border border-indigo-600 rounded-xs cursor-ns-resize shadow-sm hover:scale-125 transition-transform z-20"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 's')}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-white/95 border border-indigo-600 rounded-xs cursor-ns-resize shadow-sm hover:scale-125 transition-transform z-20"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'w')}
                  className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-5 bg-white/95 border border-indigo-600 rounded-xs cursor-ew-resize shadow-sm hover:scale-125 transition-transform z-20"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'e')}
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-5 bg-white/95 border border-indigo-600 rounded-xs cursor-ew-resize shadow-sm hover:scale-125 transition-transform z-20"
                />

                {/* Dimension Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white/90 pointer-events-none backdrop-blur-xs border border-white/10">
                  {crop.width} × {crop.height} px
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading image asset...</span>
            </div>
          )}
        </div>

        {/* Bottom Zoom & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Zoom Slider (0.25x - 3.0x enables full boundary viewing and precise framing) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Zoom Out (view full bounds)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={0.25}
              max={3.0}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-28 sm:w-36 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              aria-label="Zoom level"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 w-11 text-right">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(1.0)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors ml-1"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={!image || isProcessing}
              leftIcon={
                isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )
              }
              className="text-xs shadow-lg shadow-indigo-600/20"
            >
              {isProcessing ? 'Cropping...' : 'Apply Crop & Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, targetHost);
}
