'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { Card, CardDescription, CardHeader, CardTitle, Input, Button, IconButton } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
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
import { useUsernameAvailability } from '../hooks/use-username-availability';

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
  const {
    status: usernameStatus,
    error: usernameError,
    setError: setUsernameError,
  } = useUsernameAvailability(username, editUsernameValue, isEditingUsername);

  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [editBioValue, setEditBioValue] = React.useState(bio);
  const [isSavingBio, setIsSavingBio] = React.useState(false);
  const [bioError, setBioError] = React.useState<string | null>(null);

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
      if (!nameError)
        setNameError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
      if (!usernameError)
        setUsernameError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
      if (!bioError)
        setBioError(err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err;
    } finally {
      setIsSavingBio(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-card text-card-foreground border-border/50 sm:border-border shadow-xs sm:shadow-sm rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden transition-all">
        <CardHeader className="pb-2 sm:pb-2.5 md:pb-3 px-3 sm:px-5 pt-3 sm:pt-4 md:pt-5 border-b border-border/40 sm:border-border/60">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-foreground">
              Profile Information
            </CardTitle>
          </div>
          <CardDescription className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Update your public name, username handle, developer bio, and profile image.
          </CardDescription>
        </CardHeader>

        <div className="p-2.5 sm:p-4 md:p-5 pt-2 sm:pt-3 space-y-2 sm:space-y-3 md:space-y-3.5">
          <ProfileAvatarStudio
            user={user}
            displayName={displayName}
            photoUrl={photoUrl}
            onPhotoSaved={setPhotoUrl}
          />

          <div
            data-section="profile-name"
            className="p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-muted/15 border border-border/50 sm:border-border/80 space-y-1.5 sm:space-y-2.5 md:space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground">
                Full Name
              </span>
              {!isEditingName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setEditNameValue(displayName);
                    setIsEditingName(true);
                    setNameError(null);
                  }}
                  leftIcon={<Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground rounded-md sm:rounded-lg"
                >
                  Edit
                </Button>
              )}
            </div>

            {!isEditingName ? (
              <div className="p-2 sm:p-2.5 rounded-md sm:rounded-xl bg-background/60 border border-border/50 text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                {displayName || <span className="text-muted-foreground italic">Not set</span>}
              </div>
            ) : (
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-background border border-primary/30 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Edit Name</span>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameError(null);
                    }}
                    aria-label="Cancel editing name"
                    icon={<X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  />
                </div>

                <div className="flex gap-1.5 sm:gap-2 items-center">
                  <FloatingLabelInput
                    label="Display Name"
                    type="text"
                    value={editNameValue}
                    onChange={(val) => setEditNameValue(val)}
                    placeholder="e.g. Sourav Ghosh"
                    maxLength={60}
                    className="flex-1"
                  />
                  <LoadingButton
                    onAction={handleApplyName}
                    disabled={
                      isSavingName || !editNameValue.trim() || editNameValue === displayName
                    }
                    pendingLabel="Applying..."
                    successLabel="Applied"
                    errorLabel="Failed"
                    className="text-[10px] sm:text-xs font-semibold h-8 sm:h-9 md:h-10 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-5 shrink-0"
                  >
                    Save
                  </LoadingButton>
                </div>

                {nameError && (
                  <p className="text-[10px] sm:text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {nameError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            data-section="profile-username"
            className="p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-muted/15 border border-border/50 sm:border-border/80 space-y-1.5 sm:space-y-2.5 md:space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground">
                  Username Handle
                </span>
                <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground block mt-0.5">
                  Used for your public URL profile: /{username || 'username'} · You can customize anytime
                </span>
              </div>
              {!isEditingUsername && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setEditUsernameValue(username);
                    setIsEditingUsername(true);
                    setUsernameError(null);
                  }}
                  leftIcon={<Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground shrink-0 rounded-md sm:rounded-lg"
                >
                  Change
                </Button>
              )}
            </div>

            {!isEditingUsername ? (
              <div className="p-2 sm:p-2.5 rounded-md sm:rounded-xl bg-background/60 border border-border/50 text-[11px] sm:text-xs md:text-sm font-mono text-foreground flex items-center justify-between">
                <span>@{username || 'not_set'}</span>
                {username && (
                  <span className="text-[9px] sm:text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full font-sans font-medium">
                    Unique
                  </span>
                )}
              </div>
            ) : (
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-background border border-primary/30 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                  <label className="font-medium text-foreground">New Username Handle</label>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsernameError(null);
                    }}
                    aria-label="Cancel editing username"
                    icon={<X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  />
                </div>

                <div className="flex gap-1.5 sm:gap-2">
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
                      className="bg-background border-border text-[11px] sm:text-xs rounded-lg text-foreground pl-6 pr-8 h-7.5 sm:h-8 md:h-9 font-mono"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === 'available' && (
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                      )}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                        <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
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
                    className="h-7.5 sm:h-8 md:h-9 px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-semibold shrink-0 rounded-lg sm:rounded-xl"
                  >
                    Apply
                  </LoadingButton>
                </div>

                {usernameError && (
                  <p className="text-[10px] sm:text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {usernameError}
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-[10px] sm:text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> @{editUsernameValue} is available!
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            data-section="profile-bio"
            className="p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-muted/15 border border-border/50 sm:border-border/80 space-y-1.5 sm:space-y-2.5 md:space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground">
                Bio / About
              </span>
              {!isEditingBio && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setEditBioValue(bio);
                    setIsEditingBio(true);
                    setBioError(null);
                  }}
                  leftIcon={<Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground rounded-md sm:rounded-lg"
                >
                  Edit
                </Button>
              )}
            </div>

            {!isEditingBio ? (
              <div className="p-2 sm:p-2.5 rounded-md sm:rounded-xl bg-background/60 border border-border/50 text-[11px] sm:text-xs md:text-sm text-foreground leading-relaxed">
                {bio || <span className="text-muted-foreground italic">No bio provided yet.</span>}
              </div>
            ) : (
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-background border border-primary/30 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                  <label className="font-medium text-foreground">Short Bio (max 250 chars)</label>
                  <span className="text-[10px] sm:text-[11px] font-mono">{editBioValue.length}/250</span>
                </div>

                <textarea
                  value={editBioValue}
                  onChange={(e) => setEditBioValue(e.target.value)}
                  placeholder="Tell the community about yourself, your tech stack, or projects..."
                  maxLength={250}
                  rows={3}
                  autoFocus
                  className="w-full bg-background border border-border/70 rounded-lg p-2 sm:p-2.5 text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
                />

                <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                  {bioError ? (
                    <p className="text-[10px] sm:text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {bioError}
                    </p>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioError(null);
                      }}
                      className="h-6.5 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground rounded-md sm:rounded-lg"
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      onAction={handleApplyBio}
                      disabled={isSavingBio || editBioValue === bio}
                      pendingLabel="Applying..."
                      successLabel="Applied"
                      errorLabel="Failed"
                      className="h-6.5 sm:h-7 md:h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs font-semibold rounded-lg sm:rounded-xl"
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
