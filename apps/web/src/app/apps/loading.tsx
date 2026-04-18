import { PageShell } from "@/components/ui/page";

export default function AppsLoading() {
  return (
    <PageShell width="wide" className="gap-3">
      <div className="ui-skeleton h-7 w-32 animate-pulse rounded" />
      <div className="ui-skeleton h-10 w-64 animate-pulse rounded" />
      <div className="ui-card h-16 animate-pulse rounded-xl border" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="ui-card h-36 animate-pulse rounded-xl border" />
        <div className="ui-card h-36 animate-pulse rounded-xl border" />
        <div className="ui-card h-36 animate-pulse rounded-xl border" />
      </div>
    </PageShell>
  );
}
