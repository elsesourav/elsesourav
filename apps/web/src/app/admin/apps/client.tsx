"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDateTime,
  formatPrice,
  type AdminAppListItem,
} from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";
import {
  removeLinkById,
  replaceLinkById,
  toSortedLinks,
  upsertLinkByPlatform,
  validateLinkUrls,
  type AdminAppLink,
  type LinkPlatform,
} from "./link-state";

type AppStatus = "DRAFT" | "PUBLISHED";

type AppCategoryOption = {
  id: string;
  name: string;
};

type AppTagOption = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    appLinks: number;
  };
};

type AppFormState = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  version: string;
  status: AppStatus;
  isPaid: boolean;
  isFeatured: boolean;
  price: string;
  categoryId: string;
};

type AppMutationResponse = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  version: string;
  status: string;
  isPaid: boolean;
  isFeatured: boolean;
  price: number | string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
};

type AppTagMutationResponse = {
  appId: string;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

const statusOptions: AppStatus[] = ["DRAFT", "PUBLISHED"];
const linkPlatformOptions: LinkPlatform[] = [
  "WEBSITE",
  "CHROME",
  "ANDROID",
  "GITHUB",
  "OTHER",
];

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

function toSortedApps(items: AdminAppListItem[]): AdminAppListItem[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function toSortedTags(items: AppTagOption[]): AppTagOption[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function createEmptyForm(categoryOptions: AppCategoryOption[]): AppFormState {
  return {
    title: "",
    shortDescription: "",
    fullDescription: "",
    version: "1.0.0",
    status: "DRAFT",
    isPaid: false,
    isFeatured: false,
    price: "0",
    categoryId: categoryOptions[0]?.id ?? "",
  };
}

function createFormFromItem(item: AdminAppListItem): AppFormState {
  return {
    title: item.title,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription,
    version: item.version,
    status: item.status as AppStatus,
    isPaid: item.isPaid,
    isFeatured: item.isFeatured,
    price: String(item.price),
    categoryId: item.category.id,
  };
}

function normalizeMutationItem(
  item: AppMutationResponse,
  previous?: AdminAppListItem,
): AdminAppListItem {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription,
    version: item.version,
    status: item.status,
    isPaid: item.isPaid,
    isFeatured: item.isFeatured,
    price: item.price,
    updatedAt: item.updatedAt,
    category: item.category,
    tags: previous?.tags ?? [],
    _count: previous?._count ?? {
      feedbacks: 0,
      downloadEvents: 0,
    },
  };
}

function validateForm(form: AppFormState): string | null {
  if (form.title.trim().length < 3) {
    return "Title must contain at least 3 characters.";
  }

  if (form.shortDescription.trim().length < 10) {
    return "Short description must contain at least 10 characters.";
  }

  if (form.fullDescription.trim().length < 20) {
    return "Full description must contain at least 20 characters.";
  }

  if (form.version.trim().length < 1 || form.version.trim().length > 20) {
    return "Version must be between 1 and 20 characters.";
  }

  if (!statusOptions.includes(form.status)) {
    return "Please select a valid status.";
  }

  if (!form.categoryId) {
    return "Please select a category.";
  }

  const parsedPrice = Number(form.price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return "Price must be a number greater than or equal to 0.";
  }

  if (!form.isPaid && parsedPrice !== 0) {
    return "Price must be 0 when app is free.";
  }

  if (form.isPaid && parsedPrice <= 0) {
    return "Paid apps must have a price greater than 0.";
  }

  return null;
}

function statusTone(status: string): "success" | "warning" | "neutral" {
  const normalized = status.toUpperCase();

  if (normalized.includes("PUBLISH")) {
    return "success";
  }

  if (normalized.includes("DRAFT")) {
    return "warning";
  }

  return "neutral";
}

function AppCard({
  app,
  onEdit,
  onManageTags,
  onManageLinks,
  onDelete,
  deleting,
}: {
  app: AdminAppListItem;
  onEdit: () => void;
  onManageTags: () => void;
  onManageLinks: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{app.title}</CardTitle>
          <CardDescription className="mt-1">/{app.slug}</CardDescription>
        </div>
        <Badge tone={statusTone(app.status)}>{app.status}</Badge>
      </div>

      <p className="line-clamp-3 text-sm text-[#4f5970]">
        {app.shortDescription}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {app.tags.length === 0 ? (
          <span className="text-xs text-[#5a647d]">No tags assigned</span>
        ) : (
          app.tags.map((tag) => (
            <Badge key={tag.id} tone="info" className="text-[10px]">
              {tag.name}
            </Badge>
          ))
        )}
      </div>

      <div className="grid gap-1 text-xs text-[#5a647d]">
        <p>Category: {app.category.name}</p>
        <p>Version: {app.version}</p>
        <p>Price: {app.isPaid ? formatPrice(app.price) : "Free"}</p>
        <p>Featured: {app.isFeatured ? "Yes" : "No"}</p>
        <p>Feedback: {app._count.feedbacks}</p>
        <p>Downloads: {app._count.downloadEvents}</p>
        <p>Updated: {formatDateTime(app.updatedAt)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button tone="secondary" size="sm" onClick={onEdit}>
          Edit app
        </Button>
        <Button tone="ghost" size="sm" onClick={onManageTags}>
          Manage tags
        </Button>
        <Button tone="ghost" size="sm" onClick={onManageLinks}>
          Release links
        </Button>
        <Button tone="danger" size="sm" disabled={deleting} onClick={onDelete}>
          {deleting ? "Deleting..." : "Delete app"}
        </Button>
      </div>
    </Card>
  );
}

function AppEditorFields({
  form,
  onChange,
  categoryOptions,
}: {
  form: AppFormState;
  onChange: (nextState: AppFormState) => void;
  categoryOptions: AppCategoryOption[];
}) {
  function updateField<Key extends keyof AppFormState>(
    key: Key,
    value: AppFormState[Key],
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-title">Title</Label>
        <Input
          id="app-title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="app-category">Category</Label>
        <select
          id="app-category"
          value={form.categoryId}
          onChange={(event) => updateField("categoryId", event.target.value)}
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
        >
          {categoryOptions.length === 0 ? (
            <option value="">No categories</option>
          ) : null}
          {categoryOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="app-status">Status</Label>
        <select
          id="app-status"
          value={form.status}
          onChange={(event) =>
            updateField("status", event.target.value as AppStatus)
          }
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="app-version">Version</Label>
        <Input
          id="app-version"
          value={form.version}
          onChange={(event) => updateField("version", event.target.value)}
          maxLength={20}
          required
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-short-description">Short description</Label>
        <Textarea
          id="app-short-description"
          value={form.shortDescription}
          onChange={(event) =>
            updateField("shortDescription", event.target.value)
          }
          rows={3}
          maxLength={300}
          required
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-full-description">Full description</Label>
        <Textarea
          id="app-full-description"
          value={form.fullDescription}
          onChange={(event) =>
            updateField("fullDescription", event.target.value)
          }
          rows={8}
          maxLength={5000}
          required
        />
      </div>

      <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#f8fbff] px-3 py-2 text-sm text-[#1a2439]">
        <input
          type="checkbox"
          checked={form.isPaid}
          onChange={(event) => {
            const nextPaid = event.target.checked;
            updateField("isPaid", nextPaid);
            if (!nextPaid) {
              onChange({
                ...form,
                isPaid: false,
                price: "0",
              });
            }
          }}
          className="h-4 w-4"
        />
        Paid app
      </label>

      <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#f8fbff] px-3 py-2 text-sm text-[#1a2439]">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) => updateField("isFeatured", event.target.checked)}
          className="h-4 w-4"
        />
        Featured placement
      </label>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-price">Price</Label>
        <Input
          id="app-price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(event) => updateField("price", event.target.value)}
          disabled={!form.isPaid}
        />
      </div>
    </div>
  );
}

export function AdminAppsClient({
  initialApps,
  initialTags,
  categoryOptions,
}: {
  initialApps: AdminAppListItem[];
  initialTags: AppTagOption[];
  categoryOptions: AppCategoryOption[];
}) {
  const dispatch = useAppDispatch();
  const [apps, setApps] = useState(() => toSortedApps(initialApps));
  const [tags, setTags] = useState(() => toSortedTags(initialTags));
  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AppFormState>(() =>
    createEmptyForm(categoryOptions),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AppFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  const [tagLibraryOpen, setTagLibraryOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [tagCreateError, setTagCreateError] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingTagSlug, setEditingTagSlug] = useState("");
  const [savingTagId, setSavingTagId] = useState<string | null>(null);

  const [confirmDeleteTagId, setConfirmDeleteTagId] = useState<string | null>(
    null,
  );
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const [taggingAppId, setTaggingAppId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagAssignmentError, setTagAssignmentError] = useState<string | null>(
    null,
  );
  const [savingTagAssignment, setSavingTagAssignment] = useState(false);

  const [linkModalAppId, setLinkModalAppId] = useState<string | null>(null);
  const [appLinksByAppId, setAppLinksByAppId] = useState<
    Record<string, AdminAppLink[]>
  >({});
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [newLinkPlatform, setNewLinkPlatform] =
    useState<LinkPlatform>("WEBSITE");
  const [newDownloadUrl, setNewDownloadUrl] = useState("");
  const [newSourceCodeUrl, setNewSourceCodeUrl] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkPlatform, setEditLinkPlatform] =
    useState<LinkPlatform>("WEBSITE");
  const [editDownloadUrl, setEditDownloadUrl] = useState("");
  const [editSourceCodeUrl, setEditSourceCodeUrl] = useState("");
  const [savingLinkId, setSavingLinkId] = useState<string | null>(null);

  const [confirmDeleteLinkId, setConfirmDeleteLinkId] = useState<string | null>(
    null,
  );
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return apps;
    }

    return apps.filter((item) =>
      [item.title, item.slug, item.category.name, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [apps, query]);

  const editingApp =
    editingAppId !== null
      ? (apps.find((item) => item.id === editingAppId) ?? null)
      : null;

  const deletingApp =
    confirmDeleteId !== null
      ? (apps.find((item) => item.id === confirmDeleteId) ?? null)
      : null;

  const taggingApp =
    taggingAppId !== null
      ? (apps.find((item) => item.id === taggingAppId) ?? null)
      : null;

  const deletingTag =
    confirmDeleteTagId !== null
      ? (tags.find((tag) => tag.id === confirmDeleteTagId) ?? null)
      : null;

  const linkModalApp =
    linkModalAppId !== null
      ? (apps.find((item) => item.id === linkModalAppId) ?? null)
      : null;

  const activeLinks =
    linkModalAppId !== null ? (appLinksByAppId[linkModalAppId] ?? []) : [];

  const deletingLink =
    confirmDeleteLinkId !== null
      ? (activeLinks.find((link) => link.id === confirmDeleteLinkId) ?? null)
      : null;

  function openTagAssignment(app: AdminAppListItem) {
    setTaggingAppId(app.id);
    setSelectedTagIds(app.tags.map((tag) => tag.id));
    setTagAssignmentError(null);
  }

  function resetLinkForm() {
    setNewLinkPlatform("WEBSITE");
    setNewDownloadUrl("");
    setNewSourceCodeUrl("");
    setEditingLinkId(null);
    setEditLinkPlatform("WEBSITE");
    setEditDownloadUrl("");
    setEditSourceCodeUrl("");
    setLinkError(null);
  }

  async function onCreateApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/apps", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: createForm.title.trim(),
          shortDescription: createForm.shortDescription.trim(),
          fullDescription: createForm.fullDescription.trim(),
          version: createForm.version.trim(),
          status: createForm.status,
          isPaid: createForm.isPaid,
          isFeatured: createForm.isFeatured,
          price: Number(createForm.price),
          categoryId: createForm.categoryId,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AppMutationResponse>(payload)) {
        setCreateError(parseApiMessage(payload) ?? "Failed to create app.");
        return;
      }

      setApps((previous) =>
        toSortedApps([normalizeMutationItem(payload.data), ...previous]),
      );
      setCreateForm(createEmptyForm(categoryOptions));
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Created app ${payload.data.title}.`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create app.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSaveEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingAppId || !editForm) {
      return;
    }

    const validationError = validateForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(`/api/admin/apps/${editingAppId}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          shortDescription: editForm.shortDescription.trim(),
          fullDescription: editForm.fullDescription.trim(),
          version: editForm.version.trim(),
          status: editForm.status,
          isPaid: editForm.isPaid,
          isFeatured: editForm.isFeatured,
          price: Number(editForm.price),
          categoryId: editForm.categoryId,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AppMutationResponse>(payload)) {
        setEditError(parseApiMessage(payload) ?? "Failed to update app.");
        return;
      }

      setApps((previous) =>
        toSortedApps(
          previous.map((item) =>
            item.id === editingAppId
              ? normalizeMutationItem(payload.data, item)
              : item,
          ),
        ),
      );
      setEditingAppId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Updated app ${payload.data.title}.`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update app.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmDelete() {
    if (!confirmDeleteId) {
      return;
    }

    setDeletingAppId(confirmDeleteId);

    try {
      const response = await fetch(`/api/admin/apps/${confirmDeleteId}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<{ deleted: boolean }>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to delete app.",
          }),
        );
        return;
      }

      setApps((previous) =>
        previous.filter((item) => item.id !== confirmDeleteId),
      );
      dispatch(
        enqueueNotification({
          tone: "success",
          message: "App removed from active catalog list.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Failed to delete app.",
        }),
      );
    } finally {
      setDeletingAppId(null);
      setConfirmDeleteId(null);
    }
  }

  async function onSaveTagAssignment() {
    if (!taggingAppId) {
      return;
    }

    setSavingTagAssignment(true);
    setTagAssignmentError(null);

    try {
      const response = await fetch(`/api/admin/apps/${taggingAppId}/tags`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          tagIds: selectedTagIds,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AppTagMutationResponse>(payload)) {
        setTagAssignmentError(
          parseApiMessage(payload) ?? "Failed to update app tags.",
        );
        return;
      }

      setApps((previous) =>
        previous.map((item) =>
          item.id === taggingAppId
            ? {
                ...item,
                tags: payload.data.tags.map((tag) => ({
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug,
                })),
              }
            : item,
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "App tags updated.",
        }),
      );

      setTaggingAppId(null);
    } catch (error) {
      setTagAssignmentError(
        error instanceof Error ? error.message : "Failed to update app tags.",
      );
    } finally {
      setSavingTagAssignment(false);
    }
  }

  async function onCreateTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newTagName.trim().length < 2) {
      setTagCreateError("Tag name must contain at least 2 characters.");
      return;
    }

    setTagCreateError(null);
    setCreatingTag(true);

    try {
      const response = await fetch("/api/admin/apps/tags", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          slug: newTagSlug.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AppTagOption>(payload)) {
        setTagCreateError(parseApiMessage(payload) ?? "Failed to create tag.");
        return;
      }

      setTags((previous) => toSortedTags([...previous, payload.data]));
      setNewTagName("");
      setNewTagSlug("");
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Tag ${payload.data.name} created.`,
        }),
      );
    } catch (error) {
      setTagCreateError(
        error instanceof Error ? error.message : "Failed to create tag.",
      );
    } finally {
      setCreatingTag(false);
    }
  }

  function startTagEdit(tag: AppTagOption) {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setEditingTagSlug(tag.slug);
  }

  async function onSaveTagEdit(tagId: string) {
    const normalizedName = editingTagName.trim();
    const normalizedSlug = editingTagSlug.trim();

    if (!normalizedName && !normalizedSlug) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message: "Provide a tag name or slug for update.",
        }),
      );
      return;
    }

    setSavingTagId(tagId);

    try {
      const response = await fetch(`/api/admin/apps/tags/${tagId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName || undefined,
          slug: normalizedSlug || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AppTagOption>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to update tag.",
          }),
        );
        return;
      }

      setTags((previous) =>
        toSortedTags(
          previous.map((tag) =>
            tag.id === tagId ? { ...tag, ...payload.data } : tag,
          ),
        ),
      );
      setApps((previous) =>
        previous.map((item) => ({
          ...item,
          tags: item.tags.map((tag) =>
            tag.id === tagId
              ? {
                  ...tag,
                  name: payload.data.name,
                  slug: payload.data.slug,
                }
              : tag,
          ),
        })),
      );

      setEditingTagId(null);
      setEditingTagName("");
      setEditingTagSlug("");

      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Tag ${payload.data.name} updated.`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Failed to update tag.",
        }),
      );
    } finally {
      setSavingTagId(null);
    }
  }

  async function onConfirmDeleteTag() {
    if (!confirmDeleteTagId) {
      return;
    }

    setDeletingTagId(confirmDeleteTagId);

    try {
      const response = await fetch(
        `/api/admin/apps/tags/${confirmDeleteTagId}`,
        {
          method: "DELETE",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<{ deleted: boolean }>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to delete tag.",
          }),
        );
        return;
      }

      setTags((previous) =>
        previous.filter((tag) => tag.id !== confirmDeleteTagId),
      );
      setApps((previous) =>
        previous.map((item) => ({
          ...item,
          tags: item.tags.filter((tag) => tag.id !== confirmDeleteTagId),
        })),
      );
      setSelectedTagIds((previous) =>
        previous.filter((id) => id !== confirmDeleteTagId),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Tag deleted.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Failed to delete tag.",
        }),
      );
    } finally {
      setDeletingTagId(null);
      setConfirmDeleteTagId(null);
    }
  }

  async function fetchLinksForApp(appId: string) {
    setLoadingLinks(true);
    setLinkError(null);

    try {
      const response = await fetch(`/api/admin/apps/${appId}/links`);
      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminAppLink[]>(payload)) {
        setLinkError(
          parseApiMessage(payload) ?? "Failed to load release links.",
        );
        return;
      }

      setAppLinksByAppId((previous) => ({
        ...previous,
        [appId]: toSortedLinks(payload.data),
      }));
    } catch (error) {
      setLinkError(
        error instanceof Error
          ? error.message
          : "Failed to load release links.",
      );
    } finally {
      setLoadingLinks(false);
    }
  }

  function openLinkManager(app: AdminAppListItem) {
    setLinkModalAppId(app.id);
    resetLinkForm();

    if (!appLinksByAppId[app.id]) {
      void fetchLinksForApp(app.id);
    }
  }

  async function onCreateLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!linkModalAppId) {
      return;
    }

    const validationError = validateLinkUrls(newDownloadUrl, newSourceCodeUrl);
    if (validationError) {
      setLinkError(validationError);
      return;
    }

    setCreatingLink(true);
    setLinkError(null);

    try {
      const response = await fetch(`/api/admin/apps/${linkModalAppId}/links`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          platform: newLinkPlatform,
          downloadUrl: newDownloadUrl.trim(),
          sourceCodeUrl: newSourceCodeUrl.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminAppLink>(payload)) {
        setLinkError(
          parseApiMessage(payload) ?? "Failed to create release link.",
        );
        return;
      }

      setAppLinksByAppId((previous) => {
        const current = previous[linkModalAppId] ?? [];

        return {
          ...previous,
          [linkModalAppId]: upsertLinkByPlatform(current, payload.data),
        };
      });
      setNewDownloadUrl("");
      setNewSourceCodeUrl("");

      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Release link created for ${payload.data.platform}.`,
        }),
      );
    } catch (error) {
      setLinkError(
        error instanceof Error
          ? error.message
          : "Failed to create release link.",
      );
    } finally {
      setCreatingLink(false);
    }
  }

  function startLinkEdit(link: AdminAppLink) {
    setEditingLinkId(link.id);
    setEditLinkPlatform(link.platform);
    setEditDownloadUrl(link.downloadUrl);
    setEditSourceCodeUrl(link.sourceCodeUrl ?? "");
    setLinkError(null);
  }

  async function onSaveLinkEdit(linkId: string) {
    if (!linkModalAppId) {
      return;
    }

    const validationError = validateLinkUrls(
      editDownloadUrl,
      editSourceCodeUrl,
    );
    if (validationError) {
      setLinkError(validationError);
      return;
    }

    setSavingLinkId(linkId);
    setLinkError(null);

    try {
      const response = await fetch(
        `/api/admin/apps/${linkModalAppId}/links/${linkId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            platform: editLinkPlatform,
            downloadUrl: editDownloadUrl.trim(),
            sourceCodeUrl: editSourceCodeUrl.trim() || null,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminAppLink>(payload)) {
        setLinkError(
          parseApiMessage(payload) ?? "Failed to update release link.",
        );
        return;
      }

      setAppLinksByAppId((previous) => {
        const current = previous[linkModalAppId] ?? [];
        return {
          ...previous,
          [linkModalAppId]: replaceLinkById(current, linkId, payload.data),
        };
      });
      setEditingLinkId(null);
      setEditDownloadUrl("");
      setEditSourceCodeUrl("");

      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Release link updated for ${payload.data.platform}.`,
        }),
      );
    } catch (error) {
      setLinkError(
        error instanceof Error
          ? error.message
          : "Failed to update release link.",
      );
    } finally {
      setSavingLinkId(null);
    }
  }

  async function onConfirmDeleteLink() {
    if (!linkModalAppId || !confirmDeleteLinkId) {
      return;
    }

    setDeletingLinkId(confirmDeleteLinkId);

    try {
      const response = await fetch(
        `/api/admin/apps/${linkModalAppId}/links/${confirmDeleteLinkId}`,
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
              parseApiMessage(payload) ?? "Failed to delete release link.",
          }),
        );
        return;
      }

      setAppLinksByAppId((previous) => {
        const current = previous[linkModalAppId] ?? [];
        return {
          ...previous,
          [linkModalAppId]: removeLinkById(current, confirmDeleteLinkId),
        };
      });

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Release link deleted.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete release link.",
        }),
      );
    } finally {
      setDeletingLinkId(null);
      setConfirmDeleteLinkId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search apps by title, slug, category, or status"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button tone="ghost" onClick={() => setTagLibraryOpen(true)}>
            Manage tags
          </Button>
          <Button
            tone="primary"
            onClick={() => setCreateOpen(true)}
            disabled={categoryOptions.length === 0}
          >
            Add app
          </Button>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <Card>
          <CardTitle>No app records found</CardTitle>
          <CardDescription className="mt-1">
            Create a new app or clear search filters.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredApps.map((item) => (
            <AppCard
              key={item.id}
              app={item}
              deleting={deletingAppId === item.id}
              onEdit={() => {
                setEditingAppId(item.id);
                setEditForm(createFormFromItem(item));
                setEditError(null);
              }}
              onManageTags={() => openTagAssignment(item)}
              onManageLinks={() => openLinkManager(item)}
              onDelete={() => setConfirmDeleteId(item.id)}
            />
          ))}
        </section>
      )}

      <Modal
        open={Boolean(taggingApp)}
        onClose={() => {
          if (savingTagAssignment) {
            return;
          }

          setTaggingAppId(null);
          setTagAssignmentError(null);
        }}
        title={
          taggingApp ? `Manage tags for ${taggingApp.title}` : "Manage tags"
        }
        description="Select all tags that should be attached to this app."
        width="lg"
      >
        <div className="space-y-4">
          {tags.length === 0 ? (
            <Card>
              <CardTitle>No tags available</CardTitle>
              <CardDescription className="mt-1">
                Create tags first, then assign them to apps.
              </CardDescription>
              <div className="mt-3">
                <Button
                  tone="ghost"
                  size="sm"
                  onClick={() => {
                    setTagLibraryOpen(true);
                    setTaggingAppId(null);
                  }}
                >
                  Open tag library
                </Button>
              </div>
            </Card>
          ) : (
            <section className="grid max-h-105 gap-2 overflow-auto rounded-xl border border-black/10 bg-[#fbfcff] p-3">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);

                return (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-black/10 bg-white px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedTagIds((previous) => [
                            ...previous,
                            tag.id,
                          ]);
                          return;
                        }

                        setSelectedTagIds((previous) =>
                          previous.filter((id) => id !== tag.id),
                        );
                      }}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[#111722]">
                        {tag.name}
                      </span>
                      <span className="block text-xs text-[#5a647d]">
                        {tag.slug}
                      </span>
                    </span>
                  </label>
                );
              })}
            </section>
          )}

          {tagAssignmentError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {tagAssignmentError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              tone="secondary"
              onClick={() => {
                setTaggingAppId(null);
                setTagAssignmentError(null);
              }}
              disabled={savingTagAssignment}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void onSaveTagAssignment()}
              disabled={savingTagAssignment || !taggingApp}
            >
              {savingTagAssignment ? "Saving..." : "Save tags"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={tagLibraryOpen}
        onClose={() => {
          if (creatingTag || Boolean(savingTagId) || Boolean(deletingTagId)) {
            return;
          }

          setTagLibraryOpen(false);
          setTagCreateError(null);
          setEditingTagId(null);
        }}
        title="Tag library"
        description="Create, edit, and delete reusable tags for app classification."
        width="xl"
      >
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-xl border border-black/10 bg-[#fbfcff] p-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={onCreateTag}
          >
            <Input
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Tag name"
              maxLength={60}
              required
            />
            <Input
              value={newTagSlug}
              onChange={(event) => setNewTagSlug(event.target.value)}
              placeholder="optional-slug"
              maxLength={100}
            />
            <Button type="submit" disabled={creatingTag}>
              {creatingTag ? "Creating..." : "Create tag"}
            </Button>
          </form>

          {tagCreateError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {tagCreateError}
            </p>
          ) : null}

          {tags.length === 0 ? (
            <Card>
              <CardTitle>No tags yet</CardTitle>
              <CardDescription className="mt-1">
                Create your first tag for app organization and discovery.
              </CardDescription>
            </Card>
          ) : (
            <section className="space-y-2">
              {tags.map((tag) => {
                const inEdit = editingTagId === tag.id;

                return (
                  <Card key={tag.id} className="space-y-2">
                    {inEdit ? (
                      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
                        <Input
                          value={editingTagName}
                          onChange={(event) =>
                            setEditingTagName(event.target.value)
                          }
                          placeholder="Tag name"
                        />
                        <Input
                          value={editingTagSlug}
                          onChange={(event) =>
                            setEditingTagSlug(event.target.value)
                          }
                          placeholder="Tag slug"
                        />
                        <Button
                          size="sm"
                          onClick={() => void onSaveTagEdit(tag.id)}
                          disabled={savingTagId === tag.id}
                        >
                          {savingTagId === tag.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          tone="secondary"
                          size="sm"
                          onClick={() => setEditingTagId(null)}
                          disabled={savingTagId === tag.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle>{tag.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {tag.slug}
                          </CardDescription>
                          <p className="mt-1 text-xs text-[#5a647d]">
                            Linked apps: {tag._count?.appLinks ?? 0}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            tone="secondary"
                            size="sm"
                            onClick={() => startTagEdit(tag)}
                          >
                            Edit
                          </Button>
                          <Button
                            tone="danger"
                            size="sm"
                            onClick={() => setConfirmDeleteTagId(tag.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </section>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(linkModalApp)}
        onClose={() => {
          if (
            creatingLink ||
            Boolean(savingLinkId) ||
            Boolean(deletingLinkId)
          ) {
            return;
          }

          setLinkModalAppId(null);
          resetLinkForm();
        }}
        title={
          linkModalApp
            ? `Release links for ${linkModalApp.title}`
            : "Release links"
        }
        description="Manage platform-specific download and source links for this app."
        width="xl"
      >
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-xl border border-black/10 bg-[#fbfcff] p-3 md:grid-cols-[1fr_1.4fr_1.4fr_auto]"
            onSubmit={onCreateLink}
          >
            <select
              value={newLinkPlatform}
              onChange={(event) =>
                setNewLinkPlatform(event.target.value as LinkPlatform)
              }
              className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
            >
              {linkPlatformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>

            <Input
              value={newDownloadUrl}
              onChange={(event) => setNewDownloadUrl(event.target.value)}
              placeholder="Download URL"
              required
            />

            <Input
              value={newSourceCodeUrl}
              onChange={(event) => setNewSourceCodeUrl(event.target.value)}
              placeholder="Source URL (optional)"
            />

            <Button type="submit" disabled={creatingLink || !linkModalAppId}>
              {creatingLink ? "Adding..." : "Add link"}
            </Button>
          </form>

          {linkError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {linkError}
            </p>
          ) : null}

          {loadingLinks ? (
            <p className="rounded-lg border border-black/10 bg-[#f8f9fc] px-3 py-2 text-sm text-[#5a647d]">
              Loading links...
            </p>
          ) : activeLinks.length === 0 ? (
            <Card>
              <CardTitle>No release links yet</CardTitle>
              <CardDescription className="mt-1">
                Add links for Chrome, Android, website, GitHub, or other
                platforms.
              </CardDescription>
            </Card>
          ) : (
            <section className="space-y-2">
              {activeLinks.map((link) => {
                const inEdit = editingLinkId === link.id;

                return (
                  <Card key={link.id} className="space-y-2">
                    {inEdit ? (
                      <div className="grid gap-2 md:grid-cols-[1fr_1.4fr_1.4fr_auto_auto]">
                        <select
                          value={editLinkPlatform}
                          onChange={(event) =>
                            setEditLinkPlatform(
                              event.target.value as LinkPlatform,
                            )
                          }
                          className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
                        >
                          {linkPlatformOptions.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={editDownloadUrl}
                          onChange={(event) =>
                            setEditDownloadUrl(event.target.value)
                          }
                          placeholder="Download URL"
                        />
                        <Input
                          value={editSourceCodeUrl}
                          onChange={(event) =>
                            setEditSourceCodeUrl(event.target.value)
                          }
                          placeholder="Source URL"
                        />
                        <Button
                          size="sm"
                          onClick={() => void onSaveLinkEdit(link.id)}
                          disabled={savingLinkId === link.id}
                        >
                          {savingLinkId === link.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          tone="secondary"
                          size="sm"
                          onClick={() => setEditingLinkId(null)}
                          disabled={savingLinkId === link.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle>{link.platform}</CardTitle>
                          <CardDescription className="mt-1 break-all">
                            {link.downloadUrl}
                          </CardDescription>
                          <p className="mt-1 text-xs text-[#5a647d] break-all">
                            Source: {link.sourceCodeUrl ?? "-"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            tone="secondary"
                            size="sm"
                            onClick={() => startLinkEdit(link)}
                          >
                            Edit
                          </Button>
                          <Button
                            tone="danger"
                            size="sm"
                            onClick={() => setConfirmDeleteLinkId(link.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </section>
          )}
        </div>
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => {
          if (creating) {
            return;
          }

          setCreateOpen(false);
          setCreateError(null);
        }}
        title="Create app"
        description="Add a catalog app record with pricing, status, and category assignment."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreateApp}>
          <AppEditorFields
            form={createForm}
            onChange={setCreateForm}
            categoryOptions={categoryOptions}
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
              disabled={creating || categoryOptions.length === 0}
            >
              {creating ? "Creating..." : "Create app"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingAppId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingAppId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={editingApp ? `Edit ${editingApp.title}` : "Edit app"}
        description="Update app metadata, pricing model, status, and category."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSaveEdits}>
            <AppEditorFields
              form={editForm}
              onChange={setEditForm}
              categoryOptions={categoryOptions}
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
                  setEditingAppId(null);
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
        open={Boolean(confirmDeleteId && deletingApp)}
        title="Delete app"
        description={`Set ${deletingApp?.title ?? "this app"} to draft and remove it from the public catalog?`}
        confirmLabel="Delete app"
        busy={Boolean(deletingAppId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => void onConfirmDelete()}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteTagId && deletingTag)}
        title="Delete tag"
        description={`Delete tag ${deletingTag?.name ?? "this tag"} from the catalog? Linked app associations will be removed.`}
        confirmLabel="Delete tag"
        busy={Boolean(deletingTagId)}
        onCancel={() => setConfirmDeleteTagId(null)}
        onConfirm={() => void onConfirmDeleteTag()}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteLinkId && deletingLink)}
        title="Delete release link"
        description={`Delete ${deletingLink?.platform ?? "this"} release link for ${linkModalApp?.title ?? "app"}?`}
        confirmLabel="Delete link"
        busy={Boolean(deletingLinkId)}
        onCancel={() => setConfirmDeleteLinkId(null)}
        onConfirm={() => void onConfirmDeleteLink()}
      />
    </section>
  );
}
