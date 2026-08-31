'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@elsesourav/ui';
import { createSupportTicketAction } from '../actions/support-actions';
import { Send, AlertCircle, Loader2 } from 'lucide-react';

interface CreateTicketFormProps {
  onSuccess?: (ticketId: string) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'app_issue', label: 'App Issue / Troubleshooting' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'account', label: 'Account & Security' },
  { value: 'billing', label: 'Billing & Subscriptions' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low — Minor inquiry or question' },
  { value: 'medium', label: 'Medium — Standard issue' },
  { value: 'high', label: 'High — Important workflow impaired' },
  { value: 'urgent', label: 'Urgent — Critical blocker' },
];

export function CreateTicketForm({ onSuccess, onCancel }: CreateTicketFormProps) {
  const router = useRouter();
  const [subject, setSubject] = React.useState('');
  const [category, setCategory] = React.useState('app_issue');
  const [priority, setPriority] = React.useState('medium');
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long.');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please describe your issue with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createSupportTicketAction({
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
      });

      if (res.success && res.ticketId) {
        if (onSuccess) {
          onSuccess(res.ticketId);
        } else {
          router.push(`/support/tickets/${res.ticketId}`);
        }
      } else {
        setError(res.error || 'Failed to submit support ticket.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground">
          Issue Category <span className="text-rose-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground">Priority Level</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
        >
          {PRIORITIES.map((pri) => (
            <option key={pri.value} value={pri.value}>
              {pri.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground">
          Subject Summary <span className="text-rose-500">*</span>
        </label>
        <Input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of the issue..."
          required
          maxLength={120}
          className="bg-background border-border text-xs rounded-xl text-foreground focus:border-primary"
        />
      </div>

      {/* Description Textarea */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe what happened, expected behavior, and steps to reproduce..."
          required
          rows={6}
          maxLength={3000}
          className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
        />
        <div className="flex justify-end text-[11px] text-muted-foreground">
          {description.length}/3000 characters
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-sm cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting Ticket...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Support Ticket</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
