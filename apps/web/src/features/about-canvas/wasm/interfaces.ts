import type { PointerState } from "../types/particle";

export interface WasmParticleData {
  pointer: number;
  count: number;
}

export interface IEngineModule {
  init(
    imageData: ImageData, 
    chunkSize: number,
    alphaThreshold: number,
    offsetX: number,
    offsetY: number
  ): void;
  update(pointer: PointerState, dt: number): void;
  setPhysicsConfig(interactionRadius: number, repelForce: number, returnSpeed: number): void;
  getParticles(): WasmParticleData;
  getModule(): any;
  destroy(): void;
}
