'use client';

import * as React from 'react';
import { Badge, Switch } from '@elsesourav/ui';
import { WasmPortraitCanvas } from '@elsesourav/ui/interior';
import { Sparkles, Cpu, Zap, Eye, Compass, Route, Sun, Moon, Flame, Waves } from 'lucide-react';

export interface AboutPortraitParticleSettingsProps {
  particleDensity: string;
  particleSize: string;
  glowBrightness: string;
  flightSpeed: string;
  pathSpread?: string;
  lightIntensity?: string;
  showPathGuide?: boolean;
  imageDarkSrc?: string;
  imageLightSrc?: string;
  onChange: (key: string, value: string) => void;
}

const DENSITY_PRESETS = [
  { value: '0.5x', label: '0.5x Minimal', desc: 'Light halo & subtle stars' },
  { value: '1.0x', label: '1.0x Standard', desc: 'Balanced default fidelity' },
  { value: '1.5x', label: '1.5x Dense', desc: 'Rich starry boundary' },
  { value: '2.0x', label: '2.0x Ultra', desc: 'Double contour micro-pixels' },
  { value: '3.0x', label: '3.0x Extreme', desc: 'Maximum crystalline particles' },
];

const SIZE_PRESETS = [
  { value: '0.6x', label: '0.6x Micro', desc: 'Ultra-fine starlight sparkles' },
  { value: '0.8x', label: '0.8x Compact', desc: 'Crisp delicate particles' },
  { value: '1.0x', label: '1.0x Standard', desc: 'Default pixel proportions' },
  { value: '1.3x', label: '1.3x Bold', desc: 'Enhanced pixel presence' },
  { value: '1.6x', label: '1.6x Retro', desc: 'Classic arcade chunkiness' },
];

const GLOW_PRESETS = [
  { value: '0.5x', label: '0.5x Soft', desc: 'Subtle ethereal bloom' },
  { value: '1.0x', label: '1.0x Standard', desc: 'Balanced neon vibrancy' },
  { value: '1.5x', label: '1.5x Bright', desc: 'Luminous cyber radiance' },
  { value: '2.0x', label: '2.0x Vivid', desc: 'Intense high-voltage aura' },
  { value: '3.0x', label: '3.0x Supernova', desc: 'Maximum glow saturation' },
];

const SPEED_PRESETS = [
  { value: '0.5x', label: '0.5x Zen Drift', desc: 'Ultra-slow floating arrival' },
  { value: '0.75x', label: '0.75x Cinematic', desc: 'Graceful magnetic docking' },
  { value: '1.0x', label: '1.0x Standard', desc: 'Variable organic trajectory' },
  { value: '1.5x', label: '1.5x Swift', desc: 'Brisk dynamic warp flight' },
  { value: '2.0x', label: '2.0x Hyperdrive', desc: 'Instant rapid convergence' },
];

const SPREAD_PRESETS = [
  { value: '1.0px', label: '1.0px Tight', desc: 'Locked directly to silhouette' },
  { value: '1.8px', label: '1.8px Natural', desc: 'Subtle organic deviation' },
  { value: '2.6px', label: '2.6px Balanced', desc: 'Gently spread ribbon with organic wave' },
  { value: '3.8px', label: '3.8px Wide', desc: 'Broad luminous contour band' },
  { value: '5.2px', label: '5.2px Expansive', desc: 'Wide ethereal atmospheric aura' },
];

const LIGHT_INTENSITY_PRESETS = [
  { value: '0.0', label: '0.0 Off', desc: 'No rim illumination' },
  { value: '0.25', label: '0.25 Soft', desc: 'Subtle photograph lighting' },
  { value: '0.38', label: '0.38 Standard', desc: 'Default luminous rim' },
  { value: '0.65', label: '0.65 Vivid', desc: 'Prominent neon radiance' },
  { value: '1.0', label: '1.0 Maximum', desc: 'Full cyber neon intensity' },
];

export function AboutPortraitParticleSettingsSection({
  particleDensity = '1.0x',
  particleSize = '1.0x',
  glowBrightness = '1.0x',
  flightSpeed = '1.0x',
  pathSpread = '2.6px',
  lightIntensity = '0.38',
  showPathGuide = false,
  imageDarkSrc = '/about/souravbarui-dark.png',
  imageLightSrc = '/about/souravbarui-light.png',
  onChange,
}: AboutPortraitParticleSettingsProps) {
  const [previewTheme, setPreviewTheme] = React.useState<'dark' | 'light'>('dark');
  const [guideEnabled, setGuideEnabled] = React.useState<boolean>(showPathGuide);

  React.useEffect(() => {
    setGuideEnabled(showPathGuide);
  }, [showPathGuide]);

  const handleToggleGuide = (enabled: boolean) => {
    setGuideEnabled(enabled);
    onChange('portrait_show_path_guide', enabled ? 'true' : 'false');
  };

  return (
    <div className="pt-5 border-t border-zinc-800 space-y-6">
      {/* Header Eyebrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-zinc-100">
            About Portrait Particle Engine (WebGL + WebAssembly C++)
          </h4>
        </div>
        <Badge variant="primary" className="text-[10px] font-mono">
          C++ WASM Engine
        </Badge>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">
        Configure the WebGL cyber portrait particle simulation, outer cosmic flight speed,
        micro-pixel sizing, and neon bloom. Client visitors never see the contour guide line by default.
        Use the inspector below to verify that new portrait images trace cleanly around hair and shoulders.
      </p>

      {/* Admin Interactive Portrait Inspector & Contour Live Preview */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">
                Silhouette Contour Inspection Preview
              </div>
              <div className="text-[11px] text-zinc-500">
                Live WebAssembly simulation running with current admin settings
              </div>
            </div>
          </div>

          {/* Theme switcher & Burst test button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewTheme('dark')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  previewTheme === 'dark'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Moon className="w-3 h-3 text-cyan-400" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('light')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  previewTheme === 'light'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-400" />
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Path Guide Toggle Switch */}
        <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <Switch
            checked={guideEnabled}
            onCheckedChange={handleToggleGuide}
            label={
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Route className="w-3.5 h-3.5 text-cyan-400" />
                Show Silhouette Contour Path Guide Line
              </span>
            }
            description="Overlays the continuous cyan-to-violet boundary line to verify exact Moore-Neighbor tracing on uploaded images. Public client visitors never see this line."
          />
        </div>

        {/* Canvas Sandbox */}
        <div className="flex justify-center py-2">
          <div
            className={`relative p-2 rounded-2xl border transition-colors max-w-[280px] w-full ${
              previewTheme === 'dark'
                ? 'bg-zinc-950 border-zinc-800 shadow-[0_0_24px_rgba(6,182,212,0.15)]'
                : 'bg-zinc-100 border-zinc-300 shadow-[0_0_24px_rgba(0,0,0,0.06)]'
            }`}
          >
            <WasmPortraitCanvas
              imageDarkSrc={imageDarkSrc}
              imageLightSrc={imageLightSrc}
              isDark={previewTheme === 'dark'}
              size={280}
              particleDensity={particleDensity}
              particleSize={particleSize}
              glowBrightness={glowBrightness}
              flightSpeed={flightSpeed}
              pathSpread={pathSpread}
              lightIntensity={parseFloat(lightIntensity) || 0.38}
              showPathGuide={guideEnabled}
              className="rounded-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* 1. Particle Quantity / Density Multiplier */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Particle Quantity / Density</span>
          </label>
          <span className="font-mono text-cyan-400 text-[11px] font-bold">{particleDensity}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {DENSITY_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('portrait_particle_density', preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                particleDensity === preset.value
                  ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Particle Size Multiplier */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Particle & Retro Star Size</span>
          </label>
          <span className="font-mono text-indigo-400 text-[11px] font-bold">{particleSize}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('portrait_particle_size', preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                particleSize === preset.value
                  ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Glow Brightness / Intensity */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Glow Brightness & Bloom</span>
          </label>
          <span className="font-mono text-amber-400 text-[11px] font-bold">{glowBrightness}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {GLOW_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('portrait_glow_brightness', preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                glowBrightness === preset.value
                  ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Movement & Flight Speed Multiplier */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Flight Movement Speed & Docking</span>
          </label>
          <span className="font-mono text-emerald-400 text-[11px] font-bold">{flightSpeed}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('portrait_flight_speed', preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                flightSpeed === preset.value
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Glow Path Spread & Organic Ribbon Width */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-indigo-400" />
            <span>Path Spread & Random Deviation</span>
          </label>
          <span className="font-mono text-indigo-400 text-[11px] font-bold">{pathSpread}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {SPREAD_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('portrait_path_spread', preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                pathSpread === preset.value
                  ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Dynamic Proximity Lighting Intensity */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Photograph Rim Proximity Lighting</span>
          </label>
          <span className="font-mono text-cyan-400 text-[11px] font-bold">{lightIntensity}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {LIGHT_INTENSITY_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('portrait_light_intensity', preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                lightIntensity === preset.value
                  ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Device Capability Auto-Adjustment Information Card */}
      <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 flex items-start gap-3">
        <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-zinc-200">
            Hardware-Adaptive Multiplier Scaling
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            The C++ engine measures client CPU concurrency (<span className="text-zinc-300 font-mono">navigator.hardwareConcurrency</span>),
            device memory, and screen density. On mobile devices or lower-core hardware, particle
            density and glow radius automatically scale down (0.75x–0.85x) to maintain strict 60 FPS,
            while high-end workstations get full unconstrained fidelity.
          </p>
        </div>
      </div>
    </div>
  );
}
