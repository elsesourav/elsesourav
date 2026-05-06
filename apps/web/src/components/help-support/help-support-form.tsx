"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ApiFailure, ApiSuccess } from "@elsesourav/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

type PriorityOption = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type SupportFormState = {
  subject: string;
  description: string;
  priority: PriorityOption;
  category: string;
  appId: string;
};

type SupportFormStatus = {
  tone: "success" | "error";
  message: string;
} | null;

const priorityOptions: Array<{ value: PriorityOption; label: string }> = [
  { value: "LOW", label: "Low - General question" },
  { value: "MEDIUM", label: "Medium - Needs guidance" },
  { value: "HIGH", label: "High - Workflow blocked" },
  { value: "URGENT", label: "Urgent - Production down" },
];

const categoryOptions = [
  "Account",
  "Billing",
  "Apps",
  "Security",
  "Integrations",
  "Other",
] as const;

const supportFormSchema = z.object({
  subject: z.string().trim().min(4, "Add a short subject.").max(200),
  description: z
    .string()
    .trim()
    .min(10, "Add more detail about the issue.")
    .max(12000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(2).max(80).optional(),
  ),
  appId: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().cuid().optional(),
  ),
});

function isApiSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
  return (
    !!payload &&
    typeof payload === "object" &&
    (payload as ApiSuccess<T>).ok === true
  );
}

function getApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const asFailure = payload as ApiFailure;
  if (asFailure.ok === false && asFailure.error?.message) {
    return asFailure.error.message;
  }

  return null;
}

export function HelpSupportForm() {
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<SupportFormState>({
    subject: "",
    description: "",
    priority: "MEDIUM",
    category: "",
    appId: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SupportFormStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      formState.subject.trim().length > 0 &&
      formState.description.trim().length > 0
    );
  }, [formState.subject, formState.description]);

  const handleChange = (name: keyof SupportFormState, value: string) => {
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const parsed = supportFormSchema.safeParse(formState);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      const { fieldErrors: errors } = parsed.error.flatten();

      Object.entries(errors).forEach(([key, value]) => {
        if (value && value.length > 0) {
          nextErrors[key] = value[0] ?? "Invalid value";
        }
      });

      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        subject: parsed.data.subject,
        description: parsed.data.description,
        priority: parsed.data.priority,
        category: parsed.data.category,
        appId: parsed.data.appId,
        channel: "WEB" as const,
        sourceUrl: window.location.href,
      };

      const response = await fetch("/api/user/support/tickets", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as unknown;

      if (!response.ok || !isApiSuccess<{ ticket: { id: string } }>(body)) {
        const message =
          getApiErrorMessage(body) ??
          "We could not submit the request. Please try again.";
        setStatus({ tone: "error", message });
        setIsSubmitting(false);
        return;
      }

      setStatus({
        tone: "success",
        message: "Support request submitted. We will be in touch shortly.",
      });
      setFormState({
        subject: "",
        description: "",
        priority: "MEDIUM",
        category: "",
        appId: "",
      });
    } catch {
      setStatus({
        tone: "error",
        message: "We could not submit the request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const priority = searchParams.get("priority");
    if (
      priority === "LOW" ||
      priority === "MEDIUM" ||
      priority === "HIGH" ||
      priority === "URGENT"
    ) {
      setFormState((previous) => ({ ...previous, priority }));
    }
  }, [searchParams]);

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>Submit a support request</CardTitle>
        <CardDescription>
          Tell us what you need and we will route it to the right team.
        </CardDescription>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="support-subject" className="text-xs font-semibold">
              Subject
            </label>
            <Input
              id="support-subject"
              name="subject"
              value={formState.subject}
              onChange={(event) => handleChange("subject", event.target.value)}
              placeholder="Short summary of the issue"
              aria-invalid={Boolean(fieldErrors.subject)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  minHeight: 44,
                },
              }}
            />
            {fieldErrors.subject ? (
              <p className="text-xs text-rose-600">{fieldErrors.subject}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="support-category" className="text-xs font-semibold">
              Category
            </label>
            <select
              id="support-category"
              name="category"
              value={formState.category}
              onChange={(event) => handleChange("category", event.target.value)}
              className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select a category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.category ? (
              <p className="text-xs text-rose-600">{fieldErrors.category}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="support-priority" className="text-xs font-semibold">
              Priority
            </label>
            <select
              id="support-priority"
              name="priority"
              value={formState.priority}
              onChange={(event) =>
                handleChange("priority", event.target.value as PriorityOption)
              }
              className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="support-app-id" className="text-xs font-semibold">
              App ID (optional)
            </label>
            <Input
              id="support-app-id"
              name="appId"
              value={formState.appId}
              onChange={(event) => handleChange("appId", event.target.value)}
              placeholder="app_cuid"
              aria-invalid={Boolean(fieldErrors.appId)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  minHeight: 44,
                },
              }}
            />
            {fieldErrors.appId ? (
              <p className="text-xs text-rose-600">{fieldErrors.appId}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="support-description"
            className="text-xs font-semibold"
          >
            Description
          </label>
          <Textarea
            id="support-description"
            name="description"
            value={formState.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            placeholder="Tell us what you were trying to do and what happened."
            rows={6}
            aria-invalid={Boolean(fieldErrors.description)}
          />
          {fieldErrors.description ? (
            <p className="text-xs text-rose-600">{fieldErrors.description}</p>
          ) : null}
        </div>

        {status ? (
          <p
            className={
              status.tone === "success"
                ? "text-xs text-emerald-600"
                : "text-xs text-rose-600"
            }
          >
            {status.message}
          </p>
        ) : null}

        <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
          Submit request
        </Button>
      </form>
    </Card>
  );
}
