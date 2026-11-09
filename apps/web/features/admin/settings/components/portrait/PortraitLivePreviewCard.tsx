'use client';

import * as React from 'react';
import { Badge, Button, Switch } from '@elsesourav/ui';
import { WasmPortraitCanvas } from '@elsesourav/ui/interior';
import { Sparkles, Undo2, Send, Route, Moon, Sun, Zap, MousePointerClick } from 'lucide-react';
import type { PortraitDraftSettings } from './portrait.types';

export interface PortraitLivePreviewCardProps {
  settings: PortraitDraftSettings;
  hasUnappliedChanges?: boolean;
  isApplying?: boolean;
  onApply?: () => void;
  onRevert?: () => void;
  onToggleGuide: (enabled: boolean) => void;
}

export function PortraitLivePreviewCard({
  settings,
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

  return (
    <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl space-y-3">
      {/* Studio Header: Branding, State Indicator & Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100 truncate">Portrait Studio</span>
              <Badge variant="primary" className="text-[8px] font-mono py-0 px-1 shrink-0">
                WASM
              </Badge>
            </div>
            <div>
              {hasUnappliedChanges ? (
                <span className="text-[10px] text-amber-400 font-medium">● Draft Active</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-medium">● Synced</span>
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
              className="text-[11px] h-7 px-2 rounded-lg border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 whitespace-nowrap"
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
          <Badge variant="outline" className="text-[9px] font-mono border-zinc-700 text-zinc-400 shrink-0">
            {settings.portrait_image_resolution || '224'}px
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={triggerTestBurst}
            className="text-[10px] h-6 px-2 rounded-lg border-zinc-800 text-zinc-300 hover:bg-zinc-800 whitespace-nowrap"
          >
            <Zap className="w-2.5 h-2.5 text-amber-400 mr-1" />
            <span>Click Burst</span>
          </Button>
        </div>

        <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewTheme('dark')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors ${
              previewTheme === 'dark' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Moon className="w-2.5 h-2.5 text-cyan-400" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewTheme('light')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors ${
              previewTheme === 'light' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sun className="w-2.5 h-2.5 text-amber-400" />
            <span>Light</span>
          </button>
        </div>
      </div>

      {/* Path Guide Toggle */}
      <div className="px-2.5 py-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
        <Switch
          checked={guideEnabled}
          onCheckedChange={onToggleGuide}
          label={
            <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
              <Route className="w-3 h-3 text-cyan-400" />
              Contour Path Guide
            </span>
          }
        />
        <span className="text-[10px] font-mono text-zinc-500">Preview only</span>
      </div>

      {/* Canvas Sandbox: Compact 230px Fit */}
      <div className="flex justify-center py-0.5">
        <div
          key={burstKey}
          className={`relative p-2 rounded-2xl border transition-colors max-w-[240px] w-full ${
            previewTheme === 'dark'
              ? 'bg-zinc-950 border-zinc-800 shadow-[0_0_24px_rgba(6,182,212,0.12)]'
              : 'bg-zinc-100 border-zinc-300 shadow-[0_0_24px_rgba(0,0,0,0.06)]'
          }`}
        >
          <WasmPortraitCanvas
            imageDarkSrc={settings.portrait_image_dark_url || '/about/souravbarui-dark.png'}
            imageLightSrc={settings.portrait_image_light_url || '/about/souravbarui-light.png'}
            isDark={previewTheme === 'dark'}
            size={230}
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
            backsideStars={settings.portrait_backside_stars}
            backsideHalo={settings.portrait_backside_halo}
            backsideOrbits={settings.portrait_backside_orbits}
            backsideSpecks={settings.portrait_backside_specks}
            simulationResolution={settings.portrait_image_resolution}
            clickForce={settings.portrait_click_force}
            bounceSpeed={settings.portrait_bounce_speed}
            introDuration={settings.portrait_intro_animation}
            className="rounded-xl w-full"
          />
        </div>
      </div>

      {/* Interactive Micro-hint */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-zinc-500 font-mono">
        <MousePointerClick className="w-3 h-3 text-cyan-400/70" />
        <span>Click canvas to test interactive impulse</span>
      </div>
    </div>
  );
}
