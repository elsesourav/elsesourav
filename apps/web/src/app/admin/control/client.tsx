"use client";

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
  body: string;
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

function ControlForm({
  title,
  endpoint,
  method = "POST",
  defaultPayload,
}: ControlFormProps) {
  const dispatch = useAppDispatch();
  const [payload, setPayload] = useState(defaultPayload);
  const [result, setResult] = useState<ApiResult | null>(null);
  const pendingKey = `admin-control:${method}:${endpoint}`;
  const pending = useAppSelector((state) => selectIsPending(state, pendingKey));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(startPending(pendingKey));

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: payload,
      });

      const body = await response.text();
      setResult({
        status: response.status,
        body,
      });

      dispatch(
        enqueueNotification({
          tone: response.ok ? "success" : "error",
          message: response.ok
            ? `${title} request succeeded (${response.status}).`
            : `${title} request failed (${response.status}).`,
        }),
      );
    } catch (error) {
      setResult({
        status: 500,
        body: error instanceof Error ? error.message : "Unknown error",
      });

      dispatch(
        enqueueNotification({
          tone: "error",
          message: `${title} request failed before reaching the service.`,
        }),
      );
    } finally {
      dispatch(stopPending(pendingKey));
    }
  }

  return (
    <article className="rounded-2xl border border-black/15 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
      <h2 className="text-base font-semibold text-[#131924]">{title}</h2>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <textarea
          className="min-h-44 w-full rounded-xl border border-black/20 bg-white px-3 py-2 font-mono text-xs text-[#14171f]"
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-full bg-[#14171f] px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "Submitting..." : `${method} ${endpoint}`}
        </button>
      </form>
      {result ? (
        <pre className="mt-3 overflow-auto rounded-xl border border-black/20 bg-[#f5f7fb] p-3 text-xs text-[#252c39]">
          {`status: ${result.status}\n${result.body}`}
        </pre>
      ) : null}
    </article>
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
