'use client';

import * as React from 'react';
import { Button } from '../button';
import { getCroppedCanvas, canvasToFile } from './crop-utils';
import type { ImageCropperModalProps } from './types';
import { useCropInteraction, PRESET_RATIOS } from './useCropInteraction';
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
} from 'lucide-react';

export function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
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
}: ImageCropperModalProps) {
  const [zoom, setZoom] = React.useState<number>(1.0);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgElementRef = React.useRef<HTMLImageElement>(null);

  const {
    image,
    crop,
    activeRatio,
    isLocked,
    effectiveRatios,
    hasRestrictedRatios,
    handleSelectPreset,
    toggleRatioLock,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getRenderedBoxStyle,
  } = useCropInteraction({
    isOpen,
    imageSrc,
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

  // Execute Crop and Upload
  const handleConfirm = async () => {
    if (!image) return;

    try {
      setIsProcessing(true);
      const outW = targetWidth || crop.width;
      const outH = targetHeight || crop.height;
      const canvas = getCroppedCanvas(image, crop, outW, outH);
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-6 shadow-2xl flex flex-col space-y-3.5 max-h-[92vh] overflow-y-auto">
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
              Drag corners to resize selection · Target: {targetWidth || crop.width} ×{' '}
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

        {/* Preset Ratio Toolbar */}
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

          {/* Only show free ratio lock/unlock toggle if ratios are not restricted */}
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
                  ? 'Aspect Ratio Locked (drag corners to scale)'
                  : 'Aspect Ratio Unlocked (free drag)'
              }
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <Unlock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              )}
              <span>{isLocked ? 'Ratio Locked' : 'Ratio Free'}</span>
            </button>
          )}
        </div>

        {/* Viewport Canvas: Generous viewport without zoom restriction */}
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
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`absolute border-2 border-indigo-400 cursor-move box-border select-none ${
                  cropShape === 'round' ? 'rounded-full' : 'rounded-lg'
                }`}
                style={{
                  ...getRenderedBoxStyle(),
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.68)',
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
                  className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-20"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-20"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-20"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-20"
                />

                {/* 4 Edge Midpoint Handles (Only active in Unlocked Free mode) */}
                {!isLocked && (
                  <>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'n')}
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/90 border border-indigo-600 rounded-xs cursor-ns-resize shadow-sm hover:scale-125 transition-transform z-20"
                    />
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 's')}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/90 border border-indigo-600 rounded-xs cursor-ns-resize shadow-sm hover:scale-125 transition-transform z-20"
                    />
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'w')}
                      className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-4 bg-white/90 border border-indigo-600 rounded-xs cursor-ew-resize shadow-sm hover:scale-125 transition-transform z-20"
                    />
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'e')}
                      className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-4 bg-white/90 border border-indigo-600 rounded-xs cursor-ew-resize shadow-sm hover:scale-125 transition-transform z-20"
                    />
                  </>
                )}

                {/* Dimension Badge */}
                <div className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/90 pointer-events-none backdrop-blur-xs">
                  {crop.width} × {crop.height}
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
          {/* Zoom Slider (0.4x - 2.5x enables full boundary view) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Zoom Out (view full bounds)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={0.4}
              max={2.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-28 sm:w-36 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 w-9 text-right">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(1.0)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors ml-1"
              title="Reset Zoom"
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
}
