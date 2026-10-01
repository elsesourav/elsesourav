'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { Card, CardDescription, CardHeader, CardTitle, Input } from '@elsesourav/ui';
import { LoadingButton } from '@/components/interior/LoadingButton';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  User as UserIcon,
  X,
} from 'lucide-react';
import { ProfileAvatarStudio } from './ProfileAvatarStudio';
import { updateProfileFormAction } from '../actions/account-actions';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [username, setUsername] = React.useState(user.username || '');
  const [bio, setBio] = React.useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = React.useState(user.photoUrl || '');

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editNameValue, setEditNameValue] = React.useState(displayName);
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);

  const [isEditingUsername, setIsEditingUsername] = React.useState(false);
  const [editUsernameValue, setEditUsernameValue] = React.useState(username);
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);
  const [usernameStatus, setUsernameStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'invalid' | 'taken'
  >('idle');
  const [usernameError, setUsernameError] = React.useState<string | null>(null);

  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [editBioValue, setEditBioValue] = React.useState(bio);
  const [isSavingBio, setIsSavingBio] = React.useState(false);
  const [bioError, setBioError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isEditingUsername) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }

    const trimmed = editUsernameValue.trim().toLowerCase();

    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }

    if (trimmed === (username || '').toLowerCase()) {
      setUsernameStatus('idle');
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
      setUsernameError('Only lowercase letters, numbers, hyphens, and underscores allowed');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/check-username?username=${encodeURIComponent(trimmed)}`
        );
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
    }, 450);

    return () => clearTimeout(timer);
  }, [editUsernameValue, isEditingUsername, username]);

  const handleApplyName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Name must be at least 2 characters long');
      throw new Error('Name must be at least 2 characters long');
    }
    if (trimmed.length > 60) {
      setNameError('Name cannot exceed 60 characters');
      throw new Error('Name cannot exceed 60 characters');
    }

    setIsSavingName(true);
    setNameError(null);

    try {
      const res = await updateProfileFormAction({ displayName: trimmed });
      if (res.success) {
        setDisplayName(trimmed);
        setIsEditingName(false);
      } else {
        setNameError(res.error || 'Failed to update name');
        throw new Error(res.error || 'Failed to update name');
      }
    } catch (err) {
      if (!nameError) setNameError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
    } finally {
      setIsSavingName(false);
    }
  };

  const handleApplyUsername = async () => {
    const trimmed = editUsernameValue.trim().toLowerCase();
    if (trimmed.length < 4) {
      setUsernameError('Username must be at least 4 characters long');
      throw new Error('Username must be at least 4 characters long');
    }
    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
      setUsernameError('Only lowercase letters, numbers, hyphens, and underscores allowed');
      throw new Error('Only lowercase letters, numbers, hyphens, and underscores allowed');
    }

    setIsSavingUsername(true);
    setUsernameError(null);

    try {
      const res = await updateProfileFormAction({ username: trimmed });
      if (res.success) {
        setUsername(trimmed);
        setIsEditingUsername(false);
      } else {
        setUsernameError(res.error || 'Failed to update username');
        throw new Error(res.error || 'Failed to update username');
      }
    } catch (err) {
      if (!usernameError) setUsernameError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleApplyBio = async () => {
    const trimmed = editBioValue.trim();
    if (trimmed.length > 250) {
      setBioError('Bio cannot exceed 250 characters');
      throw new Error('Bio cannot exceed 250 characters');
    }

    setIsSavingBio(true);
    setBioError(null);

    try {
      const res = await updateProfileFormAction({ bio: trimmed });
      if (res.success) {
        setBio(trimmed);
        setIsEditingBio(false);
      } else {
        setBioError(res.error || 'Failed to update bio');
        throw new Error(res.error || 'Failed to update bio');
      }
    } catch (err) {
      if (!bioError) setBioError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
    } finally {
      setIsSavingBio(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Profile Information
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Update your public name, username handle, developer bio, and profile image.
          </CardDescription>
        </CardHeader>

        <div className="p-4 sm:p-5 pt-1 space-y-3">
          <ProfileAvatarStudio
            user={user}
            displayName={displayName}
            photoUrl={photoUrl}
            onPhotoSaved={setPhotoUrl}
          />

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-3 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">Full Name</span>
              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => {
                    setEditNameValue(displayName);
                    setIsEditingName(true);
                    setNameError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {!isEditingName ? (
              <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-xs font-medium text-foreground">
                {displayName || <span className="text-muted-foreground italic">Not set</span>}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-background border border-primary/30 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label className="font-medium text-foreground">Enter Display Name</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameError(null);
                    }}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    placeholder="e.g. Sourav Ghosh"
                    maxLength={60}
                    autoFocus
                    className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                  />
                  <LoadingButton
                    onAction={handleApplyName}
                    disabled={isSavingName || !editNameValue.trim() || editNameValue === displayName}
                    pendingLabel="Applying..."
                    successLabel="Applied"
                    errorLabel="Failed"
                    className="h-8 sm:h-9 px-3.5 text-xs font-semibold shrink-0"
                  >
                    Apply
                  </LoadingButton>
                </div>

                {nameError && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {nameError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-3 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-foreground">Username Handle</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Used for your public URL profile: /{username || 'username'}
                </span>
              </div>
              {!isEditingUsername && (
                <button
                  type="button"
                  onClick={() => {
                    setEditUsernameValue(username);
                    setIsEditingUsername(true);
                    setUsernameError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {!isEditingUsername ? (
              <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-xs font-mono text-foreground flex items-center justify-between">
                <span>@{username || 'not_set'}</span>
                {username && (
                  <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-sans font-medium">
                    Unique
                  </span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-background border border-primary/30 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label className="font-medium text-foreground">New Username Handle</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsernameError(null);
                    }}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground pointer-events-none">
                      @
                    </span>
                    <Input
                      type="text"
                      value={editUsernameValue}
                      onChange={(e) => setEditUsernameValue(e.target.value)}
                      placeholder="username"
                      maxLength={30}
                      autoFocus
                      className="bg-background border-border text-xs rounded-lg text-foreground pl-6 pr-8 h-8 sm:h-9 font-mono"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === 'available' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                    </div>
                  </div>

                  <LoadingButton
                    onAction={handleApplyUsername}
                    disabled={
                      isSavingUsername ||
                      !editUsernameValue.trim() ||
                      editUsernameValue === username ||
                      usernameStatus === 'taken' ||
                      usernameStatus === 'invalid'
                    }
                    pendingLabel="Applying..."
                    successLabel="Applied"
                    errorLabel="Failed"
                    className="h-8 sm:h-9 px-3.5 text-xs font-semibold shrink-0"
                  >
                    Apply
                  </LoadingButton>
                </div>

                {usernameError && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {usernameError}
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> @{editUsernameValue} is available!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-3 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">Bio / About</span>
              {!isEditingBio && (
                <button
                  type="button"
                  onClick={() => {
                    setEditBioValue(bio);
                    setIsEditingBio(true);
                    setBioError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {!isEditingBio ? (
              <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-xs text-foreground leading-relaxed">
                {bio || (
                  <span className="text-muted-foreground italic">No bio provided yet.</span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-background border border-primary/30 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label className="font-medium text-foreground">Short Bio (max 250 chars)</label>
                  <span className="text-[11px] font-mono">
                    {editBioValue.length}/250
                  </span>
                </div>

                <textarea
                  value={editBioValue}
                  onChange={(e) => setEditBioValue(e.target.value)}
                  placeholder="Tell the community about yourself, your tech stack, or projects..."
                  maxLength={250}
                  rows={3}
                  autoFocus
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
                />

                <div className="flex items-center justify-between pt-1">
                  {bioError ? (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {bioError}
                    </p>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioError(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <LoadingButton
                      onAction={handleApplyBio}
                      disabled={isSavingBio || editBioValue === bio}
                      pendingLabel="Applying..."
                      successLabel="Applied"
                      errorLabel="Failed"
                      className="h-8 px-3.5 text-xs font-semibold"
                    >
                      Apply
                    </LoadingButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
