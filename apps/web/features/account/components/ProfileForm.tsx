'use client';

import { ImageCropperModal } from '@/components/media/ImageCropperModal';
import type { User } from '@elsesourav/types';
import { Card, CardDescription, CardHeader, CardTitle, Input, UserAvatar } from '@elsesourav/ui';
import { LoadingButton } from '@/components/interior/LoadingButton';
import { SnapCarousel } from '@/components/interior/SnapCarousel';
import { BlurUpImage } from '@/components/interior/BlurUpImage';
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Sparkles,
  UploadCloud,
  User as UserIcon,
  X,
} from 'lucide-react';
import * as React from 'react';
import { updateProfileFormAction } from '../actions/account-actions';

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

  // Profile Image State (Draft preview vs committed photoUrl)
  const [photoUrl, setPhotoUrl] = React.useState(user.photoUrl || '');
  const [draftPhotoUrl, setDraftPhotoUrl] = React.useState(user.photoUrl || '');
  const [isSavingPhoto, setIsSavingPhoto] = React.useState(false);
  const [photoSaveSuccess, setPhotoSaveSuccess] = React.useState(false);
  const [photoSaveError, setPhotoSaveError] = React.useState<string | null>(null);

  const hasPhotoChanged = draftPhotoUrl !== (photoUrl || '');

  // Edit Modes for individual fields
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


  // Cropper Modal & Drag-and-Drop state
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [droppedImageUrl, setDroppedImageUrl] = React.useState<string | undefined>(undefined);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Debounced check for username when editing
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

  // Handle Full Name Save
  const handleApplyName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Name must be at least 2 characters long');
      return;
    }
    if (trimmed.length > 60) {
      setNameError('Name cannot exceed 60 characters');
      return;
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
    if (!trimmed || trimmed.length < 4) {
      setUsernameError('Username must be at least 4 characters long');
      throw new Error('Username must be at least 4 characters long');
    }
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      throw new Error('Username is not available');
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

  const handleSelectPresetOrDraft = (newUrl: string) => {
    setDraftPhotoUrl(newUrl);
    setPhotoSaveSuccess(false);
    setPhotoSaveError(null);
  };

  const handleSavePhoto = async () => {
    setIsSavingPhoto(true);
    setPhotoSaveError(null);
    setPhotoSaveSuccess(false);

    try {
      const res = await updateProfileFormAction({ photoUrl: draftPhotoUrl });
      if (res.success) {
        setPhotoUrl(draftPhotoUrl);
        setPhotoSaveSuccess(true);
        setTimeout(() => setPhotoSaveSuccess(false), 3000);
      } else {
        setPhotoSaveError(res.error || 'Failed to update profile image');
        throw new Error(res.error || 'Failed to update profile image');
      }
    } catch (err) {
      if (!photoSaveError) {
        setPhotoSaveError(err instanceof Error ? err.message : 'An unexpected error occurred while saving profile image');
      }
      throw err;
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Reset Draft Image back to currently saved image
  const handleResetPhoto = () => {
    setDraftPhotoUrl(photoUrl);
    setPhotoSaveError(null);
  };

  // Handle Drag & Drop File Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setDroppedImageUrl(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDroppedImageUrl(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
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
          {/* 1. Studio-Quality Profile Image Section */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/80 space-y-3.5">
            {/* Header: Title + Status + Action Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Profile Image</span>
                {hasPhotoChanged && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                    Unsaved changes
                  </span>
                )}
              </div>

              {/* Status & Save Button */}
              <div className="flex items-center gap-2">
                {photoSaveSuccess && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                    <Check className="w-3 h-3" /> Image saved
                  </span>
                )}
                {photoSaveError && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium animate-in fade-in">
                    <AlertCircle className="w-3 h-3" /> {photoSaveError}
                  </span>
                )}

                {hasPhotoChanged && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    disabled={isSavingPhoto}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                    title="Reset to current saved image"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                <LoadingButton
                  onAction={handleSavePhoto}
                  disabled={!hasPhotoChanged || isSavingPhoto}
                  pendingLabel="Saving..."
                  successLabel="Saved"
                  errorLabel="Failed"
                  className="h-8 px-3 text-xs font-semibold"
                >
                  Save Image
                </LoadingButton>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-[25%] overflow-hidden border-2 border-primary/30 bg-muted/60 shadow-md shrink-0 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg flex items-center justify-center"
                title="Click to upload new photo"
              >
                {draftPhotoUrl ? (
                  <BlurUpImage
                    src={draftPhotoUrl}
                    alt={displayName || 'Profile preview'}
                    width={160}
                    height={160}
                    radius={36}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <UserAvatar
                    src={null}
                    name={displayName}
                    identifier={user.id || user.email}
                    size="xl"
                    className="w-full h-full rounded-2xl sm:rounded-3xl text-3xl md:text-4xl font-bold"
                  />
                )}

                {/* Hover camera upload overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 p-2 text-center">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-semibold">Change Photo</span>
                </div>
              </div>

              {/* Right Panel: Upload Zone (Top) + Presets Strip (Bottom) */}
              <div className="flex-1 w-full flex flex-col justify-between gap-3 min-w-0">
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-xl sm:rounded-2xl border border-dashed flex items-center gap-3.5 p-3 sm:p-3.5 text-left cursor-pointer transition-all duration-200 group ${
                    isDraggingOver
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-border/90 hover:border-primary/60 hover:bg-primary/5 bg-background/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Drop an image here, or <span className="text-primary underline">browse</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      Square JPG, PNG, WEBP • Max 5MB (1:1 recommended)
                    </p>
                  </div>
                </div>

                {/* Preset Avatars Row */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Or select a preset:
                  </div>

                  <div className="w-full overflow-hidden">
                    <SnapCarousel label="Preset avatars" gap={8} className="w-full">
                      <button
                        type="button"
                        onClick={() => handleSelectPresetOrDraft('')}
                        title="Default Monogram"
                        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 ${
                          !draftPhotoUrl
                            ? 'border-primary ring-2 ring-primary/50 shadow-md scale-105 font-bold'
                            : 'border-border hover:border-foreground/40 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <UserAvatar
                          src={null}
                          name={displayName}
                          identifier={user.id || user.email}
                          size="sm"
                          className="w-full h-full rounded-none text-[10px]"
                        />
                      </button>

                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = draftPhotoUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPresetOrDraft(preset.url)}
                            title={preset.name}
                            className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
                              isSelected
                                ? 'border-primary ring-2 ring-primary/50 shadow-md scale-105'
                                : 'border-border hover:border-foreground/40 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </SnapCarousel>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Full Name (Display Name) Field with Inline Edit */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Display Name <span className="text-rose-500">*</span>
              </label>

              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => {
                    setEditNameValue(displayName);
                    setNameError(null);
                    setIsEditingName(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    maxLength={60}
                    className="bg-background border-border text-xs rounded-lg text-foreground flex-1 h-8 sm:h-9"
                  />
                  <LoadingButton
                    onAction={handleApplyName}
                    disabled={isSavingName}
                    pendingLabel="Applying..."
                    successLabel="Applied"
                    errorLabel="Failed"
                    className="h-8 sm:h-9 px-3 text-xs font-semibold shrink-0"
                  >
                    Apply
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameError(null);
                    }}
                    className="inline-flex items-center p-1.5 h-8 sm:h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background border border-border transition-colors cursor-pointer shrink-0"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {nameError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">{nameError}</p>
                )}
              </div>
            ) : (
              <div className="text-xs font-medium text-foreground py-0.5">
                {displayName || <span className="text-muted-foreground italic">Not set</span>}
              </div>
            )}
          </div>

          {/* 3. Username Handle Field with Inline Edit */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Username</label>

              {!isEditingUsername ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditUsernameValue(username);
                    setUsernameError(null);
                    setIsEditingUsername(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {usernameStatus === 'checking' && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" /> Checking...
                    </span>
                  )}
                  {usernameStatus === 'available' && editUsernameValue.trim().length >= 4 && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3" /> Taken
                    </span>
                  )}
                </div>
              )}
            </div>

            {isEditingUsername ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 h-8 sm:h-9 rounded-lg bg-background border border-border focus-within:border-primary px-2.5">
                    <span className="text-xs text-muted-foreground select-none font-mono">@</span>
                    <input
                      type="text"
                      value={editUsernameValue}
                      onChange={(e) => setEditUsernameValue(e.target.value.toLowerCase())}
                      placeholder="username"
                      autoFocus
                      maxLength={30}
                      className="bg-transparent border-0 text-xs text-foreground px-1 w-full focus:outline-none font-mono"
                    />
                  </div>

                  <LoadingButton
                    onAction={handleApplyUsername}
                    disabled={
                      isSavingUsername ||
                      usernameStatus === 'invalid' ||
                      usernameStatus === 'taken' ||
                      usernameStatus === 'checking'
                    }
                    pendingLabel="Applying..."
                    successLabel="Applied"
                    errorLabel="Failed"
                    className="h-8 sm:h-9 px-3 text-xs font-semibold shrink-0"
                  >
                    Apply
                  </LoadingButton>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsernameError(null);
                    }}
                    className="inline-flex items-center p-1.5 h-8 sm:h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background border border-border transition-colors cursor-pointer shrink-0"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {usernameError ? (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">{usernameError}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Minimum 4 characters (lowercase letters, numbers, hyphens, and underscores).
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xs font-mono text-primary font-medium py-0.5">
                {username ? (
                  `@${username}`
                ) : (
                  <span className="text-muted-foreground italic font-sans">No handle set</span>
                )}
              </div>
            )}
          </div>

          {/* 4. Bio Field with Inline Edit */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Bio</label>

              {!isEditingBio && (
                <button
                  type="button"
                  onClick={() => {
                    setEditBioValue(bio);
                    setBioError(null);
                    setIsEditingBio(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-1.5">
                <textarea
                  value={editBioValue}
                  onChange={(e) => setEditBioValue(e.target.value)}
                  placeholder="Brief developer bio or summary..."
                  autoFocus
                  rows={2}
                  maxLength={250}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-0.5">
                  <div className="text-[10px] text-muted-foreground">
                    {editBioValue.length}/250 characters
                  </div>

                  <div className="flex items-center gap-1.5">
                    <LoadingButton
                      onAction={handleApplyBio}
                      disabled={isSavingBio}
                      pendingLabel="Applying..."
                      successLabel="Applied"
                      errorLabel="Failed"
                      className="h-7 px-3 text-xs font-semibold shrink-0"
                    >
                      Apply
                    </LoadingButton>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioError(null);
                      }}
                      className="inline-flex items-center px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background border border-border text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {bioError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">{bioError}</p>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground leading-relaxed py-0.5">
                {bio || <span className="italic">No bio added yet.</span>}
              </div>
            )}
          </div>

        </div>
      </Card>

      {/* Image Adjuster Modal for Custom Avatars */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setDroppedImageUrl(undefined);
        }}
        initialImageUrl={droppedImageUrl}
        aspectRatio="1:1"
        lockRatio={true}
        title="Choose & Adjust Profile Photo"
        onCropComplete={(croppedData) => {
          handleSelectPresetOrDraft(croppedData);
        }}
      />
    </div>
  );
}
