'use client';

import * as React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@elsesourav/ui';
import { Crop, ZoomIn, RotateCw, Check, Upload } from 'lucide-react';

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatio?: '1:1' | '16:9' | '16:10' | 'free';
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
  const isLockedToOneToOne = lockRatio || aspectRatio === '1:1';
  const [imageSrc, setImageSrc] = React.useState<string | null>(initialImageUrl || null);
  const [zoom, setZoom] = React.useState<number>(1);
  const [rotation, setRotation] = React.useState<number>(0);
  const [selectedRatio, setSelectedRatio] = React.useState<'1:1' | '16:9' | '16:10' | 'free'>(
    isLockedToOneToOne ? '1:1' : aspectRatio
  );
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetWidth, setTargetWidth] = React.useState<number>(400);
  const [targetHeight, setTargetHeight] = React.useState<number>(400);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = React.useRef<HTMLImageElement | null>(null);

  const renderCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.save();

    // Move to center
    ctx.translate(targetWidth / 2 + pan.x, targetHeight / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Compute scale to cover target canvas
    const imgRatio = img.width / img.height;
    const targetCanvasRatio = targetWidth / targetHeight;
    let renderW = targetWidth;
    let renderH = targetHeight;

    if (imgRatio > targetCanvasRatio) {
      renderH = targetHeight;
      renderW = targetHeight * imgRatio;
    } else {
      renderW = targetWidth;
      renderH = targetWidth / imgRatio;
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();
  }, [targetWidth, targetHeight, pan, rotation, zoom]);

  React.useEffect(() => {
    if (initialImageUrl) {
      setImageSrc(initialImageUrl);
    }
  }, [initialImageUrl]);

  React.useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, renderCanvas]);

  const handleRatioChange = (ratio: '1:1' | '16:9' | '16:10' | 'free') => {
    if (isLockedToOneToOne) return;
    setSelectedRatio(ratio);
    if (ratio === '1:1') {
      setTargetWidth(400);
      setTargetHeight(400);
    } else if (ratio === '16:9') {
      setTargetWidth(800);
      setTargetHeight(450);
    } else if (ratio === '16:10') {
      setTargetWidth(800);
      setTargetHeight(500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropAndSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-indigo-400" />
            <DialogTitle className="text-lg font-bold text-zinc-100">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* File Picker if no image */}
          {!imageSrc ? (
            <div className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 rounded-2xl p-8 text-center transition-colors">
              <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-xs text-zinc-300 font-medium mb-1">
                Select an image to crop and adjust
              </p>
              <p className="text-[11px] text-zinc-500 mb-4">PNG, JPG, WebP supported</p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20">
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              {/* Aspect Ratio Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                <span className="text-[11px] font-medium text-zinc-400 px-2">Aspect Ratio:</span>
                {isLockedToOneToOne ? (
                  <span className="text-[11px] font-mono font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                    1:1 Square (Avatar Profile - Locked)
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {(['1:1', '16:9', '16:10', 'free'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => handleRatioChange(ratio)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          selectedRatio === ratio
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Canvas Container */}
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2 min-h-[260px] max-h-[360px] select-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`max-w-full max-h-[320px] object-contain cursor-grab ${
                    isDragging ? 'cursor-grabbing' : ''
                  } ${selectedRatio === '1:1' ? 'rounded-full' : 'rounded-xl'}`}
                  style={{
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  }}
                />
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 text-xs">
                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-indigo-400" /> Zoom
                    </span>
                    <span>{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Rotation & Replace */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                  </button>

                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium">
                    <Upload className="w-3.5 h-3.5" /> Change File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Dimensions Indicator */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                <span>Drag to pan. Use slider to zoom.</span>
                <span>
                  Output Resolution: {targetWidth} × {targetHeight}px
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-xs"
          >
            Cancel
          </Button>
          {imageSrc && (
            <Button
              size="sm"
              onClick={handleCropAndSave}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Use Image</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
