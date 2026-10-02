'use client';

import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterXIcon,
  YoutubeIcon,
} from '@/components/icons/SocialIcons';
import { AdminMarkdownEditor } from '@/features/admin/components/AdminMarkdownEditor';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import type {
  SiteContactItem,
  SiteContactMethodType,
  SiteFooterLink,
  SiteLinkItem,
  SiteLinkPlatform,
} from '@elsesourav/types';
import { Alert, Button, Card, FormField, Input, Textarea } from '@elsesourav/ui';
import { Dropdown, FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  parseContactMethods,
  parseFooterLinks,
  parseSiteLinks,
  parseStringList,
} from '@elsesourav/validation';
import {
  BookOpen,
  Calendar,
  Edit2,
  ExternalLink,
  Globe,
  Layout,
  LifeBuoy,
  Mail,
  PanelBottom,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Send,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import * as React from 'react';
import { updateSiteSettingsAction } from '../actions/admin-settings-actions';

export interface AdminSettingsFormProps {
  initialSettings: Record<string, string>;
}

const PLATFORM_OPTIONS: Array<{
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

const CONTACT_TYPE_OPTIONS: Array<{
  value: SiteContactMethodType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'email', label: 'Email Address', icon: Mail },
  { value: 'support_desk', label: 'Support Desk / Portal', icon: LifeBuoy },
  { value: 'telegram', label: 'Telegram Direct', icon: Send },
  { value: 'discord', label: 'Discord DM / Server', icon: Globe },
  { value: 'calendar', label: 'Booking / Calendar', icon: Calendar },
  { value: 'phone', label: 'Phone / WhatsApp', icon: Phone },
  { value: 'other', label: 'Other Contact', icon: ExternalLink },
];

const BOOLEAN_ENABLED_OPTIONS = [
  { value: 'true', label: 'Enabled (Visible)' },
  { value: 'false', label: 'Disabled (Hidden)' },
];

const PLATFORM_DROPDOWN_ITEMS = PLATFORM_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

const CONTACT_TYPE_DROPDOWN_ITEMS = CONTACT_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

type SettingsTab =
  'identity' | 'footer' | 'homepage' | 'profile' | 'creator_narrative' | 'links' | 'contact';

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('identity');
  const [settings, setSettings] = React.useState<Record<string, string>>(initialSettings);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Platform Links State
  const [links, setLinks] = React.useState<SiteLinkItem[]>(() => {
    return parseSiteLinks(initialSettings['social_links_json'], initialSettings);
  });
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
  const [editLinkForm, setEditLinkForm] = React.useState<Partial<SiteLinkItem>>({});
  const [isAddingLink, setIsAddingLink] = React.useState(false);
  const [newLink, setNewLink] = React.useState<Partial<SiteLinkItem>>({
    platform: 'github',
    label: 'GitHub',
    url: '',
    priority: 0,
    isActive: true,
  });

  // Contact Methods State
  const [contacts, setContacts] = React.useState<SiteContactItem[]>(() => {
    return parseContactMethods(initialSettings['contact_methods_json'], initialSettings);
  });
  const [isAddingContact, setIsAddingContact] = React.useState(false);
  const [newContact, setNewContact] = React.useState<Partial<SiteContactItem>>({
    type: 'email',
    label: 'Primary Inquiries',
    value: '',
    description: '',
    priority: 0,
    isActive: true,
  });

  // Custom Footer Links State
  const [footerLinks, setFooterLinks] = React.useState<SiteFooterLink[]>(() => {
    return parseFooterLinks(initialSettings['footer_links_json']);
  });
  const [isAddingFooterLink, setIsAddingFooterLink] = React.useState(false);
  const [newFooterLink, setNewFooterLink] = React.useState<Partial<SiteFooterLink>>({
    label: '',
    url: '',
    isExternal: false,
    priority: 0,
    isActive: true,
  });

  // Principles Tag State
  const [principles, setPrinciples] = React.useState<string[]>(() => {
    return parseStringList(initialSettings['creator_principles_json'], [
      'Accessibility by default',
      'Deterministic builds',
      'Zero vanity metrics',
    ]);
  });
  const [newPrincipleInput, setNewPrincipleInput] = React.useState('');

  // Focus Tags State
  const [focusAreas, setFocusAreas] = React.useState<string[]>(() => {
    return parseStringList(initialSettings['creator_focus_json'], [
      'Developer Tools',
      'Systems Design',
      'Web Performance',
    ]);
  });
  const [newFocusInput, setNewFocusInput] = React.useState('');

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Principles Handlers
  const handleAddPrinciple = () => {
    if (!newPrincipleInput.trim()) return;
    const updated = [...principles, newPrincipleInput.trim()];
    setPrinciples(updated);
    handleChange('creator_principles_json', JSON.stringify(updated));
    setNewPrincipleInput('');
  };

  const handleRemovePrinciple = (indexToRemove: number) => {
    const updated = principles.filter((_, idx) => idx !== indexToRemove);
    setPrinciples(updated);
    handleChange('creator_principles_json', JSON.stringify(updated));
  };

  // Focus Handlers
  const handleAddFocus = () => {
    if (!newFocusInput.trim()) return;
    const updated = [...focusAreas, newFocusInput.trim()];
    setFocusAreas(updated);
    handleChange('creator_focus_json', JSON.stringify(updated));
    setNewFocusInput('');
  };

  const handleRemoveFocus = (indexToRemove: number) => {
    const updated = focusAreas.filter((_, idx) => idx !== indexToRemove);
    setFocusAreas(updated);
    handleChange('creator_focus_json', JSON.stringify(updated));
  };

  // Synchronize links back into settings
  const syncLinksToSettings = (updatedLinks: SiteLinkItem[]) => {
    const sorted = [...updatedLinks].sort((a, b) => a.priority - b.priority);
    setLinks(sorted);
    setSettings((prev) => ({
      ...prev,
      social_links_json: JSON.stringify(sorted),
      github_url:
        sorted.find((l) => l.platform === 'github' && l.isActive)?.url || prev['github_url'] || '',
      twitter_url:
        sorted.find((l) => l.platform === 'twitter' && l.isActive)?.url ||
        prev['twitter_url'] ||
        '',
    }));
  };

  // Synchronize contacts back into settings
  const syncContactsToSettings = (updatedContacts: SiteContactItem[]) => {
    const sorted = [...updatedContacts].sort((a, b) => a.priority - b.priority);
    setContacts(sorted);
    setSettings((prev) => ({
      ...prev,
      contact_methods_json: JSON.stringify(sorted),
      contact_email:
        sorted.find((c) => c.type === 'email' && c.isActive)?.value || prev['contact_email'] || '',
      support_url:
        sorted.find((c) => c.type === 'support_desk' && c.isActive)?.value ||
        prev['support_url'] ||
        '',
    }));
  };

  // Synchronize footer links
  const syncFooterLinksToSettings = (updatedFooterLinks: SiteFooterLink[]) => {
    const sorted = [...updatedFooterLinks].sort((a, b) => a.priority - b.priority);
    setFooterLinks(sorted);
    setSettings((prev) => ({
      ...prev,
      footer_links_json: JSON.stringify(sorted),
    }));
  };

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
    syncLinksToSettings([...links, item]);
    setIsAddingLink(false);
    setNewLink({
      platform: 'website',
      label: '',
      url: '',
      priority: nextPriority + 1,
      isActive: true,
    });
  };

  const handleAddContact = () => {
    if (!newContact.label?.trim() || !newContact.value?.trim()) return;
    const nextPriority = contacts.length > 0 ? Math.max(...contacts.map((c) => c.priority)) + 1 : 0;
    const item: SiteContactItem = {
      id: `contact-${Date.now()}`,
      label: newContact.label.trim(),
      value: newContact.value.trim(),
      type: (newContact.type as SiteContactMethodType) || 'email',
      description: newContact.description?.trim() || undefined,
      priority: typeof newContact.priority === 'number' ? newContact.priority : nextPriority,
      isActive: newContact.isActive ?? true,
    };
    syncContactsToSettings([...contacts, item]);
    setIsAddingContact(false);
    setNewContact({
      type: 'email',
      label: '',
      value: '',
      description: '',
      priority: nextPriority + 1,
      isActive: true,
    });
  };

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
    syncFooterLinksToSettings([...footerLinks, item]);
    setIsAddingFooterLink(false);
    setNewFooterLink({
      label: '',
      url: '',
      isExternal: false,
      priority: nextPriority + 1,
      isActive: true,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload: Record<string, string> = {
        ...settings,
        social_links_json: JSON.stringify(links),
        contact_methods_json: JSON.stringify(contacts),
        footer_links_json: JSON.stringify(footerLinks),
        creator_principles_json: JSON.stringify(principles),
        creator_focus_json: JSON.stringify(focusAreas),
      };

      const res = await updateSiteSettingsAction(payload);
      if (res.success) {
        setMessage({ type: 'success', text: 'All settings saved successfully.' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save settings.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Portal Configuration & Customization
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure site branding, public footer, creator profile, public narrative, links, and
            contact channels.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 text-xs h-9 px-4 rounded-xl shadow-lg shadow-indigo-600/20"
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'identity'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Site & Brand</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'footer'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <PanelBottom className="w-3.5 h-3.5 text-indigo-400" />
          <span>Footer Options</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'profile'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span>Creator Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('creator_narrative')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'creator_narrative'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>About & Narrative</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'homepage'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-indigo-400" />
          <span>Homepage Copy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'links'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Links ({links.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'contact'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Contact ({contacts.length})</span>
        </button>
      </div>

      {/* Tab 1: Site Identity & Brand */}
      {activeTab === 'identity' && (
        <Card className="p-5 sm:p-6 space-y-5 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Site Name"
              required
              value={settings['site_name'] || ''}
              onChange={(val) => handleChange('site_name', val)}
              placeholder="ElseSourav"
            />

            <FloatingLabelInput
              label="Site Tagline"
              required
              value={settings['site_tagline'] || ''}
              onChange={(val) => handleChange('site_tagline', val)}
              placeholder="Software, Tools & Engineering Notes"
            />
          </div>

          <FormField label="Meta Description">
            <Textarea
              rows={2}
              value={settings['site_description'] || ''}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="Portfolio, applications, and technical deep-dives..."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageInputWithLibrary
              label="Site Brand Logo / Icon"
              value={settings['site_logo_url'] || ''}
              onChange={(val) => handleChange('site_logo_url', val)}
              folder="general"
              defaultCategory="general"
              previewShape="square"
              placeholder="Logo URL or upload/select"
            />

            <ImageInputWithLibrary
              label="OpenGraph Social Share Banner"
              value={settings['site_og_image_url'] || ''}
              onChange={(val) => handleChange('site_og_image_url', val)}
              folder="general"
              defaultCategory="general"
              previewShape="banner"
              placeholder="Social share banner image URL"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
            <FloatingLabelInput
              label="SEO Keywords (Comma-Separated)"
              value={settings['site_keywords'] || ''}
              onChange={(val) => handleChange('site_keywords', val)}
              placeholder="software, developer tools, typescript, web performance"
            />

            <FloatingLabelInput
              label="System Status Badge"
              value={settings['site_status_badge'] || ''}
              onChange={(val) => handleChange('site_status_badge', val)}
              placeholder="● All Systems Operational"
            />
          </div>
        </Card>
      )}

      {/* Tab 2: Footer Customization */}
      {activeTab === 'footer' && (
        <Card className="p-5 sm:p-6 space-y-5 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Footer Copyright Notice"
              value={settings['footer_copyright'] || ''}
              onChange={(val) => handleChange('footer_copyright', val)}
              placeholder="© 2026 ElseSourav. All rights reserved."
            />

            <FloatingLabelInput
              label="Footer Mission Note"
              value={settings['footer_text'] || ''}
              onChange={(val) => handleChange('footer_text', val)}
              placeholder="Software, Tools & Ideas — Built with purpose."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
            <FloatingLabelInput
              label="Operational Status Text"
              value={settings['footer_status_text'] || ''}
              onChange={(val) => handleChange('footer_status_text', val)}
              placeholder="● All Services Online"
            />

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                Show Socials in Footer
              </label>
              <Dropdown
                items={BOOLEAN_ENABLED_OPTIONS}
                value={settings['footer_show_socials'] !== 'false' ? 'true' : 'false'}
                onChange={(val) => handleChange('footer_show_socials', val)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                Back to Top Button
              </label>
              <Dropdown
                items={BOOLEAN_ENABLED_OPTIONS}
                value={settings['footer_show_back_to_top'] !== 'false' ? 'true' : 'false'}
                onChange={(val) => handleChange('footer_show_back_to_top', val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Custom Footer Links Management */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Custom Footer Navigation
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Add custom navigation or external links to the footer bottom bar.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingFooterLink(true)}
                className="gap-1 text-xs h-7 px-2.5 rounded-lg"
              >
                <Plus className="w-3 h-3" /> Add Link
              </Button>
            </div>

            {isAddingFooterLink && (
              <div className="p-3.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 space-y-2.5">
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
                    className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-zinc-200">{fl.label}</span>
                      <span className="text-zinc-500 font-mono text-[11px] truncate">{fl.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = footerLinks.filter((f) => f.id !== fl.id);
                        syncFooterLinksToSettings(updated);
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Creator Profile & Identity */}
      {activeTab === 'profile' && (
        <Card className="p-5 sm:p-6 space-y-5 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <ImageInputWithLibrary
            label="Creator Avatar & Profile Photo"
            value={settings['creator_avatar_url'] || ''}
            onChange={(val) => handleChange('creator_avatar_url', val)}
            folder="users"
            defaultCategory="users"
            previewShape="circle"
            placeholder="Avatar image URL or upload/select from library"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Display Name (Homepage)"
              required
              value={settings['creator_name'] || ''}
              onChange={(val) => handleChange('creator_name', val)}
              placeholder="Sourav"
            />

            <FloatingLabelInput
              label="Full Name (About & Footer)"
              value={settings['creator_full_name'] || ''}
              onChange={(val) => handleChange('creator_full_name', val)}
              placeholder="Sourav Barui"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Professional Title"
              required
              value={settings['creator_title'] || ''}
              onChange={(val) => handleChange('creator_title', val)}
              placeholder="Software Engineer & Creator"
            />

            <FloatingLabelInput
              label="Role / Specialization"
              value={settings['creator_role'] || ''}
              onChange={(val) => handleChange('creator_role', val)}
              placeholder="Independent Software Creator"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Location / Timezone"
              value={settings['creator_location'] || ''}
              onChange={(val) => handleChange('creator_location', val)}
              placeholder="Remote / Worldwide"
            />

            <FloatingLabelInput
              label="Studio Positioning Statement"
              value={settings['creator_positioning'] || ''}
              onChange={(val) => handleChange('creator_positioning', val)}
              placeholder="Exploring ideas across web architecture, AI, graphics, and systems..."
            />
          </div>

          <FormField label="Compact Bio (Hero Cards & Footer)">
            <Textarea
              rows={2}
              value={settings['creator_short_bio'] || ''}
              onChange={(e) => handleChange('creator_short_bio', e.target.value)}
              placeholder="Software engineer and independent creator building practical software..."
            />
          </FormField>
        </Card>
      )}

      {/* Tab 4: Creator Narrative & About Page */}
      {activeTab === 'creator_narrative' && (
        <Card className="p-5 sm:p-6 space-y-5 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <FormField label="About Page Introduction">
            <Textarea
              rows={2}
              value={settings['about_intro'] || ''}
              onChange={(e) => handleChange('about_intro', e.target.value)}
              placeholder="Introduction paragraph displayed at the top of the About page..."
            />
          </FormField>

          {/* Full Narrative in Markdown */}
          <AdminMarkdownEditor
            label="Full Creator Narrative & Engineering Journey (Markdown)"
            value={settings['creator_long_bio'] || ''}
            onChange={(val: string) => handleChange('creator_long_bio', val)}
            placeholder="Write full biography and engineering journey in Markdown..."
            rows={10}
            helperText="Rendered with full typography on the public About page."
          />

          {/* Guiding Principles Manager */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Guiding Principles</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Core engineering values displayed on the About page.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newPrincipleInput}
                onChange={(e) => setNewPrincipleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPrinciple();
                  }
                }}
                placeholder="e.g. Accessibility by default"
                className="text-xs h-9 bg-zinc-950"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddPrinciple}
                className="text-xs h-9 px-3 shrink-0"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {principles.map((principle, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 shadow-sm"
                >
                  <span>{principle}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrinciple(idx)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Focus Areas Manager */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Focus Areas & Specializations</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Skill badges and focus tags displayed on the About page.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newFocusInput}
                onChange={(e) => setNewFocusInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFocus();
                  }
                }}
                placeholder="e.g. Systems Design"
                className="text-xs h-9 bg-zinc-950"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddFocus}
                className="text-xs h-9 px-3 shrink-0"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {focusAreas.map((focus, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-xs text-indigo-300 shadow-sm"
                >
                  <span>{focus}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFocus(idx)}
                    className="text-indigo-400/60 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Homepage Hero & Sections */}
      {activeTab === 'homepage' && (
        <Card className="p-5 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Hero Badge"
              hint="Small pill badge above the hero headline"
              value={settings['hero_badge'] || ''}
              onChange={(val) => handleChange('hero_badge', val)}
              placeholder="Software & Systems Studio"
            />

            <FloatingLabelInput
              label="Announcement Banner"
              hint="Optional top-of-page alert banner"
              value={settings['announcement_banner'] || ''}
              onChange={(val) => handleChange('announcement_banner', val)}
              placeholder="e.g. SpectraLens AI v2.4 released with on-device WASM"
            />
          </div>

          <FloatingLabelInput
            label="Hero Headline"
            hint="Main statement rendered below 'I am [Name].'"
            value={settings['hero_headline'] || ''}
            onChange={(val) => handleChange('hero_headline', val)}
            placeholder="Building software, tools, games, and experiments that solve real problems and spark new ideas."
          />

          <FormField
            label="Hero Positioning Paragraph"
            description="Supporting narrative below the main hero statement"
          >
            <Textarea
              rows={3}
              value={settings['hero_subtitle'] || ''}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              placeholder="ElseSourav is my personal space for the applications I build, the ideas I explore, and the things I learn along the way."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Primary CTA Label"
              hint="First button linking to /apps"
              value={settings['primary_cta_label'] || ''}
              onChange={(val) => handleChange('primary_cta_label', val)}
              placeholder="Explore Apps"
            />

            <FloatingLabelInput
              label="Secondary CTA Label"
              hint="Second button linking to /about"
              value={settings['secondary_cta_label'] || ''}
              onChange={(val) => handleChange('secondary_cta_label', val)}
              placeholder="About Me"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Selected Apps Section Title"
              value={settings['homepage_apps_title'] || ''}
              onChange={(val) => handleChange('homepage_apps_title', val)}
              placeholder="Selected Apps"
            />

            <FloatingLabelInput
              label="Field Notes Section Title"
              value={settings['homepage_blog_title'] || ''}
              onChange={(val) => handleChange('homepage_blog_title', val)}
              placeholder="Field Notes & Reflections"
            />
          </div>

          <FloatingLabelInput
            label="Creator Statement ('How I Build' Headline)"
            value={settings['creator_statement'] || ''}
            onChange={(val) => handleChange('creator_statement', val)}
            placeholder="I care about software that is understandable, useful, fast, and considerate."
          />

          <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Closing Studio Doorway Title"
              value={settings['closing_cta_title'] || ''}
              onChange={(val) => handleChange('closing_cta_title', val)}
              placeholder="Explore the ElseSourav Studio"
            />

            <FloatingLabelInput
              label="Closing Studio Doorway Subtitle"
              value={settings['closing_cta_subtitle'] || ''}
              onChange={(val) => handleChange('closing_cta_subtitle', val)}
              placeholder="Every application, utility, and field note is built independently with a focus on craft, performance, and usability."
            />
          </div>
        </Card>
      )}

      {/* Tab 6: Platform & Social Links */}
      {activeTab === 'links' && (
        <Card className="p-5 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
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
              className="gap-1.5 text-xs rounded-xl h-8 px-3"
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
                          className="text-xs h-8"
                        />
                        <Input
                          value={editLinkForm.url || ''}
                          onChange={(e) =>
                            setEditLinkForm((prev) => ({ ...prev, url: e.target.value }))
                          }
                          placeholder="URL"
                          className="text-xs h-8"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editLinkForm.priority ?? link.priority}
                            onChange={(e) =>
                              setEditLinkForm((prev) => ({
                                ...prev,
                                priority: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              const updated = links.map((l) =>
                                l.id === link.id ? ({ ...l, ...editLinkForm } as SiteLinkItem) : l
                              );
                              syncLinksToSettings(updated);
                              setEditingLinkId(null);
                            }}
                            className="text-xs h-8 px-3"
                          >
                            Save
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
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono text-zinc-500 w-5 text-center">
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
                        onClick={() => {
                          const updated = links.map((l) =>
                            l.id === link.id ? { ...l, isActive: !l.isActive } : l
                          );
                          syncLinksToSettings(updated);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                          link.isActive
                            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                            : 'border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {link.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLinkId(link.id);
                          setEditLinkForm({ ...link });
                        }}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = links.filter((l) => l.id !== link.id);
                          syncLinksToSettings(updated);
                        }}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* Tab 7: Direct Contact & Inquiries */}
      {activeTab === 'contact' && (
        <Card className="p-5 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Direct Contact & Inquiries</h2>
              <p className="text-[11px] text-zinc-400">
                Manage communication methods for clients and collaborators.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddingContact(true)}
              className="gap-1.5 text-xs rounded-xl h-8 px-3"
            >
              <Plus className="w-3.5 h-3.5" /> Add Contact
            </Button>
          </div>

          {/* Quick Fallback Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-zinc-800/80">
            <FloatingLabelInput
              label="Primary Contact Email"
              type="email"
              value={settings['contact_email'] || ''}
              onChange={(val) => handleChange('contact_email', val)}
              placeholder="contact@elsesourav.com"
            />

            <FloatingLabelInput
              label="Support Desk URL"
              type="url"
              value={settings['support_url'] || ''}
              onChange={(val) => handleChange('support_url', val)}
              placeholder="https://elsesourav.com/support"
            />
          </div>

          {/* Add Contact Form */}
          {isAddingContact && (
            <div className="p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Contact Type
                  </label>
                  <Dropdown
                    items={CONTACT_TYPE_DROPDOWN_ITEMS}
                    value={newContact.type || 'email'}
                    onChange={(val) =>
                      setNewContact((prev) => ({
                        ...prev,
                        type: val as SiteContactMethodType,
                      }))
                    }
                    className="w-full"
                  />
                </div>

                <FloatingLabelInput
                  label="Channel Label"
                  value={newContact.label || ''}
                  onChange={(val) => setNewContact((prev) => ({ ...prev, label: val }))}
                  placeholder="e.g. Technical Inquiries"
                />

                <FloatingLabelInput
                  label="Contact Detail / URL"
                  value={newContact.value || ''}
                  onChange={(val) => setNewContact((prev) => ({ ...prev, value: val }))}
                  placeholder="email, phone, or link"
                />
              </div>

              <FloatingLabelInput
                label="Note / Response Time"
                value={newContact.description || ''}
                onChange={(val) =>
                  setNewContact((prev) => ({ ...prev, description: val }))
                }
                placeholder="Usually replies within 24 hours"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingContact(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddContact}
                  className="text-xs h-8"
                >
                  Save Contact Method
                </Button>
              </div>
            </div>
          )}

          {/* Contact Methods List */}
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No contact methods configured.
              </p>
            ) : (
              contacts.map((contact) => {
                const opt = CONTACT_TYPE_OPTIONS.find((o) => o.value === contact.type);
                const IconComp = opt?.icon || Mail;

                return (
                  <div
                    key={contact.id}
                    className="p-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono text-zinc-500 w-5 text-center">
                        #{contact.priority}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-zinc-200 block truncate">
                          {contact.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 block truncate font-mono">
                          {contact.value}
                        </span>
                        {contact.description && (
                          <span className="text-[10px] text-zinc-500 block truncate">
                            {contact.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = contacts.map((c) =>
                            c.id === contact.id ? { ...c, isActive: !c.isActive } : c
                          );
                          syncContactsToSettings(updated);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                          contact.isActive
                            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                            : 'border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {contact.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = contacts.filter((c) => c.id !== contact.id);
                          syncContactsToSettings(updated);
                        }}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
