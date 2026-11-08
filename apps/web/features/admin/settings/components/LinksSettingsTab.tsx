'use client';

import * as React from 'react';
import type { SiteLinkItem, SiteLinkPlatform } from '@elsesourav/types';
import { Card, Button, IconButton, Input, Badge } from '@elsesourav/ui';
import { Dropdown, FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterXIcon,
  YoutubeIcon,
} from '@/components/icons/SocialIcons';
import {
  Globe,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Send,
} from 'lucide-react';

export const PLATFORM_OPTIONS: Array<{
  value: SiteLinkPlatform;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultLabel: string;
}> = [
  { value: 'github', label: 'GitHub', icon: GithubIcon, defaultLabel: 'GitHub' },
  { value: 'twitter', label: 'Twitter / X', icon: TwitterXIcon, defaultLabel: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, defaultLabel: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube', icon: YoutubeIcon, defaultLabel: 'YouTube' },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon, defaultLabel: 'Instagram' },
  { value: 'discord', label: 'Discord', icon: Globe, defaultLabel: 'Discord Community' },
  { value: 'telegram', label: 'Telegram', icon: Send, defaultLabel: 'Telegram Channel' },
  { value: 'bluesky', label: 'Bluesky', icon: Globe, defaultLabel: 'Bluesky' },
  { value: 'website', label: 'Website / Blog', icon: Globe, defaultLabel: 'Personal Website' },
  { value: 'other', label: 'Custom Link', icon: ExternalLink, defaultLabel: 'Custom Link' },
];

const PLATFORM_DROPDOWN_ITEMS = PLATFORM_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export interface LinksSettingsTabProps {
  links: SiteLinkItem[];
  onLinksChange: (updated: SiteLinkItem[]) => void;
}

export function LinksSettingsTab({ links, onLinksChange }: LinksSettingsTabProps) {
  const [isAddingLink, setIsAddingLink] = React.useState(false);
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
  const [editLinkForm, setEditLinkForm] = React.useState<Partial<SiteLinkItem>>({});
  const [newLink, setNewLink] = React.useState<Partial<SiteLinkItem>>({
    platform: 'github',
    label: 'GitHub',
    url: '',
    priority: 0,
    isActive: true,
  });

  const handleAddLink = () => {
    if (!newLink.label?.trim() || !newLink.url?.trim()) return;
    const nextPriority = links.length > 0 ? Math.max(...links.map((l) => l.priority)) + 1 : 0;
    const item: SiteLinkItem = {
      id: `link-${Date.now()}`,
      label: newLink.label.trim(),
      url: newLink.url.trim(),
      platform: (newLink.platform as SiteLinkPlatform) || 'website',
      priority: typeof newLink.priority === 'number' ? newLink.priority : nextPriority,
      isActive: newLink.isActive ?? true,
    };
    onLinksChange([...links, item]);
    setIsAddingLink(false);
    setNewLink({
      platform: 'github',
      label: 'GitHub',
      url: '',
      priority: nextPriority + 1,
      isActive: true,
    });
  };

  const handleRemoveLink = (id: string) => {
    onLinksChange(links.filter((l) => l.id !== id));
  };

  const handleToggleActive = (id: string) => {
    onLinksChange(links.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l)));
  };

  const handleSaveEdit = (id: string) => {
    onLinksChange(
      links.map((l) => (l.id === id ? ({ ...l, ...editLinkForm } as SiteLinkItem) : l))
    );
    setEditingLinkId(null);
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white">Platform & Social Channels</h2>
          <p className="text-[11px] text-zinc-400">
            Manage external profile links with priority ordering.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsAddingLink(true)}
          className="gap-1.5 text-xs rounded-xl h-8 px-3 shrink-0 w-fit"
        >
          <Plus className="w-3.5 h-3.5" /> Add Channel
        </Button>
      </div>

      {/* Add Link Form */}
      {isAddingLink && (
        <div className="p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Platform
              </label>
              <Dropdown
                items={PLATFORM_DROPDOWN_ITEMS}
                value={newLink.platform || 'github'}
                onChange={(val) => {
                  const plat = val as SiteLinkPlatform;
                  const opt = PLATFORM_OPTIONS.find((o) => o.value === plat);
                  setNewLink((prev) => ({
                    ...prev,
                    platform: plat,
                    label: prev.label || opt?.defaultLabel || '',
                  }));
                }}
                className="w-full"
              />
            </div>

            <FloatingLabelInput
              label="Display Label"
              value={newLink.label || ''}
              onChange={(val) => setNewLink((prev) => ({ ...prev, label: val }))}
              placeholder="e.g. GitHub"
            />

            <FloatingLabelInput
              label="Target URL"
              type="url"
              value={newLink.url || ''}
              onChange={(val) => setNewLink((prev) => ({ ...prev, url: val }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingLink(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddLink}
              className="text-xs h-8"
            >
              Save Link
            </Button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-2">
        {links.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            No platform links configured.
          </p>
        ) : (
          links.map((link) => {
            const isEditing = editingLinkId === link.id;
            const platformOpt = PLATFORM_OPTIONS.find((o) => o.value === link.platform);
            const IconComponent = platformOpt?.icon || Globe;

            if (isEditing) {
              return (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl border border-indigo-500/40 bg-zinc-900/80 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      value={editLinkForm.label || ''}
                      onChange={(e) =>
                        setEditLinkForm((prev) => ({ ...prev, label: e.target.value }))
                      }
                      placeholder="Label"
                      className="text-xs h-8 bg-zinc-950/60"
                    />
                    <Input
                      value={editLinkForm.url || ''}
                      onChange={(e) =>
                        setEditLinkForm((prev) => ({ ...prev, url: e.target.value }))
                      }
                      placeholder="URL"
                      className="text-xs h-8 bg-zinc-950/60"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={String(editLinkForm.priority ?? link.priority)}
                        onChange={(e) =>
                          setEditLinkForm((prev) => ({
                            ...prev,
                            priority: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-16 h-8 text-xs bg-zinc-950/60 text-center"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => handleSaveEdit(link.id)}
                        className="text-xs h-8 px-3"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLinkId(null)}
                        className="text-xs h-8 px-2 text-zinc-400"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={link.id}
                className="p-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 w-5 text-center shrink-0">
                    #{link.priority}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-zinc-200 block truncate">
                      {link.label}
                    </span>
                    <span className="text-[11px] text-zinc-500 block truncate font-mono">
                      {link.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(link.id)}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  >
                    <Badge
                      variant={link.isActive ? 'success' : 'outline'}
                      className={`text-[10px] px-2 py-0.5 font-mono ${
                        link.isActive ? '' : 'border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {link.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </button>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setEditingLinkId(link.id);
                      setEditLinkForm({ ...link });
                    }}
                    aria-label={`Edit ${link.label}`}
                    icon={<Edit2 className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200" />}
                    className="rounded-lg hover:bg-zinc-800"
                  />
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveLink(link.id)}
                    aria-label={`Remove ${link.label}`}
                    icon={<Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-400" />}
                    className="rounded-lg hover:bg-rose-950/40"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
