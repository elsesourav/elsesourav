"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminCategory } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState, type FormEvent } from "react";

type CategoryStatusTone = "active" | "pending" | "deleted";

type CategoryStatus = {
  label: string;
  tone: CategoryStatusTone;
};

type AdminCategoriesClientProps = {
  initialCategories: AdminCategory[];
};

const STATUS_BADGE_TONE: Record<
  CategoryStatusTone,
  "success" | "warning" | "neutral"
> = {
  active: "success",
  pending: "warning",
  deleted: "neutral",
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

export function resolveCategoryStatus(
  category: Pick<AdminCategory, "scheduledDeletionAt" | "deletedAt">,
): CategoryStatus {
  if (category.deletedAt) {
    return {
      label: "Deleted",
      tone: "deleted",
    };
  }

  if (category.scheduledDeletionAt) {
    return {
      label: "Pending deletion",
      tone: "pending",
    };
  }

  return {
    label: "Active",
    tone: "active",
  };
}

export function canScheduleCategoryDeletion(
  category: Pick<AdminCategory, "scheduledDeletionAt" | "deletedAt" | "_count">,
): boolean {
  return (
    category.deletedAt === null &&
    category.scheduledDeletionAt === null &&
    category._count.apps === 0
  );
}

export function formatDeletionDate(iso: string | null): string | null {
  if (!iso) {
    return null;
  }

  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function toSortedCategories(items: AdminCategory[]): AdminCategory[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function AdminCategoriesClient({
  initialCategories,
}: AdminCategoriesClientProps) {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState(() =>
    toSortedCategories(initialCategories),
  );
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingRowAction, setPendingRowAction] = useState<
    Record<string, boolean>
  >({});
  const [confirmAction, setConfirmAction] = useState<{
    categoryId: string;
    action: "schedule" | "restore";
  } | null>(null);

  const counts = useMemo(
    () => ({
      active: categories.filter(
        (item) => item.deletedAt === null && item.scheduledDeletionAt === null,
      ).length,
      pending: categories.filter(
        (item) => item.deletedAt === null && item.scheduledDeletionAt !== null,
      ).length,
      deleted: categories.filter((item) => item.deletedAt !== null).length,
    }),
    [categories],
  );

  const confirmCategory =
    confirmAction !== null
      ? (categories.find((item) => item.id === confirmAction.categoryId) ??
        null)
      : null;

  function pushNotification(tone: "success" | "error", message: string): void {
    dispatch(
      enqueueNotification({
        tone,
        message,
      }),
    );
  }

  async function onCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedIcon = icon.trim();

    if (normalizedName.length < 2) {
      pushNotification(
        "error",
        "Category name must contain at least 2 characters.",
      );
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          icon: normalizedIcon.length > 0 ? normalizedIcon : undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminCategory>(payload)) {
        pushNotification(
          "error",
          parseApiMessage(payload) ??
            "Failed to create category. Please try again.",
        );
        return;
      }

      setCategories((previous) =>
        toSortedCategories([...previous, payload.data]),
      );
      setName("");
      setIcon("");
      pushNotification("success", `Created category \"${payload.data.name}\".`);
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error ? error.message : "Failed to create category.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function runRowAction(options: {
    category: AdminCategory;
    method: "DELETE" | "POST";
    endpoint: string;
    successMessage: (nextCategory: AdminCategory) => string;
    failureFallback: string;
  }) {
    const { category, method, endpoint, successMessage, failureFallback } =
      options;

    setPendingRowAction((previous) => ({
      ...previous,
      [category.id]: true,
    }));

    try {
      const response = await fetch(endpoint, {
        method,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminCategory>(payload)) {
        pushNotification("error", parseApiMessage(payload) ?? failureFallback);
        return;
      }

      setCategories((previous) =>
        toSortedCategories(
          previous.map((item) =>
            item.id === category.id ? payload.data : item,
          ),
        ),
      );
      pushNotification("success", successMessage(payload.data));
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error ? error.message : failureFallback,
      );
    } finally {
      setPendingRowAction((previous) => ({
        ...previous,
        [category.id]: false,
      }));
    }
  }

  async function onConfirmAction() {
    if (!confirmAction || !confirmCategory) {
      return;
    }

    if (confirmAction.action === "restore") {
      await runRowAction({
        category: confirmCategory,
        method: "POST",
        endpoint: `/api/admin/categories/${confirmCategory.id}/restore`,
        successMessage: (nextCategory) =>
          `Restored category \"${nextCategory.name}\".`,
        failureFallback: "Failed to restore category.",
      });
    } else {
      await runRowAction({
        category: confirmCategory,
        method: "DELETE",
        endpoint: `/api/admin/categories/${confirmCategory.id}`,
        successMessage: (nextCategory) => {
          const formatted = formatDeletionDate(
            nextCategory.scheduledDeletionAt,
          );
          return formatted
            ? `Scheduled deletion for \"${nextCategory.name}\" on ${formatted}.`
            : `Scheduled deletion for \"${nextCategory.name}\".`;
        },
        failureFallback: "Failed to schedule category deletion.",
      });
    }

    setConfirmAction(null);
  }

  return (
    <section className="space-y-4">
      <Card className="shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
        <CardTitle>Create category</CardTitle>
        <CardDescription className="mt-1 text-xs">
          Delete uses a 30-day grace period. Pending categories can be restored.
        </CardDescription>

        <form
          className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr_auto]"
          onSubmit={onCreateCategory}
        >
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
              maxLength={80}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-icon">Icon (optional)</Label>
            <Input
              id="category-icon"
              type="text"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="icon-name"
              maxLength={80}
            />
          </div>

          <Button type="submit" disabled={creating} className="self-end">
            {creating ? "Creating..." : "Create"}
          </Button>
        </form>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Active
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {counts.active}
          </p>
        </Card>
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Pending deletion
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {counts.pending}
          </p>
        </Card>
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Deleted
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {counts.deleted}
          </p>
        </Card>
      </section>

      {categories.length === 0 ? (
        <Card>
          <CardTitle>No categories found</CardTitle>
          <CardDescription className="mt-1">
            Create your first category to classify apps and control deletion
            lifecycle.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const status = resolveCategoryStatus(category);
            const isBusy = Boolean(pendingRowAction[category.id]);
            const canSchedule = canScheduleCategoryDeletion(category);
            const scheduledAt = formatDeletionDate(
              category.scheduledDeletionAt,
            );

            return (
              <Card key={category.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {category.icon
                        ? `Icon: ${category.icon}`
                        : "No icon configured"}
                    </CardDescription>
                  </div>
                  <Badge tone={STATUS_BADGE_TONE[status.tone]}>
                    {status.label}
                  </Badge>
                </div>

                <div className="ui-text-muted grid gap-1 text-xs">
                  <p>Active apps: {category._count.apps}</p>
                  {scheduledAt ? <p>Deletes on: {scheduledAt}</p> : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {category.scheduledDeletionAt ? (
                    <Button
                      tone="secondary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        setConfirmAction({
                          categoryId: category.id,
                          action: "restore",
                        })
                      }
                    >
                      {isBusy ? "Restoring..." : "Restore"}
                    </Button>
                  ) : (
                    <Button
                      tone="danger"
                      size="sm"
                      disabled={!canSchedule || isBusy}
                      onClick={() =>
                        setConfirmAction({
                          categoryId: category.id,
                          action: "schedule",
                        })
                      }
                    >
                      {isBusy ? "Scheduling..." : "Schedule delete"}
                    </Button>
                  )}
                </div>

                {!canSchedule && !category.scheduledDeletionAt ? (
                  <p className="ui-text-muted text-xs">
                    Remove active apps before scheduling deletion.
                  </p>
                ) : null}
              </Card>
            );
          })}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction && confirmCategory)}
        title={
          confirmAction?.action === "restore"
            ? "Restore category"
            : "Schedule category deletion"
        }
        description={
          confirmAction?.action === "restore"
            ? `Restore \"${confirmCategory?.name ?? "this category"}\" and make it active again?`
            : `Schedule deletion for \"${confirmCategory?.name ?? "this category"}\" after the 30-day grace period?`
        }
        confirmLabel={
          confirmAction?.action === "restore" ? "Restore" : "Schedule"
        }
        confirmTone={confirmAction?.action === "restore" ? "primary" : "danger"}
        busy={Boolean(confirmCategory && pendingRowAction[confirmCategory.id])}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void onConfirmAction()}
      />
    </section>
  );
}
