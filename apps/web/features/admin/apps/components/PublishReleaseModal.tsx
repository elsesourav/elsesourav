'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { Send, Loader2 } from 'lucide-react';

interface PublishReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (versionData: {
    version: string;
    changelog: string;
    downloadUrl?: string;
  }) => Promise<void>;
  isPublishing: boolean;
}

export function PublishReleaseModal({
  isOpen,
  onClose,
  onPublish,
  isPublishing,
}: PublishReleaseModalProps) {
  const [releaseVersion, setReleaseVersion] = React.useState('1.0.0');
  const [releaseChangelog, setReleaseChangelog] = React.useState('Initial production release.');
  const [releaseDownloadUrl, setReleaseDownloadUrl] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPublish({
      version: releaseVersion,
      changelog: releaseChangelog,
      downloadUrl: releaseDownloadUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-indigo-500/40 bg-zinc-900 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Publish Application Release</h3>
            <p className="text-xs text-zinc-400">Creates an immutable version release entry.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <FloatingLabelInput
            label="Release Version"
            type="text"
            value={releaseVersion}
            onChange={(val) => setReleaseVersion(val)}
            placeholder="e.g. 1.0.0"
            required
          />

          <div className="space-y-1.5">
            <label className="block font-semibold text-zinc-300">
              Changelog Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={releaseChangelog}
              onChange={(e) => setReleaseChangelog(e.target.value)}
              placeholder="What is new in this release version..."
              required
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <FloatingLabelInput
            label="Download Asset URL (optional)"
            type="url"
            value={releaseDownloadUrl}
            onChange={(val) => setReleaseDownloadUrl(val)}
            placeholder="https://github.com/.../release.zip"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPublishing}
              onClick={onClose}
              className="text-xs text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPublishing}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Release</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
