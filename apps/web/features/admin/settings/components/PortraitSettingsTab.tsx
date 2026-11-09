'use client';

import * as React from 'react';
import type { PortraitDraftSettings } from './portrait/portrait.types';
import { PortraitStudioToolbar } from './portrait/PortraitStudioToolbar';
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
  onSave?: () => Promise<void>;
}

export function PortraitSettingsTab({ settings, onChange, onSave }: PortraitSettingsTabProps) {
  // Extract initial published state
  const getInitialDraft = React.useCallback(
    (): PortraitDraftSettings => ({
      portrait_image_dark_url: settings['portrait_image_dark_url'] || '/about/souravbarui-dark.png',
      portrait_image_light_url: settings['portrait_image_light_url'] || '/about/souravbarui-light.png',
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
      portrait_backside_stars: settings['portrait_backside_stars'] || '32',
      portrait_backside_halo: settings['portrait_backside_halo'] || '1.0x',
      portrait_backside_orbits: settings['portrait_backside_orbits'] || 'enabled',
      portrait_backside_specks: settings['portrait_backside_specks'] || '1.0x',
      portrait_image_resolution: settings['portrait_image_resolution'] || '224',
      portrait_click_force: settings['portrait_click_force'] || '1.8x',
      portrait_bounce_speed: settings['portrait_bounce_speed'] || '8.2',
      portrait_intro_animation: settings['portrait_intro_animation'] || 'standard',
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
        await onSave();
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
  const avatarUrl = settings['creator_avatar_url'] || '';

  const handleSyncToAvatar = (url: string) => {
    onChange('creator_avatar_url', url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Column: All Interactive Controls (7 cols on desktop) */}
      <div className="lg:col-span-7 space-y-4 order-2 lg:order-1 min-w-0">
        <PortraitImageUploadControls
          darkUrl={darkUrl}
          lightUrl={lightUrl}
          avatarUrl={avatarUrl}
          onChange={handleDraftChange}
          onSyncToAvatar={handleSyncToAvatar}
        />

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
          resolution={draftSettings.portrait_image_resolution}
          onChange={handleDraftChange}
        />

        <PhysicsInteractionControls
          clickForce={draftSettings.portrait_click_force}
          bounceSpeed={draftSettings.portrait_bounce_speed}
          introAnimation={draftSettings.portrait_intro_animation}
          onChange={handleDraftChange}
        />
      </div>

      {/* Right Column: Sticky Live Preview Sandbox & Actions (5 cols on desktop) */}
      <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-3 order-1 lg:order-2">
        <PortraitStudioToolbar
          hasUnappliedChanges={hasUnappliedChanges}
          isApplying={isApplying}
          onApply={handleApply}
          onRevert={handleRevert}
        />

        <PortraitLivePreviewCard
          settings={draftSettings}
          onToggleGuide={(enabled) =>
            handleDraftChange('portrait_show_path_guide', enabled ? 'true' : 'false')
          }
        />
      </div>
    </div>
  );
}
