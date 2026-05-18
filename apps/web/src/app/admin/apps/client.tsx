"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GithubMarkdownEditor } from "@/components/ui/github-markdown-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { parseMetadataInput, stringifyMetadata } from "@/lib/metadata";
import {
  formatDateTime,
  formatPrice,
  type AdminAppListItem,
} from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import Image from "next/image";
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
  releaseNotes: string;
  metadata: string;
  version: string;
  status: AppStatus;
  isPaid: boolean;
  isFeatured: boolean;
  containsAds: boolean;
  price: string;
  iconUrl: string;
  featureGraphicUrl: string;
  promoVideoUrl: string;
  supportEmail: string;
  supportWebsiteUrl: string;
  privacyPolicyUrl: string;
  developerName: string;
  categoryId: string;
};

type AppMutationResponse = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  releaseNotes?: string | null;
  metadata?: Record<string, unknown> | null;
  version: string;
  status: string;
  isPaid: boolean;
  isFeatured: boolean;
  containsAds?: boolean;
  price: number | string;
  iconUrl?: string | null;
  featureGraphicUrl?: string | null;
  promoVideoUrl?: string | null;
  supportEmail?: string | null;
  supportWebsiteUrl?: string | null;
  privacyPolicyUrl?: string | null;
  developerName?: string | null;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
};

type MediaType = "IMAGE" | "VIDEO";

type AdminAppMedia = {
  id: string;
  appId: string;
  type: MediaType;
  url: string;
  alt: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  thumbnailUrl?: string | null;
  fileSizeBytes?: string | number | null;
  isAnimated?: boolean;
  sortOrder: number;
  createdAt: string;
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
    releaseNotes: "",
    metadata: "",
    version: "1.0.0",
    status: "DRAFT",
    isPaid: false,
    isFeatured: false,
    containsAds: false,
    price: "0",
    iconUrl: "",
    featureGraphicUrl: "",
    promoVideoUrl: "",
    supportEmail: "",
    supportWebsiteUrl: "",
    privacyPolicyUrl: "",
    developerName: "",
    categoryId: categoryOptions[0]?.id ?? "",
  };
}

function createFormFromItem(item: AdminAppListItem): AppFormState {
  return {
    title: item.title,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription,
    releaseNotes: item.releaseNotes ?? "",
    metadata: stringifyMetadata(item.metadata),
    version: item.version,
    status: item.status as AppStatus,
    isPaid: item.isPaid,
    isFeatured: item.isFeatured,
    containsAds: item.containsAds ?? false,
    price: String(item.price),
    iconUrl: item.iconUrl ?? "",
    featureGraphicUrl: item.featureGraphicUrl ?? "",
    promoVideoUrl: item.promoVideoUrl ?? "",
    supportEmail: item.supportEmail ?? "",
    supportWebsiteUrl: item.supportWebsiteUrl ?? "",
    privacyPolicyUrl: item.privacyPolicyUrl ?? "",
    developerName: item.developerName ?? "",
    categoryId: item.category?.id ?? "",
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
    releaseNotes: item.releaseNotes ?? null,
    metadata: item.metadata ?? null,
    version: item.version,
    status: item.status,
    isPaid: item.isPaid,
    isFeatured: item.isFeatured,
    containsAds: item.containsAds ?? false,
    price: item.price,
    iconUrl: item.iconUrl ?? null,
    featureGraphicUrl: item.featureGraphicUrl ?? null,
    promoVideoUrl: item.promoVideoUrl ?? null,
    supportEmail: item.supportEmail ?? null,
    supportWebsiteUrl: item.supportWebsiteUrl ?? null,
    privacyPolicyUrl: item.privacyPolicyUrl ?? null,
    developerName: item.developerName ?? null,
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

  const metadataResult = parseMetadataInput(form.metadata);
  if (metadataResult.error) {
    return metadataResult.error;
  }

  const optionalUrlKeys: Array<keyof AppFormState> = [
    "iconUrl",
    "featureGraphicUrl",
    "promoVideoUrl",
    "supportWebsiteUrl",
    "privacyPolicyUrl",
  ];

  for (const key of optionalUrlKeys) {
    const value = String(form[key] ?? "").trim();
    if (!value) {
      continue;
    }

    try {
      new URL(value);
    } catch {
      return `Please provide a valid URL for ${key}.`;
    }
  }

  if (form.supportEmail.trim().length > 0) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.supportEmail.trim())) {
      return "Support email must be a valid email address.";
    }
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
  onManageMedia,
  onDelete,
  deleting,
}: {
  app: AdminAppListItem;
  onEdit: () => void;
  onManageTags: () => void;
  onManageLinks: () => void;
  onManageMedia: () => void;
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

      {app.developerName ? (
        <p className="text-xs text-[#5a647d]">Developer: {app.developerName}</p>
      ) : null}

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
        <p>Category: {app.category?.name ?? "—"}</p>
        <p>Version: {app.version}</p>
        <p>Price: {app.isPaid ? formatPrice(app.price) : "Free"}</p>
        <p>Featured: {app.isFeatured ? "Yes" : "No"}</p>
        <p>Contains ads: {app.containsAds ? "Yes" : "No"}</p>
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
        <Button tone="ghost" size="sm" onClick={onManageMedia}>
          Media gallery
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
        <GithubMarkdownEditor
          id="app-full-description"
          value={form.fullDescription}
          onChange={(nextValue) => updateField("fullDescription", nextValue)}
          placeholder="Write a rich app description"
          height={320}
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-release-notes">Release notes (optional)</Label>
        <GithubMarkdownEditor
          id="app-release-notes"
          value={form.releaseNotes}
          onChange={(nextValue) => updateField("releaseNotes", nextValue)}
          placeholder="What's new in this release"
          height={260}
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-metadata">Metadata JSON (optional)</Label>
        <Textarea
          id="app-metadata"
          value={form.metadata}
          onChange={(event) => updateField("metadata", event.target.value)}
          rows={6}
          className="font-mono text-xs"
          placeholder='{"releaseChannel":"stable","supportedLocales":["en","es"]}'
        />
        <p className="text-xs text-[#62708d]">
          Store custom attributes for future filters, experiments, and feature
          flags.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="app-developer-name">Developer name (optional)</Label>
        <Input
          id="app-developer-name"
          value={form.developerName}
          onChange={(event) => updateField("developerName", event.target.value)}
          maxLength={120}
          placeholder="Studio or developer display name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="app-support-email">Support email (optional)</Label>
        <Input
          id="app-support-email"
          type="email"
          value={form.supportEmail}
          onChange={(event) => updateField("supportEmail", event.target.value)}
          maxLength={180}
          placeholder="support@example.com"
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-icon-url">Icon URL (optional)</Label>
        <Input
          id="app-icon-url"
          value={form.iconUrl}
          onChange={(event) => updateField("iconUrl", event.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-feature-graphic-url">
          Feature graphic URL (optional)
        </Label>
        <Input
          id="app-feature-graphic-url"
          value={form.featureGraphicUrl}
          onChange={(event) =>
            updateField("featureGraphicUrl", event.target.value)
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-promo-video-url">Promo video URL (optional)</Label>
        <Input
          id="app-promo-video-url"
          value={form.promoVideoUrl}
          onChange={(event) => updateField("promoVideoUrl", event.target.value)}
          placeholder="https://youtube.com/..."
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-support-website-url">
          Support website URL (optional)
        </Label>
        <Input
          id="app-support-website-url"
          value={form.supportWebsiteUrl}
          onChange={(event) =>
            updateField("supportWebsiteUrl", event.target.value)
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="app-privacy-policy-url">
          Privacy policy URL (optional)
        </Label>
        <Input
          id="app-privacy-policy-url"
          value={form.privacyPolicyUrl}
          onChange={(event) =>
            updateField("privacyPolicyUrl", event.target.value)
          }
          placeholder="https://..."
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

      <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#f8fbff] px-3 py-2 text-sm text-[#1a2439]">
        <input
          type="checkbox"
          checked={form.containsAds}
          onChange={(event) => updateField("containsAds", event.target.checked)}
          className="h-4 w-4"
        />
        Contains ads
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

  const [mediaModalAppId, setMediaModalAppId] = useState<string | null>(null);
  const [appMediaByAppId, setAppMediaByAppId] = useState<
    Record<string, AdminAppMedia[]>
  >({});
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [newMediaType, setNewMediaType] = useState<MediaType>("IMAGE");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaAlt, setNewMediaAlt] = useState("");
  const [newMediaMimeType, setNewMediaMimeType] = useState("");
  const [newMediaWidth, setNewMediaWidth] = useState("");
  const [newMediaHeight, setNewMediaHeight] = useState("");
  const [newMediaDurationSec, setNewMediaDurationSec] = useState("");
  const [newMediaThumbnailUrl, setNewMediaThumbnailUrl] = useState("");
  const [newMediaFileSizeBytes, setNewMediaFileSizeBytes] = useState("");
  const [newMediaIsAnimated, setNewMediaIsAnimated] = useState(false);
  const [newMediaSortOrder, setNewMediaSortOrder] = useState("0");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [creatingMedia, setCreatingMedia] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editMediaType, setEditMediaType] = useState<MediaType>("IMAGE");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [editMediaAlt, setEditMediaAlt] = useState("");
  const [editMediaMimeType, setEditMediaMimeType] = useState("");
  const [editMediaWidth, setEditMediaWidth] = useState("");
  const [editMediaHeight, setEditMediaHeight] = useState("");
  const [editMediaDurationSec, setEditMediaDurationSec] = useState("");
  const [editMediaThumbnailUrl, setEditMediaThumbnailUrl] = useState("");
  const [editMediaFileSizeBytes, setEditMediaFileSizeBytes] = useState("");
  const [editMediaIsAnimated, setEditMediaIsAnimated] = useState(false);
  const [editMediaSortOrder, setEditMediaSortOrder] = useState("0");
  const [savingMediaId, setSavingMediaId] = useState<string | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [reorderingMedia, setReorderingMedia] = useState(false);
  const [draggingMediaId, setDraggingMediaId] = useState<string | null>(null);
  const [dragOverMediaId, setDragOverMediaId] = useState<string | null>(null);

  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return apps;
    }

    return apps.filter((item) =>
      [item.title, item.slug, item.category?.name ?? "", item.status]
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

  const mediaModalApp =
    mediaModalAppId !== null
      ? (apps.find((item) => item.id === mediaModalAppId) ?? null)
      : null;

  const activeMedia =
    mediaModalAppId !== null ? (appMediaByAppId[mediaModalAppId] ?? []) : [];

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

  function resetMediaForm() {
    setNewMediaType("IMAGE");
    setNewMediaUrl("");
    setNewMediaAlt("");
    setNewMediaMimeType("");
    setNewMediaWidth("");
    setNewMediaHeight("");
    setNewMediaDurationSec("");
    setNewMediaThumbnailUrl("");
    setNewMediaFileSizeBytes("");
    setNewMediaIsAnimated(false);
    setNewMediaSortOrder("0");
    setEditingMediaId(null);
    setEditMediaType("IMAGE");
    setEditMediaUrl("");
    setEditMediaAlt("");
    setEditMediaMimeType("");
    setEditMediaWidth("");
    setEditMediaHeight("");
    setEditMediaDurationSec("");
    setEditMediaThumbnailUrl("");
    setEditMediaFileSizeBytes("");
    setEditMediaIsAnimated(false);
    setEditMediaSortOrder("0");
    setDraggingMediaId(null);
    setDragOverMediaId(null);
    setMediaError(null);
  }

  function toSortedMedia(items: AdminAppMedia[]): AdminAppMedia[] {
    return [...items].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async function fetchMediaForApp(appId: string) {
    setLoadingMedia(true);
    setMediaError(null);

    try {
      const response = await fetch(`/api/admin/apps/${appId}/media`);
      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminAppMedia[]>(payload)) {
        setMediaError(parseApiMessage(payload) ?? "Failed to load app media.");
        return;
      }

      setAppMediaByAppId((previous) => ({
        ...previous,
        [appId]: toSortedMedia(payload.data),
      }));
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Failed to load app media.",
      );
    } finally {
      setLoadingMedia(false);
    }
  }

  function openMediaManager(app: AdminAppListItem) {
    setMediaModalAppId(app.id);
    resetMediaForm();

    if (!appMediaByAppId[app.id]) {
      void fetchMediaForApp(app.id);
    }
  }

  async function onUploadMediaFile(file: File) {
    if (!mediaModalAppId) {
      return;
    }

    setUploadingMedia(true);
    setMediaError(null);

    try {
      const signatureResponse = await fetch("/api/upload/cloudinary/sign", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          folder: `apps/${mediaModalAppId}/media`,
        }),
      });

      const signaturePayload = await signatureResponse.json().catch(() => null);
      if (
        !signatureResponse.ok ||
        !isApiSuccess<{
          cloudName: string;
          apiKey: string;
          folder: string;
          timestamp: number;
          signature: string;
        }>(signaturePayload)
      ) {
        setMediaError(
          parseApiMessage(signaturePayload) ?? "Failed to initialize upload.",
        );
        return;
      }

      const signData = signaturePayload.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadPayload = (await uploadResponse.json().catch(() => null)) as {
        secure_url?: string;
        resource_type?: string;
        format?: string;
        bytes?: number;
        width?: number;
        height?: number;
        duration?: number;
      } | null;

      if (!uploadResponse.ok || !uploadPayload?.secure_url) {
        setMediaError("Upload failed. Please retry with a valid file.");
        return;
      }

      setNewMediaUrl(uploadPayload.secure_url);
      setNewMediaType(
        uploadPayload.resource_type === "video" ? "VIDEO" : "IMAGE",
      );
      const normalizedFormat = uploadPayload.format
        ? `${uploadPayload.resource_type ?? "image"}/${uploadPayload.format}`
        : "";
      setNewMediaMimeType(normalizedFormat);
      setNewMediaWidth(
        uploadPayload.width !== undefined ? String(uploadPayload.width) : "",
      );
      setNewMediaHeight(
        uploadPayload.height !== undefined ? String(uploadPayload.height) : "",
      );
      setNewMediaDurationSec(
        uploadPayload.duration !== undefined
          ? String(Math.round(uploadPayload.duration))
          : "",
      );
      setNewMediaFileSizeBytes(
        uploadPayload.bytes !== undefined ? String(uploadPayload.bytes) : "",
      );
      setNewMediaIsAnimated(
        (uploadPayload.resource_type ?? "").toLowerCase() === "image" &&
          (uploadPayload.format ?? "").toLowerCase() === "gif",
      );

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "File uploaded. Review details and click Add media.",
        }),
      );
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingMedia(false);
    }
  }

  async function onCreateMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mediaModalAppId) {
      return;
    }

    const normalizedUrl = newMediaUrl.trim();
    if (!normalizedUrl) {
      setMediaError("Media URL is required.");
      return;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setMediaError("Please provide a valid media URL.");
      return;
    }

    const parsedSortOrder = Number(newMediaSortOrder);
    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      setMediaError("Sort order must be a whole number >= 0.");
      return;
    }

    const parsedWidth = newMediaWidth ? Number(newMediaWidth) : undefined;
    const parsedHeight = newMediaHeight ? Number(newMediaHeight) : undefined;
    const parsedDuration = newMediaDurationSec
      ? Number(newMediaDurationSec)
      : undefined;
    const parsedFileSizeBytes = newMediaFileSizeBytes.trim() || undefined;

    if (
      parsedWidth !== undefined &&
      (!Number.isInteger(parsedWidth) || parsedWidth < 1)
    ) {
      setMediaError("Width must be a whole number >= 1.");
      return;
    }

    if (
      parsedHeight !== undefined &&
      (!Number.isInteger(parsedHeight) || parsedHeight < 1)
    ) {
      setMediaError("Height must be a whole number >= 1.");
      return;
    }

    if (
      parsedDuration !== undefined &&
      (!Number.isInteger(parsedDuration) || parsedDuration < 0)
    ) {
      setMediaError("Duration must be a whole number >= 0.");
      return;
    }

    if (parsedFileSizeBytes && !/^\d+$/.test(parsedFileSizeBytes)) {
      setMediaError("File size must be a positive integer in bytes.");
      return;
    }

    if (newMediaThumbnailUrl.trim()) {
      try {
        new URL(newMediaThumbnailUrl.trim());
      } catch {
        setMediaError("Thumbnail URL must be valid.");
        return;
      }
    }

    setCreatingMedia(true);
    setMediaError(null);

    try {
      const response = await fetch(`/api/admin/apps/${mediaModalAppId}/media`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: newMediaType,
          url: normalizedUrl,
          alt: newMediaAlt.trim() || null,
          mimeType: newMediaMimeType.trim() || null,
          width: Number.isFinite(parsedWidth) ? parsedWidth : null,
          height: Number.isFinite(parsedHeight) ? parsedHeight : null,
          durationSec: Number.isFinite(parsedDuration) ? parsedDuration : null,
          thumbnailUrl: newMediaThumbnailUrl.trim() || null,
          fileSizeBytes: parsedFileSizeBytes ?? null,
          isAnimated: newMediaIsAnimated,
          sortOrder: parsedSortOrder,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminAppMedia>(payload)) {
        setMediaError(
          parseApiMessage(payload) ?? "Failed to create app media.",
        );
        return;
      }

      setAppMediaByAppId((previous) => {
        const current = previous[mediaModalAppId] ?? [];

        return {
          ...previous,
          [mediaModalAppId]: toSortedMedia([...current, payload.data]),
        };
      });

      resetMediaForm();
      dispatch(
        enqueueNotification({
          tone: "success",
          message: "App media item added.",
        }),
      );
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Failed to create app media.",
      );
    } finally {
      setCreatingMedia(false);
    }
  }

  async function onDeleteMedia(mediaId: string) {
    if (!mediaModalAppId) {
      return;
    }

    setDeletingMediaId(mediaId);
    setMediaError(null);

    try {
      const response = await fetch(
        `/api/admin/apps/${mediaModalAppId}/media/${mediaId}`,
        {
          method: "DELETE",
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<{ deleted: boolean }>(payload)) {
        setMediaError(
          parseApiMessage(payload) ?? "Failed to delete app media.",
        );
        return;
      }

      setAppMediaByAppId((previous) => {
        const current = previous[mediaModalAppId] ?? [];
        return {
          ...previous,
          [mediaModalAppId]: current.filter((item) => item.id !== mediaId),
        };
      });

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Media removed.",
        }),
      );
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Failed to delete app media.",
      );
    } finally {
      setDeletingMediaId(null);
    }
  }

  function startMediaEdit(item: AdminAppMedia) {
    setEditingMediaId(item.id);
    setEditMediaType(item.type);
    setEditMediaUrl(item.url);
    setEditMediaAlt(item.alt ?? "");
    setEditMediaMimeType(item.mimeType ?? "");
    setEditMediaWidth(
      item.width !== null && item.width !== undefined ? String(item.width) : "",
    );
    setEditMediaHeight(
      item.height !== null && item.height !== undefined
        ? String(item.height)
        : "",
    );
    setEditMediaDurationSec(
      item.durationSec !== null && item.durationSec !== undefined
        ? String(item.durationSec)
        : "",
    );
    setEditMediaThumbnailUrl(item.thumbnailUrl ?? "");
    setEditMediaFileSizeBytes(
      item.fileSizeBytes !== null && item.fileSizeBytes !== undefined
        ? String(item.fileSizeBytes)
        : "",
    );
    setEditMediaIsAnimated(Boolean(item.isAnimated));
    setEditMediaSortOrder(String(item.sortOrder));
    setMediaError(null);
  }

  async function onSaveMediaEdit(mediaId: string) {
    if (!mediaModalAppId) {
      return;
    }

    const normalizedUrl = editMediaUrl.trim();
    if (!normalizedUrl) {
      setMediaError("Media URL is required.");
      return;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setMediaError("Please provide a valid media URL.");
      return;
    }

    const parsedSortOrder = Number(editMediaSortOrder);
    const parsedWidth = editMediaWidth ? Number(editMediaWidth) : undefined;
    const parsedHeight = editMediaHeight ? Number(editMediaHeight) : undefined;
    const parsedDuration = editMediaDurationSec
      ? Number(editMediaDurationSec)
      : undefined;
    const parsedFileSizeBytes = editMediaFileSizeBytes.trim() || undefined;

    if (
      parsedWidth !== undefined &&
      (!Number.isInteger(parsedWidth) || parsedWidth < 1)
    ) {
      setMediaError("Width must be a whole number >= 1.");
      return;
    }

    if (
      parsedHeight !== undefined &&
      (!Number.isInteger(parsedHeight) || parsedHeight < 1)
    ) {
      setMediaError("Height must be a whole number >= 1.");
      return;
    }

    if (
      parsedDuration !== undefined &&
      (!Number.isInteger(parsedDuration) || parsedDuration < 0)
    ) {
      setMediaError("Duration must be a whole number >= 0.");
      return;
    }

    if (parsedFileSizeBytes && !/^\d+$/.test(parsedFileSizeBytes)) {
      setMediaError("File size must be a positive integer in bytes.");
      return;
    }

    if (editMediaThumbnailUrl.trim()) {
      try {
        new URL(editMediaThumbnailUrl.trim());
      } catch {
        setMediaError("Thumbnail URL must be valid.");
        return;
      }
    }

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      setMediaError("Sort order must be a whole number >= 0.");
      return;
    }

    setSavingMediaId(mediaId);
    setMediaError(null);

    try {
      const response = await fetch(
        `/api/admin/apps/${mediaModalAppId}/media/${mediaId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            type: editMediaType,
            url: normalizedUrl,
            alt: editMediaAlt.trim() || null,
            mimeType: editMediaMimeType.trim() || null,
            width: Number.isFinite(parsedWidth) ? parsedWidth : null,
            height: Number.isFinite(parsedHeight) ? parsedHeight : null,
            durationSec: Number.isFinite(parsedDuration)
              ? parsedDuration
              : null,
            thumbnailUrl: editMediaThumbnailUrl.trim() || null,
            fileSizeBytes: parsedFileSizeBytes ?? null,
            isAnimated: editMediaIsAnimated,
            sortOrder: parsedSortOrder,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<AdminAppMedia>(payload)) {
        setMediaError(
          parseApiMessage(payload) ?? "Failed to update app media.",
        );
        return;
      }

      setAppMediaByAppId((previous) => {
        const current = previous[mediaModalAppId] ?? [];
        return {
          ...previous,
          [mediaModalAppId]: toSortedMedia(
            current.map((item) => (item.id === mediaId ? payload.data : item)),
          ),
        };
      });

      setEditingMediaId(null);
      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Media updated.",
        }),
      );
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Failed to update app media.",
      );
    } finally {
      setSavingMediaId(null);
    }
  }

  async function persistMediaOrder(nextItems: AdminAppMedia[]) {
    if (!mediaModalAppId) {
      return;
    }

    setReorderingMedia(true);
    setMediaError(null);

    const normalized = nextItems.map((item, index) => ({
      ...item,
      sortOrder: index * 10,
    }));

    try {
      const responses = await Promise.all(
        normalized.map((item) =>
          fetch(`/api/admin/apps/${mediaModalAppId}/media/${item.id}`, {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ sortOrder: item.sortOrder }),
          }),
        ),
      );

      const payloads = await Promise.all(
        responses.map((response) => response.json().catch(() => null)),
      );

      const failedPayload = responses.find((response) => !response.ok);
      if (failedPayload) {
        const failedIndex = responses.findIndex((response) => !response.ok);
        setMediaError(
          parseApiMessage(payloads[failedIndex]) ?? "Failed to reorder media.",
        );
        await fetchMediaForApp(mediaModalAppId);
        return;
      }

      setAppMediaByAppId((previous) => ({
        ...previous,
        [mediaModalAppId]: normalized,
      }));

      dispatch(
        enqueueNotification({
          tone: "success",
          message: "Media order updated.",
        }),
      );
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "Failed to reorder media.",
      );
      await fetchMediaForApp(mediaModalAppId);
    } finally {
      setReorderingMedia(false);
      setDraggingMediaId(null);
      setDragOverMediaId(null);
    }
  }

  async function onDropMedia(targetMediaId: string) {
    if (
      !mediaModalAppId ||
      !draggingMediaId ||
      draggingMediaId === targetMediaId
    ) {
      setDraggingMediaId(null);
      setDragOverMediaId(null);
      return;
    }

    const items = appMediaByAppId[mediaModalAppId] ?? [];
    const fromIndex = items.findIndex((item) => item.id === draggingMediaId);
    const toIndex = items.findIndex((item) => item.id === targetMediaId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggingMediaId(null);
      setDragOverMediaId(null);
      return;
    }

    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setAppMediaByAppId((previous) => ({
      ...previous,
      [mediaModalAppId]: reordered,
    }));

    await persistMediaOrder(reordered);
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

    const metadataResult = parseMetadataInput(createForm.metadata);
    if (metadataResult.error) {
      setCreateError(metadataResult.error);
      setCreating(false);
      return;
    }

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
          releaseNotes: createForm.releaseNotes.trim() || undefined,
          version: createForm.version.trim(),
          status: createForm.status,
          isPaid: createForm.isPaid,
          isFeatured: createForm.isFeatured,
          containsAds: createForm.containsAds,
          price: Number(createForm.price),
          iconUrl: createForm.iconUrl.trim() || undefined,
          featureGraphicUrl: createForm.featureGraphicUrl.trim() || undefined,
          promoVideoUrl: createForm.promoVideoUrl.trim() || undefined,
          supportEmail: createForm.supportEmail.trim() || undefined,
          supportWebsiteUrl: createForm.supportWebsiteUrl.trim() || undefined,
          privacyPolicyUrl: createForm.privacyPolicyUrl.trim() || undefined,
          developerName: createForm.developerName.trim() || undefined,
          metadata: metadataResult.data,
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

    const metadataResult = parseMetadataInput(editForm.metadata);
    if (metadataResult.error) {
      setEditError(metadataResult.error);
      setSavingEdit(false);
      return;
    }

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
          releaseNotes: editForm.releaseNotes.trim() || undefined,
          version: editForm.version.trim(),
          status: editForm.status,
          isPaid: editForm.isPaid,
          isFeatured: editForm.isFeatured,
          containsAds: editForm.containsAds,
          price: Number(editForm.price),
          iconUrl: editForm.iconUrl.trim() || undefined,
          featureGraphicUrl: editForm.featureGraphicUrl.trim() || undefined,
          promoVideoUrl: editForm.promoVideoUrl.trim() || undefined,
          supportEmail: editForm.supportEmail.trim() || undefined,
          supportWebsiteUrl: editForm.supportWebsiteUrl.trim() || undefined,
          privacyPolicyUrl: editForm.privacyPolicyUrl.trim() || undefined,
          developerName: editForm.developerName.trim() || undefined,
          metadata: metadataResult.data,
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
              onManageMedia={() => openMediaManager(item)}
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
        open={Boolean(mediaModalApp)}
        onClose={() => {
          if (
            creatingMedia ||
            uploadingMedia ||
            Boolean(deletingMediaId) ||
            Boolean(savingMediaId) ||
            reorderingMedia
          ) {
            return;
          }

          setMediaModalAppId(null);
          resetMediaForm();
        }}
        title={
          mediaModalApp
            ? `Media gallery for ${mediaModalApp.title}`
            : "Media gallery"
        }
        description="Upload screenshots and clips, or add hosted media URLs for storefront presentation."
        width="xl"
      >
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-xl border border-black/10 bg-[#fbfcff] p-3 md:grid-cols-2"
            onSubmit={onCreateMedia}
          >
            <div className="grid gap-3 md:col-span-2 md:grid-cols-[0.9fr_1.6fr_1.1fr_0.7fr_auto]">
              <select
                value={newMediaType}
                onChange={(event) =>
                  setNewMediaType(event.target.value as MediaType)
                }
                className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
              >
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
              </select>

              <Input
                value={newMediaUrl}
                onChange={(event) => setNewMediaUrl(event.target.value)}
                placeholder="https://..."
                required
              />

              <Input
                value={newMediaAlt}
                onChange={(event) => setNewMediaAlt(event.target.value)}
                placeholder="Alt text (optional)"
                maxLength={180}
              />

              <Input
                value={newMediaSortOrder}
                onChange={(event) => setNewMediaSortOrder(event.target.value)}
                type="number"
                min="0"
                step="1"
                placeholder="Sort"
              />

              <Button
                type="submit"
                disabled={creatingMedia || !mediaModalAppId}
              >
                {creatingMedia ? "Adding..." : "Add media"}
              </Button>
            </div>

            <Input
              value={newMediaMimeType}
              onChange={(event) => setNewMediaMimeType(event.target.value)}
              placeholder="MIME type (optional, e.g. image/gif)"
              maxLength={120}
            />

            <Input
              value={newMediaThumbnailUrl}
              onChange={(event) => setNewMediaThumbnailUrl(event.target.value)}
              placeholder="Thumbnail URL (optional)"
            />

            <Input
              value={newMediaWidth}
              onChange={(event) => setNewMediaWidth(event.target.value)}
              type="number"
              min="1"
              step="1"
              placeholder="Width"
            />

            <Input
              value={newMediaHeight}
              onChange={(event) => setNewMediaHeight(event.target.value)}
              type="number"
              min="1"
              step="1"
              placeholder="Height"
            />

            <Input
              value={newMediaDurationSec}
              onChange={(event) => setNewMediaDurationSec(event.target.value)}
              type="number"
              min="0"
              step="1"
              placeholder="Duration (sec)"
            />

            <Input
              value={newMediaFileSizeBytes}
              onChange={(event) => setNewMediaFileSizeBytes(event.target.value)}
              placeholder="File size bytes"
            />

            <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#1a2439]">
              <input
                type="checkbox"
                checked={newMediaIsAnimated}
                onChange={(event) =>
                  setNewMediaIsAnimated(event.target.checked)
                }
                className="h-4 w-4"
              />
              Animated (GIF/WebP)
            </label>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-[#182236] hover:bg-[#f7f8fb]">
              <input
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void onUploadMediaFile(file);
                  }

                  event.target.value = "";
                }}
                disabled={uploadingMedia || !mediaModalAppId}
              />
              {uploadingMedia ? "Uploading..." : "Upload image or clip"}
            </label>

            <p className="text-xs text-[#5a647d]">
              Upload fills URL/type automatically. Then click Add media.
            </p>
          </div>

          {mediaError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {mediaError}
            </p>
          ) : null}

          {loadingMedia ? (
            <p className="rounded-lg border border-black/10 bg-[#f8f9fc] px-3 py-2 text-sm text-[#5a647d]">
              Loading media...
            </p>
          ) : activeMedia.length === 0 ? (
            <Card>
              <CardTitle>No media yet</CardTitle>
              <CardDescription className="mt-1">
                Add screenshots and clips to improve app storefront quality.
              </CardDescription>
            </Card>
          ) : (
            <section className="grid gap-3 md:grid-cols-2">
              {activeMedia.map((item) => (
                <Card
                  key={item.id}
                  className={`space-y-3 ${dragOverMediaId === item.id ? "ring-2 ring-[#1f5ed4]/35" : ""}`}
                  draggable={!reorderingMedia}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    setDraggingMediaId(item.id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggingMediaId && draggingMediaId !== item.id) {
                      setDragOverMediaId(item.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverMediaId === item.id) {
                      setDragOverMediaId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void onDropMedia(item.id);
                  }}
                  onDragEnd={() => {
                    setDraggingMediaId(null);
                    setDragOverMediaId(null);
                  }}
                >
                  {editingMediaId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-2 md:grid-cols-2">
                        <select
                          value={editMediaType}
                          onChange={(event) =>
                            setEditMediaType(event.target.value as MediaType)
                          }
                          className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
                        >
                          <option value="IMAGE">IMAGE</option>
                          <option value="VIDEO">VIDEO</option>
                        </select>
                        <Input
                          value={editMediaSortOrder}
                          onChange={(event) =>
                            setEditMediaSortOrder(event.target.value)
                          }
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Sort"
                        />
                      </div>

                      <Input
                        value={editMediaUrl}
                        onChange={(event) =>
                          setEditMediaUrl(event.target.value)
                        }
                        placeholder="https://..."
                      />

                      <Input
                        value={editMediaAlt}
                        onChange={(event) =>
                          setEditMediaAlt(event.target.value)
                        }
                        placeholder="Alt text (optional)"
                        maxLength={180}
                      />

                      <div className="grid gap-2 md:grid-cols-2">
                        <Input
                          value={editMediaMimeType}
                          onChange={(event) =>
                            setEditMediaMimeType(event.target.value)
                          }
                          placeholder="MIME type"
                          maxLength={120}
                        />
                        <Input
                          value={editMediaThumbnailUrl}
                          onChange={(event) =>
                            setEditMediaThumbnailUrl(event.target.value)
                          }
                          placeholder="Thumbnail URL"
                        />
                      </div>

                      <div className="grid gap-2 md:grid-cols-3">
                        <Input
                          value={editMediaWidth}
                          onChange={(event) =>
                            setEditMediaWidth(event.target.value)
                          }
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Width"
                        />
                        <Input
                          value={editMediaHeight}
                          onChange={(event) =>
                            setEditMediaHeight(event.target.value)
                          }
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Height"
                        />
                        <Input
                          value={editMediaDurationSec}
                          onChange={(event) =>
                            setEditMediaDurationSec(event.target.value)
                          }
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Duration (sec)"
                        />
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <Input
                          value={editMediaFileSizeBytes}
                          onChange={(event) =>
                            setEditMediaFileSizeBytes(event.target.value)
                          }
                          placeholder="File size bytes"
                        />
                        <label className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#1a2439]">
                          <input
                            type="checkbox"
                            checked={editMediaIsAnimated}
                            onChange={(event) =>
                              setEditMediaIsAnimated(event.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          Animated (GIF/WebP)
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          tone="secondary"
                          size="sm"
                          onClick={() => setEditingMediaId(null)}
                          disabled={savingMediaId === item.id}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => void onSaveMediaEdit(item.id)}
                          disabled={savingMediaId === item.id}
                        >
                          {savingMediaId === item.id ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {item.type === "VIDEO" ? (
                        <video
                          controls
                          preload="metadata"
                          src={item.url}
                          className="h-48 w-full rounded-lg border border-black/10 bg-black object-contain"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.alt ?? "App media"}
                          width={720}
                          height={420}
                          className="h-48 w-full rounded-lg border border-black/10 bg-[#f8fafc] object-cover"
                          unoptimized
                        />
                      )}

                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#51607a]">
                          {item.type} · Sort {item.sortOrder}
                        </p>
                        <p className="line-clamp-1 text-xs text-[#5a647d]">
                          {item.alt ?? "No alt text"}
                        </p>
                        <p className="line-clamp-1 text-xs text-[#5a647d]">
                          {item.url}
                        </p>
                        <p className="line-clamp-1 text-xs text-[#5a647d]">
                          MIME: {item.mimeType ?? "-"}
                        </p>
                        <p className="line-clamp-1 text-xs text-[#5a647d]">
                          Size: {item.width ?? "?"}x{item.height ?? "?"} ·
                          Duration: {item.durationSec ?? 0}s · Animated:{" "}
                          {item.isAnimated ? "Yes" : "No"}
                        </p>
                        <p className="text-[11px] text-[#66718b]">
                          Drag card to reorder media
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          tone="secondary"
                          size="sm"
                          onClick={() => startMediaEdit(item)}
                          disabled={Boolean(savingMediaId) || reorderingMedia}
                        >
                          Edit
                        </Button>
                        <Button
                          tone="danger"
                          size="sm"
                          onClick={() => void onDeleteMedia(item.id)}
                          disabled={
                            deletingMediaId === item.id || reorderingMedia
                          }
                        >
                          {deletingMediaId === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </section>
          )}
          {reorderingMedia ? (
            <p className="rounded-lg border border-black/10 bg-[#f8f9fc] px-3 py-2 text-sm text-[#5a647d]">
              Saving media order...
            </p>
          ) : null}
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
