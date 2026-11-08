'use client';

import * as React from 'react';
import { Card, Button } from '@elsesourav/ui';
import { AdminMarkdownEditor } from '@/features/admin/components/AdminMarkdownEditor';
import {
  FileText,
  Shield,
  ExternalLink,
  RotateCcw,
  Info,
} from 'lucide-react';
import { DEFAULT_PRIVACY_POLICY_MD, DEFAULT_TERMS_OF_SERVICE_MD } from '@/lib/legal-defaults';

export interface LegalSettingsTabProps {
  privacyMd: string;
  termsMd: string;
  onPrivacyChange: (value: string) => void;
  onTermsChange: (value: string) => void;
}

export function LegalSettingsTab({
  privacyMd,
  termsMd,
  onPrivacyChange,
  onTermsChange,
}: LegalSettingsTabProps) {
  const [showPrivacyEditor, setShowPrivacyEditor] = React.useState(true);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="p-4 rounded-2xl border-zinc-800 bg-zinc-900/40">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">
              Legal Content Management
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Edit the Privacy Policy and Terms of Service content below using
              Markdown. Changes will appear on the public{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
              >
                /privacy <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
              >
                /terms <ExternalLink className="w-3 h-3" />
              </a>{' '}
              pages after saving.
            </p>
          </div>
        </div>
      </Card>

      {/* Privacy Policy Editor */}
      <Card className="p-5 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">Privacy Policy</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset Privacy Policy to the default template? Your current content will be replaced.'
                  )
                ) {
                  onPrivacyChange(DEFAULT_PRIVACY_POLICY_MD);
                }
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Default
            </Button>
            <button
              type="button"
              onClick={() => setShowPrivacyEditor((v) => !v)}
              className="text-[10px] px-2 py-0.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              {showPrivacyEditor ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        {showPrivacyEditor && (
          <AdminMarkdownEditor
            label="Privacy Policy (Markdown)"
            value={privacyMd}
            onChange={onPrivacyChange}
            rows={16}
            placeholder="Write your Privacy Policy in Markdown..."
          />
        )}
      </Card>

      {/* Terms of Service Editor */}
      <Card className="p-5 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              Terms of Service
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset Terms of Service to the default template? Your current content will be replaced.'
                  )
                ) {
                  onTermsChange(DEFAULT_TERMS_OF_SERVICE_MD);
                }
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Default
            </Button>
          </div>
        </div>
        <AdminMarkdownEditor
          label="Terms of Service (Markdown)"
          value={termsMd}
          onChange={onTermsChange}
          rows={16}
          placeholder="Write your Terms of Service in Markdown..."
        />
      </Card>
    </div>
  );
}
