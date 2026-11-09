'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Moon, Sun, User, Info, RefreshCw } from 'lucide-react';
import type { PortraitDraftSettings } from './portrait/portrait.types';
import { PortraitStudioToolbar } from './portrait/PortraitStudioToolbar';
import { PortraitLivePreviewCard } from './portrait/PortraitLivePreviewCard';
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
      // Propagate all draft settings to parent form
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

  const handleSyncDarkToAvatar = () => {
    onChange('creator_avatar_url', darkUrl || '/about/souravbarui-dark.png');
  };

  const handleSyncLightToAvatar = () => {
    onChange('creator_avatar_url', lightUrl || '/about/souravbarui-light.png');
  };

  return (
    <div className="space-y-6">
      {/* 1. Sticky Action Toolbar with Status and Apply Button */}
      <PortraitStudioToolbar
        hasUnappliedChanges={hasUnappliedChanges}
        isApplying={isApplying}
        onApply={handleApply}
        onRevert={handleRevert}
      />

      {/* 2. Real-Time Simulation Sandbox Live Preview */}
      <PortraitLivePreviewCard
        settings={draftSettings}
        onToggleGuide={(enabled) =>
          handleDraftChange('portrait_show_path_guide', enabled ? 'true' : 'false')
        }
      />

      {/* 3. Section: Silhouette Contour & Edge Detection */}
      <EdgeDetectionControls
        algorithm={draftSettings.portrait_edge_algorithm}
        threshold={draftSettings.portrait_edge_threshold}
        pinBottom={draftSettings.portrait_pin_bottom_edge}
        onChange={handleDraftChange}
      />

      {/* 4. Section: Top Globe & Edge Flow Particles */}
      <TopParticleControls
        topSize={draftSettings.portrait_top_particle_size}
        topQuantity={draftSettings.portrait_top_particle_quantity}
        topSpeed={draftSettings.portrait_top_particle_speed}
        pathSpread={draftSettings.portrait_path_spread}
        lightIntensity={draftSettings.portrait_light_intensity}
        onChange={handleDraftChange}
      />

      {/* 5. Section: Backside Space, Halo & Retro Stars */}
      <BacksideObjectControls
        halo={draftSettings.portrait_backside_halo}
        stars={draftSettings.portrait_backside_stars}
        orbits={draftSettings.portrait_backside_orbits}
        specks={draftSettings.portrait_backside_specks}
        onChange={handleDraftChange}
      />

      {/* 6. Section: Photographic Image Quality & Simulation Grid */}
      <ImagePixelQualityControls
        resolution={draftSettings.portrait_image_resolution}
        onChange={handleDraftChange}
      />

      {/* 7. Section: Touch Dynamics, Click Blast & Flight Arrival */}
      <PhysicsInteractionControls
        clickForce={draftSettings.portrait_click_force}
        bounceSpeed={draftSettings.portrait_bounce_speed}
        introAnimation={draftSettings.portrait_intro_animation}
        onChange={handleDraftChange}
      />

      {/* 8. Dual-Theme Portrait Images Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dark Theme Portrait Card */}
        <Card className="p-5 rounded-3xl border-zinc-800 bg-zinc-900/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-100">Dark Theme Portrait</h3>
                  <p className="text-[11px] text-zinc-400">Active when visitors browse in Dark Mode</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-300">
                Dark Mode
              </Badge>
            </div>

            <ImageInputWithLibrary
              label="Portrait Image (Transparent PNG / WebP)"
              value={darkUrl}
              onChange={(val) => handleDraftChange('portrait_image_dark_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-dark.png or select from media"
            />

            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Image Requirements</span>
              </div>
              <p className="leading-relaxed">
                Use a <strong>1:1 square image</strong> with a completely{' '}
                <strong>transparent background (alpha = 0)</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              {darkUrl ? 'Custom Image Active' : 'Default Asset Active'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleDraftChange('portrait_image_dark_url', '/about/souravbarui-dark.png')}
              className="text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-xl h-7 px-2.5"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Reset to Default</span>
            </Button>
          </div>
        </Card>

        {/* Light Theme Portrait Card */}
        <Card className="p-5 rounded-3xl border-zinc-800 bg-zinc-900/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-100">Light Theme Portrait</h3>
                  <p className="text-[11px] text-zinc-400">Active when visitors browse in Light Mode</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-300">
                Light Mode
              </Badge>
            </div>

            <ImageInputWithLibrary
              label="Portrait Image (Transparent PNG / WebP)"
              value={lightUrl}
              onChange={(val) => handleDraftChange('portrait_image_light_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-light.png or select from media"
            />

            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Image Requirements</span>
              </div>
              <p className="leading-relaxed">
                Use a <strong>1:1 square image</strong> with a completely{' '}
                <strong>transparent background (alpha = 0)</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              {lightUrl ? 'Custom Image Active' : 'Default Asset Active'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleDraftChange('portrait_image_light_url', '/about/souravbarui-light.png')}
              className="text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-xl h-7 px-2.5"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Reset to Default</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* 9. Global Creator Avatar Fallback Card */}
      <Card className="p-4 sm:p-5 rounded-3xl border-zinc-800 bg-zinc-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-100">Global Creator Avatar Photo</h3>
              <p className="text-[11px] text-zinc-400">
                Used in header navigation, author badges, and compact user cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleSyncDarkToAvatar}
              className="text-[11px] text-zinc-400 hover:text-cyan-300 gap-1 rounded-xl h-7 px-2.5 border border-zinc-800"
            >
              <Moon className="w-3 h-3 text-cyan-400" />
              <span>Copy from Dark</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleSyncLightToAvatar}
              className="text-[11px] text-zinc-400 hover:text-amber-300 gap-1 rounded-xl h-7 px-2.5 border border-zinc-800"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Copy from Light</span>
            </Button>
          </div>
        </div>

        <ImageInputWithLibrary
          label="Avatar Photo URL"
          value={avatarUrl}
          onChange={(val) => onChange('creator_avatar_url', val)}
          folder="users"
          defaultCategory="users"
          previewShape="circle"
          placeholder="Avatar photo URL or select from media"
        />
      </Card>
    </div>
  );
}
