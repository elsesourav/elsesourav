'use client';

import * as React from 'react';
import { Badge, Button, Switch } from '@elsesourav/ui';
import { WasmPortraitCanvas } from '@elsesourav/ui/interior';
import { Route, Moon, Sun, Zap } from 'lucide-react';
import type { PortraitDraftSettings } from './portrait.types';

export interface PortraitLivePreviewCardProps {
  settings: PortraitDraftSettings;
  onToggleGuide: (enabled: boolean) => void;
}

export function PortraitLivePreviewCard({ settings, onToggleGuide }: PortraitLivePreviewCardProps) {
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
    <div className="p-3.5 sm:p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Route className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-100 truncate">Live Simulation</span>
          <Badge variant="outline" className="text-[9px] font-mono border-zinc-700 text-zinc-400 shrink-0">
            {settings.portrait_image_resolution || '224'}px
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={triggerTestBurst}
            className="text-[10px] h-6 px-2 rounded-lg border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <Zap className="w-2.5 h-2.5 text-amber-400 mr-1" />
            <span>Click Burst</span>
          </Button>

          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
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
      </div>

      {/* Path Guide Toggle */}
      <div className="px-2.5 py-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
        <Switch
          checked={guideEnabled}
          onCheckedChange={onToggleGuide}
          label={
            <span className="text-[11px] font-medium text-zinc-300">
              Contour Path Guide
            </span>
          }
        />
        <span className="text-[10px] font-mono text-zinc-500">Preview only</span>
      </div>

      {/* Canvas Sandbox */}
      <div className="flex justify-center py-1">
        <div
          key={burstKey}
          className={`relative p-2 rounded-2xl border transition-colors max-w-[260px] w-full ${
            previewTheme === 'dark'
              ? 'bg-zinc-950 border-zinc-800 shadow-[0_0_24px_rgba(6,182,212,0.12)]'
              : 'bg-zinc-100 border-zinc-300 shadow-[0_0_24px_rgba(0,0,0,0.06)]'
          }`}
        >
          <WasmPortraitCanvas
            imageDarkSrc={settings.portrait_image_dark_url || '/about/souravbarui-dark.png'}
            imageLightSrc={settings.portrait_image_light_url || '/about/souravbarui-light.png'}
            isDark={previewTheme === 'dark'}
            size={260}
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
    </div>
  );
}
