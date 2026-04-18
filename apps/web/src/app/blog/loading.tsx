import { PageShell } from "@/components/ui/page";

export default function BlogLoading() {
  return (
    <PageShell width="content" className="gap-3">
      <div className="ui-skeleton h-7 w-32 animate-pulse rounded" />
      <div className="ui-skeleton h-10 w-64 animate-pulse rounded" />
      <div className="grid gap-3">
        <div className="ui-card h-28 animate-pulse rounded-xl border" />
        <div className="ui-card h-28 animate-pulse rounded-xl border" />
        <div className="ui-card h-28 animate-pulse rounded-xl border" />
      </div>
    </PageShell>
  );
}
