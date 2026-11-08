'use client';

import * as React from 'react';
import { Card, FormField, Textarea, Input, Button } from '@elsesourav/ui';
import { AdminMarkdownEditor } from '@/features/admin/components/AdminMarkdownEditor';
import { Sparkles, Tag, X } from 'lucide-react';

export interface CreatorNarrativeSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  principles: string[];
  onPrinciplesChange: (updated: string[]) => void;
  focusAreas: string[];
  onFocusAreasChange: (updated: string[]) => void;
}

export function CreatorNarrativeSettingsTab({
  settings,
  onChange,
  principles,
  onPrinciplesChange,
  focusAreas,
  onFocusAreasChange,
}: CreatorNarrativeSettingsTabProps) {
  const [newPrincipleInput, setNewPrincipleInput] = React.useState('');
  const [newFocusInput, setNewFocusInput] = React.useState('');

  const handleAddPrinciple = () => {
    if (!newPrincipleInput.trim()) return;
    onPrinciplesChange([...principles, newPrincipleInput.trim()]);
    setNewPrincipleInput('');
  };

  const handleRemovePrinciple = (indexToRemove: number) => {
    onPrinciplesChange(principles.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddFocus = () => {
    if (!newFocusInput.trim()) return;
    onFocusAreasChange([...focusAreas, newFocusInput.trim()]);
    setNewFocusInput('');
  };

  const handleRemoveFocus = (indexToRemove: number) => {
    onFocusAreasChange(focusAreas.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <Card className="p-4 sm:p-6 space-y-5 rounded-3xl border-zinc-800 bg-zinc-900/40">
      <FormField label="About Page Introduction">
        <Textarea
          rows={2}
          value={settings['about_intro'] || ''}
          onChange={(e) => onChange('about_intro', e.target.value)}
          placeholder="Introduction paragraph displayed at the top of the About page..."
          className="text-xs bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl"
        />
      </FormField>

      {/* Full Narrative in Markdown */}
      <AdminMarkdownEditor
        label="Full Creator Narrative & Engineering Journey (Markdown)"
        value={settings['creator_long_bio'] || ''}
        onChange={(val: string) => onChange('creator_long_bio', val)}
        placeholder="Write full biography and engineering journey in Markdown..."
        rows={10}
        helperText="Rendered with full typography on the public About page."
      />

      {/* Guiding Principles Manager */}
      <div className="pt-3 border-t border-zinc-800/80 space-y-3">
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
            className="text-xs h-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 rounded-xl"
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
                aria-label={`Remove ${principle}`}
                className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Focus Areas Manager */}
      <div className="pt-3 border-t border-zinc-800/80 space-y-3">
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
            className="text-xs h-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 rounded-xl"
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
                aria-label={`Remove ${focus}`}
                className="text-indigo-400/60 hover:text-rose-400 transition-colors p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
