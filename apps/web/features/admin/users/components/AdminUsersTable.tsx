'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input, UserAvatar } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { AdminUserListItem, UserRole } from '@elsesourav/types';
import { Users, Search, ExternalLink, BookMarked, LifeBuoy } from 'lucide-react';

interface AdminUsersTableProps {
  initialUsers: readonly AdminUserListItem[];
  total: number;
  totalPages: number;
}

export function AdminUsersTable({ initialUsers, total, totalPages }: AdminUsersTableProps) {
  const [users] = React.useState(initialUsers);
  const [search, setSearch] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  const roleItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Roles' },
      { value: 'USER', label: 'User' },
      { value: 'STAFF', label: 'Staff' },
      { value: 'ADMIN', label: 'Admin' },
    ],
    []
  );

  const statusItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'deleted', label: 'Deleted' },
    ],
    []
  );

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
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono border-purple-500/50 text-purple-300 bg-purple-950/20"
          >
            Admin
          </Badge>
        );
      case 'STAFF':
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono border-indigo-500/50 text-indigo-300 bg-indigo-950/20"
          >
            Staff
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono border-zinc-700 text-zinc-400"
          >
            User
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-6 lg:col-span-7">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or @username..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500 h-9"
            />
          </div>

          {/* Role & Status Dropdowns */}
          <div className="grid grid-cols-2 sm:col-span-6 lg:col-span-5 gap-2">
            <Dropdown
              items={roleItems}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              className="w-full"
            />
            <Dropdown
              items={statusItems}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-full"
            />
          </div>
        </div>

        {/* Total Users Count */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
          <span>
            Showing <strong className="text-zinc-200">{filteredUsers.length}</strong> of{' '}
            <strong className="text-zinc-200">{total}</strong> total users
          </span>
          <span>
            {totalPages} {totalPages === 1 ? 'page' : 'pages'}
          </span>
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
            <table className="table-fixed w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 w-auto min-w-[180px]">
                    User
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 hidden md:table-cell w-44 lg:w-48">
                    Email Address
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 hidden sm:table-cell w-20">
                    Role
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 hidden sm:table-cell w-20">
                    Status
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 hidden lg:table-cell w-16">
                    Library
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 hidden lg:table-cell w-16">
                    Support
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 hidden md:table-cell w-24">
                    Joined
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-zinc-300 text-right w-20 sm:w-24">
                    Action
                  </th>
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
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* User Avatar & Name */}
                      <td className="py-3 px-3 sm:px-4 min-w-0">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <UserAvatar
                            src={user.photoUrl}
                            name={user.displayName}
                            identifier={user.id || user.email}
                            alt={user.displayName}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors">
                              {user.displayName}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono truncate flex items-center gap-1.5 flex-wrap">
                              <span>
                                {user.username ? `@${user.username}` : user.id.slice(0, 8)}
                              </span>
                              {/* Mobile inline badges for complete visibility without side-scrolling */}
                              <span className="sm:hidden text-zinc-700">•</span>
                              <span className="sm:hidden">{getRoleBadge(user.role)}</span>
                              <span className="sm:hidden">
                                {user.status === 'active' ? (
                                  <Badge
                                    variant="success"
                                    className="text-[9px] py-0 px-1 font-mono uppercase"
                                  >
                                    Act
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] py-0 px-1 font-mono uppercase border-rose-500/40 text-rose-300"
                                  >
                                    Del
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 sm:px-4 hidden md:table-cell font-mono text-[11px] text-zinc-300 truncate">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
                        {user.status === 'active' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono border-rose-500/40 text-rose-300"
                          >
                            Deleted
                          </Badge>
                        )}
                      </td>

                      {/* Library count */}
                      <td className="py-3 px-3 sm:px-4 hidden lg:table-cell text-zinc-400 font-mono text-[11px] truncate">
                        <div className="flex items-center gap-1.5">
                          <BookMarked className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span>{user.libraryCount}</span>
                        </div>
                      </td>

                      {/* Support ticket count */}
                      <td className="py-3 px-3 sm:px-4 hidden lg:table-cell text-zinc-400 font-mono text-[11px] truncate">
                        <div className="flex items-center gap-1.5">
                          <LifeBuoy className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span>{user.supportTicketCount}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-3 sm:px-4 hidden md:table-cell text-zinc-500 text-[11px] truncate">
                        {joinedDate}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          aria-label={`Manage user ${user.displayName}`}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-indigo-600 hover:text-white text-zinc-300 transition-colors text-[11px] font-medium shrink-0"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
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
