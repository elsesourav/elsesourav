'use client';

import type { AdminUserDetail, UserRole } from '@elsesourav/types';
import { Badge, Button, Card, UserAvatar } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  ExternalLink,
  LifeBuoy,
  Loader2,
  Shield,
  Trash2,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { adminDeleteUserAction, adminUpdateUserRoleAction } from '../actions/admin-users-actions';

const ROLE_OPTIONS = [
  { value: 'USER', label: 'USER (Standard Access)' },
  { value: 'STAFF', label: 'STAFF (Support & Moderation)' },
  { value: 'ADMIN', label: 'ADMIN (Full Super Admin)' },
];

interface AdminUserDetailViewProps {
  user: AdminUserDetail;
}

export function AdminUserDetailView({ user: initialUser }: AdminUserDetailViewProps) {
  const [user, setUser] = React.useState(initialUser);
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(initialUser.role);
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) return;

    if (
      !window.confirm(
        `Are you sure you want to change this user's role from ${user.role} to ${selectedRole}?`
      )
    ) {
      return;
    }

    setIsUpdatingRole(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminUpdateUserRoleAction(user.id, selectedRole);
      if (res.success && res.user) {
        setUser((prev) => ({ ...prev, role: res.user.role }));
        setSuccess(`User role successfully changed to ${res.user.role}.`);
      } else {
        setError(res.error || 'Failed to update role.');
      }
    } catch {
      setError('An error occurred updating user role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmation = window.prompt(
      `DANGER: You are about to terminate user account "${user.displayName}". Type "CONFIRM DELETE" to proceed:`
    );

    if (confirmation !== 'CONFIRM DELETE') {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminDeleteUserAction(user.id, 'Terminated via Admin Portal');
      if (res.success) {
        setUser((prev) => ({ ...prev, status: 'deleted' }));
        setSuccess('User account successfully terminated.');
      } else {
        setError(res.error || 'Failed to delete user.');
      }
    } catch {
      setError('An error occurred deleting user account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const updatedDate = new Date(user.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Link
            href="/admin/users"
            aria-label="Back to user directory"
            className="p-2 shrink-0 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <UserAvatar
              src={user.photoUrl}
              name={user.displayName}
              identifier={user.id || user.email}
              alt={user.displayName}
              size="md"
              className="sm:w-16 sm:h-16 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight break-words">
                  {user.displayName}
                </h1>
                {user.role === 'ADMIN' ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono border-purple-500/50 text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/20"
                  >
                    Admin
                  </Badge>
                ) : user.role === 'STAFF' ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono border-indigo-500/50 text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/20"
                  >
                    Staff
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  >
                    User
                  </Badge>
                )}
                {user.status === 'active' ? (
                  <Badge variant="success" className="text-[10px] uppercase font-mono">
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono border-rose-500/40 text-rose-600 dark:text-rose-300"
                  >
                    Deleted
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono break-all mt-0.5">
                {user.username ? `@${user.username}` : user.id} • {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Details & Role Management */}
        <div className="md:col-span-2 space-y-6">
          {/* Identity Card */}
          <Card className="p-4 sm:p-6 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Identity & Account Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 space-y-1 min-w-0">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Full Email Address</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all">{user.email}</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 space-y-1 min-w-0">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">PostgreSQL User ID</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400 text-[11px] break-all">{user.id}</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Registered On</span>
                <span className="text-zinc-800 dark:text-zinc-200">{joinedDate}</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Last Profile Update</span>
                <span className="text-zinc-800 dark:text-zinc-200">{updatedDate}</span>
              </div>
            </div>

            {user.bio && (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 space-y-1 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Biography</span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">{user.bio}</p>
              </div>
            )}
          </Card>

          {/* Role Authorization Card */}
          <Card className="p-4 sm:p-6 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>Role & Permission Level</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Update this user's application permissions. Only Super Administrators can modify
              roles.
            </p>

            <form onSubmit={handleRoleChange} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Dropdown
                items={ROLE_OPTIONS}
                value={selectedRole}
                onChange={(val) => setSelectedRole(val as UserRole)}
                className="w-full sm:w-64"
              />

              <Button
                type="submit"
                disabled={isUpdatingRole || selectedRole === user.role}
                size="sm"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl gap-1.5 shadow-lg justify-center"
              >
                {isUpdatingRole ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Shield className="w-3.5 h-3.5" />
                )}
                <span>Save Role</span>
              </Button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 sm:p-6 rounded-3xl border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Danger Zone</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Terminate User Account</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Permanently soft-deletes this user account and revokes access.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting || user.status === 'deleted'}
                onClick={handleDeleteUser}
                className="w-full sm:w-auto border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-semibold px-4 py-2.5 rounded-xl gap-1.5 shrink-0 justify-center"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{user.status === 'deleted' ? 'Account Terminated' : 'Delete Account'}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Activity & Summaries */}
        <div className="space-y-6">
          {/* Support Ticket Summary */}
          <Card className="p-4 sm:p-5 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Support Summary</span>
              </h4>
              <Link
                href={`/admin/support?search=${encodeURIComponent(user.email)}`}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>View</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/60">
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                  {user.openTicketCount}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Open</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/60">
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                  {user.supportTicketCount}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Total</span>
              </div>
            </div>
          </Card>

          {/* Library Summary */}
          <Card className="p-4 sm:p-5 rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Library Summary</span>
            </h4>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Saved Applications</span>
              <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {user.libraryCount} apps
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
