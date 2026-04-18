"use client";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="ui-text-primary mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-16 sm:px-10">
      <p className="ui-text-muted text-xs font-semibold uppercase tracking-[0.15em]">
        Unexpected Error
      </p>
      <h1 className="ui-text-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Something went wrong while loading this page.
      </h1>
      <p className="ui-text-muted text-sm">
        Please retry. If this continues, contact support with the error details.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset} className="rounded-lg">
          Try again
        </Button>
      </div>
      {process.env.NODE_ENV !== "production" ? (
        <pre className="ui-card ui-text-muted overflow-auto rounded-xl border p-3 text-xs">
          {error.message}
        </pre>
      ) : null}
    </main>
  );
}
