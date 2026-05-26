import { PageShell } from "@/components/ui/page";

export default function PostsLoading() {
  return (
    <PageShell width="content" className="gap-10">
      <div className="space-y-2">
        <div className="ui-skeleton h-5 w-24 animate-pulse rounded" />
        <div className="ui-skeleton h-9 w-48 animate-pulse rounded" />
        <div className="ui-skeleton h-5 w-80 animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
          >
            <div className="ui-skeleton aspect-[16/9] w-full animate-pulse" />
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex gap-3">
                <div className="ui-skeleton h-3 w-24 animate-pulse rounded" />
                <div className="ui-skeleton h-3 w-16 animate-pulse rounded" />
              </div>
              <div className="ui-skeleton h-6 w-4/5 animate-pulse rounded" />
              <div className="space-y-1.5">
                <div className="ui-skeleton h-3.5 w-full animate-pulse rounded" />
                <div className="ui-skeleton h-3.5 w-3/4 animate-pulse rounded" />
              </div>
              <div className="mt-auto flex gap-2">
                <div className="ui-skeleton h-5 w-16 animate-pulse rounded-full" />
                <div className="ui-skeleton h-5 w-20 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
