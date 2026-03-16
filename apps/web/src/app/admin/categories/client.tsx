"use client";

import type { AdminCategory } from "@/lib/view-models";
import type { ApiResponse } from "@elsesourav/types";
import { useState } from "react";

type CategoryMutationFeedback = {
  tone: "success" | "error";
  message: string;
};

type CategoryStatusTone = "active" | "pending" | "deleted";

type CategoryStatus = {
  label: string;
  tone: CategoryStatusTone;
};

type AdminCategoriesClientProps = {
  initialCategories: AdminCategory[];
};

const STATUS_CLASSNAMES: Record<CategoryStatusTone, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-[#f2c9d1] bg-[#fff7f8] text-[#941e33]",
  deleted: "border-black/20 bg-[#f3f4f6] text-[#3f4757]",
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
  const [categories, setCategories] = useState(() =>
    toSortedCategories(initialCategories),
  );
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingRowAction, setPendingRowAction] = useState<
    Record<string, boolean>
  >({});
  const [feedback, setFeedback] = useState<CategoryMutationFeedback | null>(
    null,
  );

  async function onCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedIcon = icon.trim();

    if (normalizedName.length < 2) {
      setFeedback({
        tone: "error",
        message: "Category name must contain at least 2 characters.",
      });
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
        setFeedback({
          tone: "error",
          message:
            parseApiMessage(payload) ??
            "Failed to create category. Please try again.",
        });
        return;
      }

      setCategories((previous) =>
        toSortedCategories([...previous, payload.data]),
      );
      setName("");
      setIcon("");
      setFeedback({
        tone: "success",
        message: `Created category \"${payload.data.name}\".`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Failed to create category.",
      });
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
        setFeedback({
          tone: "error",
          message: parseApiMessage(payload) ?? failureFallback,
        });
        return;
      }

      setCategories((previous) =>
        previous.map((item) => (item.id === category.id ? payload.data : item)),
      );
      setFeedback({
        tone: "success",
        message: successMessage(payload.data),
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : failureFallback,
      });
    } finally {
      setPendingRowAction((previous) => ({
        ...previous,
        [category.id]: false,
      }));
    }
  }

  return (
    <section className="space-y-4">
      <article className="rounded-xl border border-black/15 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
        <h2 className="text-base font-semibold text-[#111722]">
          Create category
        </h2>
        <p className="mt-1 text-xs text-[#4a5262]">
          Delete uses a 30-day grace period. Pending categories can be restored.
        </p>

        <form
          className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr_auto]"
          onSubmit={onCreateCategory}
        >
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
            maxLength={80}
            required
          />
          <input
            type="text"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            placeholder="Icon (optional)"
            className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
            maxLength={80}
          />
          <button
            type="submit"
            className="rounded-lg bg-[#14171f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </article>

      {feedback ? (
        <p
          className={[
            "rounded-lg border px-3 py-2 text-sm",
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {feedback.message}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No category records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Icon</th>
                <th className="px-3 py-2">Active apps</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const status = resolveCategoryStatus(category);
                const isBusy = Boolean(pendingRowAction[category.id]);
                const canSchedule = canScheduleCategoryDeletion(category);
                const scheduledAt = formatDeletionDate(
                  category.scheduledDeletionAt,
                );

                return (
                  <tr
                    key={category.id}
                    className="border-b border-black/10 align-top last:border-0"
                  >
                    <td className="px-3 py-2 font-medium text-[#111722]">
                      {category.name}
                    </td>
                    <td className="px-3 py-2 text-[#364055]">
                      {category.icon ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-[#364055]">
                      {category._count.apps}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2 py-1 text-xs font-semibold",
                          STATUS_CLASSNAMES[status.tone],
                        ].join(" ")}
                      >
                        {status.label}
                      </span>
                      {scheduledAt ? (
                        <p className="mt-1 text-xs text-[#4a5262]">
                          Deletes on {scheduledAt}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      {category.scheduledDeletionAt ? (
                        <button
                          type="button"
                          className="rounded-md border border-black/20 bg-white px-3 py-1.5 text-xs font-medium text-[#111722] disabled:opacity-60"
                          disabled={isBusy}
                          onClick={() =>
                            void runRowAction({
                              category,
                              method: "POST",
                              endpoint: `/api/admin/categories/${category.id}/restore`,
                              successMessage: (nextCategory) =>
                                `Restored category \"${nextCategory.name}\".`,
                              failureFallback: "Failed to restore category.",
                            })
                          }
                        >
                          {isBusy ? "Restoring..." : "Restore"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-60"
                          disabled={!canSchedule || isBusy}
                          onClick={() =>
                            void runRowAction({
                              category,
                              method: "DELETE",
                              endpoint: `/api/admin/categories/${category.id}`,
                              successMessage: (nextCategory) => {
                                const formatted = formatDeletionDate(
                                  nextCategory.scheduledDeletionAt,
                                );
                                return formatted
                                  ? `Scheduled deletion for \"${nextCategory.name}\" on ${formatted}.`
                                  : `Scheduled deletion for \"${nextCategory.name}\".`;
                              },
                              failureFallback:
                                "Failed to schedule category deletion.",
                            })
                          }
                        >
                          {isBusy ? "Scheduling..." : "Schedule delete"}
                        </button>
                      )}
                      {!canSchedule && !category.scheduledDeletionAt ? (
                        <p className="mt-1 text-xs text-[#4a5262]">
                          Remove active apps before scheduling deletion.
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </section>
  );
}
