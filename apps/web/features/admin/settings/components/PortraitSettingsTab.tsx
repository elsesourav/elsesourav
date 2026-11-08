'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { AboutPortraitParticleSettingsSection } from './AboutPortraitParticleSettingsSection';
import { Sparkles, Moon, Sun, User, Info, Check, RefreshCw } from 'lucide-react';

export interface PortraitSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function PortraitSettingsTab({ settings, onChange }: PortraitSettingsTabProps) {
  const darkUrl = settings['portrait_image_dark_url'] || '';
  const lightUrl = settings['portrait_image_light_url'] || '';
  const avatarUrl = settings['creator_avatar_url'] || '';

  const handleSyncDarkToAvatar = () => {
    if (darkUrl) {
      onChange('creator_avatar_url', darkUrl);
    } else {
      onChange('creator_avatar_url', '/about/souravbarui-dark.png');
    }
  };

  const handleSyncLightToAvatar = () => {
    if (lightUrl) {
      onChange('creator_avatar_url', lightUrl);
    } else {
      onChange('creator_avatar_url', '/about/souravbarui-light.png');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <Card className="p-5 sm:p-6 rounded-3xl border-zinc-800 bg-zinc-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Interactive Portrait Studio & Avatars
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Upload and manage your transparent Light Mode and Dark Mode portrait photographs.
              Calibrate WebGL WebAssembly particle physics, path spread, and preview real-time
              silhouette edge contour tracing in one unified studio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge variant="primary" className="text-[10px] font-mono">
              C++ WASM Engine
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-300">
              Moore-Neighbor Tracing
            </Badge>
          </div>
        </div>
      </Card>

      {/* 2. Dual-Theme Portrait Images Upload Cards */}
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
              onChange={(val) => onChange('portrait_image_dark_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-dark.png or select from media"
            />

            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Image Requirements & Edge Detection</span>
              </div>
              <p className="leading-relaxed">
                Use a <strong>1:1 square image</strong> (e.g. 512×512) with a completely{' '}
                <strong>transparent background (alpha = 0)</strong>. The C++ Moore-Neighbor tracer uses the
                transparent perimeter to calculate the smooth silhouette contour ribbon.
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
              onClick={() => onChange('portrait_image_dark_url', '/about/souravbarui-dark.png')}
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
              onChange={(val) => onChange('portrait_image_light_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-light.png or select from media"
            />

            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Image Requirements & Edge Detection</span>
              </div>
              <p className="leading-relaxed">
                Use a <strong>1:1 square image</strong> (e.g. 512×512) with a completely{' '}
                <strong>transparent background (alpha = 0)</strong>. Higher contrast against white
                delivers crisp celestial particle highlights and proximity lighting.
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
              onClick={() => onChange('portrait_image_light_url', '/about/souravbarui-light.png')}
              className="text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-xl h-7 px-2.5"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Reset to Default</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Global Creator Avatar Fallback Card */}
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

      {/* 4. Live Inspector & Simulation Controls Section */}
      <Card className="p-5 sm:p-6 rounded-3xl border-zinc-800 bg-zinc-900/40 space-y-6">
        <AboutPortraitParticleSettingsSection
          particleDensity={settings['portrait_particle_density'] || '1.0x'}
          particleSize={settings['portrait_particle_size'] || '1.0x'}
          glowBrightness={settings['portrait_glow_brightness'] || '1.0x'}
          flightSpeed={settings['portrait_flight_speed'] || '1.0x'}
          pathSpread={settings['portrait_path_spread'] || '2.6px'}
          lightIntensity={settings['portrait_light_intensity'] || '0.38'}
          showPathGuide={settings['portrait_show_path_guide'] === 'true'}
          imageDarkSrc={darkUrl || '/about/souravbarui-dark.png'}
          imageLightSrc={lightUrl || '/about/souravbarui-light.png'}
          onChange={onChange}
        />
      </Card>
    </div>
  );
}
