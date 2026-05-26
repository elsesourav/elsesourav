"use client";

import { useMemo, useState, useRef } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  flexRender, 
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { formatDateTime, type AdminUser, type AppRole } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { Search, Filter, ShieldAlert, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

type RoleFilter = "all" | "admin" | "user";
type RoleUpdateResponse = { id: string; role: AppRole; email: string; };

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as { ok?: boolean; error?: { message?: string; }; };
  return candidate.ok === false && candidate.error?.message ? candidate.error.message : null;
}

function isApiSuccess<T>(payload: unknown): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as { ok?: boolean; data?: T; };
  return candidate.ok === true && "data" in candidate;
}

export function AdminUsersClient({ initialUsers, currentUserId }: { initialUsers: AdminUser[]; currentUserId: string; }) {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; nextRole: AppRole; } | null>(null);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(i => i.role === "ADMIN").length,
    standardUsers: users.filter(i => i.role === "USER").length,
    libraries: users.reduce((sum, item) => sum + item._count.libraries, 0),
  }), [users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((item) => {
      if (filter === "admin" && item.role !== "ADMIN") return false;
      if (filter === "user" && item.role !== "USER") return false;
      if (!q) return true;
      return [item.name, item.email, item.role].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [users, filter, query]);

  const confirmUser = confirmAction ? users.find((item) => item.id === confirmAction.userId) : null;

  async function onConfirmRoleChange() {
    if (!confirmAction || !confirmUser) return;
    setPendingUserId(confirmAction.userId);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: confirmAction.userId, role: confirmAction.nextRole }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<RoleUpdateResponse>(payload)) {
        dispatch(enqueueNotification({ tone: "error", message: parseApiMessage(payload) ?? "Failed to update role." }));
        return;
      }

      setUsers(prev => prev.map(u => u.id === confirmAction.userId ? { ...u, role: payload.data.role } : u));
      dispatch(enqueueNotification({ tone: "success", message: `Role for ${payload.data.email} updated to ${payload.data.role}.` }));
    } catch (error) {
      dispatch(enqueueNotification({ tone: "error", message: error instanceof Error ? error.message : "Failed to update role." }));
    } finally {
      setPendingUserId(null);
      setConfirmAction(null);
    }
  }

  const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-surface-active flex items-center justify-center font-bold text-xs text-text-primary">
              {(u.name ?? u.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">{u.name ?? "No name"}</p>
              <p className="text-xs text-text-muted">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentUserId;
        return (
          <Badge variant={u.role === "ADMIN" ? "info" : "default"}>
            {u.role}
            {isSelf && <span className="ml-1 opacity-70">(You)</span>}
          </Badge>
        );
      },
    },
    {
      accessorKey: "_count.libraries",
      header: "Libraries",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text-secondary">{row.original._count.libraries} items</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Joined
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => <span className="text-sm text-text-secondary">{formatDateTime(row.original.createdAt).split(',')[0]}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentUserId;
        const isBusy = pendingUserId === u.id;
        const nextRole = u.role === "ADMIN" ? "USER" : "ADMIN";
        
        return (
          <div className="flex justify-end">
            <Button
              variant={u.role === "ADMIN" ? "outline" : "secondary"}
              size="sm"
              disabled={isSelf || isBusy}
              onClick={() => setConfirmAction({ userId: u.id, nextRole })}
            >
              {isBusy ? "Updating..." : (u.role === "ADMIN" ? "Revoke Admin" : "Make Admin")}
            </Button>
          </div>
        );
      },
    },
  ], [currentUserId, pendingUserId]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // row height
    overscan: 10,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="py-4"><CardDescription>Total Users</CardDescription><CardTitle className="text-2xl">{stats.total.toLocaleString()}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="py-4"><CardDescription>Admins</CardDescription><CardTitle className="text-2xl">{stats.admins.toLocaleString()}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="py-4"><CardDescription>Standard</CardDescription><CardTitle className="text-2xl">{stats.standardUsers.toLocaleString()}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="py-4"><CardDescription>Total Libraries</CardDescription><CardTitle className="text-2xl">{stats.libraries.toLocaleString()}</CardTitle></CardHeader></Card>
      </div>

      <Card className="border border-border-subtle shadow-sm overflow-hidden flex flex-col h-[calc(100vh-22rem)] min-h-[500px]">
        <div className="p-4 border-b border-border-subtle bg-bg-surface shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input placeholder="Search users by name or email..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as RoleFilter)}
              className="h-9 w-full sm:w-40 rounded-md border border-border-strong bg-bg-base px-3 text-sm text-text-primary focus:ring-1 focus:ring-brand-accent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins only</option>
              <option value="user">Users only</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-bg-base" ref={parentRef}>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 bg-bg-surface shadow-sm z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3 font-semibold uppercase tracking-wider text-xs text-text-muted border-b border-border-subtle">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr 
                    key={row.id} 
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualRow.start}px)` }}
                    className="group border-b border-border-subtle hover:bg-surface-hover transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="p-8 text-center text-text-muted">No users found matching your criteria.</div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(confirmAction && confirmUser)}
        title={confirmAction?.nextRole === "ADMIN" ? "Grant Admin Rights" : "Revoke Admin Rights"}
        description={
          confirmAction?.nextRole === "ADMIN"
            ? `Are you sure you want to promote ${confirmUser?.email} to an Admin? They will have full access to the dashboard.`
            : `Are you sure you want to demote ${confirmUser?.email} to a User? They will lose access to the dashboard.`
        }
        confirmLabel={confirmAction?.nextRole === "ADMIN" ? "Grant Access" : "Revoke Access"}
        confirmTone={confirmAction?.nextRole === "ADMIN" ? "primary" : "danger"}
        busy={Boolean(pendingUserId)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void onConfirmRoleChange()}
      />
    </div>
  );
}
