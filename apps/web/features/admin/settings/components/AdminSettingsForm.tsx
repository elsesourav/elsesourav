'use client';

import * as React from 'react';
import {
  Button,
  Card,
  Input,
  Textarea,
  FormField,
  Badge,
  Alert,
} from '@elsesourav/ui';
import { AdminMarkdownEditor } from '@/features/admin/components/AdminMarkdownEditor';
import { updateSiteSettingsAction } from '../actions/admin-settings-actions';
import {
  Globe,
  Layout,
  User,
  Share2,
  Save,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export interface AdminSettingsFormProps {
  initialSettings: Record<string, string>;
}

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [activeTab, setActiveTab] = React.useState<'identity' | 'homepage' | 'about' | 'social'>('identity');
  const [settings, setSettings] = React.useState<Record<string, string>>(initialSettings);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await updateSiteSettingsAction(settings);
    setIsSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Site settings and content successfully updated!' });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save settings' });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Portal & Content Configuration</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage site identity, creator bio, and homepage copywriting without code changes.
          </p>
        </div>

        <Button type="submit" disabled={isSaving} className="gap-2 shadow-lg shadow-indigo-600/20">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes...' : 'Save Configuration'}
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} title={message.type === 'success' ? 'Saved' : 'Error'}>
          {message.text}
        </Alert>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'identity'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Site Identity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'homepage'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layout className="w-3.5 h-3.5" /> Homepage Hero
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'about'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Creator & About
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'social'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> Links & Contact
        </button>
      </div>

      {/* Tab 1: Site Identity */}
      {activeTab === 'identity' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-white">Global Site Identity</h2>
            <Badge variant="outline" className="text-[11px]">Identity Tier</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Site Name" required description="Public brand title">
              <Input
                value={settings.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                placeholder="ElseSourav"
              />
            </FormField>

            <FormField label="Site Tagline" required description="Short brand subtitle">
              <Input
                value={settings.site_tagline || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                placeholder="Software, Tools & Ideas"
              />
            </FormField>
          </div>

          <FormField label="Global Meta Description" description="Search engine description for SEO">
            <Textarea
              rows={3}
              value={settings.site_description || ''}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="ElseSourav is the personal platform of Sourav, featuring software..."
            />
          </FormField>
        </Card>
      )}

      {/* Tab 2: Homepage Hero */}
      {activeTab === 'homepage' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-white">Homepage Value Proposition</h2>
            <Badge variant="outline" className="text-[11px]">Value-First</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Hero Badge Text" description="Pill above headline">
              <Input
                value={settings.hero_badge || ''}
                onChange={(e) => handleChange('hero_badge', e.target.value)}
                placeholder="Software & Digital Tools by Sourav"
              />
            </FormField>

            <FormField label="Announcement Banner (Optional)" description="Top notification strip">
              <Input
                value={settings.announcement_banner || ''}
                onChange={(e) => handleChange('announcement_banner', e.target.value)}
                placeholder="Leave blank to disable banner"
              />
            </FormField>
          </div>

          <FormField label="Hero Main Headline" required description="Primary proposition headline">
            <Input
              value={settings.hero_headline || ''}
              onChange={(e) => handleChange('hero_headline', e.target.value)}
              placeholder="Thoughtful software, practical tools, & engineering ideas."
            />
          </FormField>

          <FormField label="Hero Positioning Paragraph" required description="High-level description of ElseSourav">
            <Textarea
              rows={3}
              value={settings.hero_subtitle || ''}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              placeholder="Building thoughtful software, useful tools, and digital experiences..."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Primary CTA Button Label" description="Main hero button text">
              <Input
                value={settings.primary_cta_label || ''}
                onChange={(e) => handleChange('primary_cta_label', e.target.value)}
                placeholder="Explore Applications"
              />
            </FormField>

            <FormField label="Secondary CTA Button Label" description="Secondary button text">
              <Input
                value={settings.secondary_cta_label || ''}
                onChange={(e) => handleChange('secondary_cta_label', e.target.value)}
                placeholder="Read Engineering Notes"
              />
            </FormField>
          </div>
        </Card>
      )}

      {/* Tab 3: Creator & About Story */}
      {activeTab === 'about' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-white">Creator Bio & Narrative</h2>
            <Badge variant="outline" className="text-[11px]">Markdown Capable</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Creator Name" required>
              <Input
                value={settings.creator_name || ''}
                onChange={(e) => handleChange('creator_name', e.target.value)}
                placeholder="Sourav"
              />
            </FormField>

            <FormField label="Professional Title" required>
              <Input
                value={settings.creator_title || ''}
                onChange={(e) => handleChange('creator_title', e.target.value)}
                placeholder="Software Engineer & Creator"
              />
            </FormField>

            <FormField label="Location">
              <Input
                value={settings.creator_location || ''}
                onChange={(e) => handleChange('creator_location', e.target.value)}
                placeholder="Remote"
              />
            </FormField>
          </div>

          <FormField label="Short Bio" description="Compact bio for footers and hero cards">
            <Textarea
              rows={2}
              value={settings.creator_short_bio || ''}
              onChange={(e) => handleChange('creator_short_bio', e.target.value)}
              placeholder="Software engineer and independent creator..."
            />
          </FormField>

          {/* Long Narrative Bio in Markdown */}
          <AdminMarkdownEditor
            label="Full Creator Narrative & Philosophy"
            value={settings.creator_long_bio || ''}
            onChange={(val: string) => handleChange('creator_long_bio', val)}
            placeholder="Write full biography and engineering journey in Markdown..."
            rows={10}
            helperText="Supports headings, emphasis, lists, and links."
          />
        </Card>
      )}

      {/* Tab 4: Links & Contact */}
      {activeTab === 'social' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-white">Channels & Inquiries</h2>
            <Badge variant="outline" className="text-[11px]">Connectivity</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="GitHub Profile URL">
              <Input
                value={settings.github_url || ''}
                onChange={(e) => handleChange('github_url', e.target.value)}
                placeholder="https://github.com/elsesourav"
              />
            </FormField>

            <FormField label="Twitter / X URL">
              <Input
                value={settings.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/elsesourav"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Contact Email">
              <Input
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="contact@elsesourav.com"
              />
            </FormField>

            <FormField label="Support Desk URL">
              <Input
                value={settings.support_url || ''}
                onChange={(e) => handleChange('support_url', e.target.value)}
                placeholder="https://elsesourav.com/support"
              />
            </FormField>
          </div>
        </Card>
      )}
    </form>
  );
}
