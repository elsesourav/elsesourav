'use client';

import * as React from 'react';
import { Button, Input } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { AlertTriangle, Trash2, Check } from 'lucide-react';
import { HoldToConfirm } from '@/components/interior/HoldToConfirm';
import { LoadingButton } from '@/components/interior/LoadingButton';
import {
  cancelAccountDeletionAction,
  scheduleAccountDeletionAction,
} from '../actions/account-actions';

interface AccountDeleteCardProps {
  targetUsername: string;
  scheduledDeletionAt?: number | null;
}

export function AccountDeleteCard({ targetUsername, scheduledDeletionAt }: AccountDeleteCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState('');
  const [typedUsername, setTypedUsername] = React.useState('');
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Close delete modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDeleteModalOpen && !isDeletingAccount) {
        setIsDeleteModalOpen(false);
        setTypedUsername('');
        setDeleteError(null);
      }
    };
    if (isDeleteModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleteModalOpen, isDeletingAccount]);

  const isUsernameMatched = typedUsername.trim().toLowerCase() === targetUsername.toLowerCase();
  const isPendingDeletion = !!scheduledDeletionAt;
  const deletionDate = scheduledDeletionAt
    ? new Date(scheduledDeletionAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleScheduleDelete = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isUsernameMatched) return;
    setIsDeletingAccount(true);
    setDeleteError(null);
    const res = await scheduleAccountDeletionAction(deleteReason.trim() || undefined);
    if (res.success) {
      window.location.reload();
    } else {
      setDeleteError(res.error || 'Failed to schedule deletion');
      setIsDeletingAccount(false);
      throw new Error(res.error || 'Failed to schedule deletion');
    }
  };

  const handleCancelDelete = async () => {
    setIsDeletingAccount(true);
    const res = await cancelAccountDeletionAction();
    if (res.success) {
      window.location.reload();
    } else {
      setIsDeletingAccount(false);
      throw new Error(res.error || 'Failed to cancel deletion');
    }
  };

  return (
    <>
      {isPendingDeletion ? (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <h4 className="text-xs font-semibold text-rose-500">Account Deletion Scheduled</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your account will be permanently deleted on{' '}
                <span className="font-semibold text-rose-400">{deletionDate}</span>. You can cancel
                at any time during this 30-day grace period.
              </p>
            </div>
          </div>
          <LoadingButton
            onAction={handleCancelDelete}
            disabled={isDeletingAccount}
            pendingLabel="Cancelling..."
            successLabel="Cancelled"
            errorLabel="Failed"
            className="border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-lg h-7 px-3"
          >
            Cancel Deletion
          </LoadingButton>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-rose-500">Delete Account</h4>
            <p className="text-xs text-muted-foreground">
              Schedule your account for permanent deletion with a 30-day recovery grace period.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs gap-1.5 shrink-0 rounded-lg cursor-pointer h-7 px-3 self-start sm:self-auto"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete Account</span>
          </Button>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingAccount) {
              setIsDeleteModalOpen(false);
              setTypedUsername('');
              setDeleteError(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-card p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-account-title" className="text-sm font-bold text-foreground">
                  Schedule Account Deletion
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your account enters a{' '}
                  <span className="font-semibold text-foreground">30-day grace period</span> before
                  permanent deletion.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">
                {deleteError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isUsernameMatched) void handleScheduleDelete();
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <label className="block text-[11px] font-semibold text-rose-300">
                  Type your username{' '}
                  <span className="font-mono text-white bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
                    {targetUsername}
                  </span>{' '}
                  to confirm:
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={typedUsername}
                    onChange={(e) => setTypedUsername(e.target.value)}
                    placeholder={targetUsername}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className={`bg-background border text-xs rounded-lg text-foreground h-8 sm:h-9 font-mono pr-8 ${
                      isUsernameMatched
                        ? 'border-emerald-500/60 focus:border-emerald-500 ring-1 ring-emerald-500/20'
                        : 'border-border focus:border-rose-500'
                    }`}
                  />
                  {isUsernameMatched && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              <FloatingLabelInput
                label="Reason for closure (optional)"
                type="text"
                value={deleteReason}
                onChange={(val) => setDeleteReason(val)}
                placeholder="Tell us why you are leaving..."
              />

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTypedUsername('');
                    setDeleteError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg h-8 px-3"
                >
                  Cancel
                </Button>

                <HoldToConfirm
                  onConfirm={() => {
                    void handleScheduleDelete();
                  }}
                  disabled={isDeletingAccount || !isUsernameMatched}
                  confirmLabel="Scheduling..."
                  variant="destructive"
                  className="text-xs font-semibold h-8 rounded-lg shadow-sm"
                >
                  Hold to Schedule Deletion
                </HoldToConfirm>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
