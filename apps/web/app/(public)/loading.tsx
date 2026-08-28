import { CardSkeleton } from '@elsesourav/ui';

export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-zinc-800/60 rounded-lg" />
      <div className="h-4 w-96 bg-zinc-800/40 rounded-lg mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
