'use client';

import * as React from 'react';
import { loadImageElement } from './crop-utils';
import type { CropArea } from './types';

export interface PresetRatio {
  id: string;
  label: string;
  ratio: number | null;
}

export const PRESET_RATIOS: PresetRatio[] = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1 Square', ratio: 1.0 },
  { id: '16:9', label: '16:9 Hero', ratio: 16 / 9 },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
  { id: '1:6', label: '1:6 Carousel', ratio: 1 / 6 },
  { id: '6:1', label: '6:1 Banner', ratio: 6.0 },
];

export interface UseCropInteractionOptions {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio?: number | null;
  imgElementRef: React.RefObject<HTMLImageElement | null>;
}

export function useCropInteraction({
  isOpen,
  imageSrc,
  aspectRatio,
  imgElementRef,
}: UseCropInteractionOptions) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [activeRatio, setActiveRatio] = React.useState<number | null>(
    aspectRatio !== undefined ? aspectRatio : 1.0
  );
  const [isLocked, setIsLocked] = React.useState<boolean>(
    aspectRatio !== null && aspectRatio !== undefined
  );

  // Crop area in natural image coordinates (pixels)
  const [crop, setCrop] = React.useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });

  // Dragging state tracking
  const draggingRef = React.useRef<boolean>(false);
  const dragTypeRef = React.useRef<string | null>(null);
  const dragStartRef = React.useRef<{
    clientX: number;
    clientY: number;
    cropX: number;
    cropY: number;
    cropW: number;
    cropH: number;
  }>({ clientX: 0, clientY: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  // Helper to initialize crop box centered on image
  const initializeCrop = React.useCallback(
    (img: HTMLImageElement, ratio: number | null) => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      let w = nw * 0.85;
      let h = nh * 0.85;

      if (ratio !== null) {
        if (w / h > ratio) {
          w = h * ratio;
        } else {
          h = w / ratio;
        }
      }

      w = Math.round(Math.min(w, nw));
      h = Math.round(Math.min(h, nh));
      const x = Math.round(Math.max(0, (nw - w) / 2));
      const y = Math.round(Math.max(0, (nh - h) / 2));

      setCrop({ x, y, width: w, height: h });
    },
    []
  );

  // Load image whenever imageSrc opens
  React.useEffect(() => {
    if (!isOpen || !imageSrc) return;
    let cancelled = false;

    const initialRatio = aspectRatio !== undefined ? aspectRatio : 1.0;
    setActiveRatio(initialRatio);
    setIsLocked(initialRatio !== null);

    loadImageElement(imageSrc)
      .then((img) => {
        if (!cancelled) {
          setImage(img);
          initializeCrop(img, initialRatio);
        }
      })
      .catch((err) => {
        console.error('Failed to load image for cropping:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, imageSrc, aspectRatio, initializeCrop]);

  // Handle Preset Ratio Selection
  const handleSelectPreset = (ratio: number | null) => {
    setActiveRatio(ratio);
    setIsLocked(ratio !== null);
    if (!image) return;

    const nw = image.naturalWidth;
    const nh = image.naturalHeight;

    if (ratio === null) return; // Free mode keeps current crop dimensions

    // Adjust crop to fit selected ratio
    let newW = crop.width;
    let newH = newW / ratio;

    if (newH > nh) {
      newH = nh * 0.9;
      newW = newH * ratio;
    }
    if (newW > nw) {
      newW = nw * 0.9;
      newH = newW / ratio;
    }

    newW = Math.round(Math.min(newW, nw));
    newH = Math.round(Math.min(newH, nh));
    const newX = Math.round(Math.max(0, Math.min(crop.x, nw - newW)));
    const newY = Math.round(Math.max(0, Math.min(crop.y, nh - newH)));

    setCrop({ x: newX, y: newY, width: newW, height: newH });
  };

  // Toggle Aspect Ratio Lock
  const toggleRatioLock = () => {
    if (isLocked) {
      setIsLocked(false);
      setActiveRatio(null);
    } else {
      setIsLocked(true);
      const currentRatio = crop.width / crop.height;
      setActiveRatio(currentRatio);
    }
  };

  // Pointer Down for Drag or Resize Handles
  const handlePointerDown = (e: React.PointerEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    dragTypeRef.current = type;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
      cropW: crop.width,
      cropH: crop.height,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move (Calculates Drag Movement in Image Coordinates)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !image || !imgElementRef.current) return;

    const imgDisplay = imgElementRef.current.getBoundingClientRect();
    if (imgDisplay.width === 0 || imgDisplay.height === 0) return;

    // Scale factors between screen pixels and original image coordinates
    const scaleX = image.naturalWidth / imgDisplay.width;
    const scaleY = image.naturalHeight / imgDisplay.height;

    const dx = (e.clientX - dragStartRef.current.clientX) * scaleX;
    const dy = (e.clientY - dragStartRef.current.clientY) * scaleY;

    const { cropX, cropY, cropW, cropH } = dragStartRef.current;
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    const minSize = Math.max(24, Math.min(nw, nh) * 0.04);

    let newX = cropX;
    let newY = cropY;
    let newW = cropW;
    let newH = cropH;

    const type = dragTypeRef.current;
    const lockRatio = isLocked && activeRatio !== null ? activeRatio : null;

    if (type === 'move') {
      newX = Math.round(Math.max(0, Math.min(cropX + dx, nw - cropW)));
      newY = Math.round(Math.max(0, Math.min(cropY + dy, nh - cropH)));
    } else if (type) {
      // Handle corner and edge resizing
      if (type.includes('e')) {
        newW = Math.max(minSize, cropW + dx);
      }
      if (type.includes('w')) {
        newW = Math.max(minSize, cropW - dx);
        newX = cropX + (cropW - newW);
      }
      if (type.includes('s')) {
        newH = Math.max(minSize, cropH + dy);
      }
      if (type.includes('n')) {
        newH = Math.max(minSize, cropH - dy);
        newY = cropY + (cropH - newH);
      }

      // Enforce aspect ratio when locked
      if (lockRatio !== null) {
        if (type === 'n' || type === 's') {
          newW = newH * lockRatio;
        } else {
          newH = newW / lockRatio;
          if (type.includes('n')) {
            newY = cropY + (cropH - newH);
          }
        }
      }

      // Clamp to image bounds
      if (newX < 0) {
        newW += newX;
        newX = 0;
      }
      if (newY < 0) {
        newH += newY;
        newY = 0;
      }
      if (newX + newW > nw) {
        newW = nw - newX;
        if (lockRatio !== null) newH = newW / lockRatio;
      }
      if (newY + newH > nh) {
        newH = nh - newY;
        if (lockRatio !== null) newW = newH * lockRatio;
      }

      newX = Math.round(newX);
      newY = Math.round(newY);
      newW = Math.round(newW);
      newH = Math.round(newH);
    }

    setCrop({ x: newX, y: newY, width: newW, height: newH });
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragTypeRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Compute displayed overlay position relative to displayed image element
  const getRenderedBoxStyle = (): React.CSSProperties => {
    if (!image) return { display: 'none' };

    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    if (nw === 0 || nh === 0) return { display: 'none' };

    const leftPercent = (crop.x / nw) * 100;
    const topPercent = (crop.y / nh) * 100;
    const widthPercent = (crop.width / nw) * 100;
    const heightPercent = (crop.height / nh) * 100;

    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
    };
  };

  return {
    image,
    crop,
    activeRatio,
    isLocked,
    handleSelectPreset,
    toggleRatioLock,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getRenderedBoxStyle,
  };
}
