'use client';

import * as React from 'react';
import { Card } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { UserCheck } from 'lucide-react';

export interface AdminAppAttributionSectionProps {
  authorName: string;
  setAuthorName: (val: string) => void;
  authorRole: string;
  setAuthorRole: (val: string) => void;
  authorImageUrl: string;
  setAuthorImageUrl: (val: string) => void;
  authorUrl: string;
  setAuthorUrl: (val: string) => void;
}

export function AdminAppAttributionSection({
  authorName,
  setAuthorName,
  authorRole,
  setAuthorRole,
  authorImageUrl,
  setAuthorImageUrl,
  authorUrl,
  setAuthorUrl,
}: AdminAppAttributionSectionProps) {
  return (
    <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
        <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
        <span>Author & Attribution (Optional)</span>
      </div>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Leave blank to omit attribution and default to the studio creator. If set, this specific contributor will be shown in app specifications.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <FloatingLabelInput
          label="Contributor / Author Name"
          type="text"
          value={authorName}
          onChange={(val) => setAuthorName(val)}
          placeholder="e.g. John Smith"
          maxLength={100}
        />
        <FloatingLabelInput
          label="Contributor Role / Title"
          type="text"
          value={authorRole}
          onChange={(val) => setAuthorRole(val)}
          placeholder="e.g. Collaborator, Core Contributor"
          maxLength={100}
        />
        <ImageInputWithLibrary
          label="Contributor Avatar Image"
          value={authorImageUrl}
          onChange={setAuthorImageUrl}
          folder="users"
          defaultCategory="users"
          previewShape="square"
          placeholder="Avatar URL or select from library"
        />
        <FloatingLabelInput
          label="Contributor Profile / Web URL"
          type="url"
          value={authorUrl}
          onChange={(val) => setAuthorUrl(val)}
          placeholder="https://github.com/username"
          maxLength={200}
        />
      </div>
    </Card>
  );
}
