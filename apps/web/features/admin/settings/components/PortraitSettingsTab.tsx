'use client';

import * as React from 'react';
import type {
  PortraitDraftSettings,
  PortraitDeviceProfile,
  PortraitDeviceTarget,
} from './portrait/portrait.types';
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

function parseDeviceProfile(
  rawJson: string | undefined,
  fallbackSettings: Record<string, string>,
  defaultRes: string
): PortraitDeviceProfile {
  let parsed: Record<string, string> = {};
  if (rawJson) {
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      parsed = {};
    }
  }
  return {
    portrait_image_resolution:
      parsed.portrait_image_resolution || defaultRes,
    portrait_particle_density:
      parsed.portrait_particle_density || fallbackSettings['portrait_particle_density'] || '1.0x',
    portrait_particle_size:
      parsed.portrait_particle_size || fallbackSettings['portrait_particle_size'] || '1.0x',
    portrait_glow_brightness:
      parsed.portrait_glow_brightness || fallbackSettings['portrait_glow_brightness'] || '1.0x',
    portrait_flight_speed:
      parsed.portrait_flight_speed || fallbackSettings['portrait_flight_speed'] || '1.0x',
    portrait_path_spread:
      parsed.portrait_path_spread || fallbackSettings['portrait_path_spread'] || '2.6px',
    portrait_light_intensity:
      parsed.portrait_light_intensity || fallbackSettings['portrait_light_intensity'] || '0.38',
    portrait_edge_algorithm:
      parsed.portrait_edge_algorithm || fallbackSettings['portrait_edge_algorithm'] || 'perimeter',
    portrait_edge_threshold:
      parsed.portrait_edge_threshold || fallbackSettings['portrait_edge_threshold'] || '28',
    portrait_pin_bottom_edge:
      parsed.portrait_pin_bottom_edge || fallbackSettings['portrait_pin_bottom_edge'] || 'true',
    portrait_top_particle_size:
      parsed.portrait_top_particle_size || fallbackSettings['portrait_top_particle_size'] || '1.0x',
    portrait_top_particle_quantity:
      parsed.portrait_top_particle_quantity || fallbackSettings['portrait_top_particle_quantity'] || '1.0x',
    portrait_top_particle_speed:
      parsed.portrait_top_particle_speed || fallbackSettings['portrait_top_particle_speed'] || '1.0x',
    portrait_glow_distance:
      parsed.portrait_glow_distance || fallbackSettings['portrait_glow_distance'] || '8px',
    portrait_backside_stars:
      parsed.portrait_backside_stars || fallbackSettings['portrait_backside_stars'] || '32',
    portrait_backside_halo:
      parsed.portrait_backside_halo || fallbackSettings['portrait_backside_halo'] || '1.0x',
    portrait_backside_orbits:
      parsed.portrait_backside_orbits || fallbackSettings['portrait_backside_orbits'] || '2',
    portrait_backside_specks:
      parsed.portrait_backside_specks || fallbackSettings['portrait_backside_specks'] || '1.0x',
    portrait_click_force:
      parsed.portrait_click_force || fallbackSettings['portrait_click_force'] || '1.0x',
    portrait_bounce_speed:
      parsed.portrait_bounce_speed || fallbackSettings['portrait_bounce_speed'] || '8.2',
    portrait_click_radius:
      parsed.portrait_click_radius || fallbackSettings['portrait_click_radius'] || '80px',
    portrait_hover_speed:
      parsed.portrait_hover_speed || fallbackSettings['portrait_hover_speed'] || '1.0x',
    portrait_hover_threshold:
      parsed.portrait_hover_threshold || fallbackSettings['portrait_hover_threshold'] || '55px',
    portrait_click_speed:
      parsed.portrait_click_speed || fallbackSettings['portrait_click_speed'] || '1.0x',
    portrait_intro_animation:
      parsed.portrait_intro_animation || fallbackSettings['portrait_intro_animation'] || '1.0s',
    portrait_intro_spread:
      parsed.portrait_intro_spread || fallbackSettings['portrait_intro_spread'] || '1.0x',
    portrait_intro_pattern:
      parsed.portrait_intro_pattern || fallbackSettings['portrait_intro_pattern'] || 'vortex',
  };
}

export function PortraitSettingsTab({ settings, onChange, onSave }: PortraitSettingsTabProps) {
  const [activeDevice, setActiveDevice] = React.useState<PortraitDeviceTarget>('desktop');

  // Shared assets (images & dev guide)
  const getInitialShared = React.useCallback(
    () => ({
      portrait_image_dark_url:
        settings['portrait_image_dark_url'] === '/about/souravbarui-dark.png'
          ? ''
          : settings['portrait_image_dark_url'] || '',
      portrait_image_light_url:
        settings['portrait_image_light_url'] === '/about/souravbarui-light.png'
          ? ''
          : settings['portrait_image_light_url'] || '',
      portrait_show_path_guide: settings['portrait_show_path_guide'] || 'false',
    }),
    [settings]
  );

  // Per-device configuration profiles
  const getInitialProfiles = React.useCallback(
    (): Record<PortraitDeviceTarget, PortraitDeviceProfile> => ({
      desktop: parseDeviceProfile(
        settings['portrait_config_desktop'],
        settings,
        settings['portrait_image_resolution_desktop'] || settings['portrait_image_resolution'] || '256'
      ),
      tablet: parseDeviceProfile(
        settings['portrait_config_tablet'],
        settings,
        settings['portrait_image_resolution_tablet'] || '192'
      ),
      mobile: parseDeviceProfile(
        settings['portrait_config_mobile'],
        settings,
        settings['portrait_image_resolution_mobile'] || '144'
      ),
    }),
    [settings]
  );

  const [sharedAssets, setSharedAssets] = React.useState(getInitialShared);
  const [deviceProfiles, setDeviceProfiles] = React.useState(getInitialProfiles);
  const [isApplying, setIsApplying] = React.useState(false);

  // Sync state if external settings change
  React.useEffect(() => {
    setSharedAssets(getInitialShared());
    setDeviceProfiles(getInitialProfiles());
  }, [getInitialShared, getInitialProfiles]);

  const initialSnapshot = React.useMemo(() => {
    return JSON.stringify({
      shared: getInitialShared(),
      profiles: getInitialProfiles(),
    });
  }, [getInitialShared, getInitialProfiles]);

  const currentSnapshot = JSON.stringify({
    shared: sharedAssets,
    profiles: deviceProfiles,
  });

  const hasUnappliedChanges = initialSnapshot !== currentSnapshot;

  const currentProfile = deviceProfiles[activeDevice];

  const handleDraftChange = (key: string, value: string) => {
    if (key === 'portrait_image_dark_url' || key === 'portrait_image_light_url' || key === 'portrait_show_path_guide') {
      setSharedAssets((prev) => ({ ...prev, [key]: value }));
      return;
    }

    setDeviceProfiles((prev) => ({
      ...prev,
      [activeDevice]: {
        ...prev[activeDevice],
        [key]: value,
      },
    }));
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const serializedDesktop = JSON.stringify(deviceProfiles.desktop);
      const serializedTablet = JSON.stringify(deviceProfiles.tablet);
      const serializedMobile = JSON.stringify(deviceProfiles.mobile);

      const payload: Record<string, string> = {
        portrait_image_dark_url: sharedAssets.portrait_image_dark_url,
        portrait_image_light_url: sharedAssets.portrait_image_light_url,
        portrait_show_path_guide: sharedAssets.portrait_show_path_guide,
        portrait_config_desktop: serializedDesktop,
        portrait_config_tablet: serializedTablet,
        portrait_config_mobile: serializedMobile,
        portrait_image_resolution_desktop: deviceProfiles.desktop.portrait_image_resolution,
        portrait_image_resolution_tablet: deviceProfiles.tablet.portrait_image_resolution,
        portrait_image_resolution_mobile: deviceProfiles.mobile.portrait_image_resolution,
        // Sync desktop profile to flat keys for backward compatibility
        ...deviceProfiles.desktop,
      };

      Object.entries(payload).forEach(([k, v]) => {
        onChange(k, v);
      });

      if (onSave) {
        await onSave(payload);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRevert = () => {
    setSharedAssets(getInitialShared());
    setDeviceProfiles(getInitialProfiles());
  };

  const activeDraftForPreview: PortraitDraftSettings = React.useMemo(
    () => ({
      ...sharedAssets,
      ...currentProfile,
      portrait_image_resolution_desktop: deviceProfiles.desktop.portrait_image_resolution,
      portrait_image_resolution_tablet: deviceProfiles.tablet.portrait_image_resolution,
      portrait_image_resolution_mobile: deviceProfiles.mobile.portrait_image_resolution,
    }),
    [sharedAssets, currentProfile, deviceProfiles]
  );

  return (
    <div className="space-y-4">
      {/* 1. Dual-Theme Portrait Assets (Global across all device viewports) */}
      <PortraitImageUploadControls
        darkUrl={sharedAssets.portrait_image_dark_url}
        lightUrl={sharedAssets.portrait_image_light_url}
        onChange={handleDraftChange}
      />

      {/* 2. Top Master Device Target Tabs (Desktop / Tablet / Mobile) */}
      <PortraitDeviceTargetTabs
        activeDevice={activeDevice}
        onSelectDevice={setActiveDevice}
        desktopRes={deviceProfiles.desktop.portrait_image_resolution}
        tabletRes={deviceProfiles.tablet.portrait_image_resolution}
        mobileRes={deviceProfiles.mobile.portrait_image_resolution}
      />

      {/* 3. Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Controls for Active Device Target */}
        <div className="lg:col-span-7 space-y-4 order-2 lg:order-1 min-w-0">
          <EdgeDetectionControls
            algorithm={currentProfile.portrait_edge_algorithm}
            threshold={currentProfile.portrait_edge_threshold}
            pinBottom={currentProfile.portrait_pin_bottom_edge}
            onChange={handleDraftChange}
          />

          <TopParticleControls
            topSize={currentProfile.portrait_top_particle_size}
            topQuantity={currentProfile.portrait_top_particle_quantity}
            topSpeed={currentProfile.portrait_top_particle_speed}
            pathSpread={currentProfile.portrait_path_spread}
            glowDistance={currentProfile.portrait_glow_distance}
            lightIntensity={currentProfile.portrait_light_intensity}
            onChange={handleDraftChange}
          />

          <BacksideObjectControls
            halo={currentProfile.portrait_backside_halo}
            stars={currentProfile.portrait_backside_stars}
            orbits={currentProfile.portrait_backside_orbits}
            specks={currentProfile.portrait_backside_specks}
            onChange={handleDraftChange}
          />

          <ImagePixelQualityControls
            activeDevice={activeDevice}
            resolution={currentProfile.portrait_image_resolution}
            onChange={handleDraftChange}
          />

          <PhysicsInteractionControls
            clickForce={currentProfile.portrait_click_force}
            bounceSpeed={currentProfile.portrait_bounce_speed}
            clickRadius={currentProfile.portrait_click_radius}
            hoverSpeed={currentProfile.portrait_hover_speed}
            hoverThreshold={currentProfile.portrait_hover_threshold}
            clickSpeed={currentProfile.portrait_click_speed}
            introAnimation={currentProfile.portrait_intro_animation}
            introSpread={currentProfile.portrait_intro_spread}
            introPattern={currentProfile.portrait_intro_pattern}
            onChange={handleDraftChange}
          />
        </div>

        {/* Right Column: Sticky Live Preview Studio with Constant ~340px Canvas Size */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 self-start order-1 lg:order-2">
          <PortraitLivePreviewCard
            settings={activeDraftForPreview}
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
