"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  formatDateTime,
  type AdminUser,
  type AppRole,
} from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";

type RoleFilter = "all" | "admin" | "user";

type RoleUpdateResponse = {
  id: string;
  role: AppRole;
  email: string;
};

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    ok?: boolean;
    error?: {
      message?: string;
    };
  };

  if (candidate.ok === false && candidate.error?.message) {
    return candidate.error.message;
  }

  return null;
}

function isApiSuccess<T>(
  payload: unknown,
): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as {
    ok?: boolean;
    data?: T;
  };

  return candidate.ok === true && "data" in candidate;
}

function toSortedUsers(items: AdminUser[]): AdminUser[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function AdminUsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  currentUserId: string;
}) {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState(() => toSortedUsers(initialUsers));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    nextRole: AppRole;
  } | null>(null);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((item) => item.role === "ADMIN").length,
      standardUsers: users.filter((item) => item.role === "USER").length,
      libraries: users.reduce((sum, item) => sum + item._count.libraries, 0),
    }),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((item) => {
      if (filter === "admin" && item.role !== "ADMIN") {
        return false;
      }

      if (filter === "user" && item.role !== "USER") {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [item.name, item.email, item.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [users, filter, query]);

  const confirmUser =
    confirmAction !== null
      ? (users.find((item) => item.id === confirmAction.userId) ?? null)
      : null;

  async function onConfirmRoleChange() {
    if (!confirmAction || !confirmUser) {
      return;
    }

    setPendingUserId(confirmAction.userId);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId: confirmAction.userId,
          role: confirmAction.nextRole,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<RoleUpdateResponse>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to update user role.",
          }),
        );
        return;
      }

      setUsers((previous) =>
        previous.map((item) =>
          item.id === confirmAction.userId
            ? {
                ...item,
                role: payload.data.role,
              }
            : item,
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Updated ${confirmUser.email} to ${payload.data.role}.`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update user role.",
        }),
      );
    } finally {
      setPendingUserId(null);
      setConfirmAction(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Users
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#111a2d]">
            {stats.total.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Admins
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#111a2d]">
            {stats.admins.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Standard users
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#111a2d]">
            {stats.standardUsers.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Library items
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#111a2d]">
            {stats.libraries.toLocaleString()}
          </p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <label
              htmlFor="user-search"
              className="text-xs font-semibold uppercase tracking-wide text-[#55607a]"
            >
              Search
            </label>
            <Input
              id="user-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or role"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="role-filter"
              className="text-xs font-semibold uppercase tracking-wide text-[#55607a]"
            >
              Role filter
            </label>
            <select
              id="role-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as RoleFilter)}
              className="min-w-45 rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
            >
              <option value="all">All</option>
              <option value="admin">Admins only</option>
              <option value="user">Users only</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardTitle>No users match current filter</CardTitle>
          <CardDescription className="mt-1">
            Try clearing search text or switching role filter.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((item) => {
            const isBusy = pendingUserId === item.id;
            const nextRole: AppRole = item.role === "ADMIN" ? "USER" : "ADMIN";
            const isSelfDemotion =
              item.id === currentUserId &&
              item.role === "ADMIN" &&
              nextRole === "USER";

            return (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.name ?? "Unnamed user"}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.email}
                    </CardDescription>
                  </div>
                  <Badge tone={item.role === "ADMIN" ? "info" : "neutral"}>
                    {item.role}
                  </Badge>
                </div>

                <div className="grid gap-1 text-xs text-[#5a647d]">
                  <p>Library items: {item._count.libraries}</p>
                  <p>Feedback entries: {item._count.feedbacks}</p>
                  <p>Payments: {item._count.payments}</p>
                  <p>Joined: {formatDateTime(item.createdAt)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    tone={item.role === "ADMIN" ? "danger" : "primary"}
                    size="sm"
                    disabled={isBusy || isSelfDemotion}
                    onClick={() =>
                      setConfirmAction({
                        userId: item.id,
                        nextRole,
                      })
                    }
                  >
                    {isBusy
                      ? "Updating..."
                      : item.role === "ADMIN"
                        ? "Demote to USER"
                        : "Promote to ADMIN"}
                  </Button>
                </div>

                {isSelfDemotion ? (
                  <p className="text-xs text-[#5b6580]">
                    You cannot demote your own admin role.
                  </p>
                ) : null}
              </Card>
            );
          })}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction && confirmUser)}
        title={
          confirmAction?.nextRole === "ADMIN"
            ? "Promote user to admin"
            : "Demote admin to user"
        }
        description={
          confirmAction?.nextRole === "ADMIN"
            ? `Grant admin access to ${confirmUser?.email ?? "this user"}?`
            : `Remove admin access from ${confirmUser?.email ?? "this user"}?`
        }
        confirmLabel={
          confirmAction?.nextRole === "ADMIN" ? "Promote" : "Demote"
        }
        confirmTone={confirmAction?.nextRole === "ADMIN" ? "primary" : "danger"}
        busy={Boolean(pendingUserId)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void onConfirmRoleChange()}
      />
    </section>
  );
}
