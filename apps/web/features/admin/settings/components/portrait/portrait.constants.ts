import type { DropdownItem } from '@elsesourav/ui/interior';

export const EDGE_ALGORITHM_ITEMS: readonly DropdownItem[] = [
  { value: 'perimeter', label: 'Perimeter Alpha Scan', hint: 'Scan' },
  { value: 'sobel', label: 'Sobel Edge Gradient', hint: 'Sobel' },
  { value: 'radial', label: 'Radial Centroid Raycast', hint: 'Raycast' },
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
  { value: 'enabled', label: 'Enabled (2 Orbit Loops)', hint: 'Active' },
  { value: 'disabled', label: 'Disabled (Clean Space)', hint: 'Off' },
];

export const AMBIENT_SPECKS_ITEMS: readonly DropdownItem[] = [
  { value: 'off', label: 'Off', hint: 'Off' },
  { value: '0.5x', label: 'Subtle Dust (0.5x)', hint: '0.5x' },
  { value: '1.0x', label: 'Standard Specks (1.0x)', hint: '1.0x' },
  { value: '2.0x', label: 'Dense Nebula (2.0x)', hint: '2.0x' },
];

export const IMAGE_RESOLUTION_ITEMS: readonly DropdownItem[] = [
  { value: '256', label: '256×256 Ultra Fine', hint: 'High Res' },
  { value: '224', label: '224×224 Crisp High (Default)', hint: 'Default' },
  { value: '192', label: '192×192 Medium Balanced', hint: 'Medium' },
  { value: '144', label: '144×144 Retro Pixel Art', hint: 'Pixel Art' },
  { value: '112', label: '112×112 Chunky Arcade', hint: 'Arcade' },
];

export const CLICK_FORCE_ITEMS: readonly DropdownItem[] = [
  { value: '0.8x', label: 'Gentle Ripple (0.8x)', hint: '0.8x' },
  { value: '1.0x', label: 'Standard Blast (1.0x)', hint: '1.0x' },
  { value: '1.8x', label: 'Forceful Shockwave (1.8x)', hint: '1.8x' },
  { value: '2.8x', label: 'Powerful Blast (2.8x)', hint: '2.8x' },
  { value: '4.0x', label: 'Supernova Dispersal (4.0x)', hint: '4.0x' },
];

export const BOUNCE_SPEED_ITEMS: readonly DropdownItem[] = [
  { value: '1.0x', label: 'Standard Elastic (1.0x)', hint: '1.0x' },
  { value: '4.0', label: 'Zen Floater (4.0)', hint: 'Gentle' },
  { value: '6.0', label: 'Smooth Spring (6.0)', hint: 'Smooth' },
  { value: '8.2', label: 'Snappy Elastic (8.2)', hint: 'Default' },
  { value: '12.0', label: 'Snappy Magnet (12.0)', hint: 'Snappy' },
  { value: '18.0', label: 'Instant Snap (18.0)', hint: 'Instant' },
];

export const INTRO_ANIMATION_ITEMS: readonly DropdownItem[] = [
  { value: 'instant', label: 'Instant (0s)', hint: '0s' },
  { value: 'brisk', label: 'Brisk Flight (0.6s)', hint: '0.6s' },
  { value: 'standard', label: 'Standard Drift (1.2s)', hint: '1.2s' },
  { value: 'cinematic', label: 'Cinematic Magnetic (2.0s)', hint: '2.0s' },
  { value: 'slow_motion', label: 'Slow Motion Drift (2.8s)', hint: '2.8s' },
];
