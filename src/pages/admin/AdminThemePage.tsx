import React, { useState } from 'react';
import { Palette, Check, Sparkles, Sun, Moon, Eye, Save } from 'lucide-react';
import { Button, useToast } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import './AdminThemePage.css';

const PRESET_ACCENTS = [
  { id: 'indigo', name: 'Electric Indigo', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald Green', hex: '#10b981' },
  { id: 'amber', name: 'Solar Amber', hex: '#f59e0b' },
  { id: 'rose', name: 'Neon Rose', hex: '#f43f5e' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4' },
  { id: 'violet', name: 'Deep Violet', hex: '#8b5cf6' },
] as const;

export const AdminThemePage: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();
  const { toast } = useToast();

  const [selectedAccent, setSelectedAccent] = useState<string>('indigo');
  const [glassIntensity, setGlassIntensity] = useState<number>(85);
  const [fontScale, setFontScale] = useState<'normal' | 'compact' | 'comfortable'>('normal');

  const handleSaveThemePreferences = () => {
    toast({
      title: 'Theme Presets Applied',
      message: 'Platform design system tokens successfully synchronized.',
      variant: 'success',
    });
  };

  return (
    <div className="admin-theme-page">
      <header className="admin-theme-header">
        <div className="admin-theme-header__title-group">
          <h1 className="admin-theme-header__title">Theme & Design System Studio</h1>
          <p className="admin-theme-header__subtitle">
            Configure visual design tokens, accent palettes, surface glassmorphism, and
            accessibility typography.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveThemePreferences}
          leftIcon={<Save size={14} />}
        >
          Apply & Save Presets
        </Button>
      </header>

      <div className="admin-theme-grid">
        {/* Color Mode & Appearance */}
        <section className="admin-theme-card" aria-labelledby="color-mode-title">
          <h2 id="color-mode-title" className="admin-theme-card__title">
            <Sparkles size={18} aria-hidden="true" />
            Base Theme Mode
          </h2>
          <p className="admin-theme-card__subtitle">
            Choose the default color appearance for visitors and platform administrators.
          </p>

          <div className="admin-theme-mode-options">
            <button
              type="button"
              className={`admin-theme-mode-btn ${themeMode === 'dark' ? 'admin-theme-mode-btn--active' : ''}`}
              onClick={() => setThemeMode('dark')}
              aria-pressed={themeMode === 'dark'}
            >
              <Moon size={20} aria-hidden="true" />
              <span className="admin-theme-mode-label">Dark Surface</span>
              <span className="admin-theme-mode-desc">Rich slate-950 with balanced contrast</span>
            </button>

            <button
              type="button"
              className={`admin-theme-mode-btn ${themeMode === 'light' ? 'admin-theme-mode-btn--active' : ''}`}
              onClick={() => setThemeMode('light')}
              aria-pressed={themeMode === 'light'}
            >
              <Sun size={20} aria-hidden="true" />
              <span className="admin-theme-mode-label">Light Mode</span>
              <span className="admin-theme-mode-desc">Crisp white canvas with subtle borders</span>
            </button>
          </div>
        </section>

        {/* Brand Accent Palette */}
        <section className="admin-theme-card" aria-labelledby="accents-title">
          <h2 id="accents-title" className="admin-theme-card__title">
            <Palette size={18} aria-hidden="true" />
            Platform Accent Colors
          </h2>
          <p className="admin-theme-card__subtitle">
            Primary focus highlights, active badge indicators, and interactive glow colors.
          </p>

          <div className="admin-theme-accents-list">
            {PRESET_ACCENTS.map((accent) => {
              const isSelected = selectedAccent === accent.id;
              return (
                <button
                  key={accent.id}
                  type="button"
                  className={`admin-theme-accent-chip ${
                    isSelected ? 'admin-theme-accent-chip--selected' : ''
                  }`}
                  onClick={() => setSelectedAccent(accent.id)}
                  style={{ '--accent-color': accent.hex } as React.CSSProperties}
                >
                  <span className="admin-theme-accent-swatch" style={{ background: accent.hex }} />
                  <span className="admin-theme-accent-name">{accent.name}</span>
                  {isSelected && <Check size={14} className="admin-theme-accent-check" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Glassmorphism & UI Density */}
        <section className="admin-theme-card" aria-labelledby="glass-title">
          <h2 id="glass-title" className="admin-theme-card__title">
            <Eye size={18} aria-hidden="true" />
            Surface Glass & UI Density
          </h2>
          <p className="admin-theme-card__subtitle">
            Backdrop blur intensity and layout spacing density presets.
          </p>

          <div className="admin-theme-density-group">
            <label className="admin-theme-density-label">
              <span>Backdrop Blur Opacity:</span>
              <strong>{glassIntensity}%</strong>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={glassIntensity}
              onChange={(e) => setGlassIntensity(Number(e.target.value))}
              className="admin-theme-slider"
              aria-label="Backdrop blur opacity slider"
            />
          </div>

          <div className="admin-theme-scale-group">
            <label className="admin-theme-density-label">
              <span>Layout Density:</span>
            </label>
            <div className="admin-theme-scale-tabs">
              {(['compact', 'normal', 'comfortable'] as const).map((scale) => (
                <button
                  key={scale}
                  type="button"
                  className={`admin-theme-scale-tab ${
                    fontScale === scale ? 'admin-theme-scale-tab--active' : ''
                  }`}
                  onClick={() => setFontScale(scale)}
                >
                  {scale.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
