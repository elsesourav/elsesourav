'use client';

import * as React from 'react';
import type {
  SiteContactItem,
  SiteFooterLink,
  SiteLinkItem,
} from '@elsesourav/types';
import { Alert, Button } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  parseContactMethods,
  parseFooterLinks,
  parseSiteLinks,
  parseStringList,
} from '@elsesourav/validation';
import {
  BookOpen,
  Globe,
  Layout,
  Mail,
  PanelBottom,
  RefreshCw,
  Save,
  Scale,
  Share2,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react';
import { updateSiteSettingsAction } from '../actions/admin-settings-actions';
import { IdentitySettingsTab } from './IdentitySettingsTab';
import { AppearanceSettingsTab } from './AppearanceSettingsTab';
import { PortraitSettingsTab } from './PortraitSettingsTab';
import { FooterSettingsTab } from './FooterSettingsTab';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import { CreatorNarrativeSettingsTab } from './CreatorNarrativeSettingsTab';
import { HomepageSettingsTab } from './HomepageSettingsTab';
import { LinksSettingsTab } from './LinksSettingsTab';
import { ContactSettingsTab } from './ContactSettingsTab';
import { LegalSettingsTab } from './LegalSettingsTab';

export interface AdminSettingsFormProps {
  initialSettings: Record<string, string>;
}

export type SettingsTab =
  | 'identity'
  | 'appearance'
  | 'portrait'
  | 'profile'
  | 'creator_narrative'
  | 'homepage'
  | 'links'
  | 'contact'
  | 'footer'
  | 'legal';

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TAB_CONFIG: readonly TabItem[] = [
  { id: 'identity', label: 'Site & Brand', icon: Globe },
  { id: 'appearance', label: 'UI & Effects', icon: SlidersHorizontal },
  { id: 'portrait', label: 'Portrait Studio', icon: Sparkles },
  { id: 'profile', label: 'Creator Profile', icon: User },
  { id: 'creator_narrative', label: 'About & Narrative', icon: BookOpen },
  { id: 'homepage', label: 'Homepage Copy', icon: Layout },
  { id: 'links', label: 'Platform Links', icon: Share2 },
  { id: 'contact', label: 'Direct Contact', icon: Mail },
  { id: 'footer', label: 'Footer Options', icon: PanelBottom },
  { id: 'legal', label: 'Legal Pages', icon: Scale },
];

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

  // Contact Methods State
  const [contacts, setContacts] = React.useState<SiteContactItem[]>(() => {
    return parseContactMethods(initialSettings['contact_methods_json'], initialSettings);
  });

  // Custom Footer Links State
  const [footerLinks, setFooterLinks] = React.useState<SiteFooterLink[]>(() => {
    return parseFooterLinks(initialSettings['footer_links_json']);
  });

  // Principles Tag State
  const [principles, setPrinciples] = React.useState<string[]>(() => {
    return parseStringList(initialSettings['creator_principles_json'], [
      'Accessibility by default',
      'Deterministic builds',
      'Zero vanity metrics',
    ]);
  });

  // Focus Tags State
  const [focusAreas, setFocusAreas] = React.useState<string[]>(() => {
    return parseStringList(initialSettings['creator_focus_json'], [
      'Developer Tools',
      'Systems Design',
      'Web Performance',
    ]);
  });

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  const dropdownItems = TAB_CONFIG.map((t) => ({
    value: t.id,
    label:
      t.id === 'links'
        ? `Platform Links (${links.length})`
        : t.id === 'contact'
          ? `Direct Contact (${contacts.length})`
          : t.label,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Action / Toolbar Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="text-xs text-zinc-400">
          Configure dynamic identity, profiles, links, and pages without code redeployment.
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          leftIcon={
            isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )
          }
          className="text-xs h-9 px-4 rounded-xl shadow-lg shadow-indigo-600/20 w-full sm:w-auto justify-center shrink-0"
        >
          {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
      )}

      {/* Responsive Navigation: Mobile Dropdown vs Desktop Tabs */}
      <div className="sm:hidden space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Settings Section
        </label>
        <Dropdown
          items={dropdownItems}
          value={activeTab}
          onChange={(val) => setActiveTab(val as SettingsTab)}
          className="w-full"
        />
      </div>

      <div
        role="tablist"
        aria-label="Configuration Sections"
        className="hidden sm:flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-inner"
      >
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const displayLabel =
            id === 'links'
              ? `Links (${links.length})`
              : id === 'contact'
                ? `Contact (${contacts.length})`
                : label;

          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive
                    ? id === 'portrait'
                      ? 'text-cyan-400'
                      : 'text-indigo-400'
                    : 'text-zinc-500'
                }`}
              />
              <span>{displayLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'identity' && (
        <IdentitySettingsTab settings={settings} onChange={handleChange} />
      )}

      {activeTab === 'appearance' && (
        <AppearanceSettingsTab
          effectsLevel={settings['effects_level'] || 'high'}
          onChange={(level) => handleChange('effects_level', level)}
        />
      )}

      {activeTab === 'portrait' && (
        <PortraitSettingsTab settings={settings} onChange={handleChange} onSave={handleSave} />
      )}

      {activeTab === 'footer' && (
        <FooterSettingsTab
          settings={settings}
          onChange={handleChange}
          footerLinks={footerLinks}
          onFooterLinksChange={syncFooterLinksToSettings}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileSettingsTab settings={settings} onChange={handleChange} />
      )}

      {activeTab === 'creator_narrative' && (
        <CreatorNarrativeSettingsTab
          settings={settings}
          onChange={handleChange}
          principles={principles}
          onPrinciplesChange={(updated) => {
            setPrinciples(updated);
            handleChange('creator_principles_json', JSON.stringify(updated));
          }}
          focusAreas={focusAreas}
          onFocusAreasChange={(updated) => {
            setFocusAreas(updated);
            handleChange('creator_focus_json', JSON.stringify(updated));
          }}
        />
      )}

      {activeTab === 'homepage' && (
        <HomepageSettingsTab settings={settings} onChange={handleChange} />
      )}

      {activeTab === 'links' && (
        <LinksSettingsTab links={links} onLinksChange={syncLinksToSettings} />
      )}

      {activeTab === 'contact' && (
        <ContactSettingsTab
          settings={settings}
          onChange={handleChange}
          contacts={contacts}
          onContactsChange={syncContactsToSettings}
        />
      )}

      {activeTab === 'legal' && (
        <LegalSettingsTab
          privacyMd={settings['legal_privacy_md'] || ''}
          termsMd={settings['legal_terms_md'] || ''}
          onPrivacyChange={(val) => handleChange('legal_privacy_md', val)}
          onTermsChange={(val) => handleChange('legal_terms_md', val)}
        />
      )}
    </div>
  );
}
