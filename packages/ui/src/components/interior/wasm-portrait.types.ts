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
  showPathGuide?: boolean;
  onLoaded?: () => void;
}

export interface WasmExports {
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
  engine_set_show_path_guide: (engine: number, show: number) => void;
  engine_get_vertex_buffer: (engine: number) => number;
  engine_get_vertex_count: (engine: number) => number;
  engine_destroy: (engine: number) => void;
}
