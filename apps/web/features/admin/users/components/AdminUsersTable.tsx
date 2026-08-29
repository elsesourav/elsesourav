'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input, Button } from '@elsesourav/ui';
import type { AdminUserListItem, UserRole } from '@elsesourav/types';
import {
  Users,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookMarked,
  LifeBuoy,
} from 'lucide-react';

interface AdminUsersTableProps {
  initialUsers: readonly AdminUserListItem[];
  total: number;
  totalPages: number;
}

export function AdminUsersTable({
  initialUsers,
  total,
  totalPages,
}: AdminUsersTableProps) {
  const [users] = React.useState(initialUsers);
  const [search, setSearch] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = user.displayName.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesUsername = user.username?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesEmail && !matchesUsername) return false;
      }

      // Role filter
      if (selectedRole !== 'all') {
        if (user.role !== selectedRole) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (user.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [users, search, selectedRole, selectedStatus]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="outline" className="text-[10px] uppercase font-mono border-purple-500/50 text-purple-300 bg-purple-950/20">
            Admin
          </Badge>
        );
      case 'STAFF':
        return (
          <Badge variant="outline" className="text-[10px] uppercase font-mono border-indigo-500/50 text-indigo-300 bg-indigo-950/20">
            Staff
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] uppercase font-mono border-zinc-700 text-zinc-400">
            User
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or @username..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          {/* Role Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="USER">User</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {/* Total Users Count */}
        <div className="text-xs font-mono text-zinc-400">
          Showing <span className="text-zinc-200 font-bold">{filteredUsers.length}</span> of{' '}
          <span className="text-zinc-200 font-bold">{total}</span> total
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <Users className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No users found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No registered user accounts match your current filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Email Address</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Library</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Support</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Joined</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredUsers.map((user) => {
                  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {user.photoUrl ? (
                              <img
                                src={user.photoUrl}
                                alt={user.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors max-w-[140px] sm:max-w-[200px]">
                              {user.displayName}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono truncate">
                              {user.username ? `@${user.username}` : user.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 hidden md:table-cell font-mono text-[11px] text-zinc-300">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.status === 'active' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono border-rose-500/40 text-rose-300">
                            Deleted
                          </Badge>
                        )}
                      </td>

                      {/* Library count */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <BookMarked className="w-3 h-3 text-zinc-500" />
                          <span>{user.libraryCount} apps</span>
                        </div>
                      </td>

                      {/* Support ticket count */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <LifeBuoy className="w-3 h-3 text-zinc-500" />
                          <span>{user.supportTicketCount} tickets</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-zinc-500 text-[11px]">
                        {joinedDate}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-indigo-600 hover:text-white text-zinc-300 transition-colors text-[11px] font-medium"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
