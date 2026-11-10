#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Compiling pixel_engine.cpp to WebAssembly..."
/opt/homebrew/bin/emcc pixel_engine.cpp \
  -O3 \
  -sSTANDALONE_WASM=1 \
  --no-entry \
  -sTOTAL_MEMORY=67108864 \
  -Wl,--export=engine_create \
  -Wl,--export=engine_init \
  -Wl,--export=engine_get_input_buffer \
  -Wl,--export=engine_process_image \
  -Wl,--export=engine_update \
  -Wl,--export=engine_add_burst \
  -Wl,--export=engine_trigger_entrance \
  -Wl,--export=engine_is_entrancing \
  -Wl,--export=engine_set_theme \
  -Wl,--export=engine_set_light_intensity \
  -Wl,--export=engine_set_particle_size \
  -Wl,--export=engine_set_glow_brightness \
  -Wl,--export=engine_set_speed \
  -Wl,--export=engine_set_density \
  -Wl,--export=engine_set_path_spread \
  -Wl,--export=engine_set_show_path_guide \
  -Wl,--export=engine_set_edge_algorithm \
  -Wl,--export=engine_set_edge_threshold \
  -Wl,--export=engine_set_pin_bottom_edge \
  -Wl,--export=engine_set_top_particle_size \
  -Wl,--export=engine_set_top_particle_quantity \
  -Wl,--export=engine_set_top_particle_speed \
  -Wl,--export=engine_set_backside_stars \
  -Wl,--export=engine_set_backside_halo \
  -Wl,--export=engine_set_backside_orbits \
  -Wl,--export=engine_set_backside_specks \
  -Wl,--export=engine_set_click_force \
  -Wl,--export=engine_set_bounce_speed \
  -Wl,--export=engine_set_glow_distance \
  -Wl,--export=engine_set_click_radius \
  -Wl,--export=engine_set_hover_speed \
  -Wl,--export=engine_set_hover_radius \
  -Wl,--export=engine_set_click_speed \
  -Wl,--export=engine_set_intro_spread \
  -Wl,--export=engine_set_intro_pattern \
  -Wl,--export=engine_get_vertex_buffer \
  -Wl,--export=engine_get_vertex_count \
  -Wl,--export=engine_destroy \
  -o pixel_engine.wasm

echo "Generating TypeScript base64 binary wrapper for PixelEngine..."
python3 -c "
import base64

with open('pixel_engine.wasm', 'rb') as f:
    data = f.read()

b64 = base64.b64encode(data).decode('ascii')

content = f'''// Auto-generated embedded WebAssembly binary bytes for PixelEngine
// Enables zero-network, zero-fetch instantaneous WebAssembly instantiation

export const PIXEL_ENGINE_WASM_BASE64 = '{b64}';

export function getPixelEngineWasmBinary(): Uint8Array {{
  if (typeof atob === 'undefined') {{
    return Buffer.from(PIXEL_ENGINE_WASM_BASE64, 'base64');
  }}
  const binaryString = atob(PIXEL_ENGINE_WASM_BASE64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {{
    bytes[i] = binaryString.charCodeAt(i);
  }}
  return bytes;
}}
'''

with open('pixel_engine_wasm_bytes.ts', 'w') as f:
    f.write(content)
"

echo "Compiling atmosphere_engine.cpp to WebAssembly..."
/opt/homebrew/bin/emcc atmosphere_engine.cpp \
  -O3 \
  -sSTANDALONE_WASM=1 \
  --no-entry \
  -sTOTAL_MEMORY=16777216 \
  -Wl,--export=atmosphere_create \
  -Wl,--export=atmosphere_init \
  -Wl,--export=atmosphere_resize \
  -Wl,--export=atmosphere_set_theme \
  -Wl,--export=atmosphere_set_density \
  -Wl,--export=atmosphere_set_speed \
  -Wl,--export=atmosphere_set_meteor_frequency \
  -Wl,--export=atmosphere_set_reduced_motion \
  -Wl,--export=atmosphere_set_parallax \
  -Wl,--export=atmosphere_trigger_meteor \
  -Wl,--export=atmosphere_update \
  -Wl,--export=atmosphere_get_vertex_buffer \
  -Wl,--export=atmosphere_get_vertex_count \
  -Wl,--export=atmosphere_destroy \
  -o atmosphere_engine.wasm

echo "Generating TypeScript base64 binary wrapper for AtmosphereEngine..."
python3 -c "
import base64

with open('atmosphere_engine.wasm', 'rb') as f:
    data = f.read()

b64 = base64.b64encode(data).decode('ascii')

content = f'''// Auto-generated embedded WebAssembly binary bytes for AtmosphereEngine
// Enables zero-network, zero-fetch instantaneous WebAssembly instantiation

export const ATMOSPHERE_ENGINE_WASM_BASE64 = '{b64}';

export function getAtmosphereEngineWasmBinary(): Uint8Array {{
  if (typeof atob === 'undefined') {{
    return Buffer.from(ATMOSPHERE_ENGINE_WASM_BASE64, 'base64');
  }}
  const binaryString = atob(ATMOSPHERE_ENGINE_WASM_BASE64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {{
    bytes[i] = binaryString.charCodeAt(i);
  }}
  return bytes;
}}
'''

with open('atmosphere_engine_wasm_bytes.ts', 'w') as f:
    f.write(content)
"

echo "Done! Both PixelEngine and AtmosphereEngine WASM compiled successfully."
