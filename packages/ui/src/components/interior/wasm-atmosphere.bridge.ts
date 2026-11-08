import { getAtmosphereEngineWasmBinary } from '../../wasm/atmosphere_engine_wasm_bytes';

export interface WasmAtmosphereBridgeOptions {
  canvas: HTMLCanvasElement;
  isDark?: boolean;
  densityMultiplier?: number;
  speedMultiplier?: number;
  meteorFrequencyMultiplier?: number;
  onLoaded?: () => void;
}

interface WasmExports {
  memory: WebAssembly.Memory;
  atmosphere_create: () => number;
  atmosphere_init: (engine: number, w: number, h: number, dark: number, mob: number, den: number, spd: number, freq: number) => void;
  atmosphere_resize: (engine: number, w: number, h: number, dpr: number) => void;
  atmosphere_set_theme: (engine: number, dark: number) => void;
  atmosphere_set_density: (engine: number, density: number) => void;
  atmosphere_set_speed: (engine: number, speed: number) => void;
  atmosphere_set_meteor_frequency: (engine: number, freq: number) => void;
  atmosphere_set_reduced_motion: (engine: number, reduced: number) => void;
  atmosphere_set_parallax: (engine: number, nx: number, ny: number) => void;
  atmosphere_trigger_meteor: (engine: number, x: number, y: number, len: number, spd: number, ang: number, isBig: number) => void;
  atmosphere_update: (engine: number, dt: number) => void;
  atmosphere_get_vertex_buffer: (engine: number) => number;
  atmosphere_get_vertex_count: (engine: number) => number;
  atmosphere_destroy: (engine: number) => void;
}

const ATMOSPHERE_VS = /* glsl */ `
  attribute vec2 a_pos;
  attribute vec4 a_color;
  attribute float a_size;
  attribute float a_type;

  varying vec4 v_color;
  varying float v_type;

  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
    gl_PointSize = a_size;
    v_color = a_color;
    v_type = a_type;
  }
`;

const ATMOSPHERE_FS = /* glsl */ `
  precision mediump float;

  varying vec4 v_color;
  varying float v_type;

  void main() {
    if (v_type < 0.5) {
      // 0.0: Pure crisp square pixel star (zero blur, identical to portrait engine)
      gl_FragColor = v_color;
      return;
    }

    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    if (v_type < 1.5) {
      // 1.0: Soft daylight cloud mist puff
      float d = dist * 2.0;
      float puff = clamp(1.0 - d * d, 0.0, 1.0);
      gl_FragColor = vec4(v_color.rgb, v_color.a * (puff * puff * puff * 0.65));
    } else if (v_type < 2.5) {
      // 2.0: Sleek small & medium meteor / asteroid streak
      float alpha = clamp(1.0 - dist * 1.6, 0.0, 1.0);
      gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
    } else {
      // 3.0: Daylight shimmering golden dust mote
      float alpha = clamp(1.0 - dist * 2.0, 0.0, 1.0);
      gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
    }
  }
`;

export class WasmAtmosphereBridge {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private useWebGL = true;

  private wasmExports: WasmExports | null = null;
  private enginePtr: number = 0;

  private isDark: boolean;
  private densityMult: number;
  private speedMult: number;
  private meteorFreqMult: number;
  private onLoaded?: () => void;

  private animFrameId: number | null = null;
  private isRunning = false;
  private lastTime = 0;

  private program: WebGLProgram | null = null;
  private vbo: WebGLBuffer | null = null;

  private width = 0;
  private height = 0;
  private dpr = 1;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private touchStartX = 0;
  private touchStartY = 0;

  constructor(options: WasmAtmosphereBridgeOptions) {
    this.canvas = options.canvas;
    this.isDark = options.isDark ?? true;
    this.densityMult = options.densityMultiplier ?? 1.0;
    this.speedMult = options.speedMultiplier ?? 1.0;
    this.meteorFreqMult = options.meteorFrequencyMultiplier ?? 1.0;
    this.onLoaded = options.onLoaded;

    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);

    this.initContext();
    this.initWasm();
    this.attachEventListeners();
  }

  private initContext() {
    try {
      const glOpts: WebGLContextAttributes = {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      };
      this.gl =
        (this.canvas.getContext('webgl2', glOpts) as WebGL2RenderingContext | null) ||
        (this.canvas.getContext('webgl', glOpts) as WebGLRenderingContext | null);

      if (this.gl) {
        this.useWebGL = true;
        this.initWebGLShaders();
      } else {
        this.useWebGL = false;
        this.ctx2d = this.canvas.getContext('2d');
      }
    } catch {
      this.useWebGL = false;
      this.ctx2d = this.canvas.getContext('2d');
    }
  }

  private initWebGLShaders() {
    const gl = this.gl;
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, ATMOSPHERE_VS);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, ATMOSPHERE_FS);
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      this.useWebGL = false;
      this.ctx2d = this.canvas.getContext('2d');
      return;
    }

    this.program = prog;
    this.vbo = gl.createBuffer();
  }

  private async initWasm() {
    try {
      const wasmBytes = getAtmosphereEngineWasmBinary();
      const res = (await WebAssembly.instantiate(wasmBytes, {
        env: {
          abort: () => {},
        },
      })) as WebAssembly.WebAssemblyInstantiatedSource | WebAssembly.Instance;

      const instance: WebAssembly.Instance = 'instance' in res ? res.instance : res;
      this.wasmExports = instance.exports as unknown as WasmExports;
      this.enginePtr = this.wasmExports.atmosphere_create();

      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width || window.innerWidth || 1280;
      this.height = rect.height || window.innerHeight || 800;
      const isMobile = window.innerWidth < 768 ? 1 : 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);

      this.wasmExports.atmosphere_init(
        this.enginePtr,
        this.width,
        this.height,
        this.isDark ? 1 : 0,
        isMobile,
        this.densityMult,
        this.speedMult,
        this.meteorFreqMult
      );

      this.wasmExports.atmosphere_resize(this.enginePtr, this.width, this.height, this.dpr);

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.wasmExports.atmosphere_set_reduced_motion(this.enginePtr, prefersReduced ? 1 : 0);

      this.onLoaded?.();
      this.start();
    } catch {
      // WASM instantiation fallback
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.wasmExports || !this.enginePtr) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const nx = (e.clientX - rect.left) / w - 0.5;
    const ny = (e.clientY - rect.top) / h - 0.5;
    this.wasmExports.atmosphere_set_parallax(this.enginePtr, nx, ny);
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.wasmExports || !this.enginePtr || e.touches.length === 0) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const nx = (touch.clientX - rect.left) / w - 0.5;
    const ny = (touch.clientY - rect.top) / h - 0.5;
    this.wasmExports.atmosphere_set_parallax(this.enginePtr, nx, ny);

    // Touch swipe gesture triggers a shooting star!
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    if (Math.hypot(dx, dy) > 85) {
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      const normX = Math.max(0.1, Math.min(0.9, (touch.clientX - rect.left) / w));
      const normY = Math.max(0.05, Math.min(0.35, (touch.clientY - rect.top) / h));
      this.triggerShootingStar(normX, normY);
    }
  }

  private attachEventListeners() {
    window.addEventListener('mousemove', this.boundMouseMove, { passive: true });
    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches[0]) {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: true });
  }

  private detachEventListeners() {
    window.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
  }

  public resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w <= 0 || h <= 0) return;

    this.width = w;
    this.height = h;
    const isMobile = window.innerWidth < 768 ? 1 : 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);

    const canvasW = Math.floor(w * this.dpr);
    const canvasH = Math.floor(h * this.dpr);

    if (this.canvas.width !== canvasW || this.canvas.height !== canvasH) {
      this.canvas.width = canvasW;
      this.canvas.height = canvasH;
    }

    if (this.gl) {
      this.gl.viewport(0, 0, canvasW, canvasH);
    }

    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_resize(this.enginePtr, w, h, this.dpr);
    }
  }

  public setTheme(isDark: boolean) {
    this.isDark = isDark;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_set_theme(this.enginePtr, isDark ? 1 : 0);
    }
  }

  public setDensityMultiplier(mult: number) {
    this.densityMult = mult;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_set_density(this.enginePtr, mult);
    }
  }

  public setSpeedMultiplier(mult: number) {
    this.speedMult = mult;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_set_speed(this.enginePtr, mult);
    }
  }

  public setMeteorFrequency(freq: number) {
    this.meteorFreqMult = freq;
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_set_meteor_frequency(this.enginePtr, freq);
    }
  }

  public triggerShootingStar(x = -1, y = -1, isBig = false) {
    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_trigger_meteor(
        this.enginePtr,
        x,
        y,
        isBig ? 105 : 65,
        isBig ? 9.0 : 6.8,
        0.45, // ~26 degrees
        isBig ? 1 : 0
      );
    }
  }

  public triggerMeteor = this.triggerShootingStar.bind(this);

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.renderLoop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private renderLoop = (time: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.render(dt);
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };

  private render(dt: number) {
    if (!this.wasmExports || !this.enginePtr) return;

    this.wasmExports.atmosphere_update(this.enginePtr, dt);
    const vertexCount = this.wasmExports.atmosphere_get_vertex_count(this.enginePtr);
    if (vertexCount <= 0) return;

    const vertexBufferPtr = this.wasmExports.atmosphere_get_vertex_buffer(this.enginePtr);
    // 8 floats per vertex: x, y, r, g, b, a, size, type
    const vertexData = new Float32Array(
      this.wasmExports.memory.buffer,
      vertexBufferPtr,
      vertexCount * 8
    );

    if (this.useWebGL && this.gl && this.program && this.vbo) {
      this.renderWebGL(vertexData, vertexCount);
    } else if (this.ctx2d) {
      this.render2DFallback(vertexData, vertexCount);
    }
  }

  private renderWebGL(vertexData: Float32Array, vertexCount: number) {
    const gl = this.gl!;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

    const stride = 8 * 4; // 8 floats * 4 bytes = 32 bytes
    const aPos = gl.getAttribLocation(this.program!, 'a_pos');
    const aColor = gl.getAttribLocation(this.program!, 'a_color');
    const aSize = gl.getAttribLocation(this.program!, 'a_size');
    const aType = gl.getAttribLocation(this.program!, 'a_type');

    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, stride, 2 * 4);

    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, stride, 6 * 4);

    gl.enableVertexAttribArray(aType);
    gl.vertexAttribPointer(aType, 1, gl.FLOAT, false, stride, 7 * 4);

    gl.drawArrays(gl.POINTS, 0, vertexCount);
  }

  private render2DFallback(vertexData: Float32Array, vertexCount: number) {
    const ctx = this.ctx2d!;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = 0; i < vertexCount; i++) {
      const offset = i * 8;
      const ndcX = vertexData[offset]!;
      const ndcY = vertexData[offset + 1]!;
      const r = Math.round(vertexData[offset + 2]! * 255);
      const g = Math.round(vertexData[offset + 3]! * 255);
      const b = Math.round(vertexData[offset + 4]! * 255);
      const a = vertexData[offset + 5]!;
      const size = vertexData[offset + 6]!;

      // Convert NDC to canvas pixels
      const px = ((ndcX + 1.0) / 2.0) * w;
      const py = ((1.0 - ndcY) / 2.0) * h;
      const rad = Math.max(1, size / 2);

      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.fill();
    }
  }

  public destroy() {
    this.stop();
    this.detachEventListeners();

    if (this.wasmExports && this.enginePtr) {
      this.wasmExports.atmosphere_destroy(this.enginePtr);
      this.enginePtr = 0;
    }

    if (this.gl) {
      if (this.vbo) this.gl.deleteBuffer(this.vbo);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }
}
