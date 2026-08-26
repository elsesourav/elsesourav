import type { IEngineModule } from "../wasm/interfaces";
import { DEFAULT_CANVAS_CONFIG } from "../config/defaults";

const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec4 a_color;

uniform vec2 u_resolution;
uniform float u_pointSize;

out vec4 v_color;
out vec2 v_position;

void main() {
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;
  
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  
  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;
  
  // flip Y so top-left is 0,0
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = u_pointSize;
  
  v_color = a_color;
  v_position = a_position;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec4 v_color;
in vec2 v_position;
out vec4 outColor;

uniform vec2 u_glowCenter;
uniform float u_glowTime;
uniform float u_glowDuration;
uniform float u_glowStrength;
uniform vec3 u_glowColor;
uniform float u_waveSpeed;
uniform float u_glowProbability;

#define TRAIL_MAX 20
uniform vec3 u_pointerTrail[TRAIL_MAX];
uniform int u_trailCount;

float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec3 totalGlow = vec3(0.0);
  
  // 1. Hover Entrance Wave
  if (u_glowTime > 0.0 && u_glowTime < u_glowDuration) {
    float d = distance(v_position, u_glowCenter);
    float r = u_waveSpeed * u_glowTime;
    
    float waveThickness = 120.0;
    // Exponential falloff for premium soft glow
    float distFromWave = abs(d - r);
    float intensity = exp(-distFromWave * distFromWave / (waveThickness * waveThickness * 0.2));
    
    // Add a sharp leading edge pulse
    float leadingEdge = exp(-abs(d - r - 20.0) * abs(d - r - 20.0) / 100.0);
    intensity += leadingEdge * 0.5;

    // Smooth fade out over the total duration
    float fade = pow(max(0.0, 1.0 - (u_glowTime / u_glowDuration)), 1.5);
    
    totalGlow += u_glowColor * intensity * u_glowStrength * fade;
  }
  
  // 2. Mouse Drag Trail
  if (u_trailCount > 0) {
    float trailIntensity = 0.0;
    for (int i = 0; i < TRAIL_MAX; i++) {
      if (i >= u_trailCount) break;
      vec3 pt = u_pointerTrail[i];
      float age = pt.z;
      
      // Trail lasts for 1500ms
      if (age >= 0.0 && age < 1500.0) {
        float d = distance(v_position, pt.xy);
        // Crystal glow radius falloff
        float distFalloff = exp(-d * d / 3000.0);
        float timeFalloff = pow(max(0.0, 1.0 - (age / 1500.0)), 2.0);
        trailIntensity += distFalloff * timeFalloff;
      }
    }
    totalGlow += u_glowColor * min(trailIntensity, 2.0) * u_glowStrength * 1.5;
  }
  
  if (length(totalGlow) > 0.0) {
    if (u_glowProbability >= 1.0 || rand(v_position) <= u_glowProbability) {
      outColor = vec4(v_color.rgb + totalGlow, v_color.a);
    } else {
      outColor = v_color;
    }
  } else {
    outColor = v_color;
  }
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Failed to compile shader");
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Failed to link program");
  }
  return program;
}

export class WebGLParticleRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private positionLoc: number;
  private colorLoc: number;
  private resolutionLoc: WebGLUniformLocation | null;
  private pointSizeLoc: WebGLUniformLocation | null;
  private glowCenterLoc: WebGLUniformLocation | null;
  private glowTimeLoc: WebGLUniformLocation | null;
  private glowDurationLoc: WebGLUniformLocation | null;
  private glowStrengthLoc: WebGLUniformLocation | null;
  private glowColorLoc: WebGLUniformLocation | null;
  private waveSpeedLoc: WebGLUniformLocation | null;
  private glowProbabilityLoc: WebGLUniformLocation | null;
  private pointerTrailLoc: WebGLUniformLocation | null;
  private trailCountLoc: WebGLUniformLocation | null;
  
  private vao: WebGLVertexArrayObject | null;
  private buffer: WebGLBuffer | null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = createProgram(gl, vertexShader, fragmentShader);

    this.positionLoc = gl.getAttribLocation(this.program, "a_position");
    this.colorLoc = gl.getAttribLocation(this.program, "a_color");
    this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
    this.pointSizeLoc = gl.getUniformLocation(this.program, "u_pointSize");
    
    this.glowCenterLoc = gl.getUniformLocation(this.program, "u_glowCenter");
    this.glowTimeLoc = gl.getUniformLocation(this.program, "u_glowTime");
    this.glowDurationLoc = gl.getUniformLocation(this.program, "u_glowDuration");
    this.glowStrengthLoc = gl.getUniformLocation(this.program, "u_glowStrength");
    this.glowColorLoc = gl.getUniformLocation(this.program, "u_glowColor");
    this.waveSpeedLoc = gl.getUniformLocation(this.program, "u_waveSpeed");
    this.glowProbabilityLoc = gl.getUniformLocation(this.program, "u_glowProbability");
    this.pointerTrailLoc = gl.getUniformLocation(this.program, "u_pointerTrail");
    this.trailCountLoc = gl.getUniformLocation(this.program, "u_trailCount");

    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // ParticleData is 28 bytes per struct
    // float x, y, originX, originY, vx, vy; -> 24 bytes
    // uint8_t r, g, b, a; -> 4 bytes
    const STRIDE = 28;

    gl.enableVertexAttribArray(this.positionLoc);
    gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, STRIDE, 0);

    gl.enableVertexAttribArray(this.colorLoc);
    // Note: true for normalized converts 0-255 uint8 into 0.0-1.0 float in shader
    gl.vertexAttribPointer(this.colorLoc, 4, gl.UNSIGNED_BYTE, true, STRIDE, 24);

    gl.bindVertexArray(null);
  }

  render(
    engine: IEngineModule, 
    chunkSize: number = DEFAULT_CANVAS_CONFIG.chunkSize,
    glowConfig?: {
      center: { x: number; y: number };
      time: number;
      duration: number;
      strength: number;
      color: [number, number, number];
      waveSpeed: number;
      glowProbability: number;
      trail: Float32Array; // [x, y, age, x, y, age, ...]
      trailCount: number;
    }
  ) {
    const gl = this.gl;
    const { pointer, count } = engine.getParticles();
    const module = engine.getModule();

    // Resize viewport to match canvas display size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // Multiply chunk size by devicePixelRatio because gl.PointSize is in physical pixels
    // and we already scaled canvas.width/height by dpr.
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // Set uniforms
    // If the WASM engine was initialized with physical pixel ImageData,
    // then the particles' coordinates are already in physical pixels.
    // So resolution is exactly gl.canvas.width/height.
    gl.uniform2f(this.resolutionLoc, gl.canvas.width, gl.canvas.height);
    // And point size is just the chunkSize * dpr (wait, if chunkSize is logical, we scale by dpr)
    // Actually, if we scale the ImageData by DPR during extraction, chunkSize applies to physical pixels.
    // BUT we don't scale chunkSize in engine.init. So if chunkSize=2, it skips 2 physical pixels.
    // Thus pointSize is exactly chunkSize.
    gl.uniform1f(this.pointSizeLoc, chunkSize);

    // Set glow uniforms if provided
    if (glowConfig) {
      gl.uniform2f(this.glowCenterLoc, glowConfig.center.x, glowConfig.center.y);
      gl.uniform1f(this.glowTimeLoc, glowConfig.time);
      gl.uniform1f(this.glowDurationLoc, glowConfig.duration);
      gl.uniform1f(this.glowStrengthLoc, glowConfig.strength);
      gl.uniform3f(this.glowColorLoc, glowConfig.color[0], glowConfig.color[1], glowConfig.color[2]);
      gl.uniform1f(this.waveSpeedLoc, glowConfig.waveSpeed);
      gl.uniform1f(this.glowProbabilityLoc, glowConfig.glowProbability);
      gl.uniform3fv(this.pointerTrailLoc, glowConfig.trail);
      gl.uniform1i(this.trailCountLoc, glowConfig.trailCount);
    } else {
      gl.uniform1f(this.glowTimeLoc, 0.0);
      gl.uniform1i(this.trailCountLoc, 0);
    }

    // Pipe WASM memory directly to GPU!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
    // Create a zero-copy TypedArray view directly into the WASM heap at the struct array pointer
    const byteLength = count * 28;
    const wasmMemoryView = new Uint8Array(module.HEAPU8.buffer, pointer, byteLength);
    
    // Upload this frame's physics data to GPU
    gl.bufferData(gl.ARRAY_BUFFER, wasmMemoryView, gl.DYNAMIC_DRAW);

    // Blast it onto the screen
    gl.drawArrays(gl.POINTS, 0, count);

    gl.bindVertexArray(null);
  }

  destroy() {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.program);
  }
}
