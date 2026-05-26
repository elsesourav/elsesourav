"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { GithubMarkdownEditor } from "@/components/ui/github-markdown-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { parseMetadataInput, stringifyMetadata } from "@/lib/metadata";
import { formatDateTime, type AdminContentPage } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";

type ContentStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

type ContentPageFormState = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  metadata: string;
  seoTitle: string;
  seoDescription: string;
  status: ContentStatus;
  publishAt: string;
};

const contentStatusOptions: ContentStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
];

const statusTone: Record<
  ContentStatus,
  "secondary" | "info" | "success" | "warning"
> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  PUBLISHED: "success",
  ARCHIVED: "info",
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

function toSortedPages(items: AdminContentPage[]): AdminContentPage[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function createEmptyForm(): ContentPageFormState {
  return {
    slug: "",
    title: "",
    summary: "",
    body: "",
    metadata: "",
    seoTitle: "",
    seoDescription: "",
    status: "DRAFT",
    publishAt: "",
  };
}

function createFormFromItem(item: AdminContentPage): ContentPageFormState {
  return {
    slug: item.slug,
    title: item.title,
    summary: item.summary ?? "",
    body: item.body,
    metadata: stringifyMetadata(item.metadata),
    seoTitle: item.seoTitle ?? "",
    seoDescription: item.seoDescription ?? "",
    status: item.status as ContentStatus,
    publishAt: toDateTimeLocal(item.publishAt),
  };
}

function validateForm(form: ContentPageFormState): string | null {
  if (!/^[a-z0-9-]{2,100}$/.test(form.slug.trim())) {
    return "Slug must be 2-100 chars with lowercase letters, numbers, and hyphen.";
  }

  if (form.title.trim().length < 3) {
    return "Title must contain at least 3 characters.";
  }

  if (form.body.trim().length < 10) {
    return "Body must contain at least 10 characters.";
  }

  if (form.summary.trim().length > 400) {
    return "Summary cannot exceed 400 characters.";
  }

  const metadataResult = parseMetadataInput(form.metadata);
  if (metadataResult.error) {
    return metadataResult.error;
  }

  if (form.seoTitle.trim().length > 180) {
    return "SEO title cannot exceed 180 characters.";
  }

  if (form.seoDescription.trim().length > 300) {
    return "SEO description cannot exceed 300 characters.";
  }

  if (!contentStatusOptions.includes(form.status)) {
    return "Invalid status selected.";
  }

  if (form.status === "SCHEDULED" && !form.publishAt) {
    return "Scheduled status requires a publish date/time.";
  }

  if (form.publishAt) {
    const publishAt = new Date(form.publishAt);
    if (Number.isNaN(publishAt.getTime())) {
      return "Publish date/time is invalid.";
    }
  }

  return null;
}

function ContentPageCard({
  item,
  onEdit,
}: {
  item: AdminContentPage;
  onEdit: () => void;
}) {
  const latestVersion = item.versions[0]?.version ?? "-";
  const typedStatus = contentStatusOptions.includes(
    item.status as ContentStatus,
  )
    ? (item.status as ContentStatus)
    : "DRAFT";

  return (
    <Card className="flex min-h-80 flex-col justify-between space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription className="mt-1">/{item.slug}</CardDescription>
        </div>
        <Badge variant={statusTone[typedStatus]}>{item.status}</Badge>
      </div>

      <p className="ui-text-muted line-clamp-3 text-sm">
        {(item.summary ?? item.body).trim() || "No summary yet."}
      </p>

      <div className="ui-text-muted grid gap-1 text-xs">
        <p>Latest version: {latestVersion}</p>
        <p>Publish at: {formatDateTime(item.publishAt)}</p>
        <p>Published at: {formatDateTime(item.publishedAt)}</p>
        <p>Updated at: {formatDateTime(item.updatedAt)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit page
        </Button>
      </div>
    </Card>
  );
}

function ContentEditorFields({
  form,
  onChange,
}: {
  form: ContentPageFormState;
  onChange: (nextState: ContentPageFormState) => void;
}) {
  function updateField<Key extends keyof ContentPageFormState>(
    key: Key,
    value: ContentPageFormState[Key],
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="content-slug">Slug</Label>
        <Input
          id="content-slug"
          value={form.slug}
          onChange={(event) => updateField("slug", event.target.value)}
          placeholder="about-us"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content-status">Status</Label>
        <select
          id="content-status"
          value={form.status}
          onChange={(event) =>
            updateField("status", event.target.value as ContentStatus)
          }
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
        >
          {contentStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="content-title">Title</Label>
        <Input
          id="content-title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          maxLength={180}
          required
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="content-summary">Summary</Label>
        <Textarea
          id="content-summary"
          value={form.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          maxLength={400}
          rows={3}
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="content-body">Body</Label>
        <GithubMarkdownEditor
          id="content-body"
          value={form.body}
          onChange={(nextValue) => updateField("body", nextValue)}
          placeholder="Write page content using markdown..."
          height={360}
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="content-metadata">Metadata JSON</Label>
        <Textarea
          id="content-metadata"
          value={form.metadata}
          onChange={(event) => updateField("metadata", event.target.value)}
          rows={5}
          className="font-mono text-xs"
          placeholder='{"layout":"story","audience":"public"}'
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content-seo-title">SEO Title</Label>
        <Input
          id="content-seo-title"
          value={form.seoTitle}
          onChange={(event) => updateField("seoTitle", event.target.value)}
          maxLength={180}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content-publish-at">Publish At</Label>
        <Input
          id="content-publish-at"
          type="datetime-local"
          value={form.publishAt}
          onChange={(event) => updateField("publishAt", event.target.value)}
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="content-seo-description">SEO Description</Label>
        <Textarea
          id="content-seo-description"
          value={form.seoDescription}
          onChange={(event) =>
            updateField("seoDescription", event.target.value)
          }
          maxLength={300}
          rows={3}
        />
      </div>
    </div>
  );
}

export function AdminContentPagesClient({
  initialPages,
}: {
  initialPages: AdminContentPage[];
}) {
  const dispatch = useAppDispatch();
  const [pages, setPages] = useState(() => toSortedPages(initialPages));

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ContentPageFormState>(() =>
    createEmptyForm(),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContentPageFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const stats = useMemo(
    () => ({
      published: pages.filter((item) => item.status === "PUBLISHED").length,
      scheduled: pages.filter((item) => item.status === "SCHEDULED").length,
      draft: pages.filter((item) => item.status === "DRAFT").length,
    }),
    [pages],
  );

  const editingPage =
    editingPageId !== null
      ? (pages.find((item) => item.id === editingPageId) ?? null)
      : null;

  async function onCreatePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    const metadataResult = parseMetadataInput(createForm.metadata);
    if (metadataResult.error) {
      setCreateError(metadataResult.error);
      setCreating(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/content/pages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          slug: createForm.slug.trim(),
          title: createForm.title.trim(),
          summary: createForm.summary.trim() || undefined,
          body: createForm.body.trim(),
          metadata: metadataResult.data,
          seoTitle: createForm.seoTitle.trim() || undefined,
          seoDescription: createForm.seoDescription.trim() || undefined,
          status: createForm.status,
          publishAt: toIsoOrUndefined(createForm.publishAt),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminContentPage>(payload)) {
        setCreateError(
          parseApiMessage(payload) ?? "Failed to create content page.",
        );
        return;
      }

      setPages((previous) => toSortedPages([payload.data, ...previous]));
      setCreateForm(createEmptyForm());
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Created page \"${payload.data.title}\".`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create content page.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSavePageEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPageId || !editForm) {
      return;
    }

    const validationError = validateForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    const metadataResult = parseMetadataInput(editForm.metadata);
    if (metadataResult.error) {
      setEditError(metadataResult.error);
      setSavingEdit(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/content/pages/${editingPageId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            slug: editForm.slug.trim(),
            title: editForm.title.trim(),
            summary: editForm.summary.trim() || undefined,
            body: editForm.body.trim(),
            metadata: metadataResult.data,
            seoTitle: editForm.seoTitle.trim() || undefined,
            seoDescription: editForm.seoDescription.trim() || undefined,
            status: editForm.status,
            publishAt: toIsoOrUndefined(editForm.publishAt),
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminContentPage>(payload)) {
        setEditError(
          parseApiMessage(payload) ?? "Failed to update content page.",
        );
        return;
      }

      setPages((previous) =>
        toSortedPages(
          previous.map((item) =>
            item.id === editingPageId ? payload.data : item,
          ),
        ),
      );
      setEditingPageId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Updated page \"${payload.data.title}\".`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update content page.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ui-text-muted text-sm">
          {pages.length.toLocaleString()} pages: {stats.published} published,{" "}
          {stats.scheduled} scheduled, {stats.draft} drafts.
        </p>
        <Button variant="default" onClick={() => setCreateOpen(true)}>
          Add content page
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardTitle>No content pages yet</CardTitle>
          <CardDescription className="mt-1">
            Create the first CMS page and publish when content is ready.
          </CardDescription>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <ContentPageCard
              key={page.id}
              item={page}
              onEdit={() => {
                setEditingPageId(page.id);
                setEditForm(createFormFromItem(page));
                setEditError(null);
              }}
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
        title="Create content page"
        description="Add a CMS page with status, publish scheduling, and SEO details."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreatePage}>
          <ContentEditorFields form={createForm} onChange={setCreateForm} />

          {createError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setCreateError(null);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Saving..." : "Create page"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingPageId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingPageId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={editingPage ? `Edit ${editingPage.title}` : "Edit content page"}
        description="Update content, metadata, and publication status."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSavePageEdits}>
            <ContentEditorFields form={editForm} onChange={setEditForm} />

            {editError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingPageId(null);
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
    </section>
  );
}
