"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { formatDateTime, type AdminFeedbackItem } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";

type FeedbackVisibilityFilter = "all" | "visible" | "hidden";

type FeedbackMutationResponse = {
  id: string;
  isHidden: boolean;
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

function toSortedFeedback(items: AdminFeedbackItem[]): AdminFeedbackItem[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function ratingStars(rating: number): string {
  const safe = Math.min(5, Math.max(1, Math.round(rating)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

export function AdminFeedbackClient({
  initialFeedback,
}: {
  initialFeedback: AdminFeedbackItem[];
}) {
  const dispatch = useAppDispatch();
  const [feedback, setFeedback] = useState(() =>
    toSortedFeedback(initialFeedback),
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FeedbackVisibilityFilter>("all");
  const [pendingFeedbackId, setPendingFeedbackId] = useState<string | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<{
    feedbackId: string;
    nextHidden: boolean;
  } | null>(null);

  const stats = useMemo(() => {
    const hidden = feedback.filter((item) => item.isHidden).length;
    const visible = feedback.length - hidden;

    return {
      total: feedback.length,
      hidden,
      visible,
      averageRating:
        feedback.length === 0
          ? "-"
          : (
              feedback.reduce((sum, item) => sum + item.rating, 0) /
              feedback.length
            ).toFixed(1),
    };
  }, [feedback]);

  const filteredFeedback = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return feedback.filter((item) => {
      if (filter === "visible" && item.isHidden) {
        return false;
      }

      if (filter === "hidden" && !item.isHidden) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        item.app.title,
        item.app.slug,
        item.user.name,
        item.user.email,
        item.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [feedback, filter, query]);

  const confirmItem =
    confirmAction !== null
      ? (feedback.find((item) => item.id === confirmAction.feedbackId) ?? null)
      : null;

  async function onConfirmModeration() {
    if (!confirmAction || !confirmItem) {
      return;
    }

    setPendingFeedbackId(confirmAction.feedbackId);

    try {
      const response = await fetch(
        `/api/admin/feedback/${confirmAction.feedbackId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            isHidden: confirmAction.nextHidden,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<FeedbackMutationResponse>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message:
              parseApiMessage(payload) ??
              "Failed to update feedback visibility.",
          }),
        );
        return;
      }

      setFeedback((previous) =>
        previous.map((item) =>
          item.id === confirmAction.feedbackId
            ? {
                ...item,
                isHidden: payload.data.isHidden,
              }
            : item,
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: payload.data.isHidden
            ? "Feedback hidden from public surfaces."
            : "Feedback restored to public surfaces.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update feedback visibility.",
        }),
      );
    } finally {
      setPendingFeedbackId(null);
      setConfirmAction(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Entries
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {stats.total.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Visible
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {stats.visible.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Hidden
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {stats.hidden.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Avg rating
          </p>
          <p className="ui-text-heading mt-1 text-2xl font-semibold">
            {stats.averageRating}
          </p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <label
              htmlFor="feedback-search"
              className="ui-label text-xs font-semibold uppercase tracking-wide"
            >
              Search
            </label>
            <Input
              id="feedback-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by app, user, or message"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="feedback-filter"
              className="ui-label text-xs font-semibold uppercase tracking-wide"
            >
              Visibility
            </label>
            <select
              id="feedback-filter"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as FeedbackVisibilityFilter)
              }
              className="ui-input min-w-45 rounded-lg border px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="visible">Visible only</option>
              <option value="hidden">Hidden only</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredFeedback.length === 0 ? (
        <Card>
          <CardTitle>No feedback matches current filter</CardTitle>
          <CardDescription className="mt-1">
            Try clearing search text or changing visibility filter.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFeedback.map((item) => {
            const isBusy = pendingFeedbackId === item.id;
            const nextHidden = !item.isHidden;

            return (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.app.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.user.name ?? item.user.email}
                    </CardDescription>
                  </div>
                  <Badge tone={item.isHidden ? "warning" : "success"}>
                    {item.isHidden ? "Hidden" : "Visible"}
                  </Badge>
                </div>

                <div className="ui-text-muted grid gap-1 text-xs">
                  <p>
                    Rating: {item.rating}/5 ({ratingStars(item.rating)})
                  </p>
                  <p>Created: {formatDateTime(item.createdAt)}</p>
                  <p>App slug: /{item.app.slug}</p>
                </div>

                <p className="ui-surface-soft ui-border ui-text-muted line-clamp-4 rounded-lg border px-3 py-2 text-sm">
                  {item.message}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    tone={item.isHidden ? "secondary" : "danger"}
                    size="sm"
                    disabled={isBusy}
                    onClick={() =>
                      setConfirmAction({
                        feedbackId: item.id,
                        nextHidden,
                      })
                    }
                  >
                    {isBusy
                      ? "Updating..."
                      : item.isHidden
                        ? "Restore feedback"
                        : "Hide feedback"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction && confirmItem)}
        title={confirmAction?.nextHidden ? "Hide feedback" : "Restore feedback"}
        description={
          confirmAction?.nextHidden
            ? "This will hide the feedback from public views while keeping it for moderation history."
            : "This will make the feedback visible to users again."
        }
        confirmLabel={confirmAction?.nextHidden ? "Hide" : "Restore"}
        confirmTone={confirmAction?.nextHidden ? "danger" : "primary"}
        busy={Boolean(pendingFeedbackId)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void onConfirmModeration()}
      />
    </section>
  );
}
