'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@elsesourav/ui';
import {
  AlertCircle,
  CheckCircle2,
  Crop,
  Loader2,
  Save,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { updateProfileFormAction } from '../actions/account-actions';
import { ImageCropperModal } from '@/components/media/ImageCropperModal';

interface ProfileFormProps {
  user: User;
}

const PRESET_AVATARS = [
  { id: 'cosmic', name: 'Cosmic Indigo', url: '/avatars/avatar-1.svg' },
  { id: 'emerald', name: 'Terminal Emerald', url: '/avatars/avatar-2.svg' },
  { id: 'amber', name: 'Solar Amber', url: '/avatars/avatar-3.svg' },
  { id: 'cyan', name: 'Systems Cyan', url: '/avatars/avatar-4.svg' },
  { id: 'rose', name: 'Visual Rose', url: '/avatars/avatar-5.svg' },
  { id: 'violet', name: 'Neural Violet', url: '/avatars/avatar-6.svg' },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [username, setUsername] = React.useState(user.username || '');
  const [bio, setBio] = React.useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = React.useState(user.photoUrl || PRESET_AVATARS[0]?.url || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'invalid' | 'taken'
  >('idle');
  const [usernameError, setUsernameError] = React.useState<string | null>(null);

  // Cropper Modal state
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);

  // Debounced server check for username
  React.useEffect(() => {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }

    if (trimmed === (user.username || '').toLowerCase()) {
      setUsernameStatus('available');
      setUsernameError(null);
      return;
    }

    if (trimmed.length < 4) {
      setUsernameStatus('invalid');
      setUsernameError('Username must be at least 4 characters long');
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameError('Username can only contain lowercase letters, numbers, hyphens, and underscores');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameError(null);
        } else {
          setUsernameStatus('taken');
          setUsernameError(data.error || 'Username is already taken');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === 'invalid' || usernameStatus === 'taken') {
      setError(usernameError || 'Please choose a valid and available username');
      return;
    }

    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await updateProfileFormAction({
        displayName: displayName.trim() || undefined,
        username: username.trim() ? username.trim().toLowerCase() : undefined,
        bio: bio.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
      });

      if (res.success) {
        setSuccess('Profile updated successfully.');
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="card-obsidian-glass">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          <CardTitle className="text-base text-zinc-100">Public Profile & Avatar</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Manage your public avatar, display name, unique username, and developer bio.
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

        {/* Avatar Section: Active Preview + 6 Preset Avatars + 1:1 Custom Cropper */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Choose Profile Avatar
            </label>
            <button
              type="button"
              onClick={() => setIsCropperOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" /> Upload & Crop (1:1)
            </button>
          </div>

          {/* Current Avatar & Presets Strip */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/40 overflow-hidden bg-zinc-900 shrink-0 shadow-lg shadow-indigo-950/50 flex items-center justify-center avatar-neon-concentric">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-indigo-400">
                  {displayName.slice(0, 2).toUpperCase() || 'ES'}
                </span>
              )}
            </div>

            <div className="space-y-1.5 flex-1 w-full">
              <p className="text-[11px] text-zinc-400 font-medium">Select a curated preset avatar:</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = photoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      title={preset.name}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-neon-glow-sm scale-105'
                          : 'border-zinc-800 hover:border-zinc-600 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Display Name <span className="text-rose-400">*</span>
          </label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={50}
            className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
          />
        </div>

        {/* Username with Live Debounced Check */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-300">Username</label>
            {usernameStatus === 'checking' && (
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> Checking...
              </span>
            )}
            {usernameStatus === 'available' && username.trim().length >= 4 && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Available
              </span>
            )}
            {usernameStatus === 'taken' && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3 h-3" /> Taken
              </span>
            )}
            {usernameStatus === 'invalid' && (
              <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                Min 4 chars
              </span>
            )}
          </div>

          <div className="flex items-center rounded-xl bg-zinc-950/60 border border-zinc-800 focus-within:border-indigo-500 px-3">
            <span className="text-xs text-zinc-500 select-none font-mono">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              maxLength={30}
              className="bg-transparent border-0 text-xs text-zinc-100 px-1 py-2.5 w-full focus:outline-none font-mono"
            />
          </div>

          {usernameError ? (
            <p className="text-[11px] text-rose-400">{usernameError}</p>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Minimum 4 characters (lowercase letters, numbers, hyphens, and underscores).
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief bio or developer statement..."
            rows={3}
            maxLength={250}
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
          <div className="flex justify-end text-[11px] text-zinc-500">{bio.length}/250 characters</div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSaving || usernameStatus === 'invalid' || usernameStatus === 'taken'}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Image Cropper Modal for Custom Avatars (1:1 Ratio Locked) */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        aspectRatio="1:1"
        lockRatio={true}
        title="Crop Profile Avatar (1:1 Square)"
        onCropComplete={(croppedData) => {
          setPhotoUrl(croppedData);
        }}
      />
    </Card>
  );
}
