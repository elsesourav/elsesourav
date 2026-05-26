"use client";

import { cn } from "@/lib/cn";
import Color from "@tiptap/extension-color";
import FileHandler from "@tiptap/extension-file-handler";
import { Highlight } from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Textarea } from "./textarea";

type EditorViewport = "write" | "split" | "preview";
type IncomingContentType = "html" | "markdown";

const headingLevels: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
const textAlignments = ["left", "center", "right", "justify"] as const;

const textColors = [
  { label: "Slate", value: "#334155" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Teal", value: "#0f766e" },
  { label: "Orange", value: "#c2410c" },
  { label: "Rose", value: "#be123c" },
  { label: "Emerald", value: "#047857" },
] as const;

const highlightColors = [
  { label: "Sun", value: "#fde68a" },
  { label: "Mint", value: "#bbf7d0" },
  { label: "Sky", value: "#bfdbfe" },
  { label: "Rose", value: "#fecdd3" },
] as const;

const acceptedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;

const maxImageUploadSizeBytes = 10 * 1024 * 1024;

const editorButtonClassName =
  "rounded-lg border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-2.5 py-1.5 text-xs font-medium ui-text-primary transition hover:bg-[color-mix(in_srgb,var(--background)_82%,var(--brand-secondary)_18%)] disabled:cursor-not-allowed disabled:opacity-45";

type CloudinarySignData = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

function isAcceptedImageMimeType(mimeType: string): boolean {
  return acceptedImageMimeTypes.includes(
    mimeType as (typeof acceptedImageMimeTypes)[number],
  );
}

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const errorRecord = (payload as Record<string, unknown>).error;
  if (!errorRecord || typeof errorRecord !== "object") {
    return null;
  }

  const message = (errorRecord as Record<string, unknown>).message;
  return typeof message === "string" && message.trim().length > 0
    ? message
    : null;
}

function isCloudinarySignSuccess(
  payload: unknown,
): payload is { ok: true; data: CloudinarySignData } {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const record = payload as Record<string, unknown>;
  if (record.ok !== true || !record.data || typeof record.data !== "object") {
    return false;
  }

  const data = record.data as Record<string, unknown>;
  return (
    typeof data.cloudName === "string" &&
    typeof data.apiKey === "string" &&
    typeof data.folder === "string" &&
    typeof data.signature === "string" &&
    typeof data.timestamp === "number"
  );
}

function isCloudinaryUploadSuccess(
  payload: unknown,
): payload is { secure_url: string; resource_type?: string } {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return typeof (payload as Record<string, unknown>).secure_url === "string";
}

function sanitizeFolderSegment(value: string): string {
  const sanitized = value
    .replace(/[^a-z0-9/_-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");

  return sanitized.length > 0 ? sanitized : "content";
}

async function verifyOnlineImageUrl(url: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const probeImage = new window.Image();
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(
        new Error(
          "Could not verify image URL. Try a direct public image link.",
        ),
      );
    }, 8000);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      probeImage.onload = null;
      probeImage.onerror = null;
    };

    probeImage.onload = () => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve();
    };

    probeImage.onerror = () => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(new Error("Image URL is not reachable or is not a valid image."));
    };

    probeImage.decoding = "async";
    probeImage.referrerPolicy = "no-referrer";
    probeImage.src = url;
  });
}

function detectIncomingContentType(value: string): IncomingContentType {
  const trimmed = value.trim();

  if (!trimmed) {
    return "html";
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return "html";
  }

  if (
    /^#{1,6}\s/m.test(value) ||
    /^\s*[-*+]\s+/m.test(value) ||
    /^\s*\d+\.\s+/m.test(value) ||
    /```/.test(value) ||
    /\[[^\]]+\]\([^)]+\)/.test(value) ||
    /==[^=\n]+==/.test(value) ||
    /\+\+[^+\n]+\+\+/.test(value)
  ) {
    return "markdown";
  }

  return "html";
}

function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function resolveEditorColor(colorValue: string | undefined): string {
  if (!colorValue) {
    return "#334155";
  }

  const normalized = colorValue.trim().toLowerCase();
  const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!hexMatch) {
    return "#334155";
  }

  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return normalized;
}

function ToolbarButton({
  active,
  label,
  onClick,
  disabled,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        editorButtonClassName,
        active
          ? "border-[color-mix(in_srgb,var(--brand-secondary)_55%,transparent)] bg-[color-mix(in_srgb,var(--brand-secondary)_18%,var(--background)_82%)]"
          : undefined,
      )}
    >
      {label}
    </button>
  );
}

function promptForLink(editor: Editor) {
  const previousHref = editor.getAttributes("link").href as string | undefined;
  const input = window.prompt("Enter a URL", previousHref ?? "https://");

  if (input === null) {
    return;
  }

  const nextValue = input.trim();
  if (!nextValue) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  try {
    new URL(nextValue);
  } catch {
    return;
  }

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({
      href: nextValue,
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    })
    .run();
}

type RichMarkdownEditorProps = {
  id: string;
  value: string;
  onChange: (nextValue: string) => void;
  rows?: number;
  placeholder?: string;
};

export function RichMarkdownEditor({
  id,
  value,
  onChange,
  rows = 16,
  placeholder,
}: RichMarkdownEditorProps) {
  const [view, setView] = useState<EditorViewport>("split");
  const [previewHtml, setPreviewHtml] = useState("");
  const [imageStatusMessage, setImageStatusMessage] = useState<string | null>(
    null,
  );
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const minEditorHeight = Math.max(10, rows) * 22;
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const lastEmittedHtmlRef = useRef<string>("");
  const isSyncingExternalValueRef = useRef(false);
  const initialContentType = detectIncomingContentType(value);

  const uploadImageFileToCloudinary = useCallback(
    async (file: File): Promise<string> => {
      const folder = `content/rich-editor/${sanitizeFolderSegment(id)}`;
      const signatureResponse = await fetch("/api/upload/cloudinary/sign", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ folder }),
      });

      const signaturePayload = await signatureResponse.json().catch(() => null);
      if (!signatureResponse.ok || !isCloudinarySignSuccess(signaturePayload)) {
        throw new Error(
          parseApiMessage(signaturePayload) ?? "Failed to initialize upload.",
        );
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

      const uploadPayload = await uploadResponse.json().catch(() => null);
      if (!uploadResponse.ok || !isCloudinaryUploadSuccess(uploadPayload)) {
        throw new Error("Upload failed. Please retry with a valid image file.");
      }

      if (
        typeof uploadPayload.resource_type === "string" &&
        uploadPayload.resource_type !== "image"
      ) {
        throw new Error("Only image files are supported.");
      }

      return uploadPayload.secure_url;
    },
    [id],
  );

  const insertImagesFromFiles = useCallback(
    async (currentEditor: Editor, files: File[], dropPos?: number) => {
      if (files.length === 0) {
        return;
      }

      const imageFiles = files.filter((file) =>
        isAcceptedImageMimeType(file.type),
      );
      const skippedCount = files.length - imageFiles.length;
      const failures: string[] = [];

      if (imageFiles.length === 0) {
        setImageStatusMessage(
          "Only PNG, JPEG, GIF, WebP, and AVIF files are supported.",
        );
        return;
      }

      if (skippedCount > 0) {
        failures.push(
          `${skippedCount} file${skippedCount > 1 ? "s were" : " was"} skipped (unsupported format).`,
        );
      }

      setIsProcessingImage(true);
      setImageStatusMessage(
        imageFiles.length === 1
          ? "Uploading image..."
          : `Uploading ${imageFiles.length} images...`,
      );

      let insertedCount = 0;
      let insertionPos = dropPos;

      try {
        for (const file of imageFiles) {
          if (file.size > maxImageUploadSizeBytes) {
            failures.push(`${file.name || "Image"} is larger than 10MB.`);
            continue;
          }

          try {
            const secureUrl = await uploadImageFileToCloudinary(file);
            const imageNode = {
              type: "image",
              attrs: {
                src: secureUrl,
                alt: file.name || undefined,
                title: file.name || undefined,
              },
            };

            if (typeof insertionPos === "number") {
              currentEditor
                .chain()
                .insertContentAt(insertionPos, imageNode)
                .focus()
                .run();
              insertionPos += 1;
            } else {
              currentEditor.chain().focus().insertContent(imageNode).run();
            }

            insertedCount += 1;
          } catch (error) {
            failures.push(
              error instanceof Error ? error.message : "Image upload failed.",
            );
          }
        }

        if (insertedCount > 0 && failures.length === 0) {
          setImageStatusMessage(
            insertedCount === 1
              ? "Image uploaded and inserted."
              : `${insertedCount} images uploaded and inserted.`,
          );
          return;
        }

        if (insertedCount > 0) {
          setImageStatusMessage(
            `${insertedCount} image${insertedCount > 1 ? "s" : ""} uploaded. ${failures[0]}`,
          );
          return;
        }

        setImageStatusMessage(failures[0] ?? "No images were uploaded.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [uploadImageFileToCloudinary],
  );

  const promptForImageUrl = useCallback(async (currentEditor: Editor) => {
    const src = window.prompt("Paste an image URL", "https://");
    if (src === null) {
      return;
    }

    const nextSrc = src.trim();
    if (!nextSrc) {
      return;
    }

    try {
      new URL(nextSrc);
    } catch {
      setImageStatusMessage("Please enter a valid URL.");
      return;
    }

    setIsProcessingImage(true);
    setImageStatusMessage("Checking image URL...");

    try {
      await verifyOnlineImageUrl(nextSrc);

      const alt = window.prompt("Optional alt text", "") ?? "";
      const title = window.prompt("Optional image title", "") ?? "";

      currentEditor
        .chain()
        .focus()
        .setImage({
          src: nextSrc,
          alt: alt || undefined,
          title: title || undefined,
        })
        .run();

      setImageStatusMessage("Image inserted from URL.");
    } catch (error) {
      setImageStatusMessage(
        error instanceof Error
          ? error.message
          : "Image URL verification failed.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    content: value,
    contentType: initialContentType,
    editorProps: {
      attributes: {
        id,
        class:
          "ProseMirror min-h-[220px] w-full px-3 py-2 text-sm leading-7 text-[color:var(--foreground)] focus:outline-none",
      },
    },
    extensions: [
      Markdown.configure({
        indentation: {
          style: "space",
          size: 2,
        },
      }),
      StarterKit.configure({
        heading: {
          levels: headingLevels,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
      }),
      Image.configure({
        HTMLAttributes: {
          loading: "lazy",
          decoding: "async",
        },
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: [...acceptedImageMimeTypes],
        onDrop: (currentEditor, files, pos) => {
          void insertImagesFromFiles(currentEditor, files, pos);
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (
            typeof htmlContent === "string" &&
            htmlContent.trim().length > 0
          ) {
            return;
          }

          void insertImagesFromFiles(currentEditor, files);
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      TableKit.configure({
        table: {
          resizable: true,
          cellMinWidth: 90,
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder: placeholder ?? "Write markdown-rich content...",
      }),
    ],
    onCreate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      setPreviewHtml(html);
      lastEmittedHtmlRef.current = html;
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      setPreviewHtml(html);

      if (isSyncingExternalValueRef.current) {
        return;
      }

      lastEmittedHtmlRef.current = html;
      onChange(html);
    },
  });

  const handleImageFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? []);
      event.currentTarget.value = "";

      if (!editor || selectedFiles.length === 0) {
        return;
      }

      void insertImagesFromFiles(editor, selectedFiles);
    },
    [editor, insertImagesFromFiles],
  );

  useEffect(() => {
    if (!imageStatusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setImageStatusMessage(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [imageStatusMessage]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const sourceType = detectIncomingContentType(value);

    if (sourceType === "html") {
      const normalizedIncoming = normalizeHtml(value);
      const normalizedCurrent = normalizeHtml(editor.getHTML());

      if (normalizedIncoming === normalizedCurrent) {
        return;
      }

      if (normalizeHtml(lastEmittedHtmlRef.current) === normalizedIncoming) {
        return;
      }
    }

    isSyncingExternalValueRef.current = true;

    try {
      if (sourceType === "markdown") {
        try {
          editor.commands.setContent(value, { contentType: "markdown" });
        } catch {
          editor.commands.setContent(value);
        }
      } else {
        editor.commands.setContent(value);
      }

      const nextHtml = editor.getHTML();
      setPreviewHtml(nextHtml);
      lastEmittedHtmlRef.current = nextHtml;
    } finally {
      isSyncingExternalValueRef.current = false;
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const html = editor.getHTML();
    setPreviewHtml(html);
    lastEmittedHtmlRef.current = html;
  }, [editor]);

  const renderedText =
    editor?.state.doc.textContent ?? value.replace(/<[^>]+>/g, " ");

  const wordCount = useMemo(() => countWords(renderedText), [renderedText]);
  const characterCount = renderedText.length;

  const activeTextColor = resolveEditorColor(
    editor
      ? (editor.getAttributes("textStyle").color as string | undefined)
      : undefined,
  );

  const showWrite = view === "write" || view === "split";
  const showPreview = view === "preview" || view === "split";

  return (
    <div className="space-y-3">
      <div className="ui-card rounded-xl border p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b ui-border pb-2">
          <div className="flex items-center gap-2 text-xs ui-text-muted">
            <span className="rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-2 py-0.5">
              {wordCount.toLocaleString()} words
            </span>
            <span className="rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-2 py-0.5">
              {characterCount.toLocaleString()} chars
            </span>
          </div>

          <div className="flex items-center gap-1">
            {(
              [
                { key: "write", label: "Write" },
                { key: "split", label: "Split" },
                { key: "preview", label: "Preview" },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setView(option.key)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition",
                  view === option.key
                    ? "bg-[color-mix(in_srgb,var(--brand-secondary)_20%,var(--background)_80%)] text-primary"
                    : "ui-text-muted hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <ToolbarButton
            label="P"
            active={editor?.isActive("paragraph")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          />

          {headingLevels.map((level) => (
            <ToolbarButton
              key={level}
              label={`H${level}`}
              active={editor?.isActive("heading", { level })}
              disabled={!editor}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level }).run()
              }
            />
          ))}

          {textAlignments.map((alignment) => (
            <ToolbarButton
              key={alignment}
              label={
                alignment === "justify"
                  ? "Justify"
                  : alignment[0].toUpperCase() + alignment.slice(1)
              }
              active={editor?.isActive({ textAlign: alignment })}
              disabled={!editor}
              onClick={() =>
                editor?.chain().focus().setTextAlign(alignment).run()
              }
            />
          ))}

          <ToolbarButton
            label="Align Off"
            active={!editor?.isActive({ textAlign: "left" })}
            disabled={!editor}
            onClick={() => editor?.chain().focus().unsetTextAlign().run()}
          />

          <ToolbarButton
            label="Bold"
            active={editor?.isActive("bold")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italic"
            active={editor?.isActive("italic")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="Underline"
            active={editor?.isActive("underline")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            label="Strike"
            active={editor?.isActive("strike")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          />
          <ToolbarButton
            label="Code"
            active={editor?.isActive("code")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleCode().run()}
          />
          <ToolbarButton
            label="Sub"
            active={editor?.isActive("subscript")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleSubscript().run()}
          />
          <ToolbarButton
            label="Sup"
            active={editor?.isActive("superscript")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
          />
          <ToolbarButton
            label="Highlight"
            active={editor?.isActive("highlight")}
            disabled={!editor}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleHighlight({ color: "#fde68a" })
                .run()
            }
          />
          {highlightColors.map((color) => (
            <button
              key={color.value}
              type="button"
              disabled={!editor}
              title={`Set highlight color ${color.label}`}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .setHighlight({ color: color.value })
                  .run()
              }
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md border ui-border transition disabled:cursor-not-allowed disabled:opacity-45",
                editor?.isActive("highlight", { color: color.value })
                  ? "bg-[color-mix(in_srgb,var(--brand-secondary)_18%,var(--background)_82%)]"
                  : "bg-[color-mix(in_srgb,var(--background)_92%,white_8%)]",
              )}
            >
              <span
                className="h-3.5 w-3.5 rounded"
                style={{ backgroundColor: color.value }}
              />
            </button>
          ))}
          <ToolbarButton
            label="No HL"
            active={!editor?.isActive("highlight")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().unsetHighlight().run()}
          />

          <ToolbarButton
            label="Bullet"
            active={editor?.isActive("bulletList")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Numbered"
            active={editor?.isActive("orderedList")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="Task"
            active={editor?.isActive("taskList")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
          />
          <ToolbarButton
            label="Quote"
            active={editor?.isActive("blockquote")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            label="Code Block"
            active={editor?.isActive("codeBlock")}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          />
          <ToolbarButton
            label="Rule"
            disabled={!editor}
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          />

          <ToolbarButton
            label="Link"
            active={editor?.isActive("link")}
            disabled={!editor}
            onClick={() => {
              if (!editor) {
                return;
              }

              promptForLink(editor);
            }}
          />
          <ToolbarButton
            label="Image URL"
            disabled={!editor || isProcessingImage}
            onClick={() => {
              if (!editor) {
                return;
              }

              void promptForImageUrl(editor);
            }}
          />
          <ToolbarButton
            label={isProcessingImage ? "Uploading..." : "Upload Img"}
            disabled={!editor || isProcessingImage}
            onClick={() => imageFileInputRef.current?.click()}
          />

          <ToolbarButton
            label="Table"
            disabled={!editor}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          />
          <ToolbarButton
            label="+ Row"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().addRowAfter().run()}
          />
          <ToolbarButton
            label="+ Col"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
          />
          <ToolbarButton
            label="- Row"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().deleteRow().run()}
          />
          <ToolbarButton
            label="- Col"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().deleteColumn().run()}
          />
          <ToolbarButton
            label="Hdr Row"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
          />
          <ToolbarButton
            label="Hdr Col"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
          />
          <ToolbarButton
            label="Merge"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().mergeOrSplit().run()}
          />
          <ToolbarButton
            label="Del Tbl"
            disabled={!editor || !editor.isActive("table")}
            onClick={() => editor?.chain().focus().deleteTable().run()}
          />

          {textColors.map((color) => (
            <button
              key={color.value}
              type="button"
              disabled={!editor}
              title={`Set text color ${color.label}`}
              onClick={() =>
                editor?.chain().focus().setColor(color.value).run()
              }
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md border ui-border transition disabled:cursor-not-allowed disabled:opacity-45",
                editor?.isActive("textStyle", { color: color.value })
                  ? "bg-[color-mix(in_srgb,var(--brand-secondary)_18%,var(--background)_82%)]"
                  : "bg-[color-mix(in_srgb,var(--background)_92%,white_8%)]",
              )}
            >
              <span style={{ color: color.value }}>A</span>
            </button>
          ))}

          <div className="inline-flex items-center gap-1 rounded-lg border ui-border bg-[color-mix(in_srgb,var(--background)_92%,white_8%)] px-2 py-1">
            <span className="text-[11px] ui-text-muted">Color</span>
            <input
              type="color"
              aria-label="Custom text color"
              value={activeTextColor}
              disabled={!editor}
              onChange={(event) =>
                editor?.chain().focus().setColor(event.target.value).run()
              }
              className="h-6 w-6 cursor-pointer rounded border ui-border bg-transparent p-0 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={!editor}
              onClick={() => editor?.chain().focus().unsetColor().run()}
              className="rounded-md px-2 py-1 text-[11px] font-medium ui-text-muted transition hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Reset
            </button>
          </div>

          <ToolbarButton
            label="Undo"
            disabled={!editor || !editor.can().chain().focus().undo().run()}
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            label="Redo"
            disabled={!editor || !editor.can().chain().focus().redo().run()}
            onClick={() => editor?.chain().focus().redo().run()}
          />
          <ToolbarButton
            label="Clear"
            disabled={!editor}
            onClick={() =>
              editor?.chain().focus().clearNodes().unsetAllMarks().run()
            }
          />
        </div>

        <input
          ref={imageFileInputRef}
          type="file"
          accept={acceptedImageMimeTypes.join(",")}
          multiple
          className="hidden"
          onChange={handleImageFileSelection}
        />

        {imageStatusMessage ? (
          <p className="mt-2 text-[11px] ui-text-muted">{imageStatusMessage}</p>
        ) : null}

        <p className="mt-2 text-[11px] ui-text-muted">
          Supports markdown input, HTML output, rich formatting, text alignment,
          task lists, tables, and media embeds. Images support URL insertion,
          file upload, drag-drop, and paste.
        </p>
      </div>

      <div
        className={cn("grid gap-3", view === "split" ? "xl:grid-cols-2" : "")}
      >
        {showWrite ? (
          <div className="space-y-1.5">
            <label htmlFor={id} className="ui-label text-sm font-medium">
              Content
            </label>

            {!editor ? (
              <Textarea
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={rows}
                className="font-mono text-[13px]"
                placeholder={placeholder}
              />
            ) : (
              <div
                className="ui-input rounded-xl border bg-[color-mix(in_srgb,var(--background)_94%,white_6%)]"
                style={{ minHeight: `${minEditorHeight}px` }}
              >
                <EditorContent
                  editor={editor}
                  className="[&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h4]:mt-3 [&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[color-mix(in_srgb,var(--foreground)_56%,var(--background)_44%)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_img]:my-3 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-black/15 [&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-black/15 [&_.ProseMirror_ul[data-type='taskList']]:list-none [&_.ProseMirror_ul[data-type='taskList']]:pl-0 [&_.ProseMirror_ul[data-type='taskList']_li]:my-1 [&_.ProseMirror_ul[data-type='taskList']_li]:flex [&_.ProseMirror_ul[data-type='taskList']_li]:items-start [&_.ProseMirror_ul[data-type='taskList']_li]:gap-2 [&_.ProseMirror_table]:my-3 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-black/15 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-black/15 [&_.ProseMirror_th]:bg-[color-mix(in_srgb,var(--brand-secondary)_14%,var(--background)_86%)] [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:text-left"
                />
              </div>
            )}
          </div>
        ) : null}

        {showPreview ? (
          <div className="space-y-1.5">
            <p className="ui-label text-sm font-medium">Preview</p>
            <article
              className="ui-card min-h-56 rounded-xl border p-4 text-sm leading-7 ui-text-primary"
              style={{ minHeight: `${minEditorHeight}px` }}
            >
              {previewHtml.trim().length === 0 ? (
                <p className="ui-text-muted">
                  Start writing to preview rendered output.
                </p>
              ) : (
                <div
                  className="prose prose-sm max-w-none prose-headings:ui-text-heading prose-a:text-[color-mix(in_srgb,var(--brand-secondary)_82%,var(--foreground)_18%)] prose-p:ui-text-primary prose-strong:ui-text-heading [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg [&_mark]:rounded [&_mark]:px-1 [&_mark]:py-0.5 [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-black/15 [&_hr]:my-4 [&_hr]:border-black/15 [&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0 [&_ul[data-type='taskList']_li]:my-1 [&_ul[data-type='taskList']_li]:flex [&_ul[data-type='taskList']_li]:items-start [&_ul[data-type='taskList']_li]:gap-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/15 [&_td]:p-2 [&_th]:border [&_th]:border-black/15 [&_th]:bg-[color-mix(in_srgb,var(--brand-secondary)_14%,var(--background)_86%)] [&_th]:p-2 [&_th]:text-left"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </article>
          </div>
        ) : null}
      </div>
    </div>
  );
}
