import { getPixelEngineWasmBinary } from '../../wasm/pixel_engine_wasm_bytes';

export interface WasmPortraitBridgeOptions {
  canvas: HTMLCanvasElement;
  imageDarkSrc: string;
  imageLightSrc: string;
  isDark: boolean;
  lightIntensity?: number;
  simulationResolution?: number;
  particleSize?: number;
  glowBrightness?: number;
  flightSpeed?: number;
  particleDensity?: number;
  onLoaded?: () => void;
}

interface WasmExports {
  memory: WebAssembly.Memory;
  engine_create: () => number;
  engine_init: (engine: number, w: number, h: number, dark: number) => void;
  engine_get_input_buffer: (engine: number) => number;
  engine_process_image: (engine: number, w: number, h: number) => void;
  engine_update: (engine: number, dt: number, mx: number, my: number, down: number) => void;
  engine_add_burst: (engine: number, x: number, y: number, force: number) => void;
  engine_trigger_entrance: (engine: number, duration: number) => void;
  engine_is_entrancing: (engine: number) => number;
  engine_set_theme: (engine: number, dark: number) => void;
  engine_set_light_intensity: (engine: number, intensity: number) => void;
  engine_set_particle_size: (engine: number, mult: number) => void;
  engine_set_glow_brightness: (engine: number, mult: number) => void;
  engine_set_speed: (engine: number, mult: number) => void;
  engine_set_density: (engine: number, mult: number) => void;
  engine_get_vertex_buffer: (engine: number) => number;
  engine_get_vertex_count: (engine: number) => number;
  engine_destroy: (engine: number) => void;
}

const PIXEL_VS = /* glsl */ `
  attribute vec2 a_pos;
  attribute vec4 a_color;
  attribute float a_size;
  uniform float u_point_scale;
  uniform vec2 u_scale;
  uniform vec2 u_offset;
  uniform float u_scatter;
  varying vec4 v_color;

  void main() {
    vec2 pos = a_pos * u_scale * u_scatter + u_offset;
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = a_size * u_point_scale;
    v_color = a_color;
  }
`;

const PIXEL_FS = /* glsl */ `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    // Seamless solid square point sprites with zero mesh grid lines
    gl_FragColor = v_color;
  }
`;

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
      // Allocate max 65536 vertices * 7 floats * 4 bytes
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

      // If an image was queued before WASM was ready, ingest it immediately
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
      this.offscreenCtx.drawImage(img, 0, 0, this.simRes, this.simRes);

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
    const bx = normalizedX !== undefined ? ((normalizedX + 1.0) * 0.5) * this.simRes : this.mouseX >= 0 ? this.mouseX : this.simRes * 0.5;
    const by = normalizedY !== undefined ? ((1.0 - normalizedY) * 0.5) * this.simRes : this.mouseY >= 0 ? this.mouseY : this.simRes * 0.45;
    this.wasmExports.engine_add_burst(this.enginePtr, bx, by, 2.8);
  }

  public triggerEntrance(duration = 2.4): void {
    this.entranceDuration = duration;
    this.entranceStartTime = performance.now();
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_trigger_entrance(this.enginePtr, duration);
  }

  public setFullscreenMode(active: boolean, getCardRect?: () => DOMRect | null): void {
    this.isFullscreen = active;
    this.getCardRect = getCardRect;
    if (!active) {
      this.transformScaleX = this.transformScaleY = this.transformScatter = 1.0;
      this.transformOffsetX = this.transformOffsetY = 0.0;
    }
  }

  public isEntrancing(): boolean {
    return !!(this.wasmExports && this.enginePtr && this.wasmExports.engine_is_entrancing(this.enginePtr) === 1);
  }

  public isWebGLActive(): boolean {
    return this.useWebGL && this.gl !== null;
  }

  public getVertexSnapshot(): Float32Array | null {
    if (!this.wasmExports || !this.enginePtr) return null;
    const vboPtr = this.wasmExports.engine_get_vertex_buffer(this.enginePtr);
    const vCount = this.wasmExports.engine_get_vertex_count(this.enginePtr);
    if (!vboPtr || vCount <= 0) return null;
    return new Float32Array(new Float32Array(this.wasmExports.memory.buffer, vboPtr, vCount * 7));
  }

  public getParticleCount(): number {
    return this.wasmExports && this.enginePtr ? this.wasmExports.engine_get_vertex_count(this.enginePtr) : 0;
  }

  public resize(newW: number, newH?: number): void {
    const w = newW;
    const h = newH ?? newW;
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (this.gl) this.gl.viewport(0, 0, w, h);
    }
  }

  public setTheme(isDark: boolean): void {
    if (this.isDark === isDark) return;
    this.isDark = isDark;
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_set_theme(this.enginePtr, isDark ? 1 : 0);
  }

  public setLightIntensity(intensity: number): void {
    this.lightIntensity = intensity;
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_set_light_intensity(this.enginePtr, intensity);
  }

  public setParticleSize(mult: number): void {
    this.particleSize = mult;
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_set_particle_size(this.enginePtr, mult);
  }

  public setGlowBrightness(mult: number): void {
    this.glowBrightness = mult;
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_set_glow_brightness(this.enginePtr, mult);
  }

  public setFlightSpeed(mult: number): void {
    this.flightSpeed = mult;
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_set_speed(this.enginePtr, mult);
  }

  public setDensity(mult: number): void {
    this.particleDensity = mult;
    if (this.wasmExports && this.enginePtr) this.wasmExports.engine_set_density(this.enginePtr, mult);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000.0, 0.05);
    this.lastTime = now;

    if (this.isFullscreen) {
      const elapsed = (now - this.entranceStartTime) / 1000.0;
      const progress = Math.min(Math.max(elapsed / Math.max(this.entranceDuration, 0.001), 0.0), 1.0);
      const remaining = 1.0 - progress;
      const easeRemaining = remaining * remaining;

      const rect = this.getCardRect ? this.getCardRect() : null;
      if (rect && rect.width > 0 && rect.height > 0) {
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const cardW = rect.width;
        const cardH = rect.height;
        const cardCenterX = rect.left + cardW * 0.5;
        const cardCenterY = rect.top + cardH * 0.5;

        this.transformScaleX = cardW / cw;
        this.transformScaleY = cardH / ch;
        this.transformOffsetX = (cardCenterX / cw) * 2.0 - 1.0;
        this.transformOffsetY = 1.0 - (cardCenterY / ch) * 2.0;

        const maxScatter = Math.max(2.4, (Math.max(cw, ch) / cardW) * 1.4);
        this.transformScatter = 1.0 + (maxScatter - 1.0) * easeRemaining;
      }
    }

    if (this.targetMouseX >= 0) {
      if (this.mouseX < 0) {
        this.mouseX = this.targetMouseX;
        this.mouseY = this.targetMouseY;
      } else {
        // Silky, gentle, slow cursor tracking (no fast jumps)
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
      }
    } else {
      this.mouseX = -1;
      this.mouseY = -1;
    }

    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_update(
        this.enginePtr,
        dt,
        this.mouseX,
        this.mouseY,
        this.isMouseDown ? 1 : 0
      );

      if (this.useWebGL && this.gl) {
        this.renderWebGL();
      } else if (this.ctx2d) {
        this.render2DFallback();
      }
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private renderWebGL(): void {
    const gl = this.gl;
    if (!gl || !this.wasmExports || !this.enginePtr) return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.pixelProgram && this.pixelVbo) {
      const vboPtr = this.wasmExports.engine_get_vertex_buffer(this.enginePtr);
      const vCount = this.wasmExports.engine_get_vertex_count(this.enginePtr);

      if (vboPtr && vCount > 0) {
        const mem = this.wasmExports.memory;
        const floatView = new Float32Array(mem.buffer, vboPtr, vCount * 7);

        gl.useProgram(this.pixelProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pixelVbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, floatView);

        const stride = 7 * 4;
        const posLoc = gl.getAttribLocation(this.pixelProgram, 'a_pos');
        const colLoc = gl.getAttribLocation(this.pixelProgram, 'a_color');
        const sizeLoc = gl.getAttribLocation(this.pixelProgram, 'a_size');

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
        gl.drawArrays(gl.POINTS, 0, vCount);
      }
    }
  }

  private render2DFallback(): void {
    if (!this.wasmExports || !this.enginePtr || !this.ctx2d) return;
    const vboPtr = this.wasmExports.engine_get_vertex_buffer(this.enginePtr);
    const vCount = this.wasmExports.engine_get_vertex_count(this.enginePtr);
    if (!vboPtr || vCount === 0) return;

    const ctx = this.ctx2d;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const floatView = new Float32Array(this.wasmExports.memory.buffer, vboPtr, vCount * 7);
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    for (let i = 0; i < vCount; i++) {
      const base = i * 7;
      const effX = (floatView[base] ?? 0) * this.transformScaleX * this.transformScatter + this.transformOffsetX;
      const effY = (floatView[base + 1] ?? 0) * this.transformScaleY * this.transformScatter + this.transformOffsetY;
      const r = Math.round((floatView[base + 2] ?? 0) * 255);
      const g = Math.round((floatView[base + 3] ?? 0) * 255);
      const b = Math.round((floatView[base + 4] ?? 0) * 255);
      const a = floatView[base + 5] ?? 1.0;
      const sz = floatView[base + 6] ?? 8;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.fillRect(((effX + 1.0) * 0.5) * cw - sz * 0.5, ((1.0 - effY) * 0.5) * ch - sz * 0.5, sz, sz);
    }
  }

  public dispose(): void {
    this.pause();
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.engine_destroy(this.enginePtr);
      this.enginePtr = 0;
    }
    if (this.gl && this.pixelProgram) {
      this.gl.deleteProgram(this.pixelProgram);
      if (this.pixelVbo) this.gl.deleteBuffer(this.pixelVbo);
    }
  }
}
