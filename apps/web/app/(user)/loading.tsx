import { Skeleton, Card } from '@elsesourav/ui';

export default function UserLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 bg-zinc-800 rounded" />
        <Skeleton className="h-8 w-64 bg-zinc-800 rounded-lg" />
        <Skeleton className="h-4 w-96 bg-zinc-800 rounded" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 space-y-4 border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                <Skeleton className="h-3 w-1/2 bg-zinc-800" />
              </div>
            </div>
            <Skeleton className="h-12 w-full bg-zinc-800 rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}
