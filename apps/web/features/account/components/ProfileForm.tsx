'use client';

import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import type { User } from '@elsesourav/types';
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '@elsesourav/ui';
import { AlertCircle, CheckCircle2, Loader2, Save, User as UserIcon } from 'lucide-react';
import * as React from 'react';
import { updateProfileFormAction } from '../actions/account-actions';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [username, setUsername] = React.useState(user.username || '');
  const [bio, setBio] = React.useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = React.useState(user.photoUrl || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          <CardTitle className="text-base text-zinc-100">Public Profile</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Manage your public identity, display name, username, and bio across ElseSourav.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5 max-w-xl">
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

        {/* Profile Photo & Avatar with Library Picker */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 space-y-2">
          <ImageInputWithLibrary
            label="Profile Photo & Avatar"
            value={photoUrl}
            onChange={setPhotoUrl}
            folder="users"
            defaultCategory="users"
            previewShape="circle"
            placeholder="Avatar image URL or upload/select from library"
          />
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

        {/* Username */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Username</label>
          <div className="flex items-center rounded-xl bg-zinc-950/60 border border-zinc-800 focus-within:border-indigo-500 px-3">
            <span className="text-xs text-zinc-500 select-none">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              maxLength={30}
              className="bg-transparent border-0 text-xs text-zinc-100 px-1 py-2.5 w-full focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-zinc-500">
            Unique handle used for public URLs and developer attribution.
          </p>
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
          <div className="flex justify-end text-[11px] text-zinc-500">
            {bio.length}/250 characters
          </div>
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
    </Card>
  );
}
