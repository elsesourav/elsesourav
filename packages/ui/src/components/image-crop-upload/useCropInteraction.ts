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
  { id: '16:9', label: '16:9 Desktop', ratio: 16 / 9 },
  { id: '9:16', label: '9:16 Mobile', ratio: 9 / 16 },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '21:9', label: '21:9 Ultrawide', ratio: 21 / 9 },
  { id: '1:1', label: '1:1 Square', ratio: 1.0 },
  { id: '1:6', label: '1:6 Carousel', ratio: 1 / 6 },
  { id: '6:1', label: '6:1 Banner', ratio: 6.0 },
  { id: 'free', label: 'Free', ratio: null },
];

export interface UseCropInteractionOptions {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio?: number | null | string;
  lockRatio?: boolean;
  allowedRatios?: PresetRatio[];
  imgElementRef: React.RefObject<HTMLImageElement | null>;
}

export function useCropInteraction({
  isOpen,
  imageSrc,
  aspectRatio,
  lockRatio,
  allowedRatios,
  imgElementRef,
}: UseCropInteractionOptions) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  const parseNumericRatio = React.useCallback((r?: number | null | string): number | null => {
    if (r === null || r === 'free') return null;
    if (typeof r === 'number') return r;
    if (r === '1:1') return 1.0;
    if (r === '16:9') return 16 / 9;
    if (r === '9:16') return 9 / 16;
    if (r === '16:10') return 16 / 10;
    if (r === '4:3') return 4 / 3;
    if (r === '3:4') return 3 / 4;
    if (r === '1:6') return 1 / 6;
    if (r === '6:1') return 6.0;
    if (r === '21:9') return 21 / 9;
    if (typeof r === 'string') {
      const sep = r.includes('/') ? '/' : r.includes(':') ? ':' : null;
      if (sep) {
        const [num, den] = r.split(sep).map((p) => parseFloat(p || '1'));
        return den && !isNaN(den) && !isNaN(num!) ? num! / den : 1.0;
      }
      const parsed = parseFloat(r);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1.0;
  }, []);

  const effectiveRatios = React.useMemo(() => {
    // If an explicit list of allowed ratios is provided, use it directly
    if (allowedRatios && allowedRatios.length > 0) {
      return allowedRatios;
    }
    // If lockRatio is explicitly true, or lockRatio is omitted (legacy default), restrict strictly to the specified ratio
    const shouldRestrict = lockRatio === true || (lockRatio === undefined && aspectRatio !== undefined && aspectRatio !== null && aspectRatio !== 'free');
    if (shouldRestrict && aspectRatio !== undefined && aspectRatio !== null && aspectRatio !== 'free') {
      const numRatio = parseNumericRatio(aspectRatio);
      if (numRatio !== null) {
        const matched = PRESET_RATIOS.find(
          (p) => p.ratio !== null && Math.abs(p.ratio - numRatio) < 0.01
        );
        if (matched) {
          return [matched];
        }
        const label =
          typeof aspectRatio === 'string'
            ? `${aspectRatio} Ratio`
            : `${Math.round(numRatio * 100) / 100}:1 Ratio`;
        return [{ id: String(aspectRatio), label, ratio: numRatio }];
      }
    }
    return PRESET_RATIOS;
  }, [allowedRatios, aspectRatio, lockRatio, parseNumericRatio]);

  const hasRestrictedRatios = Boolean(effectiveRatios.length <= 1);

  const getInitialRatio = React.useCallback((): number | null => {
    if (aspectRatio !== undefined) return parseNumericRatio(aspectRatio);
    if (allowedRatios && allowedRatios.length > 0 && allowedRatios[0]) return allowedRatios[0].ratio;
    return 1.0;
  }, [aspectRatio, allowedRatios, parseNumericRatio]);

  const [activeRatio, setActiveRatio] = React.useState<number | null>(getInitialRatio);
  const [isLocked, setIsLocked] = React.useState<boolean>(() => {
    if (lockRatio !== undefined) return lockRatio;
    const init = getInitialRatio();
    return init !== null;
  });

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

  // Initialize crop box to 100% full fit on image (zero arbitrary shrinkage)
  const initializeCrop = React.useCallback(
    (img: HTMLImageElement, ratio: number | null) => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      // Free crop: select 100% of the entire image
      if (ratio === null) {
        setCrop({ x: 0, y: 0, width: nw, height: nh });
        return;
      }

      // Check if image ratio already matches target ratio within 2% tolerance
      const imgRatio = nw / nh;
      if (Math.abs(imgRatio - ratio) <= 0.02) {
        setCrop({ x: 0, y: 0, width: nw, height: nh });
        return;
      }

      // Fit the maximum possible frame touching image borders (Fit Full)
      let w = nw;
      let h = w / ratio;
      if (h > nh) {
        h = nh;
        w = h * ratio;
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

    const initialRatio = getInitialRatio();
    setActiveRatio(initialRatio);
    setIsLocked(lockRatio !== undefined ? lockRatio : initialRatio !== null);

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
  }, [isOpen, imageSrc, getInitialRatio, initializeCrop, lockRatio]);

  // Fit Entire Image (expands crop box to maximum image boundary)
  const fitFullImage = React.useCallback(() => {
    if (!image) return;
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;

    if (activeRatio === null || !isLocked) {
      setCrop({ x: 0, y: 0, width: nw, height: nh });
      return;
    }

    let w = nw;
    let h = w / activeRatio;
    if (h > nh) {
      h = nh;
      w = h * activeRatio;
    }

    w = Math.round(w);
    h = Math.round(h);
    const x = Math.round((nw - w) / 2);
    const y = Math.round((nh - h) / 2);

    setCrop({ x, y, width: w, height: h });
  }, [image, activeRatio, isLocked]);

  // Center the current crop frame
  const centerCrop = React.useCallback(() => {
    if (!image) return;
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    const x = Math.round(Math.max(0, (nw - crop.width) / 2));
    const y = Math.round(Math.max(0, (nh - crop.height) / 2));
    setCrop((prev) => ({ ...prev, x, y }));
  }, [image, crop.width, crop.height]);

  // Handle Preset Ratio Selection
  const handleSelectPreset = (ratio: number | null) => {
    setActiveRatio(ratio);
    setIsLocked(ratio !== null);
    if (!image) return;

    const nw = image.naturalWidth;
    const nh = image.naturalHeight;

    if (ratio === null) return; // Free mode keeps current crop dimensions

    let newW = crop.width;
    let newH = newW / ratio;

    if (newH > nh) {
      newH = nh * 0.95;
      newW = newH * ratio;
    }
    if (newW > nw) {
      newW = nw * 0.95;
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
  };

  // Internal Move Handler for Mouse & Touch
  const onPointerMoveInternal = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingRef.current || !image || !imgElementRef.current) return;

      const imgDisplay = imgElementRef.current.getBoundingClientRect();
      if (imgDisplay.width === 0 || imgDisplay.height === 0) return;

      const scaleX = image.naturalWidth / imgDisplay.width;
      const scaleY = image.naturalHeight / imgDisplay.height;

      const dx = (clientX - dragStartRef.current.clientX) * scaleX;
      const dy = (clientY - dragStartRef.current.clientY) * scaleY;

      const { cropX, cropY, cropW, cropH } = dragStartRef.current;
      const nw = image.naturalWidth;
      const nh = image.naturalHeight;
      const minSize = Math.max(20, Math.min(nw, nh) * 0.03);

      const type = dragTypeRef.current;
      const lockRatio = isLocked && activeRatio !== null ? activeRatio : null;

      let newX = cropX;
      let newY = cropY;
      let newW = cropW;
      let newH = cropH;

      if (type === 'move') {
        newX = Math.round(Math.max(0, Math.min(cropX + dx, nw - cropW)));
        newY = Math.round(Math.max(0, Math.min(cropY + dy, nh - cropH)));
      } else if (type === 'se') {
        // Anchor: Top-Left (cropX, cropY)
        if (lockRatio === null) {
          newW = Math.min(nw - cropX, Math.max(minSize, cropW + dx));
          newH = Math.min(nh - cropY, Math.max(minSize, cropH + dy));
        } else {
          let targetW = Math.abs(dx) >= Math.abs(dy * lockRatio) ? cropW + dx : cropW + dy * lockRatio;
          targetW = Math.max(minSize, targetW);
          let targetH = targetW / lockRatio;
          const maxW = nw - cropX;
          const maxH = nh - cropY;
          if (targetW > maxW) {
            targetW = maxW;
            targetH = targetW / lockRatio;
          }
          if (targetH > maxH) {
            targetH = maxH;
            targetW = targetH * lockRatio;
          }
          newW = targetW;
          newH = targetH;
        }
      } else if (type === 'sw') {
        // Anchor: Top-Right (anchorX = cropX + cropW, cropY)
        const anchorX = cropX + cropW;
        if (lockRatio === null) {
          newW = Math.min(anchorX, Math.max(minSize, cropW - dx));
          newH = Math.min(nh - cropY, Math.max(minSize, cropH + dy));
        } else {
          let targetW = Math.abs(-dx) >= Math.abs(dy * lockRatio) ? cropW - dx : cropW + dy * lockRatio;
          targetW = Math.max(minSize, targetW);
          let targetH = targetW / lockRatio;
          const maxW = anchorX;
          const maxH = nh - cropY;
          if (targetW > maxW) {
            targetW = maxW;
            targetH = targetW / lockRatio;
          }
          if (targetH > maxH) {
            targetH = maxH;
            targetW = targetH * lockRatio;
          }
          newW = targetW;
          newH = targetH;
        }
        newX = anchorX - newW;
      } else if (type === 'ne') {
        // Anchor: Bottom-Left (cropX, anchorY = cropY + cropH)
        const anchorY = cropY + cropH;
        if (lockRatio === null) {
          newW = Math.min(nw - cropX, Math.max(minSize, cropW + dx));
          newH = Math.min(anchorY, Math.max(minSize, cropH - dy));
        } else {
          let targetW = Math.abs(dx) >= Math.abs(-dy * lockRatio) ? cropW + dx : cropW - dy * lockRatio;
          targetW = Math.max(minSize, targetW);
          let targetH = targetW / lockRatio;
          const maxW = nw - cropX;
          const maxH = anchorY;
          if (targetW > maxW) {
            targetW = maxW;
            targetH = targetW / lockRatio;
          }
          if (targetH > maxH) {
            targetH = maxH;
            targetW = targetH * lockRatio;
          }
          newW = targetW;
          newH = targetH;
        }
        newY = anchorY - newH;
      } else if (type === 'nw') {
        // Anchor: Bottom-Right (anchorX = cropX + cropW, anchorY = cropY + cropH)
        const anchorX = cropX + cropW;
        const anchorY = cropY + cropH;
        if (lockRatio === null) {
          newW = Math.min(anchorX, Math.max(minSize, cropW - dx));
          newH = Math.min(anchorY, Math.max(minSize, cropH - dy));
        } else {
          let targetW = Math.abs(-dx) >= Math.abs(-dy * lockRatio) ? cropW - dx : cropW - dy * lockRatio;
          targetW = Math.max(minSize, targetW);
          let targetH = targetW / lockRatio;
          const maxW = anchorX;
          const maxH = anchorY;
          if (targetW > maxW) {
            targetW = maxW;
            targetH = targetW / lockRatio;
          }
          if (targetH > maxH) {
            targetH = maxH;
            targetW = targetH * lockRatio;
          }
          newW = targetW;
          newH = targetH;
        }
        newX = anchorX - newW;
        newY = anchorY - newH;
      } else if (type === 'e') {
        newW = Math.min(nw - cropX, Math.max(minSize, cropW + dx));
        if (lockRatio !== null) newH = newW / lockRatio;
      } else if (type === 'w') {
        const anchorX = cropX + cropW;
        newW = Math.min(anchorX, Math.max(minSize, cropW - dx));
        newX = anchorX - newW;
        if (lockRatio !== null) newH = newW / lockRatio;
      } else if (type === 's') {
        newH = Math.min(nh - cropY, Math.max(minSize, cropH + dy));
        if (lockRatio !== null) newW = newH * lockRatio;
      } else if (type === 'n') {
        const anchorY = cropY + cropH;
        newH = Math.min(anchorY, Math.max(minSize, cropH - dy));
        newY = anchorY - newH;
        if (lockRatio !== null) newW = newH * lockRatio;
      }

      setCrop({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    },
    [image, isLocked, activeRatio, imgElementRef]
  );

  // Global window pointer listeners guarantee flawless dragging
  React.useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      onPointerMoveInternal(e.clientX, e.clientY);
    };

    const onWindowPointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      dragTypeRef.current = null;
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [onPointerMoveInternal]);

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
    effectiveRatios,
    hasRestrictedRatios,
    handleSelectPreset,
    toggleRatioLock,
    fitFullImage,
    centerCrop,
    handlePointerDown,
    getRenderedBoxStyle,
  };
}
