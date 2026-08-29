'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@elsesourav/ui';
import type { User, UserPreferences } from '@elsesourav/types';
import { updatePreferencesAction } from '../actions/account-actions';
import { Sliders, Moon, Sun, Laptop, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PreferencesFormProps {
  user: User;
}

export function PreferencesForm({ user }: PreferencesFormProps) {
  const prefs = (user.preferences as UserPreferences) || {};
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
    (prefs.theme as 'light' | 'dark' | 'system') || 'dark'
  );
  const [emailNotifications, setEmailNotifications] = React.useState(
    prefs.emailNotifications ?? true
  );
  const [reduceMotion, setReduceMotion] = React.useState(prefs.reduceMotion ?? false);
  const [compactView, setCompactView] = React.useState(prefs.compactView ?? false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
    <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <CardTitle className="text-base text-zinc-100">Application Preferences</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Customize your interface theme, accessibility settings, and notification delivery options.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6 max-w-xl">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Theme Preference Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">Interface Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'system', label: 'System', icon: Laptop },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id as 'light' | 'dark' | 'system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === id
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-4 pt-2 border-t border-zinc-800/60">
          {/* Email Notifications */}
          <label className="flex items-center justify-between gap-4 cursor-pointer p-3 rounded-xl hover:bg-zinc-900/60 transition-colors">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Email Notifications</div>
              <div className="text-[11px] text-zinc-400">
                Receive email alerts for support ticket replies and platform updates.
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>

          {/* Reduce Motion */}
          <label className="flex items-center justify-between gap-4 cursor-pointer p-3 rounded-xl hover:bg-zinc-900/60 transition-colors">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Reduce Motion</div>
              <div className="text-[11px] text-zinc-400">
                Minimize UI animations across all interactive dashboards.
              </div>
            </div>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>

          {/* Compact View */}
          <label className="flex items-center justify-between gap-4 cursor-pointer p-3 rounded-xl hover:bg-zinc-900/60 transition-colors">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Compact Density</div>
              <div className="text-[11px] text-zinc-400">
                Display tighter padding in data tables and application listings.
              </div>
            </div>
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20"
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
