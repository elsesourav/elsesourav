'use client';

import * as React from 'react';
import type { PortraitDraftSettings, PortraitDeviceTarget } from './portrait/portrait.types';
import { PortraitDeviceTargetTabs } from './portrait/PortraitDeviceTargetTabs';
import { PortraitLivePreviewCard } from './portrait/PortraitLivePreviewCard';
import { PortraitImageUploadControls } from './portrait/PortraitImageUploadControls';
import { EdgeDetectionControls } from './portrait/EdgeDetectionControls';
import { TopParticleControls } from './portrait/TopParticleControls';
import { BacksideObjectControls } from './portrait/BacksideObjectControls';
import { ImagePixelQualityControls } from './portrait/ImagePixelQualityControls';
import { PhysicsInteractionControls } from './portrait/PhysicsInteractionControls';

export interface PortraitSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave?: (overrides?: Record<string, string>) => Promise<void>;
}

export function PortraitSettingsTab({ settings, onChange, onSave }: PortraitSettingsTabProps) {
  const [activeDevice, setActiveDevice] = React.useState<PortraitDeviceTarget>('desktop');

  // Extract initial published state
  const getInitialDraft = React.useCallback(
    (): PortraitDraftSettings => ({
      portrait_image_dark_url:
        settings['portrait_image_dark_url'] === '/about/souravbarui-dark.png'
          ? ''
          : settings['portrait_image_dark_url'] || '',
      portrait_image_light_url:
        settings['portrait_image_light_url'] === '/about/souravbarui-light.png'
          ? ''
          : settings['portrait_image_light_url'] || '',
      portrait_particle_density: settings['portrait_particle_density'] || '1.0x',
      portrait_particle_size: settings['portrait_particle_size'] || '1.0x',
      portrait_glow_brightness: settings['portrait_glow_brightness'] || '1.0x',
      portrait_flight_speed: settings['portrait_flight_speed'] || '1.0x',
      portrait_path_spread: settings['portrait_path_spread'] || '2.6px',
      portrait_light_intensity: settings['portrait_light_intensity'] || '0.38',
      portrait_show_path_guide: settings['portrait_show_path_guide'] || 'false',
      portrait_edge_algorithm: settings['portrait_edge_algorithm'] || 'perimeter',
      portrait_edge_threshold: settings['portrait_edge_threshold'] || '28',
      portrait_pin_bottom_edge: settings['portrait_pin_bottom_edge'] || 'true',
      portrait_top_particle_size: settings['portrait_top_particle_size'] || '1.0x',
      portrait_top_particle_quantity: settings['portrait_top_particle_quantity'] || '1.0x',
      portrait_top_particle_speed: settings['portrait_top_particle_speed'] || '1.0x',
      portrait_glow_distance: settings['portrait_glow_distance'] || '8px',
      portrait_backside_stars: settings['portrait_backside_stars'] || '32',
      portrait_backside_halo: settings['portrait_backside_halo'] || '1.0x',
      portrait_backside_orbits: settings['portrait_backside_orbits'] || '2',
      portrait_backside_specks: settings['portrait_backside_specks'] || '1.0x',
      portrait_image_resolution: settings['portrait_image_resolution'] || '224',
      portrait_image_resolution_desktop: settings['portrait_image_resolution_desktop'] || '256',
      portrait_image_resolution_tablet: settings['portrait_image_resolution_tablet'] || '192',
      portrait_image_resolution_mobile: settings['portrait_image_resolution_mobile'] || '144',
      portrait_click_force: settings['portrait_click_force'] || '1.0x',
      portrait_bounce_speed: settings['portrait_bounce_speed'] || '8.2',
      portrait_click_radius: settings['portrait_click_radius'] || '80px',
      portrait_intro_animation: settings['portrait_intro_animation'] || '1.0s',
    }),
    [settings]
  );

  const [draftSettings, setDraftSettings] = React.useState<PortraitDraftSettings>(getInitialDraft);
  const [isApplying, setIsApplying] = React.useState(false);

  // Sync draft if external settings change outside
  React.useEffect(() => {
    setDraftSettings(getInitialDraft());
  }, [getInitialDraft]);

  // Check if draft has unapplied changes compared to parent settings
  const hasUnappliedChanges = React.useMemo(() => {
    const keys = Object.keys(draftSettings) as (keyof PortraitDraftSettings)[];
    return keys.some((k) => (settings[k] || '') !== (draftSettings[k] || ''));
  }, [draftSettings, settings]);

  const handleDraftChange = (key: string, value: string) => {
    setDraftSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      Object.entries(draftSettings).forEach(([k, v]) => {
        onChange(k, v);
      });
      if (onSave) {
        await onSave(draftSettings as unknown as Record<string, string>);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRevert = () => {
    setDraftSettings(getInitialDraft());
  };

  const darkUrl = draftSettings.portrait_image_dark_url;
  const lightUrl = draftSettings.portrait_image_light_url;

  return (
    <div className="space-y-4">
      {/* 1. Dual-Theme Portrait Assets (Placed at the very top, before device targets) */}
      <PortraitImageUploadControls
        darkUrl={darkUrl}
        lightUrl={lightUrl}
        onChange={handleDraftChange}
      />

      {/* 2. Top Section: Dedicated Device Target Tabs (Desktop / Tablet / Mobile) */}
      <PortraitDeviceTargetTabs
        activeDevice={activeDevice}
        onSelectDevice={setActiveDevice}
        desktopRes={draftSettings.portrait_image_resolution_desktop}
        tabletRes={draftSettings.portrait_image_resolution_tablet}
        mobileRes={draftSettings.portrait_image_resolution_mobile}
      />

      {/* 3. Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: All Interactive Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4 order-2 lg:order-1 min-w-0">
          <EdgeDetectionControls
            algorithm={draftSettings.portrait_edge_algorithm}
            threshold={draftSettings.portrait_edge_threshold}
            pinBottom={draftSettings.portrait_pin_bottom_edge}
            onChange={handleDraftChange}
          />

          <TopParticleControls
            topSize={draftSettings.portrait_top_particle_size}
            topQuantity={draftSettings.portrait_top_particle_quantity}
            topSpeed={draftSettings.portrait_top_particle_speed}
            pathSpread={draftSettings.portrait_path_spread}
            glowDistance={draftSettings.portrait_glow_distance}
            lightIntensity={draftSettings.portrait_light_intensity}
            onChange={handleDraftChange}
          />

          <BacksideObjectControls
            halo={draftSettings.portrait_backside_halo}
            stars={draftSettings.portrait_backside_stars}
            orbits={draftSettings.portrait_backside_orbits}
            specks={draftSettings.portrait_backside_specks}
            onChange={handleDraftChange}
          />

          <ImagePixelQualityControls
            activeDevice={activeDevice}
            desktopResolution={draftSettings.portrait_image_resolution_desktop}
            tabletResolution={draftSettings.portrait_image_resolution_tablet}
            mobileResolution={draftSettings.portrait_image_resolution_mobile}
            onChange={handleDraftChange}
          />

          <PhysicsInteractionControls
            clickForce={draftSettings.portrait_click_force}
            bounceSpeed={draftSettings.portrait_bounce_speed}
            clickRadius={draftSettings.portrait_click_radius}
            introAnimation={draftSettings.portrait_intro_animation}
            onChange={handleDraftChange}
          />
        </div>

        {/* Right Column: Sticky Live Preview Studio & Actions (5 cols on desktop, ~340px canvas on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 self-start order-1 lg:order-2">
          <PortraitLivePreviewCard
            settings={draftSettings}
            activeDevice={activeDevice}
            hasUnappliedChanges={hasUnappliedChanges}
            isApplying={isApplying}
            onApply={handleApply}
            onRevert={handleRevert}
            onToggleGuide={(enabled) =>
              handleDraftChange('portrait_show_path_guide', enabled ? 'true' : 'false')
            }
          />
        </div>
      </div>
    </div>
  );
}
