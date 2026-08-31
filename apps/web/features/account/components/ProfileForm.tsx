'use client';

import * as React from 'react';
import type { User, UserPreferences } from '@elsesourav/types';
import { Card, CardDescription, CardHeader, CardTitle, Input, UserAvatar } from '@elsesourav/ui';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Sparkles,
  UploadCloud,
  User as UserIcon,
  X,
  Bell,
} from 'lucide-react';
import { updateProfileFormAction, updatePreferencesAction } from '../actions/account-actions';
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
  const userPrefs = (user.preferences as UserPreferences) || {};

  // Form Field States
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [username, setUsername] = React.useState(user.username || '');
  const [bio, setBio] = React.useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = React.useState(user.photoUrl || '');
  const [emailNotifications, setEmailNotifications] = React.useState(
    userPrefs.emailNotifications ?? true
  );

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

  // Avatar and Preference status indicators
  const [avatarStatus, setAvatarStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const [prefStatus, setPrefStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

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
      }
    } catch {
      setNameError('An unexpected error occurred');
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle Username Save
  const handleApplyUsername = async () => {
    const trimmed = editUsernameValue.trim().toLowerCase();
    if (!trimmed || trimmed.length < 4) {
      setUsernameError('Username must be at least 4 characters long');
      return;
    }
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      return;
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
      }
    } catch {
      setUsernameError('An unexpected error occurred');
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Handle Bio Save
  const handleApplyBio = async () => {
    const trimmed = editBioValue.trim();
    if (trimmed.length > 250) {
      setBioError('Bio cannot exceed 250 characters');
      return;
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
      }
    } catch {
      setBioError('An unexpected error occurred');
    } finally {
      setIsSavingBio(false);
    }
  };

  // Handle Avatar Selection / Preset Auto-Save
  const handleSelectAvatar = async (newUrl: string) => {
    setPhotoUrl(newUrl);
    setAvatarStatus('saving');

    try {
      const res = await updateProfileFormAction({ photoUrl: newUrl });
      if (res.success) {
        setAvatarStatus('saved');
        setTimeout(() => setAvatarStatus('idle'), 2500);
      } else {
        setAvatarStatus('error');
      }
    } catch {
      setAvatarStatus('error');
    }
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

  // Handle Email Notifications Toggle Auto-Save (Debounced / Optimistic)
  const handleToggleNotifications = async (checked: boolean) => {
    setEmailNotifications(checked);
    setPrefStatus('saving');

    try {
      const res = await updatePreferencesAction({ emailNotifications: checked });
      if (res.success) {
        setPrefStatus('saved');
        setTimeout(() => setPrefStatus('idle'), 2500);
      } else {
        setPrefStatus('idle');
      }
    } catch {
      setPrefStatus('idle');
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            <CardTitle className="text-base text-foreground">Profile Information</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Update your public name, username handle, developer bio, and avatar identity.
          </CardDescription>
        </CardHeader>

        <div className="p-5 sm:p-6 pt-2 space-y-6">
          {/* 1. Modern Avatar Section: Square User Image on Left, Drag & Drop on Right, Presets at Bottom */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Profile Avatar
              </label>
              {avatarStatus === 'saving' && (
                <span className="text-[11px] text-primary flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
              {avatarStatus === 'saved' && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Avatar updated
                </span>
              )}
            </div>

            {/* Top Row: Left = Square User Image, Right = Drag & Drop / Click to Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Left: Square Profile Image */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-primary/30 relative flex items-center justify-center bg-muted/60 shadow-md shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={displayName || 'Avatar preview'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserAvatar
                    src={null}
                    name={displayName}
                    identifier={user.id || user.email}
                    size="lg"
                    className="w-full h-full rounded-2xl text-xl font-bold"
                  />
                )}
              </div>

              {/* Right: Drag & Drop / Click to Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 w-full h-24 sm:h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all duration-200 group ${
                  isDraggingOver
                    ? 'border-primary bg-primary/10 scale-[1.01]'
                    : 'border-border/80 hover:border-primary/60 hover:bg-primary/5 bg-background/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <UploadCloud className="w-6 h-6 text-primary mb-1 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-xs font-semibold text-foreground">
                  Drop image here, or <span className="text-primary underline">browse</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  JPG, PNG, WEBP (Square 1:1 format)
                </p>
              </div>
            </div>

            {/* Bottom Row: Preset Images Strip */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium">
                Select a preset or default monogram:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Default Monogram */}
                <button
                  type="button"
                  onClick={() => handleSelectAvatar('')}
                  title="Default Branded Monogram"
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex items-center justify-center ${
                    !photoUrl
                      ? 'border-primary ring-2 ring-primary/40 shadow-sm scale-105'
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

                {/* Preset Options */}
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = photoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectAvatar(preset.url)}
                      title={preset.name}
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 shadow-sm scale-105'
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
              </div>
            </div>
          </div>

          {/* 2. Full Name (Display Name) Field with Inline Edit */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    maxLength={60}
                    className="bg-background border-border text-xs rounded-xl text-foreground flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleApplyName}
                    disabled={isSavingName}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                  >
                    {isSavingName ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Apply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameError(null);
                    }}
                    className="inline-flex items-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background border border-border transition-colors cursor-pointer shrink-0"
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
              <div className="text-xs font-medium text-foreground py-1">
                {displayName || <span className="text-muted-foreground italic">Not set</span>}
              </div>
            )}
          </div>

          {/* 3. Username Handle Field with Inline Edit */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 rounded-xl bg-background border border-border focus-within:border-primary px-3">
                    <span className="text-xs text-muted-foreground select-none font-mono">@</span>
                    <input
                      type="text"
                      value={editUsernameValue}
                      onChange={(e) => setEditUsernameValue(e.target.value.toLowerCase())}
                      placeholder="username"
                      autoFocus
                      maxLength={30}
                      className="bg-transparent border-0 text-xs text-foreground px-1 py-2 w-full focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyUsername}
                    disabled={
                      isSavingUsername ||
                      usernameStatus === 'invalid' ||
                      usernameStatus === 'taken' ||
                      usernameStatus === 'checking'
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                  >
                    {isSavingUsername ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Apply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsernameError(null);
                    }}
                    className="inline-flex items-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background border border-border transition-colors cursor-pointer shrink-0"
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
              <div className="text-xs font-mono text-primary font-medium py-1">
                {username ? (
                  `@${username}`
                ) : (
                  <span className="text-muted-foreground italic font-sans">No handle set</span>
                )}
              </div>
            )}
          </div>

          {/* 4. Bio Field with Inline Edit */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
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
              <div className="space-y-2">
                <textarea
                  value={editBioValue}
                  onChange={(e) => setEditBioValue(e.target.value)}
                  placeholder="Brief bio or developer statement..."
                  autoFocus
                  rows={3}
                  maxLength={250}
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    {editBioValue.length}/250 characters
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyBio}
                      disabled={isSavingBio}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isSavingBio ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Apply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioError(null);
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background border border-border text-xs transition-colors cursor-pointer"
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
              <div className="text-xs text-muted-foreground leading-relaxed py-1">
                {bio || <span className="italic">No bio added yet.</span>}
              </div>
            )}
          </div>

          {/* 5. Email Notifications Toggle Switch (Animated, Auto-saving) */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                  <span>Email Notifications</span>
                  {prefStatus === 'saving' && (
                    <Loader2 className="w-3 h-3 animate-spin text-primary ml-1" />
                  )}
                  {prefStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 ml-1">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Receive email alerts for support ticket replies and platform updates.
                </div>
              </div>

              {/* Animated Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={emailNotifications}
                onClick={() => handleToggleNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  emailNotifications ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
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
          handleSelectAvatar(croppedData);
        }}
      />
    </div>
  );
}
