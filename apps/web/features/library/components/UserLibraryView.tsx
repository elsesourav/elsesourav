'use client';

import * as React from 'react';
import type { LibraryItem } from '@elsesourav/types';
import { LibraryAppCard } from './LibraryAppCard';
import { LibraryEmptyState } from './LibraryEmptyState';
import { Badge } from '@elsesourav/ui';

interface UserLibraryViewProps {
  initialItems: readonly LibraryItem[];
  totalCount: number;
}

export function UserLibraryView({ initialItems, totalCount }: UserLibraryViewProps) {
  const [items, setItems] = React.useState<readonly LibraryItem[]>(initialItems);

  const handleRemoveItem = (appId: string) => {
    setItems((prev) => prev.filter((item) => item.app.id !== appId && item.appId !== appId));
  };

  if (items.length === 0) {
    return <LibraryEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          Showing <span className="text-zinc-200 font-medium">{items.length}</span> saved applications
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <LibraryAppCard key={item.id} item={item} onRemove={handleRemoveItem} />
        ))}
      </div>
    </div>
  );
}
