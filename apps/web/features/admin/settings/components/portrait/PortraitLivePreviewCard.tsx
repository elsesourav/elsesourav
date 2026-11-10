'use client';

import * as React from 'react';
import { Badge, Button, Switch } from '@elsesourav/ui';
import { WasmPortraitCanvas } from '@elsesourav/ui/interior';
import {
  Sparkles,
  Undo2,
  Send,
  Route,
  Moon,
  Sun,
  Zap,
  MousePointerClick,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import type { PortraitDraftSettings, PortraitDeviceTarget } from './portrait.types';

export interface PortraitLivePreviewCardProps {
  settings: PortraitDraftSettings;
  activeDevice?: PortraitDeviceTarget;
  hasUnappliedChanges?: boolean;
  isApplying?: boolean;
  onApply?: () => void;
  onRevert?: () => void;
  onToggleGuide: (enabled: boolean) => void;
}

export function PortraitLivePreviewCard({
  settings,
  activeDevice = 'desktop',
  hasUnappliedChanges = false,
  isApplying = false,
  onApply,
  onRevert,
  onToggleGuide,
}: PortraitLivePreviewCardProps) {
  const [previewTheme, setPreviewTheme] = React.useState<'dark' | 'light'>('dark');
  const [burstKey, setBurstKey] = React.useState(0);

  const guideEnabled = settings.portrait_show_path_guide === 'true';

  const triggerTestBurst = () => {
    const win = typeof window !== 'undefined' ? (window as unknown as { __portraitBridge?: { burst: () => void } }) : null;
    if (win?.__portraitBridge) {
      win.__portraitBridge.burst();
    } else {
      setBurstKey((k) => k + 1);
    }
  };

  const triggerReplayIntro = () => {
    const win =
      typeof window !== 'undefined'
        ? (window as unknown as {
            __portraitBridge?: { triggerEntrance: (duration?: number) => void };
          })
        : null;
    if (win?.__portraitBridge?.triggerEntrance) {
      win.__portraitBridge.triggerEntrance();
    } else {
      setBurstKey((k) => k + 1);
    }
  };

  // Determine resolution based on device target
  const activeResolution =
    settings.portrait_image_resolution ||
    (activeDevice === 'mobile'
      ? settings.portrait_image_resolution_mobile || '144'
      : activeDevice === 'tablet'
        ? settings.portrait_image_resolution_tablet || '192'
        : settings.portrait_image_resolution_desktop || '256');

  // Preview canvas size remains constant (~340px) across all device targets to maintain a stable studio layout
  const canvasSize = 340;
  const maxWClass = 'max-w-[340px]';

  const DeviceIcon = activeDevice === 'mobile' ? Smartphone : activeDevice === 'tablet' ? Tablet : Monitor;

  return (
    <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/90 shadow-xl dark:shadow-2xl space-y-3">
      {/* Studio Header: Branding, State Indicator & Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-400/50 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Portrait Studio</span>
              <Badge variant="primary" className="text-[8px] font-mono py-0 px-1 shrink-0">
                WASM
              </Badge>
            </div>
            <div>
              {hasUnappliedChanges ? (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">● Draft Active</span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● Synced</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasUnappliedChanges && onRevert && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onRevert}
              className="text-[11px] h-7 px-2 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap"
            >
              <Undo2 className="w-3 h-3 mr-1" />
              <span>Revert</span>
            </Button>
          )}

          {onApply && (
            <Button
              type="button"
              variant="primary"
              size="xs"
              onClick={onApply}
              disabled={!hasUnappliedChanges || isApplying}
              className={`text-[11px] h-7 px-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                hasUnappliedChanges
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isApplying ? (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Applying...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  <span>Apply</span>
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Simulation Controls: Resolution, Quick Burst & Theme Mode Switch */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Badge
            variant="outline"
            className="text-[9px] font-mono border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 shrink-0 flex items-center gap-1"
          >
            <DeviceIcon className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
            <span>{activeResolution}px</span>
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={triggerTestBurst}
            className="text-[10px] h-6 px-2 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap"
          >
            <Zap className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 mr-1" />
            <span>Burst</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={triggerReplayIntro}
            className="text-[10px] h-6 px-2 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap"
          >
            <RotateCcw className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400 mr-1" />
            <span>Intro</span>
          </Button>
        </div>

        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewTheme('dark')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              previewTheme === 'dark' ? 'bg-zinc-800 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Moon className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewTheme('light')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              previewTheme === 'light' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sun className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
            <span>Light</span>
          </button>
        </div>
      </div>

      {/* Path Guide Toggle */}
      <div className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/30 flex items-center justify-between">
        <Switch
          checked={guideEnabled}
          onCheckedChange={onToggleGuide}
          label={
            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Route className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              Contour Path Guide
            </span>
          }
        />
        <span className="text-[10px] font-mono text-zinc-500">Preview only</span>
      </div>

      {/* Canvas Sandbox: Dynamically Sized for Active Target (340px on Desktop) */}
      <div className="flex justify-center py-1">
        <div
          key={`${burstKey}-${activeDevice}`}
          className={`relative p-2.5 rounded-2xl border transition-all ${maxWClass} w-full ${
            previewTheme === 'dark'
              ? 'bg-zinc-950 border-zinc-800 shadow-[0_0_32px_rgba(6,182,212,0.14)]'
              : 'bg-zinc-100 border-zinc-300 shadow-[0_0_32px_rgba(0,0,0,0.08)]'
          }`}
        >
          <WasmPortraitCanvas
            imageDarkSrc={settings.portrait_image_dark_url || '/about/souravbarui-dark.png'}
            imageLightSrc={settings.portrait_image_light_url || '/about/souravbarui-light.png'}
            isDark={previewTheme === 'dark'}
            size={canvasSize}
            particleDensity={settings.portrait_particle_density}
            particleSize={settings.portrait_particle_size}
            glowBrightness={settings.portrait_glow_brightness}
            flightSpeed={settings.portrait_flight_speed}
            pathSpread={settings.portrait_path_spread}
            lightIntensity={parseFloat(settings.portrait_light_intensity) || 0.38}
            showPathGuide={guideEnabled}
            edgeAlgorithm={settings.portrait_edge_algorithm}
            edgeThreshold={settings.portrait_edge_threshold}
            pinBottomEdge={settings.portrait_pin_bottom_edge !== 'false'}
            topParticleSize={settings.portrait_top_particle_size}
            topParticleQuantity={settings.portrait_top_particle_quantity}
            topParticleSpeed={settings.portrait_top_particle_speed}
            glowDistance={settings.portrait_glow_distance}
            backsideStars={settings.portrait_backside_stars}
            backsideHalo={settings.portrait_backside_halo}
            backsideOrbits={settings.portrait_backside_orbits}
            backsideSpecks={settings.portrait_backside_specks}
            simulationResolution={activeResolution}
            clickForce={settings.portrait_click_force}
            bounceSpeed={settings.portrait_bounce_speed}
            clickRadius={settings.portrait_click_radius}
            hoverSpeed={settings.portrait_hover_speed}
            hoverRadius={settings.portrait_hover_threshold}
            clickSpeed={settings.portrait_click_speed}
            introDuration={settings.portrait_intro_animation}
            introSpread={settings.portrait_intro_spread}
            introPattern={settings.portrait_intro_pattern}
            disableFullscreenIntro={true}
            className="rounded-xl w-full"
          />
        </div>
      </div>

      {/* Interactive Micro-hint */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-zinc-500 font-mono">
        <MousePointerClick className="w-3 h-3 text-cyan-400/70" />
        <span>Click canvas to test localized impulse &amp; return physics</span>
      </div>
    </div>
  );
}
