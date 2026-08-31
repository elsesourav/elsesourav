'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import { deleteAccountAction } from '../actions/account-actions';
import { ShieldAlert, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function DangerZone() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Close on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setIsOpen(false);
        setConfirmation('');
        setError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== 'DELETE MY ACCOUNT' || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await deleteAccountAction({
        confirmation,
        reason: reason.trim() || undefined,
      });

      if (res.success) {
        // Submit logout form to invalidate cookies and redirect
        window.location.href = '/api/auth/logout';
      } else {
        setError(res.error || 'Failed to delete account.');
        setIsDeleting(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-rose-500/30 shadow-sm rounded-2xl sm:rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <CardTitle className="text-base text-rose-600 dark:text-rose-400">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Permanent and destructive actions for your account.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 space-y-4 max-w-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">Delete Account</h4>
            <p className="text-[11px] text-muted-foreground">
              Permanently delete your account, wipe personal profile data, and invalidate active sessions.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="border-rose-500/40 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs gap-1.5 shrink-0 rounded-xl cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </Button>
        </div>

        {/* Confirmation Modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="danger-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) {
                setIsOpen(false);
                setConfirmation('');
                setError(null);
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-card p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="danger-modal-title" className="text-base font-bold text-foreground">
                    Delete Account Confirmation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleDelete} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Reason for closure (optional)
                  </label>
                  <Input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you are leaving..."
                    className="bg-background border-border text-xs rounded-xl text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-foreground">
                    Type{' '}
                    <span className="font-mono text-rose-600 dark:text-rose-400 select-all font-bold">
                      DELETE MY ACCOUNT
                    </span>{' '}
                    to confirm
                  </label>
                  <Input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    required
                    className="bg-background border-border text-xs rounded-xl text-foreground font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => {
                      setIsOpen(false);
                      setConfirmation('');
                      setError(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={confirmation !== 'DELETE MY ACCOUNT' || isDeleting}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting Account...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanently Delete</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
