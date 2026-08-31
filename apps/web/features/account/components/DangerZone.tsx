'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import { deleteAccountAction } from '../actions/account-actions';
import { ShieldAlert, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function DangerZone() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    <Card className="card-obsidian-glass border-rose-900/30 bg-rose-950/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <CardTitle className="text-base text-rose-300">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Permanent and destructive actions for your account.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 space-y-4 max-w-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-rose-900/30">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-zinc-200">Delete Account</h4>
            <p className="text-[11px] text-zinc-400">
              Permanently close your account, wipe profile metadata, and archive active sessions.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="border-rose-800/80 hover:bg-rose-950/40 text-rose-300 text-xs gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </Button>
        </div>

        {/* Confirmation Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-zinc-900 p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Delete Account Confirmation</h3>
                  <p className="text-xs text-zinc-400">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleDelete} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-zinc-300">
                    Reason for closure (optional)
                  </label>
                  <Input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you are leaving..."
                    className="bg-zinc-950 border-zinc-800 text-xs rounded-xl text-zinc-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-zinc-300">
                    Type{' '}
                    <span className="font-mono text-rose-400 select-all">DELETE MY ACCOUNT</span> to
                    confirm
                  </label>
                  <Input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    required
                    className="bg-zinc-950 border-zinc-800 text-xs rounded-xl text-zinc-100 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
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
                    className="text-xs text-zinc-400"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={confirmation !== 'DELETE MY ACCOUNT' || isDeleting}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50"
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
