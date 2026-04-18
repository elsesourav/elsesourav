"use client";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page";

export default function HelpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell width="content" className="gap-4">
      <h1 className="ui-text-heading text-2xl font-semibold">
        Help center unavailable
      </h1>
      <p className="ui-text-muted text-sm">
        Help content is temporarily unavailable. Please retry in a moment.
      </p>
      <Button type="button" onClick={reset} className="w-fit rounded-full">
        Try again
      </Button>
      <p className="ui-text-muted text-xs">{error.message}</p>
    </PageShell>
  );
}
