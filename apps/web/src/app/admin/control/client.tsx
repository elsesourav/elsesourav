"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import {
  selectIsPending,
  startPending,
  stopPending,
} from "@/store/slices/uiSlice";
import { FormEvent, useState } from "react";

type ApiResult = {
  status: number;
  ok: boolean;
  body: string;
  receivedAt: string;
  networkError?: boolean;
};

type ControlFormProps = {
  title: string;
  endpoint: string;
  method?: "POST" | "PATCH";
  defaultPayload: string;
};

const SECTION_ITEM_DEFAULT_PAYLOAD = JSON.stringify(
  {
    appId: "paste-app-id-here",
    sectionType: "UPCOMING",
    orderIndex: 1,
    releaseAt: "2026-03-20T10:00:00.000Z",
    startsAt: "2026-03-15T10:00:00.000Z",
    endsAt: "2026-03-25T10:00:00.000Z",
  },
  null,
  2,
);

const BANNER_DEFAULT_PAYLOAD = JSON.stringify(
  {
    title: "Big launch banner",
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
    linkUrl: null,
    placement: "HOME_HERO",
    startsAt: "2026-03-15T10:00:00.000Z",
    endsAt: "2026-03-22T10:00:00.000Z",
    isActive: true,
  },
  null,
  2,
);

const CONTENT_DEFAULT_PAYLOAD = JSON.stringify(
  {
    slug: "about",
    title: "About ElseSourav",
    summary: "Dynamic content powered by content-service.",
    body: "You can now update this page from admin controls.",
    seoTitle: "About ElseSourav",
    seoDescription: "About section for the developer platform.",
    status: "PUBLISHED",
    publishAt: "2026-03-15T10:00:00.000Z",
  },
  null,
  2,
);

const THEME_DEFAULT_PAYLOAD = JSON.stringify(
  {
    name: "Warm Contrast",
    primaryColor: "#1f2937",
    secondaryColor: "#0f172a",
    accentColor: "#ea580c",
    backgroundColor: "#fffaf5",
    foregroundColor: "#111827",
    fontSans: "Inter",
    fontHeading: "Manrope",
    headingScale: 1.12,
    isActive: true,
  },
  null,
  2,
);

const controlForms: readonly ControlFormProps[] = [
  {
    title: "Create/Update Section Item",
    endpoint: "/api/admin/store/sections/items",
    defaultPayload: SECTION_ITEM_DEFAULT_PAYLOAD,
  },
  {
    title: "Create Banner",
    endpoint: "/api/admin/store/banners",
    defaultPayload: BANNER_DEFAULT_PAYLOAD,
  },
  {
    title: "Create Content Page",
    endpoint: "/api/admin/content/pages",
    defaultPayload: CONTENT_DEFAULT_PAYLOAD,
  },
  {
    title: "Create Theme Config",
    endpoint: "/api/admin/theme/configs",
    defaultPayload: THEME_DEFAULT_PAYLOAD,
  },
] as const;

export function normalizeJsonInput(raw: string):
  | {
      ok: true;
      value: string;
    }
  | {
      ok: false;
      error: string;
    } {
  try {
    const parsed = JSON.parse(raw);
    return {
      ok: true,
      value: JSON.stringify(parsed, null, 2),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid JSON payload.",
    };
  }
}

export function prettyResponseBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return body;
  }
}

export function toneForStatus(
  status: number,
): "success" | "warning" | "danger" | "neutral" {
  if (status >= 200 && status < 300) {
    return "success";
  }

  if (status >= 300 && status < 400) {
    return "warning";
  }

  if (status >= 400) {
    return "danger";
  }

  return "neutral";
}

export async function submitControlRequest({
  endpoint,
  method,
  payload,
  fetchImpl = fetch,
  now = () => new Date().toISOString(),
}: {
  endpoint: string;
  method: "POST" | "PATCH";
  payload: string;
  fetchImpl?: typeof fetch;
  now?: () => string;
}): Promise<ApiResult> {
  try {
    const response = await fetchImpl(endpoint, {
      method,
      headers: {
        "content-type": "application/json",
      },
      body: payload,
    });

    return {
      status: response.status,
      ok: response.ok,
      body: prettyResponseBody(await response.text()),
      receivedAt: now(),
    };
  } catch (error) {
    return {
      status: 500,
      ok: false,
      body: error instanceof Error ? error.message : "Unknown error",
      receivedAt: now(),
      networkError: true,
    };
  }
}

function ControlForm({
  title,
  endpoint,
  method = "POST",
  defaultPayload,
}: ControlFormProps) {
  const dispatch = useAppDispatch();
  const [payload, setPayload] = useState(defaultPayload);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const pendingKey = `admin-control:${method}:${endpoint}`;
  const pending = useAppSelector((state) => selectIsPending(state, pendingKey));

  function onFormatJson() {
    const normalized = normalizeJsonInput(payload);
    if (!normalized.ok) {
      setPayloadError(`Invalid JSON: ${normalized.error}`);
      dispatch(
        enqueueNotification({
          tone: "error",
          message: `${title}: invalid JSON payload.`,
        }),
      );
      return;
    }

    setPayload(normalized.value);
    setPayloadError(null);
  }

  function onResetPayload() {
    setPayload(defaultPayload);
    setPayloadError(null);
    setResult(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = normalizeJsonInput(payload);
    if (!normalized.ok) {
      setPayloadError(`Invalid JSON: ${normalized.error}`);
      dispatch(
        enqueueNotification({
          tone: "error",
          message: `${title}: request aborted due to invalid JSON.`,
        }),
      );
      return;
    }

    setPayload(normalized.value);
    setPayloadError(null);
    dispatch(startPending(pendingKey));

    const submission = await submitControlRequest({
      endpoint,
      method,
      payload: normalized.value,
    });
    setResult(submission);

    dispatch(
      enqueueNotification({
        tone: submission.ok ? "success" : "error",
        message: submission.ok
          ? `${title} request succeeded (${submission.status}).`
          : submission.networkError
            ? `${title} request failed before reaching the service.`
            : `${title} request failed (${submission.status}).`,
      }),
    );

    dispatch(stopPending(pendingKey));
  }

  return (
    <Card className="space-y-3 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1 break-all">
            {endpoint}
          </CardDescription>
        </div>
        <Badge tone="info">{method}</Badge>
      </div>

      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <Textarea
          className="min-h-56 font-mono text-xs"
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
        />

        {payloadError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {payloadError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting..." : `${method} request`}
          </Button>
          <Button
            type="button"
            tone="secondary"
            onClick={onFormatJson}
            disabled={pending}
          >
            Format JSON
          </Button>
          <Button
            type="button"
            tone="secondary"
            onClick={onResetPayload}
            disabled={pending}
          >
            Reset payload
          </Button>
        </div>
      </form>

      {result ? (
        <div className="space-y-2 rounded-xl border border-black/15 bg-[#f5f7fb] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone={toneForStatus(result.status)}>
              {result.ok ? "Success" : "Failed"} ({result.status})
            </Badge>
            <span className="text-[11px] text-[#5d6780]">
              {new Date(result.receivedAt).toLocaleString()}
            </span>
          </div>

          <pre className="max-h-64 overflow-auto rounded-lg border border-black/10 bg-white p-3 text-xs text-[#252c39]">
            {result.body || "(empty body)"}
          </pre>
        </div>
      ) : null}
    </Card>
  );
}

export function AdminControlClient() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {controlForms.map((form) => (
        <ControlForm key={form.endpoint} {...form} />
      ))}
    </section>
  );
}
