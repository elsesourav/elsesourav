'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@elsesourav/ui';
import type { User, UserPreferences } from '@elsesourav/types';
import { updatePreferencesAction } from '../actions/account-actions';
import { Sliders, Moon, Sun, Laptop, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface PreferencesFormProps {
  user: User;
}

export function PreferencesForm({ user }: PreferencesFormProps) {
  const { theme: activeClientTheme, setTheme: setClientTheme } = useTheme();
  const prefs = (user.preferences as UserPreferences) || {};

  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
    (prefs.theme as 'light' | 'dark' | 'system') || activeClientTheme || 'dark'
  );
  const [emailNotifications, setEmailNotifications] = React.useState(
    prefs.emailNotifications ?? true
  );
  const [reduceMotion, setReduceMotion] = React.useState(prefs.reduceMotion ?? false);
  const [compactView, setCompactView] = React.useState(prefs.compactView ?? false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setClientTheme(newTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await updatePreferencesAction({
        theme,
        emailNotifications,
        reduceMotion,
        compactView,
      });

      if (res.success) {
        setSuccess('Preferences saved successfully.');
      } else {
        setError(res.error || 'Failed to update preferences.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <CardTitle className="text-base text-foreground">Application Preferences</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Customize your interface theme, accessibility settings, and notification delivery options.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6 max-w-xl">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Theme Preference Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground">Interface Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'system', label: 'System', icon: Laptop },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id as 'light' | 'dark' | 'system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === id
                    ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Email Notifications */}
          <label className="flex items-center justify-between gap-4 cursor-pointer p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div>
              <div className="text-xs font-semibold text-foreground">Email Notifications</div>
              <div className="text-[11px] text-muted-foreground">
                Receive email alerts for support ticket replies and platform updates.
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Reduce Motion */}
          <label className="flex items-center justify-between gap-4 cursor-pointer p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div>
              <div className="text-xs font-semibold text-foreground">Reduce Motion</div>
              <div className="text-[11px] text-muted-foreground">
                Minimize UI animations across all interactive dashboards.
              </div>
            </div>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Compact View */}
          <label className="flex items-center justify-between gap-4 cursor-pointer p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div>
              <div className="text-xs font-semibold text-foreground">Compact Density</div>
              <div className="text-[11px] text-muted-foreground">
                Display tighter padding in data tables and application listings.
              </div>
            </div>
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
