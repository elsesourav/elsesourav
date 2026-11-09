export type PortraitDeviceTarget = 'desktop' | 'tablet' | 'mobile';

export interface PortraitDraftSettings {
  portrait_image_dark_url: string;
  portrait_image_light_url: string;
  portrait_particle_density: string;
  portrait_particle_size: string;
  portrait_glow_brightness: string;
  portrait_flight_speed: string;
  portrait_path_spread: string;
  portrait_light_intensity: string;
  portrait_show_path_guide: string;
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
  portrait_image_resolution: string;
  portrait_image_resolution_desktop: string;
  portrait_image_resolution_tablet: string;
  portrait_image_resolution_mobile: string;
  portrait_click_force: string;
  portrait_bounce_speed: string;
  portrait_click_radius: string;
  portrait_intro_animation: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  desc?: string;
}
