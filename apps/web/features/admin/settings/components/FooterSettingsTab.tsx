'use client';

import * as React from 'react';
import type { SiteFooterLink } from '@elsesourav/types';
import { Card, Button, IconButton } from '@elsesourav/ui';
import { Dropdown, FloatingLabelInput } from '@elsesourav/ui/interior';
import { Plus, Trash2 } from 'lucide-react';

const BOOLEAN_ENABLED_OPTIONS = [
  { value: 'true', label: 'Enabled (Visible)' },
  { value: 'false', label: 'Disabled (Hidden)' },
];

export interface FooterSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  footerLinks: SiteFooterLink[];
  onFooterLinksChange: (updated: SiteFooterLink[]) => void;
}

export function FooterSettingsTab({
  settings,
  onChange,
  footerLinks,
  onFooterLinksChange,
}: FooterSettingsTabProps) {
  const [isAddingFooterLink, setIsAddingFooterLink] = React.useState(false);
  const [newFooterLink, setNewFooterLink] = React.useState<Partial<SiteFooterLink>>({
    label: '',
    url: '',
    isExternal: false,
    priority: 0,
    isActive: true,
  });

  const handleAddFooterLink = () => {
    if (!newFooterLink.label?.trim() || !newFooterLink.url?.trim()) return;
    const nextPriority =
      footerLinks.length > 0 ? Math.max(...footerLinks.map((f) => f.priority)) + 1 : 0;
    const item: SiteFooterLink = {
      id: `footer-link-${Date.now()}`,
      label: newFooterLink.label.trim(),
      url: newFooterLink.url.trim(),
      isExternal: newFooterLink.isExternal ?? false,
      priority: typeof newFooterLink.priority === 'number' ? newFooterLink.priority : nextPriority,
      isActive: newFooterLink.isActive ?? true,
    };
    onFooterLinksChange([...footerLinks, item]);
    setIsAddingFooterLink(false);
    setNewFooterLink({
      label: '',
      url: '',
      isExternal: false,
      priority: nextPriority + 1,
      isActive: true,
    });
  };

  const handleRemoveFooterLink = (idToRemove: string) => {
    onFooterLinksChange(footerLinks.filter((f) => f.id !== idToRemove));
  };

  return (
    <Card className="p-4 sm:p-6 space-y-5 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Footer Copyright Notice"
          value={settings['footer_copyright'] || ''}
          onChange={(val) => onChange('footer_copyright', val)}
          placeholder="© 2026 ElseSourav. All rights reserved."
        />

        <FloatingLabelInput
          label="Footer Mission Note"
          value={settings['footer_text'] || ''}
          onChange={(val) => onChange('footer_text', val)}
          placeholder="Software, Tools & Ideas — Built with purpose."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
        <FloatingLabelInput
          label="Operational Status Text"
          value={settings['footer_status_text'] || ''}
          onChange={(val) => onChange('footer_status_text', val)}
          placeholder="● All Services Online"
        />

        <div>
          <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Show Socials in Footer
          </label>
          <Dropdown
            items={BOOLEAN_ENABLED_OPTIONS}
            value={settings['footer_show_socials'] !== 'false' ? 'true' : 'false'}
            onChange={(val) => onChange('footer_show_socials', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Back to Top Button
          </label>
          <Dropdown
            items={BOOLEAN_ENABLED_OPTIONS}
            value={settings['footer_show_back_to_top'] !== 'false' ? 'true' : 'false'}
            onChange={(val) => onChange('footer_show_back_to_top', val)}
            className="w-full"
          />
        </div>
      </div>

      {/* Custom Footer Links Management */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Custom Footer Navigation
            </h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Add custom navigation or external links to the footer bottom bar.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingFooterLink(true)}
            className="gap-1 text-xs h-7 px-2.5 rounded-lg shrink-0 w-fit border-zinc-200 dark:border-zinc-800"
          >
            <Plus className="w-3 h-3" /> Add Link
          </Button>
        </div>

        {isAddingFooterLink && (
          <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <FloatingLabelInput
                label="Link Label"
                value={newFooterLink.label || ''}
                onChange={(val) =>
                  setNewFooterLink((prev) => ({ ...prev, label: val }))
                }
                placeholder="e.g. Changelog"
              />
              <FloatingLabelInput
                label="Target URL"
                value={newFooterLink.url || ''}
                onChange={(val) => setNewFooterLink((prev) => ({ ...prev, url: val }))}
                placeholder="/changelog or https://..."
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingFooterLink(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddFooterLink}
                className="text-xs h-8"
              >
                Save
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {footerLinks.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3 text-center">
              Using default footer navigation links.
            </p>
          ) : (
            footerLinks.map((fl) => (
              <div
                key={fl.id}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{fl.label}</span>
                  <span className="text-zinc-500 font-mono text-[11px] truncate">{fl.url}</span>
                </div>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemoveFooterLink(fl.id)}
                  aria-label={`Remove ${fl.label} footer link`}
                  icon={<Trash2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400" />}
                  className="rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
