import { PIXEL_VS, PIXEL_FS } from './wasm-portrait.shaders';
import type { WasmExports } from './wasm-portrait.types';

export interface WebGLTransformState {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  scatter: number;
  isFullscreen: boolean;
}

export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
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

export function createPixelProgram(
  gl: WebGLRenderingContext
): { program: WebGLProgram | null; vbo: WebGLBuffer | null } {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vs = createShader(gl, gl.VERTEX_SHADER, PIXEL_VS);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, PIXEL_FS);
  if (!vs || !fs) return { program: null, vbo: null };

  const prog = gl.createProgram();
  if (!prog) return { program: null, vbo: null };

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return { program: null, vbo: null };
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, 65536 * 7 * 4, gl.DYNAMIC_DRAW);

  return { program: prog, vbo };
}

export function computeFullscreenTransform(
  getCardRect: (() => DOMRect | null) | undefined,
  startTime: number,
  duration: number
): { scaleX: number; scaleY: number; offsetX: number; offsetY: number } {
  if (!getCardRect || typeof window === 'undefined') {
    return { scaleX: 1.0, scaleY: 1.0, offsetX: 0.0, offsetY: 0.0 };
  }

  const rect = getCardRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return { scaleX: 1.0, scaleY: 1.0, offsetX: 0.0, offsetY: 0.0 };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const targetScaleX = rect.width / vw;
  const targetScaleY = rect.height / vh;
  const cardCenterX = rect.left + rect.width * 0.5;
  const cardCenterY = rect.top + rect.height * 0.5;
  const targetOffsetX = (cardCenterX / vw) * 2.0 - 1.0;
  const targetOffsetY = 1.0 - (cardCenterY / vh) * 2.0;

  const elapsed = (performance.now() - startTime) / 1000;
  const p = Math.min(Math.max(elapsed / duration, 0), 1.0);
  const rem = 1.0 - p;
  const ease = 1.0 - rem * rem * rem * rem;

  const startScaleX = Math.min(1.0, 520 / vw);
  const startScaleY = Math.min(1.0, 520 / vh);

  return {
    scaleX: startScaleX + (targetScaleX - startScaleX) * ease,
    scaleY: startScaleY + (targetScaleY - startScaleY) * ease,
    offsetX: 0.0 + (targetOffsetX - 0.0) * ease,
    offsetY: 0.0 + (targetOffsetY - 0.0) * ease,
  };
}

export function drawPixelVertices(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram,
  vbo: WebGLBuffer,
  wasmExports: WasmExports,
  enginePtr: number,
  transform: WebGLTransformState,
  canvasWidth: number,
  cardRect: DOMRect | null
): void {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const count = wasmExports.engine_get_vertex_count(enginePtr);
  if (count <= 0) return;

  const vPtr = wasmExports.engine_get_vertex_buffer(enginePtr);
  if (!vPtr) return;

  const mem = wasmExports.memory;
  const vertexFloats = new Float32Array(mem.buffer, vPtr, count * 7);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexFloats);

  const stride = 7 * 4;
  const posLoc = gl.getAttribLocation(program, 'a_pos');
  const colLoc = gl.getAttribLocation(program, 'a_color');
  const sizeLoc = gl.getAttribLocation(program, 'a_size');

  if (posLoc >= 0 && colLoc >= 0 && sizeLoc >= 0) {
    gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), transform.scaleX, transform.scaleY);
    gl.uniform2f(gl.getUniformLocation(program, 'u_offset'), transform.offsetX, transform.offsetY);
    gl.uniform1f(gl.getUniformLocation(program, 'u_scatter'), transform.scatter);

    const effectiveWidth = cardRect && cardRect.width > 0 ? cardRect.width : canvasWidth;
    gl.uniform1f(
      gl.getUniformLocation(program, 'u_point_scale'),
      effectiveWidth > 0 ? effectiveWidth / 580.0 : 1.0
    );

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
