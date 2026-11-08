'use client';

import { BlurUpImage } from '@/components/interior/BlurUpImage';
import { LoadingButton } from '@/components/interior/LoadingButton';
import { ImageCropperModal } from '@/components/media/ImageCropperModal';
import type { User } from '@elsesourav/types';
import { UserAvatar, Button } from '@elsesourav/ui';
import { AlertCircle, Camera, Check, RotateCcw, Sparkles, UploadCloud } from 'lucide-react';
import * as React from 'react';
import { updateProfileFormAction } from '../actions/account-actions';

interface ProfileAvatarStudioProps {
  user: User;
  displayName: string;
  photoUrl: string;
  onPhotoSaved: (url: string) => void;
}

const PRESET_AVATARS = [
  { id: 'cosmic', name: 'Cosmic Indigo', url: '/avatars/avatar-1.svg' },
  { id: 'emerald', name: 'Terminal Emerald', url: '/avatars/avatar-2.svg' },
  { id: 'amber', name: 'Solar Amber', url: '/avatars/avatar-3.svg' },
  { id: 'cyan', name: 'Systems Cyan', url: '/avatars/avatar-4.svg' },
  { id: 'rose', name: 'Visual Rose', url: '/avatars/avatar-5.svg' },
  { id: 'violet', name: 'Neural Violet', url: '/avatars/avatar-6.svg' },
];

export function ProfileAvatarStudio({
  user,
  displayName,
  photoUrl,
  onPhotoSaved,
}: ProfileAvatarStudioProps) {
  const [draftPhotoUrl, setDraftPhotoUrl] = React.useState(photoUrl);
  const [isSavingPhoto, setIsSavingPhoto] = React.useState(false);
  const [photoSaveSuccess, setPhotoSaveSuccess] = React.useState(false);
  const [photoSaveError, setPhotoSaveError] = React.useState<string | null>(null);

  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [droppedImageUrl, setDroppedImageUrl] = React.useState<string | undefined>(undefined);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasPhotoChanged = draftPhotoUrl !== (photoUrl || '');

  React.useEffect(() => {
    setDraftPhotoUrl(photoUrl);
  }, [photoUrl]);

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
        onPhotoSaved(draftPhotoUrl);
        setPhotoSaveSuccess(true);
        setTimeout(() => setPhotoSaveSuccess(false), 3000);
      } else {
        setPhotoSaveError(res.error || 'Failed to update profile image');
        throw new Error(res.error || 'Failed to update profile image');
      }
    } catch (err) {
      if (!photoSaveError) {
        setPhotoSaveError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving profile image'
        );
      }
      throw err;
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleResetPhoto = () => {
    setDraftPhotoUrl(photoUrl);
    setPhotoSaveError(null);
  };

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
    <div
      data-section="profile-avatar"
      className="p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/60 sm:border-border/80 space-y-2.5 sm:space-y-3.5 overflow-hidden max-w-full transition-all"
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground">
            Profile Image
          </span>
          {hasPhotoChanged && (
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {photoSaveSuccess && (
            <span className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Saved
            </span>
          )}
          {photoSaveError && (
            <span className="text-[10px] sm:text-[11px] text-rose-400 flex items-center gap-1 font-medium animate-in fade-in">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {photoSaveError}
            </span>
          )}

          {hasPhotoChanged && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleResetPhoto}
              disabled={isSavingPhoto}
              leftIcon={<RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              className="h-6 sm:h-7 px-2 text-[10px] sm:text-xs"
              title="Reset to current saved image"
            >
              Reset
            </Button>
          )}

          <LoadingButton
            onAction={handleSavePhoto}
            disabled={!hasPhotoChanged || isSavingPhoto}
            pendingLabel="Saving..."
            successLabel="Saved"
            errorLabel="Failed"
            className="h-6.5 sm:h-7 md:h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs font-semibold rounded-lg sm:rounded-xl shadow-xs"
          >
            Save Image
          </LoadingButton>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-3 sm:gap-4 md:gap-5 w-full min-w-0 max-w-full">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-[25%] overflow-hidden border border-primary/30 sm:border-2 bg-muted/50 shadow-xs shrink-0 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm flex items-center justify-center"
          title="Click to upload new photo"
        >
          {draftPhotoUrl ? (
            <BlurUpImage
              src={draftPhotoUrl}
              alt={displayName || 'Profile preview'}
              width={144}
              height={144}
              radius={24}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <UserAvatar
              src={null}
              name={displayName}
              identifier={user.id || user.email}
              size="xl"
              className="w-full h-full rounded-2xl sm:rounded-3xl text-2xl sm:text-3xl md:text-4xl font-bold"
            />
          )}

          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-0.5 sm:gap-1 p-1 text-center">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="text-[9px] sm:text-[10px] font-semibold">Change</span>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col justify-between gap-2 sm:gap-3 min-w-0 max-w-full overflow-hidden">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-lg sm:rounded-xl md:rounded-2xl border border-dashed flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left cursor-pointer transition-all duration-200 group ${
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
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
                Drop an image, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 truncate">
                JPG, PNG, WEBP • Max 5MB (1:1)
              </p>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5 pt-0.5 w-full min-w-0 max-w-full">
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Or select preset:
            </div>

            <div className="w-full max-w-full overflow-x-auto py-0.5 scrollbar-none pl-0.5">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
                <button
                  type="button"
                  onClick={() => handleSelectPresetOrDraft('')}
                  title="Default Monogram"
                  className={`group relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer overflow-hidden ${
                    !draftPhotoUrl
                      ? 'border-primary ring-2 ring-primary/40 shadow-xs scale-105'
                      : 'border-border/60 hover:border-primary/40 bg-muted/40'
                  }`}
                >
                  <UserAvatar
                    src={null}
                    name={displayName}
                    identifier={user.id || user.email}
                    size="sm"
                    className="w-full h-full rounded-lg text-[10px] sm:text-xs font-bold"
                  />
                  {!draftPhotoUrl && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </button>

                {PRESET_AVATARS.map((preset) => {
                  const isSelected = draftPhotoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPresetOrDraft(preset.url)}
                      title={preset.name}
                      className={`group relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 shadow-xs scale-105'
                          : 'border-border/60 hover:border-primary/40 bg-muted/40'
                      }`}
                    >
                      <BlurUpImage
                        src={preset.url}
                        alt={preset.name}
                        width={40}
                        height={40}
                        radius={10}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setDroppedImageUrl(undefined);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        initialImageUrl={droppedImageUrl}
        onCropComplete={(croppedUrl) => {
          setDraftPhotoUrl(croppedUrl);
          setIsCropperOpen(false);
          setDroppedImageUrl(undefined);
          setPhotoSaveError(null);
          setPhotoSaveSuccess(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />
    </div>
  );
}
