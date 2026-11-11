export type PortraitDeviceTarget = 'desktop' | 'tablet' | 'mobile';

export interface PortraitDeviceProfile {
  portrait_image_resolution: string;
  portrait_image_algorithm?: string;
  portrait_particle_density: string;
  portrait_particle_size: string;
  portrait_glow_brightness: string;
  portrait_flight_speed: string;
  portrait_path_spread: string;
  portrait_light_intensity: string;
  portrait_edge_algorithm: string;
  portrait_edge_threshold: string;
  portrait_pin_bottom_edge: string;
  portrait_top_particle_size: string;
  portrait_top_particle_quantity: string;
  portrait_top_particle_speed: string;
  portrait_glow_distance: string;
  portrait_backside_stars: string;
  portrait_backside_halo: string;
  portrait_backside_orbits: string;
  portrait_backside_specks: string;
  portrait_click_force: string;
  portrait_bounce_speed: string;
  portrait_click_radius: string;
  portrait_hover_speed: string;
  portrait_hover_threshold: string;
  portrait_click_speed: string;
  portrait_intro_animation: string;
  portrait_intro_spread: string;
  portrait_intro_pattern: string;
}

export interface PortraitDraftSettings extends PortraitDeviceProfile {
  portrait_image_dark_url: string;
  portrait_image_light_url: string;
  portrait_show_path_guide: string;
  portrait_image_resolution_desktop: string;
  portrait_image_resolution_tablet: string;
  portrait_image_resolution_mobile: string;
  portrait_image_algorithm_desktop?: string;
  portrait_image_algorithm_tablet?: string;
  portrait_image_algorithm_mobile?: string;
  portrait_config_desktop?: string;
  portrait_config_tablet?: string;
  portrait_config_mobile?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  desc?: string;
}
