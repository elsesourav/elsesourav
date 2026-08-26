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
    <Card className="p-6 md:p-8 space-y-6 shadow-sm border-border-subtle bg-surface-base rounded-2xl">
      <div className="space-y-1.5 pb-2 border-b border-border-subtle/50">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
          Submit a support request
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-text-secondary">
          Tell us what you need and we&apos;ll route it to the right team for a quick response.
        </CardDescription>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="support-subject" className="text-sm font-semibold text-text-primary">
              Subject
            </label>
            <Input
              id="support-subject"
              name="subject"
              value={formState.subject}
              onChange={(event) => handleChange("subject", event.target.value)}
              placeholder="Short summary of the issue"
              aria-invalid={Boolean(fieldErrors.subject)}
              className="min-h-[44px] bg-bg-base border-border-subtle focus-visible:ring-brand-primary"
            />
            {fieldErrors.subject ? (
              <p className="text-xs font-medium text-status-danger">{fieldErrors.subject}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="support-category" className="text-sm font-semibold text-text-primary">
              Category
            </label>
            <div className="relative">
              <select
                id="support-category"
                name="category"
                value={formState.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="flex h-11 w-full appearance-none rounded-md border border-border-subtle bg-bg-base px-3 py-1 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              >
                <option value="" disabled>Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            {fieldErrors.category ? (
              <p className="text-xs font-medium text-status-danger">{fieldErrors.category}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="support-priority" className="text-sm font-semibold text-text-primary">
              Priority
            </label>
            <div className="relative">
              <select
                id="support-priority"
                name="priority"
                value={formState.priority}
                onChange={(event) =>
                  handleChange("priority", event.target.value as PriorityOption)
                }
                className="flex h-11 w-full appearance-none rounded-md border border-border-subtle bg-bg-base px-3 py-1 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="support-app-id" className="text-sm font-semibold text-text-primary">
              App ID <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <Input
              id="support-app-id"
              name="appId"
              value={formState.appId}
              onChange={(event) => handleChange("appId", event.target.value)}
              placeholder="e.g. app_cuid_123"
              aria-invalid={Boolean(fieldErrors.appId)}
              className="min-h-[44px] bg-bg-base border-border-subtle focus-visible:ring-brand-primary"
            />
            {fieldErrors.appId ? (
              <p className="text-xs font-medium text-status-danger">{fieldErrors.appId}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label
            htmlFor="support-description"
            className="text-sm font-semibold text-text-primary"
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
            placeholder="Tell us what you were trying to do, what happened, and any steps to reproduce."
            rows={5}
            aria-invalid={Boolean(fieldErrors.description)}
            className="bg-bg-base border-border-subtle focus-visible:ring-brand-primary resize-y min-h-[120px]"
          />
          {fieldErrors.description ? (
            <p className="text-xs font-medium text-status-danger">{fieldErrors.description}</p>
          ) : null}
        </div>

        {status ? (
          <div
            className={`p-3 rounded-md border ${
              status.tone === "success"
                ? "bg-status-success/10 border-status-success/20 text-status-success"
                : "bg-status-danger/10 border-status-danger/20 text-status-danger"
            }`}
          >
            <p className="text-sm font-medium flex items-center gap-2">
              {status.tone === "success" ? (
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
              {status.message}
            </p>
          </div>
        ) : null}

        <div className="pt-2 flex justify-end">
          <Button 
            type="submit" 
            loading={isSubmitting} 
            disabled={!canSubmit}
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            Submit request
          </Button>
        </div>
      </form>
    </Card>
  );
}
