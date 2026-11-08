import { getPixelEngineWasmBinary } from '../../wasm/pixel_engine_wasm_bytes';
import { WasmPortraitBridgeOptions, WasmExports } from './wasm-portrait.types';
import { PIXEL_VS, PIXEL_FS } from './wasm-portrait.shaders';

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

  private transformScaleX = 1.0;
  private transformScaleY = 1.0;
  private transformOffsetX = 0.0;
  private transformOffsetY = 0.0;
  private transformScatter = 1.0;
  private isFullscreen = false;
  private entranceDuration = 1.6;
  private entranceStartTime = 0;
  private getCardRect?: () => DOMRect | null;

  private particleSize: number;
  private glowBrightness: number;
  private flightSpeed: number;
  private particleDensity: number;
  private pathSpread: number;
  private showPathGuide: boolean;

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
    const rawSpread = typeof options.pathSpread === 'string' ? parseFloat(options.pathSpread) : (options.pathSpread ?? 2.4);
    this.pathSpread = isNaN(rawSpread) ? 2.4 : Math.max(0.2, Math.min(8.0, rawSpread));
    this.showPathGuide = options.showPathGuide ?? false;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.simRes;
    this.offscreenCanvas.height = this.simRes;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    this.initRenderer();
    this.initWasm();
  }

  private initRenderer(): void {
    const gl =
      (this.canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false }) as WebGL2RenderingContext | null) ||
      (this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) as WebGLRenderingContext | null);

    if (gl) {
      this.gl = gl;
      this.useWebGL = true;
      this.initWebGLShaders(gl);
    } else {
      this.useWebGL = false;
      this.ctx2d = this.canvas.getContext('2d', { alpha: true });
    }
  }

  private createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
    const vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  private initWebGLShaders(gl: WebGLRenderingContext): void {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.pixelProgram = this.createProgram(gl, PIXEL_VS, PIXEL_FS);
    if (this.pixelProgram) {
      this.pixelVbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.pixelVbo);
      gl.bufferData(gl.ARRAY_BUFFER, 65536 * 7 * 4, gl.DYNAMIC_DRAW);
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
      this.wasmExports.engine_init(
        this.enginePtr,
        this.simRes,
        this.simRes,
        this.isDark ? 1 : 0
      );
      this.wasmExports.engine_set_light_intensity(this.enginePtr, this.lightIntensity);
      if (this.particleSize !== 1.0) this.wasmExports.engine_set_particle_size(this.enginePtr, this.particleSize);
      if (this.glowBrightness !== 1.0) this.wasmExports.engine_set_glow_brightness(this.enginePtr, this.glowBrightness);
      if (this.flightSpeed !== 1.0) this.wasmExports.engine_set_speed(this.enginePtr, this.flightSpeed);
      if (this.particleDensity !== 1.0) this.wasmExports.engine_set_density(this.enginePtr, this.particleDensity);
      this.wasmExports.engine_set_path_spread(this.enginePtr, this.pathSpread);
      if (this.showPathGuide) this.wasmExports.engine_set_show_path_guide(this.enginePtr, 1);

      if (this.pendingImg) {
        this.ingestImageElement(this.pendingImg);
      }
    } catch (err) {
      console.error('[WasmPortraitBridge] Failed to initialize WebAssembly:', err);
    }
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
        const mem = this.wasmExports.memory;
        const heap = new Uint8Array(mem.buffer);
        heap.set(imgData.data, inPtr);

        this.wasmExports.engine_process_image(this.enginePtr, this.simRes, this.simRes);
        this.onLoaded?.();
      }
    } catch (err) {
      console.warn('[WasmPortraitBridge] Error ingesting image element:', err);
    }
  }

  public setPointer(normalizedX: number, normalizedY: number, isDown: boolean): void {
    this.targetMouseX = normalizedX < -900 || normalizedY < -900 ? -1 : ((normalizedX + 1.0) * 0.5) * this.simRes;
    this.targetMouseY = normalizedX < -900 || normalizedY < -900 ? -1 : ((1.0 - normalizedY) * 0.5) * this.simRes;
    this.isMouseDown = isDown;
  }

  public burst(normalizedX?: number, normalizedY?: number): void {
    if (!this.wasmExports || !this.enginePtr) return;
    const bx = normalizedX !== undefined ? ((normalizedX + 1.0) * 0.5) * this.simRes : this.simRes * 0.5;
    const by = normalizedY !== undefined ? ((1.0 - normalizedY) * 0.5) * this.simRes : this.simRes * 0.5;
    this.wasmExports.engine_add_burst(this.enginePtr, bx, by, 1.8);
  }

  public triggerEntrance(duration = 1.6): void {
    this.entranceDuration = duration;
    this.entranceStartTime = performance.now();
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_trigger_entrance(this.enginePtr, duration);
    }
  }

  public isEntrancing(): boolean {
    if (!this.wasmExports || !this.enginePtr) return false;
    return this.wasmExports.engine_is_entrancing(this.enginePtr) === 1;
  }

  public setTheme(isDark: boolean): void {
    this.isDark = isDark;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_theme(this.enginePtr, isDark ? 1 : 0);
    }
  }

  public setLightIntensity(intensity: number): void {
    this.lightIntensity = intensity;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_light_intensity(this.enginePtr, intensity);
    }
  }

  public setParticleSize(mult: number): void {
    this.particleSize = mult;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_particle_size(this.enginePtr, mult);
    }
  }

  public setGlowBrightness(mult: number): void {
    this.glowBrightness = mult;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_glow_brightness(this.enginePtr, mult);
    }
  }

  public setFlightSpeed(mult: number): void {
    this.flightSpeed = mult;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_speed(this.enginePtr, mult);
    }
  }

  public setDensity(mult: number): void {
    this.particleDensity = mult;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_density(this.enginePtr, mult);
    }
  }

  public setPathSpread(spread: number | string): void {
    const parsed = typeof spread === 'string' ? parseFloat(spread) : spread;
    const eff = isNaN(parsed) ? 2.4 : Math.max(0.2, Math.min(8.0, parsed));
    if (Math.abs(this.pathSpread - eff) > 0.05) {
      this.pathSpread = eff;
      if (this.wasmExports && this.enginePtr) {
        this.wasmExports.engine_set_path_spread(this.enginePtr, eff);
      }
    }
  }

  public setShowPathGuide(show: boolean): void {
    this.showPathGuide = show;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_set_show_path_guide(this.enginePtr, show ? 1 : 0);
    }
  }

  public setFullscreenMode(fullscreen: boolean, getCardRect?: () => DOMRect | null): void {
    this.isFullscreen = fullscreen;
    this.getCardRect = getCardRect;
    if (!fullscreen) {
      this.transformScaleX = 1.0;
      this.transformScaleY = 1.0;
      this.transformOffsetX = 0.0;
      this.transformOffsetY = 0.0;
      this.transformScatter = 1.0;
    }
  }

  public resize(width: number, height: number): void {
    if (this.gl) {
      this.gl.viewport(0, 0, width, height);
    }
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
      const smoothing = 0.35;
      this.mouseX = this.mouseX < 0 ? this.targetMouseX : this.mouseX + (this.targetMouseX - this.mouseX) * smoothing;
      this.mouseY = this.mouseY < 0 ? this.targetMouseY : this.mouseY + (this.targetMouseY - this.mouseY) * smoothing;
    }

    if (this.isFullscreen && this.getCardRect) {
      const rect = this.getCardRect();
      if (rect && rect.width > 0 && rect.height > 0 && typeof window !== 'undefined') {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const targetScaleX = rect.width / vw;
        const targetScaleY = rect.height / vh;
        const cardCenterX = rect.left + rect.width * 0.5;
        const cardCenterY = rect.top + rect.height * 0.5;
        const targetOffsetX = (cardCenterX / vw) * 2.0 - 1.0;
        const targetOffsetY = 1.0 - (cardCenterY / vh) * 2.0;

        const elapsed = (performance.now() - this.entranceStartTime) / 1000;
        const p = Math.min(Math.max(elapsed / this.entranceDuration, 0), 1.0);
        const rem = 1.0 - p;
        const ease = 1.0 - rem * rem * rem * rem;

        const startScaleX = Math.min(1.0, 520 / vw);
        const startScaleY = Math.min(1.0, 520 / vh);

        this.transformScaleX = startScaleX + (targetScaleX - startScaleX) * ease;
        this.transformScaleY = startScaleY + (targetScaleY - startScaleY) * ease;
        this.transformOffsetX = 0.0 + (targetOffsetX - 0.0) * ease;
        this.transformOffsetY = 0.0 + (targetOffsetY - 0.0) * ease;
        this.transformScatter = 1.0;
      }
    } else {
      this.transformScaleX = 1.0;
      this.transformScaleY = 1.0;
      this.transformOffsetX = 0.0;
      this.transformOffsetY = 0.0;
      this.transformScatter = 1.0;
    }

    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_update(
        this.enginePtr,
        dt,
        this.mouseX,
        this.mouseY,
        this.isMouseDown ? 1 : 0
      );
    }
  }

  private render(): void {
    if (this.useWebGL && this.gl) {
      this.renderWebGL(this.gl);
    } else if (this.ctx2d) {
      this.render2D(this.ctx2d);
    }
  }

  private renderWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!this.wasmExports || !this.enginePtr || !this.pixelProgram || !this.pixelVbo) return;

    const count = this.wasmExports.engine_get_vertex_count(this.enginePtr);
    if (count <= 0) return;

    const vPtr = this.wasmExports.engine_get_vertex_buffer(this.enginePtr);
    if (!vPtr) return;

    const mem = this.wasmExports.memory;
    const vertexFloats = new Float32Array(mem.buffer, vPtr, count * 7);

    gl.useProgram(this.pixelProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pixelVbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexFloats);

    const stride = 7 * 4;
    const posLoc = gl.getAttribLocation(this.pixelProgram, 'a_pos');
    const colLoc = gl.getAttribLocation(this.pixelProgram, 'a_color');
    const sizeLoc = gl.getAttribLocation(this.pixelProgram, 'a_size');

    if (posLoc >= 0 && colLoc >= 0 && sizeLoc >= 0) {
      gl.uniform2f(gl.getUniformLocation(this.pixelProgram, 'u_scale'), this.transformScaleX, this.transformScaleY);
      gl.uniform2f(gl.getUniformLocation(this.pixelProgram, 'u_offset'), this.transformOffsetX, this.transformOffsetY);
      gl.uniform1f(gl.getUniformLocation(this.pixelProgram, 'u_scatter'), this.transformScatter);

      const rect = this.isFullscreen && this.getCardRect ? this.getCardRect() : null;
      const effectiveWidth = rect && rect.width > 0 ? rect.width : this.canvas.width;
      gl.uniform1f(gl.getUniformLocation(this.pixelProgram, 'u_point_scale'), effectiveWidth > 0 ? effectiveWidth / 580.0 : 1.0);

      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(colLoc);
      gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, stride, 8);
      gl.enableVertexAttribArray(sizeLoc);
      gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 24);

      gl.drawArrays(gl.POINTS, 0, count);

      gl.disableVertexAttribArray(posLoc);
      gl.disableVertexAttribArray(colLoc);
      gl.disableVertexAttribArray(sizeLoc);
    }
  }

  private render2D(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public isWebGLActive(): boolean {
    return this.useWebGL && this.gl !== null;
  }

  public dispose(): void {
    this.pause();
    if (this.gl && this.pixelProgram) {
      this.gl.deleteProgram(this.pixelProgram);
    }
    if (this.gl && this.pixelVbo) {
      this.gl.deleteBuffer(this.pixelVbo);
    }
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_destroy(this.enginePtr);
      this.enginePtr = 0;
    }
    this.offscreenCanvas.width = 0;
    this.offscreenCanvas.height = 0;
    this.offscreenCtx = null;
  }
}
