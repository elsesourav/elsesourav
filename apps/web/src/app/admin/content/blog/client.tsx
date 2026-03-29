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
  type AdminBlogPost,
  type AdminBlogTag,
} from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogStatus = AdminBlogPost["status"];

type BlogPostFormState = {
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  status: BlogStatus;
  publishAt: string;
  tagIds: string[];
};

const blogStatusOptions: BlogStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const statusTone: Record<
  BlogStatus,
  "neutral" | "info" | "success" | "warning"
> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "neutral",
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

function slugFromTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function toSortedPosts(items: AdminBlogPost[]): AdminBlogPost[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function toSortedTags(items: AdminBlogTag[]): AdminBlogTag[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function createEmptyPostForm(): BlogPostFormState {
  return {
    slug: "",
    title: "",
    excerpt: "",
    contentMarkdown: "",
    status: "DRAFT",
    publishAt: "",
    tagIds: [],
  };
}

function createPostFormFromItem(item: AdminBlogPost): BlogPostFormState {
  return {
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt ?? "",
    contentMarkdown: item.contentMarkdown,
    status: item.status,
    publishAt: toDateTimeLocal(item.publishAt),
    tagIds: item.tags.map((tag) => tag.id),
  };
}

function validatePostForm(form: BlogPostFormState): string | null {
  if (!/^[a-z0-9-]{2,100}$/.test(form.slug.trim())) {
    return "Slug must be 2-100 chars with lowercase letters, numbers, and hyphen.";
  }

  if (form.title.trim().length < 3) {
    return "Title must contain at least 3 characters.";
  }

  if (form.excerpt.trim().length > 500) {
    return "Excerpt cannot exceed 500 characters.";
  }

  if (form.contentMarkdown.trim().length < 20) {
    return "Content must contain at least 20 characters.";
  }

  if (!blogStatusOptions.includes(form.status)) {
    return "Invalid status selected.";
  }

  if (form.publishAt) {
    const parsed = new Date(form.publishAt);
    if (Number.isNaN(parsed.getTime())) {
      return "Publish date/time is invalid.";
    }
  }

  if (new Set(form.tagIds).size !== form.tagIds.length) {
    return "Duplicate tags are not allowed.";
  }

  if (form.tagIds.length > 25) {
    return "A maximum of 25 tags is allowed for a post.";
  }

  return null;
}

function mergeBlogPostPatch(
  previous: AdminBlogPost,
  patch: Partial<AdminBlogPost>,
): AdminBlogPost {
  return {
    ...previous,
    ...patch,
    tags: patch.tags ?? previous.tags,
    _count: patch._count ?? previous._count,
  };
}

type MarkdownTransformResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  placeholder: string,
): MarkdownTransformResult {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const content = selected.length > 0 ? selected : placeholder;
  const after = value.slice(selectionEnd);

  const nextValue = `${before}${prefix}${content}${suffix}${after}`;
  const nextSelectionStart = before.length + prefix.length;
  const nextSelectionEnd = nextSelectionStart + content.length;

  return {
    value: nextValue,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd,
  };
}

function prefixSelectedLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  linePrefix: string,
  placeholder: string,
): MarkdownTransformResult {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const content = selected.length > 0 ? selected : placeholder;

  const prefixed = content
    .split("\n")
    .map((line) => `${linePrefix}${line}`)
    .join("\n");

  const after = value.slice(selectionEnd);
  const nextValue = `${before}${prefixed}${after}`;

  return {
    value: nextValue,
    selectionStart: before.length,
    selectionEnd: before.length + prefixed.length,
  };
}

function numberSelectedLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  placeholder: string,
): MarkdownTransformResult {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const content = selected.length > 0 ? selected : placeholder;

  const numbered = content
    .split("\n")
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n");

  const after = value.slice(selectionEnd);
  const nextValue = `${before}${numbered}${after}`;

  return {
    value: nextValue,
    selectionStart: before.length,
    selectionEnd: before.length + numbered.length,
  };
}

function MarkdownEditor({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  id: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function applyTransform(
    transform: (
      source: string,
      selectionStart: number,
      selectionEnd: number,
    ) => MarkdownTransformResult,
  ) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const result = transform(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd,
    );

    onChange(result.value);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  const editorButtonClassName =
    "rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#132034] transition hover:bg-[#f5f8ff]";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              wrapSelection(source, start, end, "## ", "", "Section title"),
            )
          }
        >
          Heading
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              wrapSelection(source, start, end, "**", "**", "bold"),
            )
          }
        >
          Bold
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              wrapSelection(source, start, end, "_", "_", "emphasis"),
            )
          }
        >
          Italic
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              wrapSelection(source, start, end, "`", "`", "inline code"),
            )
          }
        >
          Code
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              wrapSelection(
                source,
                start,
                end,
                "[",
                "](https://example.com)",
                "link text",
              ),
            )
          }
        >
          Link
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              prefixSelectedLines(source, start, end, "> ", "Quoted text"),
            )
          }
        >
          Quote
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              prefixSelectedLines(source, start, end, "- ", "List item"),
            )
          }
        >
          Bullet List
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              numberSelectedLines(source, start, end, "List item"),
            )
          }
        >
          Numbered List
        </button>
        <button
          type="button"
          className={editorButtonClassName}
          onClick={() =>
            applyTransform((source, start, end) =>
              wrapSelection(
                source,
                start,
                end,
                "```\n",
                "\n```",
                "const value = 42;",
              ),
            )
          }
        >
          Code Block
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={id}>Markdown</Label>
          <Textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={18}
            className="font-mono text-[13px]"
            placeholder="Write your post content in markdown..."
          />
        </div>

        <article className="rounded-xl border border-black/10 bg-[#fbfcff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5a647d]">
            Live preview
          </p>
          <div className="mt-3 space-y-3 text-sm leading-7 text-[#172133]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-semibold text-[#101a2b]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-[#101a2b]">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-[#101a2b]">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-[#1f2a3c]">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1f5ed4] underline"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc space-y-1 pl-6">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal space-y-1 pl-6">{children}</ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#1f5ed4]/35 bg-[#f2f6ff] px-3 py-2 text-[#24324a]">
                    {children}
                  </blockquote>
                ),
                code: ({
                  inline,
                  children,
                }: {
                  inline?: boolean;
                  children?: ReactNode;
                }) => {
                  if (!inline) {
                    return (
                      <code className="block overflow-auto rounded-lg bg-[#0f172a] px-3 py-2 font-mono text-xs text-slate-100">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <code className="rounded bg-[#edf2ff] px-1.5 py-0.5 font-mono text-xs text-[#203152]">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {value.trim().length > 0
                ? value
                : "_Start writing on the left to preview your post._"}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

function BlogPostCard({
  post,
  onEdit,
  onPublish,
  onArchive,
  busy,
}: {
  post: AdminBlogPost;
  onEdit: () => void;
  onPublish: () => void;
  onArchive: () => void;
  busy: boolean;
}) {
  return (
    <Card className="flex min-h-92 flex-col justify-between gap-3">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription className="mt-1">/{post.slug}</CardDescription>
          </div>
          <Badge tone={statusTone[post.status]}>{post.status}</Badge>
        </div>

        <p className="line-clamp-4 text-sm text-[#4f5970]">
          {(post.excerpt ?? post.contentMarkdown).trim() ||
            "No excerpt available."}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {post.tags.length === 0 ? (
            <span className="rounded-full border border-black/10 bg-[#f8f9fc] px-2 py-1 text-[11px] text-[#5a647d]">
              No tags
            </span>
          ) : (
            post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-black/10 bg-[#f8f9fc] px-2 py-1 text-[11px] text-[#3d4860]"
              >
                {tag.name}
              </span>
            ))
          )}
        </div>

        <div className="grid gap-1 text-xs text-[#5a647d]">
          <p>Comments: {(post._count?.comments ?? 0).toLocaleString()}</p>
          <p>Publish at: {formatDateTime(post.publishAt)}</p>
          <p>Published at: {formatDateTime(post.publishedAt)}</p>
          <p>Updated at: {formatDateTime(post.updatedAt)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button tone="secondary" size="sm" onClick={onEdit} disabled={busy}>
          Edit post
        </Button>
        <Button
          tone="primary"
          size="sm"
          onClick={onPublish}
          disabled={post.status === "PUBLISHED" || busy}
        >
          {busy && post.status !== "PUBLISHED" ? "Publishing..." : "Publish"}
        </Button>
        <Button
          tone="danger"
          size="sm"
          onClick={onArchive}
          disabled={post.status === "ARCHIVED" || busy}
        >
          {busy && post.status !== "ARCHIVED" ? "Archiving..." : "Archive"}
        </Button>
      </div>
    </Card>
  );
}

function BlogPostEditorFields({
  form,
  tags,
  onChange,
}: {
  form: BlogPostFormState;
  tags: AdminBlogTag[];
  onChange: (nextState: BlogPostFormState) => void;
}) {
  function updateField<Key extends keyof BlogPostFormState>(
    key: Key,
    value: BlogPostFormState[Key],
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  function toggleTag(tagId: string) {
    const nextTagIds = form.tagIds.includes(tagId)
      ? form.tagIds.filter((existingId) => existingId !== tagId)
      : [...form.tagIds, tagId];

    updateField("tagIds", nextTagIds);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="blog-slug">Slug</Label>
        <div className="flex gap-2">
          <Input
            id="blog-slug"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder="my-post"
            maxLength={100}
            required
          />
          <Button
            type="button"
            tone="secondary"
            size="sm"
            onClick={() => updateField("slug", slugFromTitle(form.title))}
          >
            Generate
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="blog-status">Status</Label>
        <select
          id="blog-status"
          value={form.status}
          onChange={(event) =>
            updateField("status", event.target.value as BlogStatus)
          }
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
        >
          {blogStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5 xl:col-span-2">
        <Label htmlFor="blog-title">Title</Label>
        <Input
          id="blog-title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          maxLength={180}
          required
        />
      </div>

      <div className="space-y-1.5 xl:col-span-2">
        <Label htmlFor="blog-excerpt">Excerpt</Label>
        <Textarea
          id="blog-excerpt"
          value={form.excerpt}
          onChange={(event) => updateField("excerpt", event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Optional summary shown in list pages."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="blog-publish-at">Publish At</Label>
        <Input
          id="blog-publish-at"
          type="datetime-local"
          value={form.publishAt}
          onChange={(event) => updateField("publishAt", event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <article className="max-h-40 overflow-auto rounded-xl border border-black/10 bg-[#fbfcff] p-3">
          {tags.length === 0 ? (
            <p className="text-xs text-[#5a647d]">
              Create tags in the tag panel to classify blog posts.
            </p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => {
                const checked = form.tagIds.includes(tag.id);

                return (
                  <label
                    key={tag.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-white px-2.5 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm text-[#1a253a]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTag(tag.id)}
                        className="h-4 w-4"
                      />
                      <span className="truncate">{tag.name}</span>
                    </span>
                    <span className="text-[11px] text-[#62708d]">
                      /{tag.slug}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </article>
      </div>

      <div className="xl:col-span-2">
        <MarkdownEditor
          id="blog-markdown"
          value={form.contentMarkdown}
          onChange={(nextValue) => updateField("contentMarkdown", nextValue)}
        />
      </div>
    </div>
  );
}

export function AdminContentBlogClient({
  initialPosts,
  initialTags,
}: {
  initialPosts: AdminBlogPost[];
  initialTags: AdminBlogTag[];
}) {
  const dispatch = useAppDispatch();
  const [posts, setPosts] = useState(() => toSortedPosts(initialPosts));
  const [tags, setTags] = useState(() => toSortedTags(initialTags));

  const [statusFilter, setStatusFilter] = useState<"ALL" | BlogStatus>("ALL");
  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<BlogPostFormState>(() =>
    createEmptyPostForm(),
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BlogPostFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmPublishId, setConfirmPublishId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [busyActionPostId, setBusyActionPostId] = useState<string | null>(null);

  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (statusFilter !== "ALL" && post.status !== statusFilter) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.slug.toLowerCase().includes(normalizedQuery) ||
        (post.excerpt ?? "").toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) =>
          tag.name.toLowerCase().includes(normalizedQuery),
        )
      );
    });
  }, [posts, query, statusFilter]);

  const stats = useMemo(
    () => ({
      published: posts.filter((post) => post.status === "PUBLISHED").length,
      draft: posts.filter((post) => post.status === "DRAFT").length,
      archived: posts.filter((post) => post.status === "ARCHIVED").length,
    }),
    [posts],
  );

  const editingPost =
    editingPostId !== null
      ? (posts.find((post) => post.id === editingPostId) ?? null)
      : null;

  async function onCreateTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newTagName.trim().length < 2) {
      setTagError("Tag name must contain at least 2 characters.");
      return;
    }

    setTagError(null);
    setCreatingTag(true);

    try {
      const response = await fetch("/api/admin/content/blog/tags", {
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
      if (!response.ok || !isApiSuccess<AdminBlogTag>(payload)) {
        setTagError(parseApiMessage(payload) ?? "Failed to create blog tag.");
        return;
      }

      setTags((previous) => toSortedTags([...previous, payload.data]));
      setNewTagName("");
      setNewTagSlug("");
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Created tag \"${payload.data.name}\".`,
        }),
      );
    } catch (error) {
      setTagError(
        error instanceof Error ? error.message : "Failed to create blog tag.",
      );
    } finally {
      setCreatingTag(false);
    }
  }

  async function onDeleteTag(tag: AdminBlogTag) {
    setDeletingTagId(tag.id);

    try {
      const response = await fetch(`/api/admin/content/blog/tags/${tag.id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<{ deleted: boolean }>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to delete blog tag.",
          }),
        );
        return;
      }

      setTags((previous) =>
        previous.filter((existing) => existing.id !== tag.id),
      );
      setPosts((previous) =>
        previous.map((post) => ({
          ...post,
          tags: post.tags.filter((existingTag) => existingTag.id !== tag.id),
        })),
      );
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Deleted tag \"${tag.name}\".`,
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete blog tag.",
        }),
      );
    } finally {
      setDeletingTagId(null);
    }
  }

  async function onCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validatePostForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      const response = await fetch("/api/admin/content/blog/posts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          slug: createForm.slug.trim(),
          title: createForm.title.trim(),
          excerpt: createForm.excerpt.trim() || undefined,
          contentMarkdown: createForm.contentMarkdown.trim(),
          status: createForm.status,
          publishAt: toIsoOrUndefined(createForm.publishAt),
          tagIds: createForm.tagIds,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminBlogPost>(payload)) {
        setCreateError(
          parseApiMessage(payload) ?? "Failed to create blog post.",
        );
        return;
      }

      const nextPost: AdminBlogPost = {
        ...payload.data,
        tags: payload.data.tags ?? [],
        _count: payload.data._count ?? { comments: 0 },
      };

      setPosts((previous) => toSortedPosts([nextPost, ...previous]));
      setCreateForm(createEmptyPostForm());
      setCreateOpen(false);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Created post \"${nextPost.title}\".`,
        }),
      );
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create blog post.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function onSavePostEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPostId || !editForm) {
      return;
    }

    const validationError = validatePostForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setSavingEdit(true);

    try {
      const response = await fetch(
        `/api/admin/content/blog/posts/${editingPostId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            slug: editForm.slug.trim(),
            title: editForm.title.trim(),
            excerpt: editForm.excerpt.trim() || undefined,
            contentMarkdown: editForm.contentMarkdown.trim(),
            status: editForm.status,
            publishAt: toIsoOrUndefined(editForm.publishAt),
            tagIds: editForm.tagIds,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminBlogPost>(payload)) {
        setEditError(parseApiMessage(payload) ?? "Failed to update blog post.");
        return;
      }

      setPosts((previous) =>
        toSortedPosts(
          previous.map((item) =>
            item.id === editingPostId
              ? mergeBlogPostPatch(item, {
                  ...payload.data,
                  tags: payload.data.tags ?? item.tags,
                })
              : item,
          ),
        ),
      );
      setEditingPostId(null);
      setEditForm(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: `Updated post \"${payload.data.title}\".`,
        }),
      );
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update blog post.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmPublishPost() {
    if (!confirmPublishId) {
      return;
    }

    setBusyActionPostId(confirmPublishId);

    try {
      const response = await fetch(
        `/api/admin/content/blog/posts/${confirmPublishId}/publish`,
        {
          method: "POST",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<Partial<AdminBlogPost>>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to publish blog post.",
          }),
        );
        return;
      }

      setPosts((previous) =>
        toSortedPosts(
          previous.map((item) =>
            item.id === confirmPublishId
              ? mergeBlogPostPatch(item, payload.data)
              : item,
          ),
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Blog post published.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to publish blog post.",
        }),
      );
    } finally {
      setBusyActionPostId(null);
      setConfirmPublishId(null);
    }
  }

  async function onConfirmArchivePost() {
    if (!confirmArchiveId) {
      return;
    }

    setBusyActionPostId(confirmArchiveId);

    try {
      const response = await fetch(
        `/api/admin/content/blog/posts/${confirmArchiveId}`,
        {
          method: "DELETE",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<Partial<AdminBlogPost>>(payload)) {
        dispatch(
          enqueueNotification({
            tone: "error",
            message: parseApiMessage(payload) ?? "Failed to archive blog post.",
          }),
        );
        return;
      }

      setPosts((previous) =>
        toSortedPosts(
          previous.map((item) =>
            item.id === confirmArchiveId
              ? mergeBlogPostPatch(item, payload.data)
              : item,
          ),
        ),
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Blog post archived.",
        }),
      );
    } catch (error) {
      dispatch(
        enqueueNotification({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to archive blog post.",
        }),
      );
    } finally {
      setBusyActionPostId(null);
      setConfirmArchiveId(null);
    }
  }

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Editorial queue</CardTitle>
            <CardDescription className="mt-1">
              {posts.length.toLocaleString()} total posts: {stats.published}{" "}
              published, {stats.draft} draft, {stats.archived} archived.
            </CardDescription>
          </div>
          <Button tone="primary" onClick={() => setCreateOpen(true)}>
            Create blog post
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, slug, excerpt, or tag"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["ALL", ...blogStatusOptions] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? "border-[#1f5ed4] bg-[#1f5ed4] text-white"
                    : "border-black/15 bg-white text-[#19253a] hover:bg-[#f6f9ff]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          {visiblePosts.length === 0 ? (
            <Card>
              <CardTitle>No matching posts</CardTitle>
              <CardDescription className="mt-1">
                Adjust search or status filters, or create your first blog post.
              </CardDescription>
            </Card>
          ) : (
            <section className="grid gap-4 md:grid-cols-2">
              {visiblePosts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  busy={busyActionPostId === post.id}
                  onEdit={() => {
                    setEditingPostId(post.id);
                    setEditForm(createPostFormFromItem(post));
                    setEditError(null);
                  }}
                  onPublish={() => setConfirmPublishId(post.id)}
                  onArchive={() => setConfirmArchiveId(post.id)}
                />
              ))}
            </section>
          )}
        </section>

        <Card className="space-y-3">
          <div>
            <CardTitle>Tag manager</CardTitle>
            <CardDescription className="mt-1">
              Create and remove blog tags used for editorial organization.
            </CardDescription>
          </div>

          <form className="space-y-2" onSubmit={onCreateTag}>
            <div className="space-y-1.5">
              <Label htmlFor="new-tag-name">Name</Label>
              <Input
                id="new-tag-name"
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                maxLength={80}
                placeholder="Engineering"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-tag-slug">Slug (optional)</Label>
              <Input
                id="new-tag-slug"
                value={newTagSlug}
                onChange={(event) => setNewTagSlug(event.target.value)}
                maxLength={100}
                placeholder="engineering"
              />
            </div>
            <Button type="submit" disabled={creatingTag}>
              {creatingTag ? "Creating..." : "Create tag"}
            </Button>
            {tagError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {tagError}
              </p>
            ) : null}
          </form>

          <div className="space-y-2">
            {tags.length === 0 ? (
              <p className="rounded-lg border border-black/10 bg-[#f8f9fc] px-3 py-2 text-xs text-[#5a647d]">
                No tags created yet.
              </p>
            ) : (
              tags.map((tag) => (
                <article
                  key={tag.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-[#fcfdff] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#152033]">
                      {tag.name}
                    </p>
                    <p className="text-[11px] text-[#5a647d]">/{tag.slug}</p>
                  </div>
                  <Button
                    tone="danger"
                    size="sm"
                    onClick={() => void onDeleteTag(tag)}
                    disabled={deletingTagId === tag.id}
                  >
                    {deletingTagId === tag.id ? "Deleting..." : "Delete"}
                  </Button>
                </article>
              ))
            )}
          </div>
        </Card>
      </section>

      <Modal
        open={createOpen}
        onClose={() => {
          if (creating) {
            return;
          }

          setCreateOpen(false);
          setCreateError(null);
        }}
        title="Create blog post"
        description="Compose markdown content with live preview, then publish when ready."
        width="xl"
      >
        <form className="space-y-4" onSubmit={onCreatePost}>
          <BlogPostEditorFields
            form={createForm}
            tags={tags}
            onChange={setCreateForm}
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
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create post"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingPostId && editForm)}
        onClose={() => {
          if (savingEdit) {
            return;
          }

          setEditingPostId(null);
          setEditForm(null);
          setEditError(null);
        }}
        title={editingPost ? `Edit ${editingPost.title}` : "Edit blog post"}
        description="Update content and publication metadata for this post."
        width="xl"
      >
        {editForm ? (
          <form className="space-y-4" onSubmit={onSavePostEdits}>
            <BlogPostEditorFields
              form={editForm}
              tags={tags}
              onChange={setEditForm}
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
                  setEditingPostId(null);
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
        open={Boolean(confirmPublishId)}
        title="Publish blog post"
        description="Publishing makes this post available publicly when its publish window is valid."
        confirmLabel="Publish"
        confirmTone="primary"
        busy={Boolean(busyActionPostId)}
        onCancel={() => setConfirmPublishId(null)}
        onConfirm={() => void onConfirmPublishPost()}
      />

      <ConfirmDialog
        open={Boolean(confirmArchiveId)}
        title="Archive blog post"
        description="Archiving hides this post from the public listing until it is republished."
        confirmLabel="Archive"
        confirmTone="danger"
        busy={Boolean(busyActionPostId)}
        onCancel={() => setConfirmArchiveId(null)}
        onConfirm={() => void onConfirmArchivePost()}
      />
    </section>
  );
}
