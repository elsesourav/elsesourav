/**
 * High-Fidelity Downsampling Algorithms for WasmPortraitCanvas
 * Converts high-resolution portrait photographs into crisp, discrete micro-pixel grids
 * without losing edge contrast, facial subtleties, or fabric shadow details.
 */

export type DownsampleAlgorithm = 'native' | 'stepped' | 'perceptual' | 'edge_preserve';

export interface DownsampleOptions {
  img: HTMLImageElement;
  targetCanvas: HTMLCanvasElement;
  targetCtx: CanvasRenderingContext2D;
  simRes: number;
  algorithm?: string;
  isDark?: boolean;
}

/**
 * Standard canvas direct downsampling (Classic Baseline).
 * Fast, smooth, native browser bicubic downscale.
 */
function downsampleNative(
  img: HTMLImageElement,
  targetCtx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void {
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  targetCtx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Multi-Step Mipmap Downsampling (Progressive Halving).
 * Progressively downsamples the image in <= 50% steps until within 2x of target,
 * eliminating high-frequency aliasing and preserving fine curl boundaries.
 */
function downsampleStepped(
  img: HTMLImageElement,
  targetCtx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void {
  let curW = img.naturalWidth || dw;
  let curH = img.naturalHeight || dh;

  // If downscale factor is small, draw directly
  if (curW <= dw * 1.5 && curH <= dh * 1.5) {
    downsampleNative(img, targetCtx, dx, dy, dw, dh);
    return;
  }

  // Create temporary scratch canvas for progressive stepped downscaling
  const stepCanvas = document.createElement('canvas');
  stepCanvas.width = curW;
  stepCanvas.height = curH;
  const stepCtx = stepCanvas.getContext('2d');
  if (!stepCtx) {
    downsampleNative(img, targetCtx, dx, dy, dw, dh);
    return;
  }

  stepCtx.imageSmoothingEnabled = true;
  stepCtx.imageSmoothingQuality = 'high';
  stepCtx.drawImage(img, 0, 0, curW, curH);

  // Halve step by step until within 1.5x of target
  while (curW * 0.5 >= dw && curH * 0.5 >= dh) {
    const nextW = Math.round(curW * 0.5);
    const nextH = Math.round(curH * 0.5);

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = nextW;
    tmpCanvas.height = nextH;
    const tmpCtx = tmpCanvas.getContext('2d');
    if (!tmpCtx) break;

    tmpCtx.imageSmoothingEnabled = true;
    tmpCtx.imageSmoothingQuality = 'high';
    tmpCtx.drawImage(stepCanvas, 0, 0, nextW, nextH);

    stepCanvas.width = nextW;
    stepCanvas.height = nextH;
    stepCtx.clearRect(0, 0, nextW, nextH);
    stepCtx.drawImage(tmpCanvas, 0, 0, nextW, nextH);

    curW = nextW;
    curH = nextH;
  }

  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  targetCtx.drawImage(stepCanvas, 0, 0, curW, curH, dx, dy, dw, dh);
}

/**
 * Perceptual Linear-Gamma Area Downsampling.
 * Performs area downsampling in linear optical luminance space (L = V^2.2)
 * rather than sRGB non-linear gamma space. Eliminates "dark crushing" so
 * deep jackets and dark hoodies retain subtle fabric folds against dark canvas.
 */
function downsamplePerceptual(
  img: HTMLImageElement,
  targetCtx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  simRes: number
): void {
  // First do high-quality stepped pre-scale to 2x target resolution
  const preW = dw * 2;
  const preH = dh * 2;
  const preCanvas = document.createElement('canvas');
  preCanvas.width = preW;
  preCanvas.height = preH;
  const preCtx = preCanvas.getContext('2d');
  if (!preCtx) {
    downsampleStepped(img, targetCtx, dx, dy, dw, dh);
    return;
  }

  preCtx.imageSmoothingEnabled = true;
  preCtx.imageSmoothingQuality = 'high';
  preCtx.drawImage(img, 0, 0, preW, preH);

  const preData = preCtx.getImageData(0, 0, preW, preH);
  const src = preData.data;

  // Final target ImageData
  const outImgData = targetCtx.createImageData(simRes, simRes);
  const out = outImgData.data;

  // 2x2 box downsampling in linear gamma optical space
  const invGamma = 1.0 / 2.2;

  for (let intY = 0; intY < dh; intY++) {
    const outY = dy + intY;
    if (outY < 0 || outY >= simRes) continue;

    for (let intX = 0; intX < dw; intX++) {
      const outX = dx + intX;
      if (outX < 0 || outX >= simRes) continue;

      let rLinSum = 0;
      let gLinSum = 0;
      let bLinSum = 0;
      let aSum = 0;
      let weightSum = 0;

      const srcStartY = intY * 2;
      const srcStartX = intX * 2;

      for (let sy = 0; sy < 2; sy++) {
        const py = srcStartY + sy;
        if (py >= preH) continue;
        for (let sx = 0; sx < 2; sx++) {
          const px = srcStartX + sx;
          if (px >= preW) continue;

          const sIdx = (py * preW + px) * 4;
          const sa = (src[sIdx + 3] ?? 0) / 255.0;
          if (sa <= 0.001) continue;

          const sr = (src[sIdx] ?? 0) / 255.0;
          const sg = (src[sIdx + 1] ?? 0) / 255.0;
          const sb = (src[sIdx + 2] ?? 0) / 255.0;

          // Convert sRGB to linear optical power
          const rLin = Math.pow(sr, 2.2) * sa;
          const gLin = Math.pow(sg, 2.2) * sa;
          const bLin = Math.pow(sb, 2.2) * sa;

          rLinSum += rLin;
          gLinSum += gLin;
          bLinSum += bLin;
          aSum += sa;
          weightSum += sa;
        }
      }

      const oIdx = (outY * simRes + outX) * 4;
      if (weightSum > 0.005) {
        const avgR = rLinSum / weightSum;
        const avgG = gLinSum / weightSum;
        const avgB = bLinSum / weightSum;
        const avgA = aSum / 4.0;

        // Convert linear optical power back to sRGB bytes
        out[oIdx] = Math.round(Math.pow(Math.min(1.0, Math.max(0.0, avgR)), invGamma) * 255.0);
        out[oIdx + 1] = Math.round(Math.pow(Math.min(1.0, Math.max(0.0, avgG)), invGamma) * 255.0);
        out[oIdx + 2] = Math.round(Math.pow(Math.min(1.0, Math.max(0.0, avgB)), invGamma) * 255.0);
        out[oIdx + 3] = Math.round(Math.min(1.0, Math.max(0.0, avgA)) * 255.0);
      }
    }
  }

  targetCtx.putImageData(outImgData, 0, 0);
}

/**
 * Bilateral Edge-Preserving Area Filter.
 * Combines stepped downsampling with edge-directed spatial sharpness,
 * enhancing micro-contrast on curls, eyes, and clothing folds.
 */
function downsampleEdgePreserve(
  img: HTMLImageElement,
  targetCtx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  simRes: number
): void {
  // First do multi-step stepped downsampling to target bounds
  downsampleStepped(img, targetCtx, dx, dy, dw, dh);

  const imgData = targetCtx.getImageData(0, 0, simRes, simRes);
  const data = imgData.data;
  const copy = new Uint8Array(data);

  // Subtle 3x3 unsharp contrast enhancement for edge pixels
  const kernel = [
    0, -0.15, 0,
    -0.15, 1.60, -0.15,
    0, -0.15, 0
  ];

  for (let y = 1; y < simRes - 1; y++) {
    for (let x = 1; x < simRes - 1; x++) {
      const idx = (y * simRes + x) * 4;
      if ((copy[idx + 3] ?? 0) < 32) continue; // Skip empty background

      let r = 0;
      let g = 0;
      let b = 0;
      let kIdx = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const sIdx = ((y + ky) * simRes + (x + kx)) * 4;
          const w = kernel[kIdx++] ?? 0;
          r += (copy[sIdx] ?? 0) * w;
          g += (copy[sIdx + 1] ?? 0) * w;
          b += (copy[sIdx + 2] ?? 0) * w;
        }
      }

      data[idx] = Math.min(255, Math.max(0, Math.round(r)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
    }
  }

  targetCtx.putImageData(imgData, 0, 0);
}

/**
 * Main Downsample Dispatcher
 */
export function downsamplePortraitImage(options: DownsampleOptions): ImageData {
  const { img, targetCanvas, targetCtx, simRes, algorithm = 'stepped' } = options;

  if (targetCanvas.width !== simRes || targetCanvas.height !== simRes) {
    targetCanvas.width = simRes;
    targetCanvas.height = simRes;
  }
  targetCtx.clearRect(0, 0, simRes, simRes);

  const nw = img.naturalWidth || 1;
  const nh = img.naturalHeight || 1;
  const aspect = nw / nh;
  let dw = simRes;
  let dh = simRes;
  let dx = 0;
  let dy = 0;

  if (aspect < 1.0) {
    dw = Math.round(simRes * aspect);
    dx = Math.round((simRes - dw) / 2);
  } else if (aspect > 1.0) {
    dh = Math.round(simRes / aspect);
    dy = Math.round((simRes - dh) / 2);
  }

  switch (algorithm) {
    case 'native':
      downsampleNative(img, targetCtx, dx, dy, dw, dh);
      break;
    case 'perceptual':
      downsamplePerceptual(img, targetCtx, dx, dy, dw, dh, simRes);
      break;
    case 'edge_preserve':
      downsampleEdgePreserve(img, targetCtx, dx, dy, dw, dh, simRes);
      break;
    case 'stepped':
    default:
      downsampleStepped(img, targetCtx, dx, dy, dw, dh);
      break;
  }

  return targetCtx.getImageData(0, 0, simRes, simRes);
}
