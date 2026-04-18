"use client";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page";

export default function AppsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell width="wide" className="gap-4">
      <h1 className="ui-text-heading text-2xl font-semibold">
        Apps catalog unavailable
      </h1>
      <p className="ui-text-muted text-sm">
        We could not load app listings right now. Please try again.
      </p>
      <Button type="button" onClick={reset} className="w-fit rounded-full">
        Retry
      </Button>
      <p className="ui-text-muted text-xs">{error.message}</p>
    </PageShell>
  );
}
