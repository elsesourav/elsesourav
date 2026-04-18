"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatDateTime, type AdminSectionItem } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";

type SectionType = "FEATURED" | "LATEST" | "UPCOMING";

type SectionFormState = {
  appId: string;
  sectionType: SectionType;
  orderIndex: string;
  releaseAt: string;
  startsAt: string;
  endsAt: string;
};

type AppOption = {
  id: string;
  title: string;
  slug: string;
};

const sectionTypeOptions: SectionType[] = ["FEATURED", "LATEST", "UPCOMING"];

const sectionTypeBadgeTone: Record<
  SectionType,
  "info" | "success" | "warning"
> = {
  FEATURED: "info",
  LATEST: "success",
  UPCOMING: "warning",
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

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrUndefined(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function sectionOrderValue(sectionType: string): number {
  switch (sectionType) {
    case "FEATURED":
      return 0;
    case "LATEST":
      return 1;
    case "UPCOMING":
      return 2;
    default:
      return 10;
  }
}

function toSortedSectionItems(items: AdminSectionItem[]): AdminSectionItem[] {
  return [...items].sort((a, b) => {
    const typeDelta =
      sectionOrderValue(a.sectionType) - sectionOrderValue(b.sectionType);
    if (typeDelta !== 0) {
      return typeDelta;
    }

    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }

    return a.app.title.localeCompare(b.app.title);
  });
}

function createEmptyForm(apps: AppOption[]): SectionFormState {
  return {
    appId: apps[0]?.id ?? "",
    sectionType: "FEATURED",
    orderIndex: "0",
    releaseAt: "",
    startsAt: "",
    endsAt: "",
  };
}

function createEditFormFromItem(item: AdminSectionItem): SectionFormState {
  return {
    appId: item.app.id,
    sectionType: item.sectionType as SectionType,
    orderIndex: String(item.orderIndex),
    releaseAt: toDateTimeLocal(item.releaseAt),
    startsAt: toDateTimeLocal(item.startsAt),
    endsAt: toDateTimeLocal(item.endsAt),
  };
}

function validateForm(
  form: SectionFormState,
  options: {
    requireAppId: boolean;
  },
): string | null {
  if (options.requireAppId && !form.appId) {
    return "Please select an app.";
  }

  if (!sectionTypeOptions.includes(form.sectionType)) {
    return "Please choose a valid section type.";
  }

  const orderIndex = Number(form.orderIndex);
  if (!Number.isInteger(orderIndex) || orderIndex < 0) {
    return "Order index must be an integer greater than or equal to 0.";
  }

  if (form.startsAt && form.endsAt) {
    const startsAt = new Date(form.startsAt);
    const endsAt = new Date(form.endsAt);

    if (endsAt <= startsAt) {
      return "End date must be after start date.";
    }
  }

  return null;
}

function SectionItemCard({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: AdminSectionItem;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const sectionType = item.sectionType as SectionType;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{item.app.title}</CardTitle>
          <CardDescription className="mt-1">/{item.app.slug}</CardDescription>
        </div>
        <Badge tone={sectionTypeBadgeTone[sectionType] ?? "neutral"}>
          {item.sectionType}
        </Badge>
      </div>

      <div className="ui-text-muted grid gap-1 text-xs">
        <p>Order index: {item.orderIndex}</p>
        <p>Release at: {formatDateTime(item.releaseAt)}</p>
        <p>Starts at: {formatDateTime(item.startsAt)}</p>
        <p>Ends at: {formatDateTime(item.endsAt)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button tone="secondary" size="sm" onClick={onEdit}>
          Edit timing
        </Button>
        <Button tone="danger" size="sm" disabled={deleting} onClick={onDelete}>
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Card>
  );
}

function SectionEditorFields({
  form,
  onChange,
  appOptions,
  lockIdentity,
}: {
  form: SectionFormState;
  onChange: (nextState: SectionFormState) => void;
  appOptions: AppOption[];
  lockIdentity: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="section-app">App</Label>
        <select
          id="section-app"
          value={form.appId}
          onChange={(event) =>
            onChange({
              ...form,
              appId: event.target.value,
            })
          }
          disabled={lockIdentity}
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
        >
          {appOptions.length === 0 ? (
            <option value="">No apps available</option>
          ) : null}
          {appOptions.map((app) => (
            <option key={app.id} value={app.id}>
              {app.title} (/{app.slug})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="section-type">Section type</Label>
        <select
          id="section-type"
          value={form.sectionType}
          onChange={(event) =>
            onChange({
              ...form,
              sectionType: event.target.value as SectionType,
            })
          }
          disabled={lockIdentity}
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
        >
          {sectionTypeOptions.map((sectionType) => (
            <option key={sectionType} value={sectionType}>
              {sectionType}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="section-order">Order index</Label>
        <Input
          id="section-order"
          type="number"
          min="0"
          step="1"
          value={form.orderIndex}
          onChange={(event) =>
            onChange({
              ...form,
              orderIndex: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="section-release">Release at</Label>
        <Input
          id="section-release"
          type="datetime-local"
          value={form.releaseAt}
          onChange={(event) =>
            onChange({
              ...form,
              releaseAt: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="section-starts">Starts at</Label>
        <Input
          id="section-starts"
          type="datetime-local"
          value={form.startsAt}
          onChange={(event) =>
            onChange({
              ...form,
              startsAt: event.target.value,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="section-ends">Ends at</Label>
        <Input
          id="section-ends"
          type="datetime-local"
          value={form.endsAt}
          onChange={(event) =>
            onChange({
              ...form,
              endsAt: event.target.value,
            })
          }
        />
      </div>

      {lockIdentity ? (
        <p className="ui-text-muted text-xs lg:col-span-2">
          App and section type are fixed during update. Create another item to
          move this app to a different section.
        </p>
      ) : null}
    </div>
  );
}

export function AdminSectionItemsClient({
  initialItems,
  appOptions,
}: {
  initialItems: AdminSectionItem[];
  appOptions: AppOption[];
}) {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState(() => toSortedSectionItems(initialItems));

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<SectionFormState>(() =>
    createEmptyForm(appOptions),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SectionFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      featured: items.filter((item) => item.sectionType === "FEATURED").length,
      latest: items.filter((item) => item.sectionType === "LATEST").length,
      upcoming: items.filter((item) => item.sectionType === "UPCOMING").length,
    }),
    [items],
  );

  const editingItem =
    editingItemId !== null
      ? (items.find((item) => item.id === editingItemId) ?? null)
      : null;

  const deletingItem =
    confirmDeleteId !== null
      ? (items.find((item) => item.id === confirmDeleteId) ?? null)
      : null;

  async function onCreateSectionItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(createForm, { requireAppId: true });
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/store/sections/items", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          appId: createForm.appId,
          sectionType: createForm.sectionType,
          orderIndex: Number(createForm.orderIndex),
          releaseAt: toIsoOrUndefined(createForm.releaseAt),
          startsAt: toIsoOrUndefined(createForm.startsAt),
          endsAt: toIsoOrUndefined(createForm.endsAt),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminSectionItem>(payload)) {
        setCreateError(
          parseApiMessage(payload) ??
            "Failed to save section item. Please retry.",
        );
        return;
      }

      setItems((previous) => {
        const withoutExisting = previous.filter(
          (item) => item.id !== payload.data.id,
        );
        return toSortedSectionItems([payload.data, ...withoutExisting]);
      });
      setCreateForm(createEmptyForm(appOptions));
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Saved ${payload.data.app.title} in ${payload.data.sectionType}.`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to save section item.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSaveSectionItemEdits(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingItemId || !editForm) {
      return;
    }

    const validationError = validateForm(editForm, { requireAppId: false });
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(
        `/api/admin/store/sections/items/${editingItemId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            orderIndex: Number(editForm.orderIndex),
            releaseAt: toIsoOrUndefined(editForm.releaseAt),
            startsAt: toIsoOrUndefined(editForm.startsAt),
            endsAt: toIsoOrUndefined(editForm.endsAt),
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminSectionItem>(payload)) {
        setEditError(
          parseApiMessage(payload) ?? "Failed to update section item. Retry.",
        );
        return;
      }

      setItems((previous) =>
        toSortedSectionItems(
          previous.map((item) =>
            item.id === editingItemId ? payload.data : item,
          ),
        ),
      );
      setEditingItemId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Updated ${payload.data.app.title} in ${payload.data.sectionType}.`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update section item.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmDelete() {
    if (!confirmDeleteId) {
      return;
    }

    setDeletingItemId(confirmDeleteId);

    try {
      const response = await fetch(
        `/api/admin/store/sections/items/${confirmDeleteId}`,
        {
          method: "DELETE",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<{ deleted: boolean }>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message:
              parseApiMessage(payload) ?? "Failed to delete section item.",
          }),
        );
        return;
      }

      setItems((previous) =>
        previous.filter((item) => item.id !== confirmDeleteId),
      );
      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Section item deleted.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete section item.",
        }),
      );
    } finally {
      setDeletingItemId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ui-text-muted text-sm">
          {items.length.toLocaleString()} items: {counts.featured} featured,{" "}
          {counts.latest} latest, {counts.upcoming} upcoming.
        </p>
        <Button
          tone="primary"
          onClick={() => setCreateOpen(true)}
          disabled={appOptions.length === 0}
        >
          Add section item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardTitle>No section items yet</CardTitle>
          <CardDescription className="mt-1">
            Add apps to featured, latest, or upcoming groups with release
            windows.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <SectionItemCard
              key={item.id}
              item={item}
              deleting={deletingItemId === item.id}
              onEdit={() => {
                setEditingItemId(item.id);
                setEditForm(createEditFormFromItem(item));
                setEditError(null);
              }}
              onDelete={() => setConfirmDeleteId(item.id)}
            />
          ))}
        </section>
      )}

      <Modal
        open={createOpen}
        onClose={() => {
          if (creating) {
            return;
          }

          setCreateOpen(false);
          setCreateError(null);
        }}
        title="Create section item"
        description="Place apps into store sections and control display timing windows."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreateSectionItem}>
          <SectionEditorFields
            form={createForm}
            onChange={setCreateForm}
            appOptions={appOptions}
            lockIdentity={false}
          />

          {createError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              tone="secondary"
              onClick={() => {
                setCreateOpen(false);
                setCreateError(null);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || appOptions.length === 0}
            >
              {creating ? "Saving..." : "Save item"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingItemId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingItemId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={
          editingItem ? `Edit ${editingItem.app.title}` : "Edit section item"
        }
        description="Adjust ordering and visibility window for the selected app."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSaveSectionItemEdits}>
            <SectionEditorFields
              form={editForm}
              onChange={setEditForm}
              appOptions={appOptions}
              lockIdentity
            />

            {editError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                tone="secondary"
                onClick={() => {
                  setEditingItemId(null);
                  setEditForm(null);
                  setEditError(null);
                }}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDeleteId && deletingItem)}
        title="Delete section item"
        description={`Remove ${deletingItem?.app.title ?? "this app"} from ${deletingItem?.sectionType ?? "section"}?`}
        confirmLabel="Delete"
        busy={Boolean(deletingItemId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => void onConfirmDelete()}
      />
    </section>
  );
}
