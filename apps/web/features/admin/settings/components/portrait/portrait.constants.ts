import type { DropdownItem } from '@elsesourav/ui/interior';

export const EDGE_ALGORITHM_ITEMS: readonly DropdownItem[] = [
  { value: 'perimeter', label: 'Perimeter Alpha Scan', hint: 'Scan' },
  { value: 'sobel', label: 'Sobel Edge Gradient', hint: 'Sobel' },
];

export const EDGE_THRESHOLD_ITEMS: readonly DropdownItem[] = [
  { value: '10', label: '10 — Ultra Sensitive', hint: 'Fine' },
  { value: '18', label: '18 — High Sensitivity', hint: 'Soft' },
  { value: '28', label: '28 — Balanced Default', hint: 'Crisp' },
  { value: '45', label: '45 — Strict Edge', hint: 'Strict' },
  { value: '65', label: '65 — High Contrast', hint: 'Dense' },
];

export const PIN_BOTTOM_ITEMS: readonly DropdownItem[] = [
  { value: 'true', label: 'Flush to Bottom Canvas', hint: 'Anchored' },
  { value: 'false', label: 'Natural Bounding Box', hint: 'Floating' },
];

export const TOP_PARTICLE_SIZE_ITEMS: readonly DropdownItem[] = [
  { value: '0.6x', label: 'Micro Sparks (0.6x)', hint: '0.6x' },
  { value: '0.85x', label: 'Compact Default (0.85x)', hint: '0.85x' },
  { value: '1.0x', label: 'Standard Pixel (1.0x)', hint: '1.0x' },
  { value: '1.3x', label: 'Bold Glowing (1.3x)', hint: '1.3x' },
  { value: '1.6x', label: 'Retro Chunky (1.6x)', hint: '1.6x' },
];

export const TOP_PARTICLE_QUANTITY_ITEMS: readonly DropdownItem[] = [
  { value: '0.5x', label: 'Minimal (0.5x)', hint: '0.5x' },
  { value: '1.0x', label: 'Standard Density (1.0x)', hint: '1.0x' },
  { value: '1.5x', label: 'Rich Ribbon (1.5x)', hint: '1.5x' },
  { value: '2.0x', label: 'Double Stream (2.0x)', hint: '2.0x' },
  { value: '3.0x', label: 'Supernova Cascade (3.0x)', hint: '3.0x' },
];

export const TOP_PARTICLE_SPEED_ITEMS: readonly DropdownItem[] = [
  { value: '0.5x', label: 'Zen Drift (0.5x)', hint: '0.5x' },
  { value: '1.0x', label: 'Standard Velocity (1.0x)', hint: '1.0x' },
  { value: '1.5x', label: 'Brisk Dynamic (1.5x)', hint: '1.5x' },
  { value: '2.0x', label: 'High Speed Warp (2.0x)', hint: '2.0x' },
  { value: '3.0x', label: 'Hyperdrive (3.0x)', hint: '3.0x' },
];

export const PATH_SPREAD_ITEMS: readonly DropdownItem[] = [
  { value: '1.0px', label: 'Locked Contour (1.0px)', hint: '1.0px' },
  { value: '1.8px', label: 'Subtle Deviation (1.8px)', hint: '1.8px' },
  { value: '2.6px', label: 'Balanced Ribbon (2.6px)', hint: '2.6px' },
  { value: '3.8px', label: 'Wide Aura (3.8px)', hint: '3.8px' },
  { value: '5.2px', label: 'Expansive Cloud (5.2px)', hint: '5.2px' },
];

export const TOP_PARTICLE_GLOW_DISTANCE_ITEMS: readonly DropdownItem[] = [
  { value: '4px', label: 'Tight Rim (4px)', hint: '4px' },
  { value: '8px', label: 'Focused Halo (8px - Default)', hint: '8px' },
  { value: '14px', label: 'Extended Radiance (14px)', hint: '14px' },
  { value: '22px', label: 'Broad Luminous Wash (22px)', hint: '22px' },
  { value: '32px', label: 'Expansive Aura (32px)', hint: '32px' },
];

export const LIGHT_INTENSITY_ITEMS: readonly DropdownItem[] = [
  { value: '0.0', label: 'Off (0.0)', hint: 'Off' },
  { value: '0.25', label: 'Soft Rim Glow (0.25)', hint: 'Soft' },
  { value: '0.38', label: 'Standard Neon (0.38)', hint: '0.38' },
  { value: '0.55', label: 'Medium Vivid (0.55)', hint: '0.55' },
  { value: '0.65', label: 'Prominent Radiance (0.65)', hint: '0.65' },
  { value: '1.0', label: 'Maximum Cyber Glow (1.0)', hint: '1.0' },
];

export const HALO_RING_ITEMS: readonly DropdownItem[] = [
  { value: 'off', label: 'Off (No Halo Ring)', hint: 'Hidden' },
  { value: '0.5x', label: 'Faint Ethereal (0.5x)', hint: '0.5x' },
  { value: '1.0x', label: 'Standard Halo (1.0x)', hint: '1.0x' },
  { value: '1.5x', label: 'Dense Radiant (1.5x)', hint: '1.5x' },
  { value: '2.0x', label: 'Supernova Ring (2.0x)', hint: '2.0x' },
];

export const DIAMOND_STARS_ITEMS: readonly DropdownItem[] = [
  { value: 'off', label: 'Off (No Stars)', hint: 'Hidden' },
  { value: '8', label: '8 Diamond Stars', hint: '8' },
  { value: '16', label: '16 Diamond Stars', hint: '16' },
  { value: '32', label: '32 Stars (Default)', hint: '32' },
  { value: '48', label: '48 Galaxy Stars', hint: '48' },
];

export const ORBIT_LOOPS_ITEMS: readonly DropdownItem[] = [
  { value: '0', label: '0 — Disabled (No Orbit Loops)', hint: 'Off' },
  { value: '1', label: '1 — Outer Celestial Loop', hint: '1 Loop' },
  { value: '2', label: '2 — Symmetrical Orbit Loops (Default)', hint: '2 Loops' },
  { value: '3', label: '3 — Planetary Orbits', hint: '3 Loops' },
  { value: '4', label: '4 — Complex Gyroscopic Rings', hint: '4 Loops' },
];

export const AMBIENT_SPECKS_ITEMS: readonly DropdownItem[] = [
  { value: 'off', label: 'Off', hint: 'Off' },
  { value: '0.5x', label: 'Subtle Dust (0.5x)', hint: '0.5x' },
  { value: '1.0x', label: 'Standard Specks (1.0x)', hint: '1.0x' },
  { value: '2.0x', label: 'Dense Nebula (2.0x)', hint: '2.0x' },
];

export const IMAGE_RESOLUTION_ITEMS: readonly DropdownItem[] = [
  { value: '256', label: '256×256 Ultra Fine (Recommended)', hint: '256px' },
  { value: '224', label: '224×224 Crisp High (Default)', hint: '224px' },
  { value: '192', label: '192×192 Medium Balanced', hint: '192px' },
  { value: '160', label: '160×160 Fluid Performance', hint: '160px' },
  { value: '144', label: '144×144 Retro Pixel Art', hint: '144px' },
  { value: '112', label: '112×112 Chunky Arcade', hint: '112px' },
  { value: '384', label: '384×384 Extreme Crystalline', hint: '384px' },
  { value: '512', label: '512×512 Super Resolution (Max Detail)', hint: '512px' },
];

export const CLICK_FORCE_ITEMS: readonly DropdownItem[] = [
  { value: '0.1x', label: 'Feather Soft (0.1x)', hint: '0.1x' },
  { value: '0.25x', label: 'Micro Nudge (0.25x)', hint: '0.25x' },
  { value: '0.5x', label: 'Gentle Ripple (0.5x)', hint: '0.5x' },
  { value: '0.8x', label: 'Soft Impulse (0.8x)', hint: '0.8x' },
  { value: '1.0x', label: 'Standard Elastic (1.0x)', hint: '1.0x' },
  { value: '1.4x', label: 'Crisp Kick (1.4x)', hint: '1.4x' },
  { value: '1.8x', label: 'Maximum Impact (1.8x)', hint: '1.8x' },
];

export const BOUNCE_SPEED_ITEMS: readonly DropdownItem[] = [
  { value: '1.5', label: 'Ultra Slow Drift (1.5)', hint: 'Slow' },
  { value: '3.0', label: 'Smooth Float (3.0)', hint: 'Float' },
  { value: '5.0', label: 'Soft Viscous (5.0)', hint: 'Viscous' },
  { value: '8.2', label: 'Standard Return (8.2 - Default)', hint: 'Default' },
  { value: '10.0', label: 'Snappy Spring (10.0)', hint: 'Snappy' },
];

export const CLICK_RADIUS_ITEMS: readonly DropdownItem[] = [
  { value: '24px', label: 'Pinpoint Touch (24px)', hint: '24px' },
  { value: '48px', label: 'Local Cluster (48px)', hint: '48px' },
  { value: '80px', label: 'Focused Area (80px - Default)', hint: '80px' },
  { value: '140px', label: 'Broad Region (140px)', hint: '140px' },
  { value: 'full', label: 'Full Canvas Shockwave (Full)', hint: 'Full' },
];

export const HOVER_SPEED_ITEMS: readonly DropdownItem[] = [
  { value: '0.3x', label: 'Ultra Slow Drift (0.3x)', hint: '0.3x' },
  { value: '0.6x', label: 'Gentle Glide (0.6x)', hint: '0.6x' },
  { value: '1.0x', label: 'Standard Velocity (1.0x - Default)', hint: '1.0x' },
  { value: '1.5x', label: 'Brisk Flow (1.5x)', hint: '1.5x' },
  { value: '2.2x', label: 'High Velocity (2.2x)', hint: '2.2x' },
];

export const HOVER_THRESHOLD_ITEMS: readonly DropdownItem[] = [
  { value: '30px', label: 'Tight Touch (30px)', hint: '30px' },
  { value: '55px', label: 'Focused Proximity (55px - Default)', hint: '55px' },
  { value: '85px', label: 'Natural Radius (85px)', hint: '85px' },
  { value: '120px', label: 'Broad Influence (120px)', hint: '120px' },
  { value: '160px', label: 'Wide Ambient Halo (160px)', hint: '160px' },
];

export const CLICK_SPEED_ITEMS: readonly DropdownItem[] = [
  { value: '0.3x', label: 'Slow-Mo Ripple (0.3x)', hint: '0.3x' },
  { value: '0.6x', label: 'Cinematic Wave (0.6x)', hint: '0.6x' },
  { value: '1.0x', label: 'Standard Blast (1.0x - Default)', hint: '1.0x' },
  { value: '1.6x', label: 'Rapid Surge (1.6x)', hint: '1.6x' },
  { value: '2.4x', label: 'Instant Impulse (2.4x)', hint: '2.4x' },
];

export const INTRO_ANIMATION_ITEMS: readonly DropdownItem[] = [
  { value: '0.1s', label: '0.1s (Ultra Fast Snap)', hint: '0.1s' },
  { value: '0.3s', label: '0.3s (Rapid Snap)', hint: '0.3s' },
  { value: '0.5s', label: '0.5s (Brisk Flight)', hint: '0.5s' },
  { value: '0.8s', label: '0.8s (Smooth Swift)', hint: '0.8s' },
  { value: '1.0s', label: '1.0s (Standard - Default)', hint: '1.0s' },
  { value: '1.3s', label: '1.3s (Graceful Drift)', hint: '1.3s' },
  { value: '1.5s', label: '1.5s (Cinematic Inflow)', hint: '1.5s' },
  { value: '1.8s', label: '1.8s (Deliberate Glide)', hint: '1.8s' },
  { value: '2.0s', label: '2.0s (Slow Cosmic Warp)', hint: '2.0s' },
  { value: '2.5s', label: '2.5s (Deep Space Float)', hint: '2.5s' },
  { value: '3.0s', label: '3.0s (Ultra Ethereal)', hint: '3.0s' },
];

export const INTRO_SPREAD_ITEMS: readonly DropdownItem[] = [
  { value: '0.5x', label: 'Compact Orbit (0.5x)', hint: '0.5x' },
  { value: '0.8x', label: 'Focused Spread (0.8x)', hint: '0.8x' },
  { value: '1.0x', label: 'Standard Spread (1.0x - Default)', hint: '1.0x' },
  { value: '1.5x', label: 'Wide Cosmic Aura (1.5x)', hint: '1.5x' },
  { value: '2.2x', label: 'Deep Space Expansion (2.2x)', hint: '2.2x' },
  { value: '3.0x', label: 'Infinite Galaxy (3.0x)', hint: '3.0x' },
];

export const INTRO_PATTERN_ITEMS: readonly DropdownItem[] = [
  { value: 'vortex', label: 'Cosmic Spiral Vortex (Default)', hint: 'Vortex' },
  { value: 'stagger', label: 'Random Constellation Clusters', hint: 'Clusters' },
  { value: 'wave', label: 'Ascending Wave Surge', hint: 'Wave' },
  { value: 'warp', label: 'Direct Magnetic Warp', hint: 'Warp' },
];
