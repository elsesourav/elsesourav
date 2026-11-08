'use client';

import * as React from 'react';
import { Card, Badge, Input, Button } from '@elsesourav/ui';
import {
  Sparkles,
  Gauge,
  Zap,
  CheckCircle2,
  Info,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import type { EffectsLevel } from '@elsesourav/types';
import { adminUploadImageFileAction } from '../../media/actions/admin-media-actions';

export interface AppearanceSettingsTabProps {
  effectsLevel: string;
  portraitLightIntensity?: string;
  portraitImageDarkUrl?: string;
  portraitImageLightUrl?: string;
  onChange: (level: EffectsLevel) => void;
  onPortraitLightChange?: (val: string) => void;
  onPortraitImageDarkChange?: (val: string) => void;
  onPortraitImageLightChange?: (val: string) => void;
}

interface FidelityOption {
  value: EffectsLevel;
  title: string;
  badge: string;
  badgeVariant: 'primary' | 'success' | 'warning' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  specs: {
    backdropBlur: string;
    shadows: string;
    ambientGlow: string;
    scrollImpact: string;
  };
}

const FIDELITY_OPTIONS: FidelityOption[] = [
  {
    value: 'high',
    title: 'High Fidelity (Maximum Visual Depth)',
    badge: 'Current / Default',
    badgeVariant: 'primary',
    icon: Sparkles,
    description:
      'Full glassmorphism, multi-layer backdrop blurs (up to 40px), deep elevation shadows, cosmic ambient glow orbs, and neon atmospheric highlights. Delivers the richest visual depth.',
    specs: {
      backdropBlur: 'Full Multi-Layer (up to 40px)',
      shadows: 'Deep 3D elevation + neon glow cards',
      ambientGlow: 'Full dynamic ambient orbs + drift animation',
      scrollImpact: 'GPU intensive on low-end devices / integrated GPUs',
    },
  },
  {
    value: 'medium',
    title: 'Medium Fidelity (Balanced & Responsive)',
    badge: 'Balanced 60 FPS',
    badgeVariant: 'info',
    icon: Gauge,
    description:
      'Subdued backdrop blurs (clamped to 4px), lightweight single-layer elevation shadows, and static ambient glow. Substantially reduces compositor repaints while preserving a clean glass aesthetic.',
    specs: {
      backdropBlur: 'Clamped light blur (4px max)',
      shadows: 'Subdued single-layer soft shadows (4–6px)',
      ambientGlow: 'Dimmed static glow (animations paused)',
      scrollImpact: 'Smooth 60 FPS on mid-range laptops and tablets',
    },
  },
  {
    value: 'low',
    title: 'Low Fidelity / Maximum Performance',
    badge: 'Zero Scroll Lag',
    badgeVariant: 'success',
    icon: Zap,
    description:
      'Completely disables expensive backdrop-filter shaders, flattens heavy box-shadows, removes offscreen blurred gradient orbs, and solidifies card backgrounds. Guaranteed buttery-smooth scrolling.',
    specs: {
      backdropBlur: 'Disabled (backdrop-filter: none)',
      shadows: 'Flat (crisp 1px hairline borders)',
      ambientGlow: 'Disabled (zero offscreen GPU convolution)',
      scrollImpact: 'Maximum FPS — butter-smooth scrolling everywhere',
    },
  },
];

export function AppearanceSettingsTab({
  effectsLevel = 'high',
  portraitLightIntensity = '0.38',
  portraitImageDarkUrl = '',
  portraitImageLightUrl = '',
  onChange,
  onPortraitLightChange,
  onPortraitImageDarkChange,
  onPortraitImageLightChange,
}: AppearanceSettingsTabProps) {
  const currentLevel: EffectsLevel =
    effectsLevel === 'low' || effectsLevel === 'medium' || effectsLevel === 'high'
      ? effectsLevel
      : 'high';

  const currentLight = parseFloat(portraitLightIntensity) || 0.38;

  const [uploadingDark, setUploadingDark] = React.useState(false);
  const [uploadingLight, setUploadingLight] = React.useState(false);
  const darkInputRef = React.useRef<HTMLInputElement>(null);
  const lightInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, mode: 'dark' | 'light') => {
    const isDarkUpload = mode === 'dark';
    if (isDarkUpload) setUploadingDark(true);
    else setUploadingLight(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'about');

      const res = await adminUploadImageFileAction(formData);
      if (res.success && res.url) {
        let finalUrl = res.url;
        // Inject 1:1 square auto-crop with face gravity for Cloudinary URLs
        if (finalUrl.includes('cloudinary.com') && !finalUrl.includes('c_fill,ar_1:1')) {
          finalUrl = finalUrl.replace(
            '/image/upload/',
            '/image/upload/c_fill,ar_1:1,w_512,h_512,g_face,q_auto,f_auto/'
          );
        }
        if (isDarkUpload) {
          onPortraitImageDarkChange?.(finalUrl);
        } else {
          onPortraitImageLightChange?.(finalUrl);
        }
      } else {
        alert(res.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading portrait image');
    } finally {
      if (isDarkUpload) setUploadingDark(false);
      else setUploadingLight(false);
    }
  };

  const handleSelect = (val: EffectsLevel) => {
    onChange(val);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-effects', val);
      try {
        localStorage.setItem('effects_level', val);
      } catch {
        // fallback
      }
    }
  };

  const LIGHT_PRESETS = [
    { label: 'Off', val: '0.0', desc: 'Natural photo pixels, no neon rim lighting' },
    { label: 'Subtle', val: '0.22', desc: 'Cinematic soft edges, very delicate glow' },
    { label: 'Balanced (Recommended)', val: '0.38', desc: 'Refined neon rim light with authentic skin protection' },
    { label: 'Vibrant', val: '0.65', desc: 'High cyber glow on shoulders and silhouette' },
    { label: 'Cyberpunk', val: '0.85', desc: 'Maximized electric neon illumination' },
  ];

  return (
    <Card className="p-5 sm:p-6 space-y-6 rounded-3xl border-zinc-800 bg-zinc-900/40">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Visual Effects & Scroll Performance Fidelity
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
          Configure the platform-wide visual rendering fidelity. This canonical backend setting
          controls backdrop blur filters, box-shadow convolutions, and ambient gradient glow orbs
          across all public and authenticated pages to optimize scrolling performance.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Visual fidelity options"
        className="grid grid-cols-1 gap-4"
      >
        {FIDELITY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = currentLevel === option.value;

          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleSelect(option.value);
                }
              }}
              className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-500/80 bg-indigo-950/20 shadow-md shadow-indigo-500/5'
                  : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 p-2 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-zinc-800/60 text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-semibold text-white">{option.title}</span>
                      <Badge variant={option.badgeVariant} size="sm">
                        {option.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{option.description}</p>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/50'
                        : 'border-zinc-700 bg-zinc-800/50 group-hover:border-zinc-600'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="block text-zinc-500 font-medium">Backdrop Blur:</span>
                  <span className="text-zinc-300 font-mono">{option.specs.backdropBlur}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-medium">Shadow Convolutions:</span>
                  <span className="text-zinc-300 font-mono">{option.specs.shadows}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-medium">Ambient Atmosphere:</span>
                  <span className="text-zinc-300 font-mono">{option.specs.ambientGlow}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-medium">Scroll Speed:</span>
                  <span
                    className={
                      option.value === 'low'
                        ? 'text-emerald-400 font-medium'
                        : option.value === 'medium'
                          ? 'text-sky-400 font-medium'
                          : 'text-amber-400 font-medium'
                    }
                  >
                    {option.specs.scrollImpact}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cyber Portrait Neon Lighting Controller */}
      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                Interactive Cyber Portrait Light Intensity
              </h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Control the neon rim light and proximity glow on the About page interactive cyber portrait.
              Prevents harsh burnout while preserving natural photographic skin tones.
            </p>
          </div>
          <Badge variant="primary" className="font-mono text-xs">
            {Math.round(currentLight * 100)}%
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {LIGHT_PRESETS.map((p) => {
            const isMatch = Math.abs(currentLight - parseFloat(p.val)) < 0.08;
            return (
              <button
                key={p.val}
                type="button"
                onClick={() => onPortraitLightChange?.(p.val)}
                className={`p-3 rounded-2xl text-left border transition-all duration-200 ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm ring-1 ring-cyan-500/50'
                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{p.label}</span>
                  {isMatch && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cyber Portrait Images (1:1 Aspect Ratio) */}
      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                Interactive Cyber Portrait Images (1:1 Ratio)
              </h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Control the dark and light mode portrait images rendered by the WebAssembly C++ &amp; WebGL engine.
              Uploads automatically enforce a square 1:1 aspect ratio with Cloudinary face-detection auto-crop.
            </p>
          </div>
          <Badge variant="primary" className="font-mono text-xs">
            1:1 Square Auto-Crop
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Portrait */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">Dark Mode Image (1:1)</span>
              <span className="text-[10px] text-zinc-500 font-mono">WebP / PNG</span>
            </div>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portraitImageDarkUrl || '/about/souravbarui-dark-512.webp'}
                alt="Dark portrait preview"
                className="w-14 h-14 rounded-xl border border-zinc-700/80 bg-zinc-900 object-cover shrink-0"
              />
              <div className="flex-1 space-y-1 min-w-0">
                <input
                  type="text"
                  value={portraitImageDarkUrl || ''}
                  onChange={(e) => onPortraitImageDarkChange?.(e.target.value)}
                  placeholder="/about/souravbarui-dark-512.webp or Cloudinary URL"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    ref={darkInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, 'dark');
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingDark}
                    onClick={() => darkInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/50 transition-colors disabled:opacity-50"
                  >
                    {uploadingDark ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Upload 1:1
                  </button>
                  <button
                    type="button"
                    onClick={() => onPortraitImageDarkChange?.('/about/souravbarui-dark-512.webp')}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Light Mode Portrait */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">Light Mode Image (1:1)</span>
              <span className="text-[10px] text-zinc-500 font-mono">WebP / PNG</span>
            </div>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portraitImageLightUrl || '/about/souravbarui-light-512.webp'}
                alt="Light portrait preview"
                className="w-14 h-14 rounded-xl border border-zinc-700/80 bg-zinc-900 object-cover shrink-0"
              />
              <div className="flex-1 space-y-1 min-w-0">
                <input
                  type="text"
                  value={portraitImageLightUrl || ''}
                  onChange={(e) => onPortraitImageLightChange?.(e.target.value)}
                  placeholder="/about/souravbarui-light-512.webp or Cloudinary URL"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    ref={lightInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, 'light');
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingLight}
                    onClick={() => lightInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                  >
                    {uploadingLight ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Upload 1:1
                  </button>
                  <button
                    type="button"
                    onClick={() => onPortraitImageLightChange?.('/about/souravbarui-light-512.webp')}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-300">How This Setting Works</p>
          <p>
            When you save changes here, this setting updates the database{' '}
            <code className="text-indigo-300 bg-indigo-950/40 px-1 py-0.5 rounded font-mono">
              SiteSetting[effects_level]
            </code>
            . The server injects the chosen mode directly into the root{' '}
            <code className="text-indigo-300 bg-indigo-950/40 px-1 py-0.5 rounded font-mono">
              &lt;html data-effects=&quot;{currentLevel}&quot;&gt;
            </code>{' '}
            attribute on page load. All backdrop filters, box-shadows, and background atmosphere
            layers adjust globally without requiring client-side re-renders.
          </p>
        </div>
      </div>
    </Card>
  );
}
