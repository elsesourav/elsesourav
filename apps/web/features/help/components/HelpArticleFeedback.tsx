'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { castHelpArticleVote } from '../actions/vote';

interface HelpArticleFeedbackProps {
  articleId: string;
  initialHelpfulCount: number;
  initialUnhelpfulCount: number;
}

export function HelpArticleFeedback({
  articleId,
  initialHelpfulCount,
  initialUnhelpfulCount,
}: HelpArticleFeedbackProps) {
  const [hasVoted, setHasVoted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [counts, setCounts] = React.useState({
    helpful: initialHelpfulCount,
    unhelpful: initialUnhelpfulCount,
  });

  const handleVote = async (isHelpful: boolean) => {
    if (hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    setHasVoted(true);

    // Optimistic update
    setCounts((prev) => ({
      helpful: isHelpful ? prev.helpful + 1 : prev.helpful,
      unhelpful: !isHelpful ? prev.unhelpful + 1 : prev.unhelpful,
    }));

    try {
      await castHelpArticleVote(articleId, isHelpful);
    } catch {
      // Non-blocking
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center space-y-2 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-emerald-500 dark:text-emerald-400 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Thank you for your feedback!</span>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Your input helps continuously improve the ElseSourav documentation suite.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-sm">
      <div className="space-y-0.5 text-center sm:text-left">
        <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Was this guide helpful?</h4>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Let us know if this article resolved your question.</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleVote(true)}
          disabled={isSubmitting}
          className="text-xs border-[hsl(var(--border))] hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-300 text-[hsl(var(--foreground))] gap-1.5"
          aria-label="Mark article as helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Yes</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleVote(false)}
          disabled={isSubmitting}
          className="text-xs border-[hsl(var(--border))] hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 text-[hsl(var(--foreground))] gap-1.5"
          aria-label="Mark article as not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>No</span>
        </Button>
      </div>
    </div>
  );
}
