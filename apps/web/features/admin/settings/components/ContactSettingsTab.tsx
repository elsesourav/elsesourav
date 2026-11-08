'use client';

import * as React from 'react';
import type { SiteContactItem, SiteContactMethodType } from '@elsesourav/types';
import { Card, Button, IconButton, Badge } from '@elsesourav/ui';
import { Dropdown, FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  Mail,
  LifeBuoy,
  Send,
  Globe,
  Calendar,
  Phone,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';

export const CONTACT_TYPE_OPTIONS: Array<{
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

const CONTACT_TYPE_DROPDOWN_ITEMS = CONTACT_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export interface ContactSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  contacts: SiteContactItem[];
  onContactsChange: (updated: SiteContactItem[]) => void;
}

export function ContactSettingsTab({
  settings,
  onChange,
  contacts,
  onContactsChange,
}: ContactSettingsTabProps) {
  const [isAddingContact, setIsAddingContact] = React.useState(false);
  const [newContact, setNewContact] = React.useState<Partial<SiteContactItem>>({
    type: 'email',
    label: 'Primary Inquiries',
    value: '',
    description: '',
    priority: 0,
    isActive: true,
  });

  const handleAddContact = () => {
    if (!newContact.label?.trim() || !newContact.value?.trim()) return;
    const nextPriority = contacts.length > 0 ? Math.max(...contacts.map((c) => c.priority)) + 1 : 0;
    const item: SiteContactItem = {
      id: `contact-${Date.now()}`,
      label: newContact.label.trim(),
      value: newContact.value.trim(),
      type: (newContact.type as SiteContactMethodType) || 'email',
      description: newContact.description?.trim(),
      priority: typeof newContact.priority === 'number' ? newContact.priority : nextPriority,
      isActive: newContact.isActive ?? true,
    };
    onContactsChange([...contacts, item]);
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

  const handleRemoveContact = (id: string) => {
    onContactsChange(contacts.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    onContactsChange(contacts.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 rounded-3xl border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
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
          className="gap-1.5 text-xs rounded-xl h-8 px-3 shrink-0 w-fit"
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
          onChange={(val) => onChange('contact_email', val)}
          placeholder="contact@elsesourav.com"
        />

        <FloatingLabelInput
          label="Support Desk URL"
          type="url"
          value={settings['support_url'] || ''}
          onChange={(val) => onChange('support_url', val)}
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
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 w-5 text-center shrink-0">
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
                    onClick={() => handleToggleActive(contact.id)}
                    className="cursor-pointer transition-opacity hover:opacity-80 inline-flex items-center"
                  >
                    <Badge
                      variant={contact.isActive ? 'success' : 'outline'}
                      className={`text-[10px] px-2 py-0.5 font-mono ${
                        contact.isActive ? '' : 'border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {contact.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </button>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveContact(contact.id)}
                    aria-label={`Remove ${contact.label}`}
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
