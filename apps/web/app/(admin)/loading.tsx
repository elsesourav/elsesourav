import { Skeleton } from '@elsesourav/ui';

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl mt-8" />
    </div>
  );
}
