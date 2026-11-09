import type { DropdownOption } from './portrait.types';

export const EDGE_ALGORITHM_OPTIONS: readonly DropdownOption[] = [
  { value: 'perimeter', label: 'Perimeter Alpha Scan (Recommended)', desc: 'Continuous row boundary scan from canvas bottom up through curls and down' },
  { value: 'sobel', label: 'Sobel Edge Gradient Filter', desc: 'Spatial intensity gradient convolution detecting high-contrast silhouette edges' },
  { value: 'radial', label: 'Radial Centroid Raycast', desc: 'Outward angular raycasting from subject center to perimeter boundary' },
];

export const EDGE_THRESHOLD_OPTIONS: readonly DropdownOption[] = [
  { value: '10', label: '10 — Ultra Sensitive', desc: 'Captures finest curls and semi-transparent hair fringe' },
  { value: '18', label: '18 — High Sensitivity', desc: 'Preserves soft contours and lightweight fabrics' },
  { value: '28', label: '28 — Standard Balanced', desc: 'Default silhouette boundary for crisp, clean cutouts' },
  { value: '45', label: '45 — Strict Edge', desc: 'Eliminates background fuzz and noisy outer fringes' },
  { value: '65', label: '65 — High Contrast Only', desc: 'Locks strictly to dense, opaque inner boundaries' },
];

export const PIN_BOTTOM_OPTIONS: readonly DropdownOption[] = [
  { value: 'true', label: 'Flush to Canvas Bottom (y = canvas bottom)', desc: 'Glow starts right at bottom edge of the frame for both hoodie shoulders' },
  { value: 'false', label: 'Natural Subject Bounding Box', desc: 'Follows natural image alpha bounds without bottom canvas pinning' },
];

export const TOP_PARTICLE_SIZE_OPTIONS: readonly DropdownOption[] = [
  { value: '0.6x', label: '0.6x — Micro Sparks', desc: 'Ultra-fine starlight sparkles along the contour' },
  { value: '0.85x', label: '0.85x — Compact (Default)', desc: 'Delicate crystalline starlight particles' },
  { value: '1.0x', label: '1.0x — Standard', desc: 'Solid pixel-art proportions matching image pixels' },
  { value: '1.3x', label: '1.3x — Bold Glowing', desc: 'Enhanced luminous presence over shoulders and hair' },
  { value: '1.6x', label: '1.6x — Retro Chunky', desc: 'Classic arcade beacon sizing' },
];

export const TOP_PARTICLE_QUANTITY_OPTIONS: readonly DropdownOption[] = [
  { value: '0.5x', label: '0.5x — Minimal Spacing', desc: 'Subtle, scattered starlight markers' },
  { value: '1.0x', label: '1.0x — Standard Density', desc: 'Balanced continuous edge flow stream' },
  { value: '1.5x', label: '1.5x — Rich Ribbon', desc: 'Dense shimmering contour flow' },
  { value: '2.0x', label: '2.0x — Double Ribbon', desc: 'High particle count with dense light coverage' },
  { value: '3.0x', label: '3.0x — Supernova Cascade', desc: 'Maximum crystalline particle constellation' },
];

export const TOP_PARTICLE_SPEED_OPTIONS: readonly DropdownOption[] = [
  { value: '0.5x', label: '0.5x — Zen Drift', desc: 'Slow, graceful celestial perimeter transit' },
  { value: '1.0x', label: '1.0x — Standard Velocity', desc: 'Balanced natural organic movement' },
  { value: '1.5x', label: '1.5x — Brisk Dynamic', desc: 'Energetic cyber particle stream' },
  { value: '2.0x', label: '2.0x — High Speed Warp', desc: 'Rapid perimeter circuits' },
  { value: '3.0x', label: '3.0x — Hyperdrive', desc: 'Ultra-fast cosmic circuit traversal' },
];

export const PATH_SPREAD_OPTIONS: readonly DropdownOption[] = [
  { value: '1.0px', label: '1.0px — Locked Contour Line', desc: 'Follows exact single silhouette edge' },
  { value: '1.8px', label: '1.8px — Subtle Deviation', desc: 'Slight organic breathing motion around edges' },
  { value: '2.6px', label: '2.6px — Balanced Ribbon (Default)', desc: 'Natural undulating ribbon with organic wandering wave' },
  { value: '3.8px', label: '3.8px — Wide Aura', desc: 'Broad luminous contour band with high particle spread' },
  { value: '5.2px', label: '5.2px — Expansive Atmosphere', desc: 'Atmospheric cloud drifting around shoulders and crown' },
];

export const LIGHT_INTENSITY_OPTIONS: readonly DropdownOption[] = [
  { value: '0.0', label: '0.0 — Off (Particles Only)', desc: 'Photograph pixels remain unlit by passing particles' },
  { value: '0.25', label: '0.25 — Soft Luminous', desc: 'Subtle rim glow illuminating curls and hoodie edges' },
  { value: '0.38', label: '0.38 — Standard Neon (Default)', desc: 'Balanced cyber rim lighting on subject edges' },
  { value: '0.65', label: '0.65 — Prominent Radiance', desc: 'Strong colorful proximity lighting on photograph' },
  { value: '1.0', label: '1.0 — Maximum Cyber Glow', desc: 'Full high-voltage illumination radiating through photo' },
];

export const HALO_RING_OPTIONS: readonly DropdownOption[] = [
  { value: 'off', label: 'Off — No Halo Ring', desc: 'Hide the backside circular orbit ring' },
  { value: '0.5x', label: '0.5x — Faint Ethereal Halo', desc: 'Delicate, minimal circular pixel ring' },
  { value: '1.0x', label: '1.0x — Standard Halo (Default)', desc: 'Crisp, continuous celestial circle behind head' },
  { value: '1.5x', label: '1.5x — Dense Radiant Halo', desc: 'Bright, prominent cosmic ring with rich color gradient' },
  { value: '2.0x', label: '2.0x — Supernova Ring', desc: 'Ultra-dense double-layer halo ring' },
];

export const DIAMOND_STARS_OPTIONS: readonly DropdownOption[] = [
  { value: 'off', label: 'Off — No Side Stars', desc: 'Disable retro diamond cross stars on sides' },
  { value: '8', label: '8 Stars — Minimalist Constellation', desc: 'Few subtle diamond stars floating in space' },
  { value: '16', label: '16 Stars — Balanced Stars', desc: 'Clean vintage cyber cross stars flanking portrait' },
  { value: '32', label: '32 Stars — Starry Cosmos (Default)', desc: 'Rich starry night field with 5-pixel diamond stars' },
  { value: '48', label: '48 Stars — Deep Galaxy Density', desc: 'Full cosmic expanse of retro arcade cross stars' },
];

export const ORBIT_LOOPS_OPTIONS: readonly DropdownOption[] = [
  { value: 'enabled', label: 'Enabled (2 Celestial Orbit Loops)', desc: 'Animated digital satellite orbit rings on left and right' },
  { value: 'disabled', label: 'Disabled (Clean Backdrop)', desc: 'Turn off the circular orbit loops' },
];

export const AMBIENT_SPECKS_OPTIONS: readonly DropdownOption[] = [
  { value: 'off', label: 'Off — Crisp Empty Space', desc: 'No background ambient micro-specks' },
  { value: '0.5x', label: '0.5x — Subtle Micro-Dust', desc: 'Light dusting of floating ambient micro-pixels' },
  { value: '1.0x', label: '1.0x — Standard Specks (Default)', desc: 'Balanced cosmic dust shimmering in the background' },
  { value: '2.0x', label: '2.0x — Dense Nebula Field', desc: 'Dense sparkling starfield particles on sides' },
];

export const IMAGE_RESOLUTION_OPTIONS: readonly DropdownOption[] = [
  { value: '256', label: '256×256 — Ultra Fine (High Quality)', desc: 'Small 2.2px pixels — photorealistic clarity with subtle pixel styling' },
  { value: '224', label: '224×224 — Crisp High (Default Quality)', desc: 'Balanced 2.6px pixels — sharp portrait with crisp authentic cyber aesthetic' },
  { value: '192', label: '192×192 — Medium Balanced', desc: '3.0px pixels — noticeable pixel matrix with smooth face rendering' },
  { value: '144', label: '144×144 — Retro Pixel Art (Low Quality)', desc: '4.0px pixels — stylized retro 90s pixel-art portrait character' },
  { value: '112', label: '112×112 — Chunky Arcade (Lowest Quality)', desc: '5.2px pixels — bold chunky 8-bit retro arcade game sprite aesthetic' },
];

export const CLICK_FORCE_OPTIONS: readonly DropdownOption[] = [
  { value: '0.8x', label: '0.8x — Gentle Ripple', desc: 'Soft touch displacement with calm particle wave' },
  { value: '1.8x', label: '1.8x — Standard Blast (Default)', desc: 'Crisp energetic radial impulse and expanding shockwave ring' },
  { value: '2.8x', label: '2.8x — High Impact Shockwave', desc: 'Dramatic particle scatter and high-voltage velocity burst' },
  { value: '4.0x', label: '4.0x — Supernova Blast', desc: 'Massive blast scattering pixels across entire canvas' },
];

export const BOUNCE_SPEED_OPTIONS: readonly DropdownOption[] = [
  { value: '3.5', label: '3.5 — Soft Zen Float (Slow Return)', desc: 'Gentle, floating return trajectory like underwater physics' },
  { value: '8.2', label: '8.2 — Smooth Magnetic (Default Speed)', desc: 'Balanced organic Hooke spring-damper snap back into place' },
  { value: '14.0', label: '14.0 — Snappy Elastic (Fast Bounce)', desc: 'Fast, high-frequency spring bounce on touch and release' },
  { value: '22.0', label: '22.0 — Hyper Instant (Immediate Snap)', desc: 'Ultra-fast magnetic lock returning instantly to docked origin' },
];

export const INTRO_ANIMATION_OPTIONS: readonly DropdownOption[] = [
  { value: 'none', label: 'Instant (0.0s — Zero Delay)', desc: 'Portrait pixels appear immediately without arrival flight sequence' },
  { value: 'fast', label: 'Swift Warp (0.8s)', desc: 'Rapid convergence from outer cosmic coordinates' },
  { value: 'standard', label: 'Cinematic Docking (1.6s — Default)', desc: 'Graceful curved magnetic flight converging onto card' },
  { value: 'slow', label: 'Dramatic Slow Drift (2.8s)', desc: 'Epic slow-motion cosmic assembly of pixels' },
];
