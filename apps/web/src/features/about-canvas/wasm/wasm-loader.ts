import type { PointerState } from "../types/particle";
import type { IEngineModule, WasmParticleData } from "./interfaces";

export class WasmAdapter implements IEngineModule {
  private module: any;
  private enginePtr: number;

  constructor(module: any) {
    this.module = module;
    this.enginePtr = this.module._create_engine();
  }

  init(
    imageData: ImageData,
    chunkSize: number,
    alphaThreshold: number,
    offsetX: number,
    offsetY: number,
  ): void {
    // 1. Allocate memory in WASM for the RGBA bytes
    const byteSize = imageData.data.length;
    const imgPtr = this.module._allocate_image_buffer(byteSize);

    // 2. Copy image data from JS to WASM
    this.module.HEAPU8.set(imageData.data, imgPtr);

    // 3. Let C++ process the image, count particles, and instantiate physics structs
    this.module._init_engine_from_image(
      this.enginePtr,
      imgPtr,
      imageData.width,
      imageData.height,
      chunkSize,
      alphaThreshold,
      offsetX,
      offsetY,
    );

    // 4. Free the image buffer, it's no longer needed now that particles are extracted
    this.module._free_image_buffer(imgPtr);
  }

  setPhysicsConfig(interactionRadius: number, repelForce: number, returnSpeed: number): void {
    this.module._set_engine_config(this.enginePtr, interactionRadius, repelForce, returnSpeed);
  }

  update(pointer: PointerState, dt: number): void {

    this.module._update_engine(
      this.enginePtr,
      pointer.x,
      pointer.y,
      pointer.isActive,
      dt,
    );
  }

  getParticles(): WasmParticleData {
    return {
      pointer: this.module._get_particles_ptr(this.enginePtr),
      count: this.module._get_particle_count(this.enginePtr),
    };
  }

  getModule(): any {
    return this.module;
  }

  destroy(): void {
    if (this.module && this.enginePtr) {
      this.module._destroy_engine(this.enginePtr);
      this.enginePtr = 0;
    }
  }
}

export async function loadWasmEngine(): Promise<IEngineModule> {
  try {
    const modulePath = "/wasm/particle_engine.js";
    // We use new Function to completely hide the dynamic import from Next.js/Turbopack
    // Otherwise Turbopack ignores webpackIgnore and tries to bundle it from _next/static/chunks
    const dynamicImport = new Function("path", "return import(path)");
    const wasmModule = await dynamicImport(modulePath);

    if (wasmModule && wasmModule.default) {
      const emscriptenModule = await wasmModule.default();
      console.log("Successfully initialized full WASM Engine Pipeline!");
      return new WasmAdapter(emscriptenModule);
    }

    throw new Error("WASM module did not export default initializer");
  } catch (error) {
    console.error("CRITICAL: Failed to load WASM engine.", error);
    throw error;
  }
}
