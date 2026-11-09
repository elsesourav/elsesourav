import { getPixelEngineWasmBinary } from '../../wasm/pixel_engine_wasm_bytes';
import { WasmPortraitBridgeOptions, WasmExports } from './wasm-portrait.types';
import {
  createPixelProgram,
  drawPixelVertices,
  computeFullscreenTransform,
  type WebGLTransformState,
} from './wasm-portrait.renderer';

export type { WasmPortraitBridgeOptions, WasmExports };

export class WasmPortraitBridge {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private useWebGL = true;

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;

  private wasmExports: WasmExports | null = null;
  private enginePtr: number = 0;
  private pendingImg: HTMLImageElement | null = null;

  private simRes: number;
  private isDark: boolean;
  private lightIntensity: number;
  private onLoaded?: () => void;

  private animFrameId: number | null = null;
  private isRunning = false;
  private lastTime = 0;

  private mouseX = -1;
  private mouseY = -1;
  private targetMouseX = -1;
  private targetMouseY = -1;
  private isMouseDown = false;

  private pixelProgram: WebGLProgram | null = null;
  private pixelVbo: WebGLBuffer | null = null;

  private transform: WebGLTransformState = {
    scaleX: 1.0,
    scaleY: 1.0,
    offsetX: 0.0,
    offsetY: 0.0,
    scatter: 1.0,
    isFullscreen: false,
  };

  private entranceDuration = 1.6;
  private entranceStartTime = 0;
  private getCardRect?: () => DOMRect | null;

  private particleSize: number;
  private glowBrightness: number;
  private flightSpeed: number;
  private particleDensity: number;
  private pathSpread: number;
  private showPathGuide: boolean;

  private edgeAlgorithm: number;
  private edgeThreshold: number;
  private pinBottomEdge: number;
  private topParticleSize: number;
  private topParticleQuantity: number;
  private topParticleSpeed: number;
  private backsideStars: number;
  private backsideHalo: number;
  private backsideOrbits: number;
  private backsideSpecks: number;
  private clickForce: number;
  private bounceSpeed: number;
  private glowDistance: number;
  private clickRadius: number;

  constructor(options: WasmPortraitBridgeOptions) {
    this.canvas = options.canvas;
    this.isDark = options.isDark;
    this.lightIntensity = options.lightIntensity ?? 0.38;
    this.simRes = options.simulationResolution || 224;
    this.onLoaded = options.onLoaded;
    this.particleSize = options.particleSize ?? 1.0;
    this.glowBrightness = options.glowBrightness ?? 1.0;
    this.flightSpeed = options.flightSpeed ?? 1.0;
    this.particleDensity = options.particleDensity ?? 1.0;
    const rawSpread =
      typeof options.pathSpread === 'string'
        ? parseFloat(options.pathSpread)
        : (options.pathSpread ?? 2.4);
    this.pathSpread = isNaN(rawSpread) ? 2.4 : Math.max(0.2, Math.min(8.0, rawSpread));
    this.showPathGuide = options.showPathGuide ?? false;

    this.edgeAlgorithm = options.edgeAlgorithm ?? 0;
    this.edgeThreshold = options.edgeThreshold ?? 28;
    this.pinBottomEdge = options.pinBottomEdge ?? 1;
    this.topParticleSize = options.topParticleSize ?? 1.0;
    this.topParticleQuantity = options.topParticleQuantity ?? 1.0;
    this.topParticleSpeed = options.topParticleSpeed ?? 1.0;
    this.backsideStars = options.backsideStars ?? 32;
    this.backsideHalo = options.backsideHalo ?? 1.0;
    this.backsideOrbits = options.backsideOrbits ?? 2;
    this.backsideSpecks = options.backsideSpecks ?? 1.0;
    this.clickForce = options.clickForce ?? 1.0;
    this.bounceSpeed = options.bounceSpeed ?? 1.0;
    this.glowDistance = options.glowDistance ?? 1.0;
    this.clickRadius = options.clickRadius ?? 1.0;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.simRes;
    this.offscreenCanvas.height = this.simRes;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    this.initRenderer();
    this.initWasm();
  }

  private initRenderer(): void {
    const gl =
      (this.canvas.getContext('webgl2', { alpha: true }) as WebGL2RenderingContext | null) ||
      (this.canvas.getContext('webgl', { alpha: true }) as WebGLRenderingContext | null);

    if (gl) {
      this.gl = gl;
      this.useWebGL = true;
      const { program, vbo } = createPixelProgram(gl);
      this.pixelProgram = program;
      this.pixelVbo = vbo;
    } else {
      this.useWebGL = false;
      this.ctx2d = this.canvas.getContext('2d', { alpha: true });
    }
  }

  private async initWasm(): Promise<void> {
    try {
      const wasmBytes = getPixelEngineWasmBinary();
      const res = (await WebAssembly.instantiate(wasmBytes, {})) as
        | WebAssembly.WebAssemblyInstantiatedSource
        | WebAssembly.Instance;
      const instance: WebAssembly.Instance = 'instance' in res ? res.instance : res;
      this.wasmExports = instance.exports as unknown as WasmExports;

      this.enginePtr = this.wasmExports.engine_create();
      this.wasmExports.engine_init(this.enginePtr, this.simRes, this.simRes, this.isDark ? 1 : 0);

      this.applyAllWasmConfig();

      if (this.pendingImg) {
        this.ingestImageElement(this.pendingImg);
      }
    } catch (err) {
      console.error('[WasmPortraitBridge] Failed to initialize WebAssembly:', err);
    }
  }

  private applyAllWasmConfig(): void {
    if (!this.wasmExports || !this.enginePtr) return;
    const e = this.wasmExports;
    const p = this.enginePtr;
    e.engine_set_light_intensity(p, this.lightIntensity);
    if (this.particleSize !== 1.0) e.engine_set_particle_size(p, this.particleSize);
    if (this.glowBrightness !== 1.0) e.engine_set_glow_brightness(p, this.glowBrightness);
    if (this.flightSpeed !== 1.0) e.engine_set_speed(p, this.flightSpeed);
    if (this.particleDensity !== 1.0) e.engine_set_density(p, this.particleDensity);
    e.engine_set_path_spread(p, this.pathSpread);
    if (this.showPathGuide) e.engine_set_show_path_guide(p, 1);

    e.engine_set_edge_algorithm(p, this.edgeAlgorithm);
    e.engine_set_edge_threshold(p, this.edgeThreshold);
    e.engine_set_pin_bottom_edge(p, this.pinBottomEdge);
    e.engine_set_top_particle_size(p, this.topParticleSize);
    e.engine_set_top_particle_quantity(p, this.topParticleQuantity);
    e.engine_set_top_particle_speed(p, this.topParticleSpeed);
    e.engine_set_backside_stars(p, this.backsideStars);
    e.engine_set_backside_halo(p, this.backsideHalo);
    e.engine_set_backside_orbits(p, this.backsideOrbits);
    e.engine_set_backside_specks(p, this.backsideSpecks);
    e.engine_set_click_force(p, this.clickForce);
    e.engine_set_bounce_speed(p, this.bounceSpeed);
    e.engine_set_glow_distance(p, this.glowDistance);
    e.engine_set_click_radius(p, this.clickRadius);
  }

  public ingestImageElement(img: HTMLImageElement): void {
    this.pendingImg = img;
    if (!this.wasmExports || !this.enginePtr || !this.offscreenCtx) return;

    if (!img.complete || img.naturalWidth === 0) {
      img.addEventListener('load', () => this.ingestImageElement(img), { once: true });
      return;
    }

    try {
      this.offscreenCtx.clearRect(0, 0, this.simRes, this.simRes);
      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;
      const aspect = nw / nh;
      let dw = this.simRes;
      let dh = this.simRes;
      let dx = 0;
      let dy = 0;

      if (aspect < 1.0) {
        dw = Math.round(this.simRes * aspect);
        dx = Math.round((this.simRes - dw) / 2);
      } else if (aspect > 1.0) {
        dh = Math.round(this.simRes / aspect);
        dy = Math.round((this.simRes - dh) / 2);
      }

      this.offscreenCtx.drawImage(img, dx, dy, dw, dh);
      const imgData = this.offscreenCtx.getImageData(0, 0, this.simRes, this.simRes);
      const inPtr = this.wasmExports.engine_get_input_buffer(this.enginePtr);

      if (inPtr) {
        new Uint8Array(this.wasmExports.memory.buffer).set(imgData.data, inPtr);
        this.wasmExports.engine_process_image(this.enginePtr, this.simRes, this.simRes);
        this.onLoaded?.();
      }
    } catch (err) {
      console.warn('[WasmPortraitBridge] Error ingesting image element:', err);
    }
  }

  public setPointer(normalizedX: number, normalizedY: number, isDown: boolean): void {
    this.targetMouseX =
      normalizedX < -900 || normalizedY < -900 ? -1 : (normalizedX + 1.0) * 0.5 * this.simRes;
    this.targetMouseY =
      normalizedX < -900 || normalizedY < -900 ? -1 : (1.0 - normalizedY) * 0.5 * this.simRes;
    this.isMouseDown = isDown;
  }

  public burst(normalizedX?: number, normalizedY?: number): void {
    if (!this.wasmExports || !this.enginePtr) return;
    const bx =
      normalizedX !== undefined ? (normalizedX + 1.0) * 0.5 * this.simRes : this.simRes * 0.5;
    const by =
      normalizedY !== undefined ? (1.0 - normalizedY) * 0.5 * this.simRes : this.simRes * 0.5;
    this.wasmExports.engine_add_burst(this.enginePtr, bx, by, 1.8);
  }

  public triggerEntrance(duration = 1.6): void {
    this.entranceDuration = duration;
    this.entranceStartTime = performance.now();
    this.wasmExports?.engine_trigger_entrance(this.enginePtr, duration);
  }

  public isEntrancing(): boolean {
    return this.wasmExports?.engine_is_entrancing(this.enginePtr) === 1;
  }

  public setTheme(isDark: boolean): void {
    this.isDark = isDark;
    this.wasmExports?.engine_set_theme(this.enginePtr, isDark ? 1 : 0);
  }

  public setLightIntensity(val: number): void {
    this.lightIntensity = val;
    this.wasmExports?.engine_set_light_intensity(this.enginePtr, val);
  }

  public setParticleSize(mult: number): void {
    this.particleSize = mult;
    this.wasmExports?.engine_set_particle_size(this.enginePtr, mult);
  }

  public setGlowBrightness(mult: number): void {
    this.glowBrightness = mult;
    this.wasmExports?.engine_set_glow_brightness(this.enginePtr, mult);
  }

  public setFlightSpeed(mult: number): void {
    this.flightSpeed = mult;
    this.wasmExports?.engine_set_speed(this.enginePtr, mult);
  }

  public setDensity(mult: number): void {
    this.particleDensity = mult;
    this.wasmExports?.engine_set_density(this.enginePtr, mult);
  }

  public setPathSpread(spread: number | string): void {
    const parsed = typeof spread === 'string' ? parseFloat(spread) : spread;
    const eff = isNaN(parsed) ? 2.4 : Math.max(0.2, Math.min(8.0, parsed));
    if (Math.abs(this.pathSpread - eff) > 0.05) {
      this.pathSpread = eff;
      this.wasmExports?.engine_set_path_spread(this.enginePtr, eff);
    }
  }

  public setShowPathGuide(show: boolean): void {
    this.showPathGuide = show;
    this.wasmExports?.engine_set_show_path_guide(this.enginePtr, show ? 1 : 0);
  }

  public setEdgeAlgorithm(v: number): void {
    this.edgeAlgorithm = v;
    this.wasmExports?.engine_set_edge_algorithm(this.enginePtr, v);
  }

  public setEdgeThreshold(v: number): void {
    this.edgeThreshold = v;
    this.wasmExports?.engine_set_edge_threshold(this.enginePtr, v);
  }

  public setPinBottomEdge(v: number): void {
    this.pinBottomEdge = v;
    this.wasmExports?.engine_set_pin_bottom_edge(this.enginePtr, v);
  }

  public setTopParticleSize(v: number): void {
    this.topParticleSize = v;
    this.wasmExports?.engine_set_top_particle_size(this.enginePtr, v);
  }

  public setTopParticleQuantity(v: number): void {
    this.topParticleQuantity = v;
    this.wasmExports?.engine_set_top_particle_quantity(this.enginePtr, v);
  }

  public setTopParticleSpeed(v: number): void {
    this.topParticleSpeed = v;
    this.wasmExports?.engine_set_top_particle_speed(this.enginePtr, v);
  }

  public setBacksideStars(v: number): void {
    this.backsideStars = v;
    this.wasmExports?.engine_set_backside_stars(this.enginePtr, v);
  }

  public setBacksideHalo(v: number): void {
    this.backsideHalo = v;
    this.wasmExports?.engine_set_backside_halo(this.enginePtr, v);
  }

  public setBacksideOrbits(v: number): void {
    this.backsideOrbits = v;
    this.wasmExports?.engine_set_backside_orbits(this.enginePtr, v);
  }

  public setBacksideSpecks(v: number): void {
    this.backsideSpecks = v;
    this.wasmExports?.engine_set_backside_specks(this.enginePtr, v);
  }

  public setClickForce(v: number): void {
    this.clickForce = v;
    this.wasmExports?.engine_set_click_force(this.enginePtr, v);
  }

  public setBounceSpeed(v: number): void {
    this.bounceSpeed = v;
    this.wasmExports?.engine_set_bounce_speed(this.enginePtr, v);
  }

  public setGlowDistance(v: number): void {
    this.glowDistance = v;
    this.wasmExports?.engine_set_glow_distance(this.enginePtr, v);
  }

  public setClickRadius(v: number): void {
    this.clickRadius = v;
    this.wasmExports?.engine_set_click_radius(this.enginePtr, v);
  }

  public setFullscreenMode(fullscreen: boolean, getCardRect?: () => DOMRect | null): void {
    this.transform.isFullscreen = fullscreen;
    this.getCardRect = getCardRect;
    if (!fullscreen) {
      this.transform.scaleX = 1.0;
      this.transform.scaleY = 1.0;
      this.transform.offsetX = 0.0;
      this.transform.offsetY = 0.0;
      this.transform.scatter = 1.0;
    }
  }

  public resize(width: number, height: number): void {
    this.gl?.viewport(0, 0, width, height);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt);
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    if (this.targetMouseX < 0) {
      this.mouseX = -1;
      this.mouseY = -1;
    } else {
      const s = 0.35;
      this.mouseX = this.mouseX < 0 ? this.targetMouseX : this.mouseX + (this.targetMouseX - this.mouseX) * s;
      this.mouseY = this.mouseY < 0 ? this.targetMouseY : this.mouseY + (this.targetMouseY - this.mouseY) * s;
    }

    if (this.transform.isFullscreen && this.getCardRect) {
      const t = computeFullscreenTransform(this.getCardRect, this.entranceStartTime, this.entranceDuration);
      this.transform.scaleX = t.scaleX;
      this.transform.scaleY = t.scaleY;
      this.transform.offsetX = t.offsetX;
      this.transform.offsetY = t.offsetY;
      this.transform.scatter = 1.0;
    } else {
      this.transform.scaleX = 1.0;
      this.transform.scaleY = 1.0;
      this.transform.offsetX = 0.0;
      this.transform.offsetY = 0.0;
      this.transform.scatter = 1.0;
    }

    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_update(this.enginePtr, dt, this.mouseX, this.mouseY, this.isMouseDown ? 1 : 0);
    }
  }

  private render(): void {
    if (this.useWebGL && this.gl && this.pixelProgram && this.pixelVbo && this.wasmExports) {
      const cardRect = this.transform.isFullscreen && this.getCardRect ? this.getCardRect() : null;
      drawPixelVertices(
        this.gl,
        this.pixelProgram,
        this.pixelVbo,
        this.wasmExports,
        this.enginePtr,
        this.transform,
        this.canvas.width,
        cardRect
      );
    } else if (this.ctx2d) {
      this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public isWebGLActive(): boolean {
    return this.useWebGL && this.gl !== null;
  }

  public dispose(): void {
    this.pause();
    if (this.gl && this.pixelProgram) this.gl.deleteProgram(this.pixelProgram);
    if (this.gl && this.pixelVbo) this.gl.deleteBuffer(this.pixelVbo);
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_destroy(this.enginePtr);
      this.enginePtr = 0;
    }
    this.offscreenCanvas.width = 0;
    this.offscreenCanvas.height = 0;
    this.offscreenCtx = null;
  }
}
