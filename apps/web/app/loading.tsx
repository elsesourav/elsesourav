import { CardSkeleton } from '@elsesourav/ui';

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-zinc-800/60 rounded-lg mx-auto" />
        <div className="h-4 w-96 bg-zinc-800/40 rounded-lg mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
