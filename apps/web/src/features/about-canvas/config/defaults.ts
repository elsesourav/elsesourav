export const DEFAULT_CANVAS_CONFIG = {
  // Size of the pixel chunk in pixels (e.g., 4 means 4x4 image pixels = 1 particle)
  chunkSize: 2,

  // Alpha threshold (0-255). Chunks with alpha lower than this are ignored.
  alphaThreshold: 50,

  // Radius within which the mouse repels particles
  interactionRadius: 150,

  // How strongly the particles are repelled
  repelForce: 0.8,

  // How fast the particles return to their origin position (0 to 1)
  returnSpeed: 0.1,

  // Frame rate targeting, used for delta time calculations if needed
  targetFPS: 60,

  // --- Glow Effect Configuration ---
  glowDuration: 4000,
  glowStrength: 0.8,
  glowColor: [0.6, 0.8, 1.0] as [number, number, number],
  waveSpeed: 1.5,
  glowProbability: 0.5, // particles glow
};

export type CanvasConfig = typeof DEFAULT_CANVAS_CONFIG;
